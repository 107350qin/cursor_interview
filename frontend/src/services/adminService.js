import api from './api'

export const adminService = {
  // 获取所有用户列表
  getAllUsers: (params) => {
    return api.get(`/admin/users`, { params })
  },

  // 更新用户信息（仅超级管理员）
  updateUser: (data) => {
    return api.put(`/admin/user`, data)
  }
}

