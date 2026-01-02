import { useEffect, useState, useRef, useCallback } from 'react'
import { Card, Tag, Typography, Row, Col, Space, Spin } from 'antd'
import { useNavigate } from 'react-router-dom'
import { questionService } from '../services/questionService'

const { Title } = Typography

function LatestQuestions() {
  const navigate = useNavigate()
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const observerRef = useRef(null)
  const lastElementRef = useCallback((node) => {
    if (loading) return
    if (observerRef.current) observerRef.current.disconnect()
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMoreQuestions()
      }
    })
    if (node) observerRef.current.observe(node)
  }, [loading, hasMore])

  useEffect(() => {
    loadQuestions()
  }, [])

  const loadQuestions = async () => {
    try {
      setLoading(true)
      const res = await questionService.getQuestions({
        page: 1,
        size: 12
      })
      if (res.code === 200) {
        setQuestions(res.data.records)
        setPage(1)
        setHasMore(res.data.total > res.data.records.length)
      }
    } catch (error) {
      console.error('加载最新题目失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMoreQuestions = async () => {
    try {
      setLoading(true)
      const nextPage = page + 1
      const res = await questionService.getQuestions({
        page: nextPage,
        size: 12
      })
      if (res.code === 200) {
        setQuestions([...questions, ...res.data.records])
        setPage(nextPage)
        setHasMore(questions.length + res.data.records.length < res.data.total)
      }
    } catch (error) {
      console.error('加载更多最新题目失败:', error)
    } finally {
      setLoading(false)
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

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 0' }}>
      <Row gutter={[16, 16]}>
        {questions.map((item, index) => (
          <Col key={item.id} xs={24} sm={12} md={8} lg={6}>
            <Card
              hoverable
              style={{
                height: '200px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
              onClick={() => navigate(`/question/${item.id}`)}
              ref={index === questions.length - 1 ? lastElementRef : null}
            >
              <div>
                <Space wrap style={{ marginBottom: '10px' }}>
                  <Tag color={getDifficultyColor(item.difficulty)}>
                    {item.difficulty}
                  </Tag>
                  {item.tags && item.tags.split(',').slice(0, 2).map((tag, tagIndex) => (
                    <Tag key={tagIndex} color="blue">
                      {tag.trim()}
                    </Tag>
                  ))}
                </Space>
                <div style={{ 
                  fontSize: '16px', 
                  fontWeight: 'bold', 
                  marginBottom: '15px',
                  lineHeight: '1.4',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {item.title}
                </div>
              </div>
              <div>
                <Space size="small" style={{ fontSize: '12px', color: '#8c8c8c' }}>
                  <span>👁 {item.viewCount}</span>
                  <span>👍 {item.likeCount}</span>
                  <span>⭐ {item.collectCount}</span>
                  <span style={{ marginLeft: '8px', fontSize: '11px' }}>
                    {new Date(item.createTime).toLocaleDateString()}
                  </span>
                </Space>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
      {loading && (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <Spin tip="加载中..." />
        </div>
      )}
      {!hasMore && !loading && (
        <div style={{ textAlign: 'center', padding: '20px 0', color: '#8c8c8c' }}>
          没有更多题目了
        </div>
      )}
    </div>
  )
}

export default LatestQuestions










