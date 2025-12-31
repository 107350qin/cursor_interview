import { useAuthStore } from '../store/authStore'

/**
 * 检查用户是否有指定权限
 * @param {string} permissionCode 权限代码，支持新旧格式：
 *   - 新格式：'system:user:edit:button'（冒号分层命名）
 *   - 旧格式：'button.user.edit'（兼容）
 * @returns {boolean} 是否有权限
 */
export const hasPermission = (permissionCode) => {
  const { role } = useAuthStore.getState()
  // 超级管理员拥有所有权限
  if (role === 'SUPER_ADMIN') {
    return true
  }
  
  const { permissions } = useAuthStore.getState()
  if (!permissions || !permissions.permissionCodes) {
    return false
  }
  // 支持新旧格式的权限代码
  return permissions.permissionCodes.includes(permissionCode) ||
         permissions.permissionCodes.some(code => {
           // 兼容旧格式：button.user.edit -> system:user:edit:button
           const oldFormat = permissionCode.replace(/\./g, ':')
           return code === oldFormat || code === permissionCode
         })
}

/**
 * 检查用户是否有多个权限中的任意一个
 * @param {string[]} permissionCodes 权限代码数组
 * @returns {boolean} 是否有任意一个权限
 */
export const hasAnyPermission = (permissionCodes) => {
  const { role } = useAuthStore.getState()
  // 超级管理员拥有所有权限
  if (role === 'SUPER_ADMIN') {
    return true
  }
  
  return permissionCodes.some(code => hasPermission(code))
}

/**
 * 检查用户是否拥有所有指定权限
 * @param {string[]} permissionCodes 权限代码数组
 * @returns {boolean} 是否拥有所有权限
 */
export const hasAllPermissions = (permissionCodes) => {
  const { role } = useAuthStore.getState()
  // 超级管理员拥有所有权限
  if (role === 'SUPER_ADMIN') {
    return true
  }
  
  return permissionCodes.every(code => hasPermission(code))
}

/**
 * React Hook: 检查权限
 * @param {string} permissionCode 权限代码
 * @returns {boolean} 是否有权限
 */
export const usePermission = (permissionCode) => {
  const { role, permissions } = useAuthStore()
  // 超级管理员拥有所有权限
  if (role === 'SUPER_ADMIN') {
    return true
  }
  
  if (!permissions || !permissions.permissionCodes) {
    return false
  }
  return permissions.permissionCodes.includes(permissionCode)
}

