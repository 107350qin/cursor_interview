import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Typography, Tag, Button, Space, message, Spin } from 'antd'
import { LikeOutlined, StarOutlined, LikeFilled, StarFilled } from '@ant-design/icons'
import { questionService } from '../services/questionService'
import { useAuthStore } from '../store/authStore'
import api from '../services/api'

const { Title, Paragraph } = Typography

function QuestionDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const [question, setQuestion] = useState(null)
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [collected, setCollected] = useState(false)

  useEffect(() => {
    loadQuestion()
    if (isAuthenticated) {
      checkLikeStatus()
      checkCollectStatus()
    }
  }, [id, isAuthenticated])

  const loadQuestion = async () => {
    try {
      setLoading(true)
      const res = await questionService.getQuestionById(id)
      if (res.code === 200) {
        setQuestion(res.data)
      }
    } catch (error) {
      message.error('加载题目失败')
    } finally {
      setLoading(false)
    }
  }

  const checkLikeStatus = async () => {
    try {
      const res = await api.get(`/likes/${id}/status`)
      if (res.code === 200) {
        setLiked(res.data)
      }
    } catch (error) {
      // 忽略错误
    }
  }

  const checkCollectStatus = async () => {
    try {
      const res = await api.get(`/collects/${id}/status`)
      if (res.code === 200) {
        setCollected(res.data)
      }
    } catch (error) {
      // 忽略错误
    }
  }

  const handleLike = async () => {
    if (!isAuthenticated) {
      message.warning('请先登录')
      navigate('/login')
      return
    }

    try {
      if (liked) {
        await api.delete(`/likes/${id}`)
        setLiked(false)
        message.success('取消点赞成功')
        if (question) {
          setQuestion({ ...question, likeCount: question.likeCount - 1 })
        }
      } else {
        await api.post(`/likes/${id}`)
        setLiked(true)
        message.success('点赞成功')
        if (question) {
          setQuestion({ ...question, likeCount: question.likeCount + 1 })
        }
      }
    } catch (error) {
      message.error('操作失败')
    }
  }

  const handleCollect = async () => {
    if (!isAuthenticated) {
      message.warning('请先登录')
      navigate('/login')
      return
    }

    try {
      if (collected) {
        await api.delete(`/collects/${id}`)
        setCollected(false)
        message.success('取消收藏成功')
        if (question) {
          setQuestion({ ...question, collectCount: question.collectCount - 1 })
        }
      } else {
        await api.post(`/collects/${id}`)
        setCollected(true)
        message.success('收藏成功')
        if (question) {
          setQuestion({ ...question, collectCount: question.collectCount + 1 })
        }
      }
    } catch (error) {
      message.error('操作失败')
    }
  }

  const getDifficultyColor = (difficulty) => {
    const colors = {
      EASY: 'green',
      MEDIUM: 'orange',
      HARD: 'red',
    }
    return colors[difficulty] || 'default'
  }

  if (loading) {
    return <Spin size="large" style={{ display: 'block', textAlign: 'center', marginTop: '50px' }} />
  }

  if (!question) {
    return <div>题目不存在</div>
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Title level={2}>{question.title}</Title>
            <Space>
              <Tag color={getDifficultyColor(question.difficulty)}>{question.difficulty}</Tag>
              {question.tags && question.tags.split(',').map(tag => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </Space>
          </div>

          <div>
            <Paragraph>
              <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{question.content}</pre>
            </Paragraph>
          </div>

          {question.analysis && (
            <Card title="解析" type="inner">
              <Paragraph>
                <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{question.analysis}</pre>
              </Paragraph>
            </Card>
          )}

          <Space>
            <Button
              icon={liked ? <LikeFilled /> : <LikeOutlined />}
              type={liked ? 'primary' : 'default'}
              onClick={handleLike}
            >
              点赞 ({question.likeCount})
            </Button>
            <Button
              icon={collected ? <StarFilled /> : <StarOutlined />}
              type={collected ? 'primary' : 'default'}
              onClick={handleCollect}
            >
              收藏 ({question.collectCount})
            </Button>
            <span>👁 浏览量: {question.viewCount}</span>
          </Space>
        </Space>
      </Card>
    </div>
  )
}

export default QuestionDetail

