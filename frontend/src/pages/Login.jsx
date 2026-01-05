import { useState, useEffect } from 'react'
import { Form, Input, Button, Card, message, Modal } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useNavigate, Link } from 'react-router-dom'
import { authService } from '../services/authService'
import { useAuthStore } from '../store/authStore'
import { useIsMobile } from '../utils/device'
import qrCodeImage from '../static/link.png'

function Login() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [isQrModalVisible, setIsQrModalVisible] = useState(false)

  const onFinish = async (values) => {
    try {
      const res = await authService.login(values.username, values.password)
      if (res.code === 200) {
        setAuth(res.data.token, res.data.userId, res.data.username, res.data.role)
        message.success('登录成功')
        navigate('/')
      } else if (res.code === 1005) {
        // 用户未激活，显示微信二维码模态框
        setIsQrModalVisible(true)
      } else {
        message.error(res.message || '登录失败')
      }
    } catch (error) {
      message.error('登录失败，请检查网络连接')
    }
  }

  const handleModalClose = () => {
    setIsQrModalVisible(false)
  }

  // 使用公共的移动设备检测Hook
  const isMobile = useIsMobile();

  // 确保模态框出现时不会影响页面的滚动条设置
  useEffect(() => {
    // 保存原始的body overflow样式
    const originalOverflow = document.body.style.overflow;
    
    // 无论模态框是否打开，都保持body的overflow为scroll
    document.body.style.overflow = 'scroll';
    
    return () => {
      // 组件卸载时恢复原始的body样式
      document.body.style.overflow = originalOverflow;
    };
  }, [isQrModalVisible]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', padding: isMobile ? '0 10px' : '0' }}>
      <Card title="登录" style={{ width: isMobile ? '100%' : 400, maxWidth: 400 }}>
        <Form
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          size={isMobile ? 'middle' : 'large'}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码!' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              登录
            </Button>
          </Form.Item>

          <Form.Item>
            <div style={{ textAlign: 'center' }}>
              还没有账号？<Link to="/register">立即注册</Link>
            </div>
          </Form.Item>
        </Form>
      </Card>

      {/* 微信二维码模态框 */}
      <Modal
        title="账号审核"
        open={isQrModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={isMobile ? '90%' : 500}
        getContainer={document.body}
        maskClosable={false}
        bodyStyle={{ overflowY: 'auto' }}
      >
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <p style={{ fontSize: '16px', marginBottom: '20px' }}>您的账号尚未审核通过，请联系管理员微信进行审核</p>
          <div style={{ marginBottom: '20px' }}>
            {/* 这里可以替换为实际的微信二维码图片 */}
            <div style={{ width: '200px', height: '200px', backgroundColor: '#f0f0f0', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: '#999' }}>
              <img src={qrCodeImage} alt="管理员微信二维码" style={{ width: '100%', height: '100%' }} />
            </div>
          </div>
          <p style={{ fontSize: '14px', color: '#666' }}>请备注：面试题网站账号审核+账号</p>
        </div>
      </Modal>
    </div>
  )
}

export default Login

