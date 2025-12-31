import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from 'antd'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import HotQuestions from './pages/HotQuestions'
import Categories from './pages/Categories'
import LatestQuestions from './pages/LatestQuestions'
import Category from './pages/Category'
import QuestionDetail from './pages/QuestionDetail'
import AddQuestion from './pages/AddQuestion'
import Profile from './pages/Profile'
import MockInterview from './pages/MockInterview'
import PermissionManagement from './pages/PermissionManagement'
import QuestionReview from './pages/QuestionReview'
import Login from './pages/Login'
import Register from './pages/Register'
import { useAuthStore } from './store/authStore'

const { Content } = Layout

function App() {
  const { isAuthenticated, role } = useAuthStore()
  const isSuperAdmin = role === 'SUPER_ADMIN'
  const isAdmin = role === 'ADMIN'
  const isUser = role === 'USER'

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

  return (
    <Router>
      <Layout style={{ minHeight: '100vh' }}>
        <Navbar />
        <Content style={{ padding: '24px', background: '#fff' }}>
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
            <Route path="/hot-questions" element={<HotQuestions />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/latest-questions" element={<LatestQuestions />} />
            <Route path="/category/:id" element={<Category />} />
            <Route path="/question/:id" element={<QuestionDetail />} />
            
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
                <ProtectedRoute requireAuth={true} allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
                  <PermissionManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/question-review" 
              element={
                <ProtectedRoute requireAuth={true} allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
                  <QuestionReview />
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


