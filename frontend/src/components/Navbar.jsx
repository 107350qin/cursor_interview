import { useState } from 'react'
import { Layout, Button, Space, Dropdown, Menu, Drawer } from 'antd'
import { HomeOutlined, UserOutlined, LogoutOutlined, PlusOutlined, EditOutlined, TeamOutlined, SettingOutlined, CheckCircleOutlined, MenuOutlined } from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useIsMobile } from '../utils/device'

const { Header } = Layout

function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, username, role, clearAuth } = useAuthStore()
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false)
  const isAdmin = role === 'ADMIN'

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
    },
    {
      key: '/questions',
      icon: <CheckCircleOutlined />,
      label: '题目列表',
    },
    {
      key: '/categories',
      icon: <TeamOutlined />,
      label: '分类导航',
    },
    // 如果是超级管理员登录才添加权限管理菜单
    ...(isAdmin ? [{
      key: '/permission-management',
      icon: <SettingOutlined />,
      label: '权限管理',
    }] : []),
  ]

  // 动态生成菜单：根据用户角色过滤可用菜单
  const generateMenuItems = () => {
    return allMenuItems
  }

  const menuItems = generateMenuItems()

  // 使用公共的移动设备检测Hook
  const isMobile = useIsMobile();

  // 处理移动端菜单点击
  const handleMobileMenuClick = (item) => {
    setMobileMenuVisible(false);
    navigate(item.key);
  };

  return (
    <>
      <Header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', borderBottom: '1px solid #f0f0f0', height: '64px', lineHeight: '64px', padding: '0 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', width: '100%' }}>
          {/* Logo */}
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
            onClick={() => navigate((isAdmin) && isAuthenticated ? '/permission-management' : '/')}
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
            {!isMobile && (
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
            )}
          </div>
          
          {/* 移动端菜单按钮 */}
          {isMobile ? (
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setMobileMenuVisible(true)}
              style={{ marginLeft: 'auto' }}
            >
              菜单
            </Button>
          ) : (
            /* 桌面端菜单 */
            <Space size="large">
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
                      padding: '0 16px',
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
          )}
        </div>
        
        {/* 操作按钮 */}
        {!isMobile && (
          <Space style={{ marginLeft: 'auto' }}>
            {isAuthenticated ? (
              <>
                {/* 所有登录用户都可以添加题目 */}
                <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/add-question')}>
                  添加题目
                </Button>
                {/* 所有登录用户都可以进行模拟面试 */}
                <Button icon={<EditOutlined />} onClick={() => navigate('/mock-interview')}>
                  模拟面试
                </Button>
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
        )}
      </Header>
      
      {/* 移动端抽屉菜单 */}
        <Drawer
          title="菜单"
          placement="left"
          onClose={() => setMobileMenuVisible(false)}
          open={mobileMenuVisible}
          width={256}
        >
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems.map(item => ({
              key: item.key,
              icon: item.icon,
              label: item.label,
              onClick: () => handleMobileMenuClick(item)
            }))}
          />
          
          {/* 移动端操作按钮 */}
          <div style={{ padding: '16px' }}>
            {isAuthenticated ? (
              <Space direction="vertical" style={{ width: '100%' }}>
                {/* 所有登录用户都可以添加题目 */}
                <Button type="primary" icon={<PlusOutlined />} onClick={() => {
                  setMobileMenuVisible(false);
                  navigate('/add-question');
                }} block>
                  添加题目
                </Button>
                {/* 所有登录用户都可以进行模拟面试 */}
                <Button icon={<EditOutlined />} onClick={() => {
                  setMobileMenuVisible(false);
                  navigate('/mock-interview');
                }} block>
                  模拟面试
                </Button>
                <Menu
                  mode="inline"
                  items={userMenuItems.map(item => ({
                    key: item.key,
                    icon: item.icon,
                    label: item.label,
                    onClick: () => {
                      setMobileMenuVisible(false);
                      item.onClick();
                    }
                  }))}
                />
              </Space>
            ) : (
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button onClick={() => {
                  setMobileMenuVisible(false);
                  navigate('/login');
                }} block>
                  登录
                </Button>
                <Button type="primary" onClick={() => {
                  setMobileMenuVisible(false);
                  navigate('/register');
                }} block>
                  注册
                </Button>
              </Space>
            )}
          </div>
        </Drawer>
    </>
  )
}

export default Navbar

