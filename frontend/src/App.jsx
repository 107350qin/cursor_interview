import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from 'antd'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import Categories from './pages/Categories'
import Questions from './pages/Questions'
import AddQuestion from './pages/AddQuestion'
import Profile from './pages/Profile'
import MockInterview from './pages/MockInterview'
import UserList from './pages/UserList'
import Login from './pages/Login'
import Register from './pages/Register'
import { useAuthStore } from './store/authStore'
import { useIsMobile } from './utils/device'

// 添加全局样式解决滚动条导致的布局偏移
import './App.css'

const { Content } = Layout

function App() {
  const { isAuthenticated, role } = useAuthStore()

  // 路由权限控制组件
  const ProtectedRoute = ({ children, requireAuth = false, allowedRoles = [] }) => {
    if (requireAuth && !isAuthenticated) {
      return <Navigate to="/login" replace />
    }

    // 如果指定了允许的角色，检查当前角色是否在允许列表中
    if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
      return <Navigate to="/" replace />
    }

    return children
  }

  // 使用公共的移动设备检测Hook
  const isMobile = useIsMobile();

  return (
    <Router>
      <Layout style={{ minHeight: '100vh' }}>
        <Navbar />
        <Content style={{ padding: isMobile ? '10px' : '24px', background: '#fff' }}>
          <Routes>
            {/* 登录和注册路由 - 仅未登录用户可访问 */}
            <Route 
              path="/login" 
              element={
                !isAuthenticated ? (
                  <Login />
                ) : (
                  <Navigate to="/" replace />
                )
              } 
            />
            <Route 
              path="/register" 
              element={
                !isAuthenticated ? (
                  <Register />
                ) : (
                  <Navigate to="/" replace />
                )
              } 
            />
            
            {/* 公共路由 - 所有用户（包括未登录）可访问 */}
            <Route path="/" element={<HomePage />} />
            <Route path="/questions" element={<Questions />} />
            <Route path="/categories" element={<Categories />} />
            
            {/* 需要登录的路由 - 普通用户、管理员、超级管理员均可访问 */}
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute requireAuth={true}>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/add-question" 
              element={
                <ProtectedRoute requireAuth={true}>
                  <AddQuestion />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/mock-interview" 
              element={
                <ProtectedRoute requireAuth={true}>
                  <MockInterview />
                </ProtectedRoute>
              } 
            />
            
            {/* 管理员和超级管理员可访问的路由 */}
            <Route 
              path="/permission-management" 
              element={
                <ProtectedRoute requireAuth={true} allowedRoles={['ADMIN']}>
                  <UserList />
                </ProtectedRoute>
              } 
            />
            {/* 默认路由 */}
            <Route 
              path="*" 
              element={<Navigate to="/" replace />}
            />
          </Routes>
        </Content>
      </Layout>
    </Router>
  )
}

export default App


