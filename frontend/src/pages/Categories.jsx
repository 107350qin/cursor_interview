import { useEffect, useState } from 'react'
import { Card, Typography, Space } from 'antd'
import { useNavigate } from 'react-router-dom'
import { categoryService } from '../services/categoryService'

const { Title, Paragraph } = Typography

function Categories() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const res = await categoryService.getAllCategories()
      if (res.code === 200) {
        setCategories(res.data)
      }
    } catch (error) {
      console.error('加载分类失败:', error)
    }
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <Card title="分类导航" style={{ marginBottom: '24px' }}>
        <Space wrap>
          {categories.map(cat => (
            <Card.Grid
              key={cat.id}
              style={{ width: '200px', textAlign: 'center', cursor: 'pointer' }}
              onClick={() => navigate(`/category/${cat.id}`)}
            >
              <Title level={4}>{cat.name}</Title>
              <Paragraph type="secondary">{cat.questionCount} 道题目</Paragraph>
            </Card.Grid>
          ))}
        </Space>
      </Card>
    </div>
  )
}

export default Categories










