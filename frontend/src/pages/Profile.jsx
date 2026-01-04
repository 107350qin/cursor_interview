import { Card, Tabs, List, Tag, Typography, Space } from 'antd'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useAuthStore } from '../store/authStore'
import { useIsMobile } from '../utils/device'

const { Title } = Typography

function Profile() {
  const navigate = useNavigate()
  const { userId } = useAuthStore()
  const [userInfo, setUserInfo] = useState(null)
  
  // 使用公共的移动设备检测Hook
  const isMobile = useIsMobile();

  useEffect(() => {
    loadUserInfo()
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
    }
  ]

  return (
    <div style={{ padding: '0 10px', maxWidth: '1000px', margin: '0 auto' }}>
      <Tabs items={tabItems} size={isMobile ? 'small' : 'default'} />
    </div>
  )
}

export default Profile

