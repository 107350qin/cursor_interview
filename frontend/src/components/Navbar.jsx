import { Layout, Button, Space, Dropdown } from 'antd'
import { HomeOutlined, UserOutlined, LogoutOutlined, PlusOutlined, EditOutlined, TeamOutlined, SettingOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { hasPermission } from '../utils/permission'

const { Header } = Layout

function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, username, role, clearAuth } = useAuthStore()
  const isSuperAdmin = role === 'SUPER_ADMIN'
  const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN'

  // 处理导航点击
  const handleMenuClick = ({ key }) => {
    navigate(key)
  }

  const handleLogout = () => {
    clearAuth()
    navigate('/login')
  }

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人中心',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ]

  // 所有可用菜单定义
  const allMenuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: '首页',
      permission: 'system:menu:home',
    },
    {
      key: '/hot-questions',
      label: '热门题目',
      permission: 'system:menu:hot-questions',
    },
    {
      key: '/categories',
      label: '分类导航',
      permission: 'system:menu:categories',
    },
    {
      key: '/latest-questions',
      label: '最新题目',
      permission: 'system:menu:latest-questions',
      icon: <SettingOutlined />,
    },
    // 如果是管理员或超级管理员登录才添加管理菜单
    ...(isAdmin ? [
      {
        key: '/question-review',
        icon: <CheckCircleOutlined />,
        label: '题目审核',
        permission: 'system:menu:question-review',
      },
      ...(isSuperAdmin ? [{
        key: '/permission-management',
        icon: <SettingOutlined />,
        label: '权限管理',
        permission: 'system:menu:permission-management',
      }] : []),
    ] : []),
  ]

  // 动态生成菜单：根据用户权限过滤可用菜单
  const generateMenuItems = () => {
    // 公共菜单：对所有用户可见
    const publicMenuKeys = ['/', '/hot-questions', '/categories', '/latest-questions']
    // 管理员菜单：对管理员和超级管理员可见，不需要权限检查
    const adminMenuKeys = ['/question-review', '/permission-management']
    
    // 超级管理员拥有所有菜单权限
    if (isSuperAdmin) {
      return allMenuItems
    }

    // 管理员菜单对管理员可见
    if (isAdmin) {
      return allMenuItems.filter(item => {
        // 公共菜单和管理员菜单对相应角色可见
        if (publicMenuKeys.includes(item.key) || adminMenuKeys.includes(item.key)) {
          return true
        }
        // 没有定义权限的菜单默认可访问
        if (!item.permission) {
          return true
        }
        // 检查是否有权限
        return hasPermission(item.permission) || hasPermission(`menu.${item.key.replace(/\//g, '.').replace(/^\./, '')}`)
      })
    }

    // 普通用户根据权限显示菜单
    return allMenuItems.filter(item => {
      // 公共菜单对所有用户可见
      if (publicMenuKeys.includes(item.key)) {
        return true
      }
      // 没有定义权限的菜单默认可访问
      if (!item.permission) {
        return true
      }
      // 检查是否有权限
      return hasPermission(item.permission) || hasPermission(`menu.${item.key.replace(/\//g, '.').replace(/^\./, '')}`)
    })
  }

  const menuItems = generateMenuItems()

  return (
    <Header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', borderBottom: '1px solid #f0f0f0', height: '64px', lineHeight: '64px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            cursor: 'pointer',
            padding: '8px 12px',
            borderRadius: '8px',
            transition: 'all 0.3s',
          }}
          onClick={() => navigate((isSuperAdmin || role === 'ADMIN') && isAuthenticated ? '/permission-management' : '/')}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#f5f5f5'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
          }}
        >
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)'
          }}>
            <span style={{ 
              fontSize: '16px', 
              fontWeight: 'bold', 
              color: '#fff',
              letterSpacing: '-0.5px'
            }}>1024</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
            <span style={{ 
              fontSize: '18px', 
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Interview
            </span>
            <span style={{ 
              fontSize: '12px', 
              color: '#8c8c8c',
              fontWeight: 'normal'
            }}>
              面试题库
            </span>
          </div>
        </div>
        <Space size="large" style={{ height: '100%' }}>
          {menuItems.map(item => {
            const isActive = location.pathname === item.key
            return (
              <div
                key={item.key}
                onClick={() => navigate(item.key)}
                style={{
                  position: 'relative',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  padding: '0 4px',
                  color: isActive ? '#1890ff' : 'rgba(0, 0, 0, 0.85)',
                  fontWeight: isActive ? 500 : 400,
                }}
              >
                {item.icon && <span style={{ marginRight: '6px' }}>{item.icon}</span>}
                <span>{item.label}</span>
                {isActive && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '2px',
                      background: '#1890ff',
                    }}
                  />
                )}
              </div>
            )
          })}
        </Space>
      </div>
      <Space>
        {isAuthenticated ? (
          <>
            {(hasPermission('question:add:button') || hasPermission('button.question.add')) && (
              <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/add-question')}>
                添加题目
              </Button>
            )}
            {(hasPermission('interview:mock:button') || hasPermission('button.interview.mock')) && (
              <Button icon={<EditOutlined />} onClick={() => navigate('/mock-interview')}>
                模拟面试
              </Button>
            )}
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Button type="text" icon={<UserOutlined />}>
                {username}
              </Button>
            </Dropdown>
          </>
        ) : (
          <>
            <Button onClick={() => navigate('/login')}>登录</Button>
            <Button type="primary" onClick={() => navigate('/register')}>注册</Button>
          </>
        )}
      </Space>
    </Header>
  )
}

export default Navbar

