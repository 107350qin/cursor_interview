import { useEffect, useState } from 'react'
import { Card, Typography, Space } from 'antd'
import { useNavigate } from 'react-router-dom'
import { categoryService } from '../services/categoryService'
import { useIsMobile } from '../utils/device'

const { Title, Paragraph } = Typography

function Categories() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const res = await categoryService.getCategoryStatistic()
      if (res.code === 200) {
        setCategories(res.data)
      }
    } catch (error) {
      console.error('加载分类失败:', error)
    }
  }

  // 使用公共的移动设备检测Hook
  const isMobile = useIsMobile();

  return (
    <div style={{ padding: '0 10px', maxWidth: '1200px'}}>
      <Card title={`总共 ${categories.length} 个分类，${categories.reduce((acc, cur) => acc + cur.count, 0)} 道题目`} style={{ marginBottom: '24px' }}>
        <Space wrap style={{ width: '100%', justifyContent: 'left' }}>
          {categories.map(cat => (
            <Card.Grid
              key={cat.name}
              style={{ 
                width: isMobile ? '140px' : '200px', 
                textAlign: 'center', 
                cursor: 'pointer',
                margin: '8px',
              }}
              onClick={() => navigate(`/questions?category=${encodeURIComponent(cat.name)}`)}
            >
              <Title level={4} style={{ fontSize: isMobile ? '16px' : '18px', marginBottom: '8px' }}>{cat.name}</Title>
              <Paragraph type="secondary" style={{ fontSize: isMobile ? '12px' : '14px', margin: 0 }}>{cat.count} 道题目</Paragraph>
            </Card.Grid>
          ))}
        </Space>
      </Card>
    </div>
  )
}

export default Categories










