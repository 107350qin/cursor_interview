import { Card, Tabs, List, Tag, Typography, Space } from 'antd'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { questionService } from '../services/questionService'
import { useAuthStore } from '../store/authStore'

const { Title } = Typography

function Profile() {
  const navigate = useNavigate()
  const { userId } = useAuthStore()
  const [userInfo, setUserInfo] = useState(null)
  const [myQuestions, setMyQuestions] = useState([])
  const [collectedQuestions, setCollectedQuestions] = useState([])

  useEffect(() => {
    loadUserInfo()
    if (userId) {
      loadMyQuestions()
      loadCollectedQuestions()
    }
  }, [userId])

  const loadUserInfo = async () => {
    try {
      const res = await api.get('/user/info')
      if (res.code === 200) {
        setUserInfo(res.data)
      }
    } catch (error) {
      console.error('加载用户信息失败:', error)
    }
  }

  const loadMyQuestions = async () => {
    try {
      const res = await questionService.getQuestions({ userId })
      if (res.code === 200) {
        setMyQuestions(res.data.records || [])
      }
    } catch (error) {
      console.error('加载我的题目失败:', error)
    }
  }

  const loadCollectedQuestions = async () => {
    // 这里需要实现获取收藏题目的接口
    // 暂时留空
  }

  const tabItems = [
    {
      key: 'info',
      label: '个人信息',
      children: (
        <Card>
          {userInfo && (
            <Space direction="vertical">
              <p><strong>用户名:</strong> {userInfo.username}</p>
              <p><strong>邮箱:</strong> {userInfo.email}</p>
              <p><strong>手机号:</strong> {userInfo.phone || '未设置'}</p>
              <p><strong>角色:</strong> {userInfo.role}</p>
            </Space>
          )}
        </Card>
      ),
    },
    {
      key: 'questions',
      label: '我的题目',
      children: (
        <List
          dataSource={myQuestions}
          renderItem={(item) => (
            <List.Item
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(`/question/${item.id}`)}
            >
              <List.Item.Meta
                title={item.title}
                description={
                  <Space>
                    <Tag>{item.difficulty}</Tag>
                    <span>👁 {item.viewCount}</span>
                    <span>👍 {item.likeCount}</span>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      ),
    },
  ]

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <Title level={2}>个人中心</Title>
      <Tabs items={tabItems} />
    </div>
  )
}

export default Profile

