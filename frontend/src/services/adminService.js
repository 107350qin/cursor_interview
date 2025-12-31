import api from './api'
import { useAuthStore } from '../store/authStore'

// 根据角色获取API前缀
const getApiPrefix = () => {
  const { role } = useAuthStore.getState()
  return role === 'SUPER_ADMIN' ? '/super-admin' : '/admin'
}

export const adminService = {
  // 获取所有用户列表
  getAllUsers: (params) => {
    const prefix = getApiPrefix()
    return api.get(`${prefix}/users`, { params })
  },

  // 更新用户信息（仅超级管理员）
  updateUser: (userId, data) => {
    return api.put(`/super-admin/users/${userId}`, data)
  },

  // 删除用户（仅超级管理员）
  deleteUser: (userId) => {
    return api.delete(`/super-admin/users/${userId}`)
  },

  // 封禁/解禁用户
  banOrUnbanUser: (userId, status) => {
    const prefix = getApiPrefix()
    return api.put(`${prefix}/users/${userId}/status`, null, { params: { status } })
  },

  // 重置用户密码（仅超级管理员）
  resetUserPassword: (userId, newPassword) => {
    return api.put(`/super-admin/users/${userId}/password`, { newPassword })
  },

  // 获取待审核的题目列表
  getPendingQuestions: (params) => {
    return api.get('/admin/questions/pending', { params })
  },

  // 审核题目（通过或拒绝）
  reviewQuestion: (questionId, status) => {
    return api.put(`/admin/questions/${questionId}/review`, null, { params: { status } })
  },
}

