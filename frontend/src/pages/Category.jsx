import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Card, List, Tag, Typography, Space, Pagination, Spin } from 'antd'
import { useNavigate } from 'react-router-dom'
import { questionService } from '../services/questionService'
import { categoryService } from '../services/categoryService'

const { Title } = Typography

function Category() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [category, setCategory] = useState(null)
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, size: 10, total: 0 })

  useEffect(() => {
    loadCategory()
    loadQuestions(1, 10)
  }, [id])

  const loadCategory = async () => {
    try {
      const res = await categoryService.getCategoryById(id)
      if (res.code === 200) {
        setCategory(res.data)
      }
    } catch (error) {
      console.error('加载分类失败:', error)
    }
  }

  const loadQuestions = async (page, size) => {
    try {
      setLoading(true)
      const res = await questionService.getQuestions({ page, size, categoryId: id })
      if (res.code === 200) {
        setQuestions(res.data.records)
        setPagination({
          page: res.data.current,
          size: res.data.size,
          total: res.data.total,
        })
      }
    } catch (error) {
      console.error('加载题目失败:', error)
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

  if (loading && !category) {
    return <Spin size="large" style={{ display: 'block', textAlign: 'center', marginTop: '50px' }} />
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {category && (
        <Title level={2}>{category.name}</Title>
      )}
      {category && category.description && (
        <p style={{ color: '#666', marginBottom: '24px' }}>{category.description}</p>
      )}
      
      <Card>
        <List
          loading={loading}
          dataSource={questions}
          renderItem={(item) => (
            <List.Item
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(`/question/${item.id}`)}
            >
              <List.Item.Meta
                title={
                  <Space>
                    <span>{item.title}</span>
                    <Tag color={getDifficultyColor(item.difficulty)}>{item.difficulty}</Tag>
                  </Space>
                }
                description={
                  <Space>
                    <span>👁 {item.viewCount}</span>
                    <span>👍 {item.likeCount}</span>
                    <span>⭐ {item.collectCount}</span>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <Pagination
            current={pagination.page}
            pageSize={pagination.size}
            total={pagination.total}
            onChange={(page, size) => loadQuestions(page, size)}
          />
        </div>
      </Card>
    </div>
  )
}

export default Category

