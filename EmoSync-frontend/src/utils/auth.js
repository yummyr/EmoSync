/**
 * 认证相关工具函数
 * 配合Redux store使用
 */

import store from '@/store'
import { selectIsLoggedIn, selectUserInfo, selectToken } from '@/store/userSlice'

/**
 * 初始化认证状态
 * 应用启动时调用
 */
export function initAuth() {
  const state = store.getState()

  // 如果token过期，自动跳转到登录页
  if (!selectIsLoggedIn(state) && selectToken(state)) {
    console.log('Token已过期，自动登出')
    store.dispatch({ type: 'user/clearUserInfo' })
    redirectToLogin()
  }
}

/**
 * 跳转到登录页
 */
export function redirectToLogin() {
  const currentPath = window.location.pathname

  // 避免在登录页重复跳转
  if (currentPath.includes('/auth/')) {
    return
  }

  window.location.href = `/auth/login?redirect=${encodeURIComponent(currentPath)}`
}

/**
 * 检查用户权限
 * @param {string} permission 权限标识
 * @returns {boolean}
 */
export function checkPermission(permission) {
  const state = store.getState()
  const userInfo = selectUserInfo(state)

  if (!userInfo || !selectIsLoggedIn(state)) {
    return false
  }

  // 管理员拥有所有权限
  if (userInfo.userType === 2 || userInfo.roleType === 'ADMIN') {
    return true
  }

  return userInfo.permissions?.includes(permission) || false
}

/**
 * 权限守卫函数
 * 用于路由守卫或组件守卫
 * @param {string|Array} permissions 需要的权限
 * @returns {boolean}
 */
export function requireAuth(permissions = []) {
  const state = store.getState()

  // 检查是否登录
  if (!selectIsLoggedIn(state)) {
    redirectToLogin()
    return false
  }

  // 检查权限
  if (permissions.length > 0) {
    const hasPermission = Array.isArray(permissions)
      ? permissions.some(p => checkPermission(p))
      : checkPermission(permissions)

    if (!hasPermission) {
      console.warn('用户权限不足:', permissions)
      return false
    }
  }

  return true
}

/**
 * 安全登出
 * 清除所有用户状态并跳转
 */
export async function safeLogout() {
  try {
    await store.dispatch({ type: 'user/logoutUser' })
  } catch (error) {
    console.error('登出过程中发生错误:', error)
  } finally {
    // 确保跳转到登录页
    window.location.href = '/auth/login'
  }
}

/**
 * 获取用户信息的安全包装
 * @returns {Object|null}
 */
export function getCurrentUser() {
  const state = store.getState()

  if (!selectIsLoggedIn(state)) {
    return null
  }

  const userInfo = selectUserInfo(state)

  return {
    id: userInfo?.id,
    name: userInfo?.nickname || userInfo?.username,
    role: userInfo?.roleType || userInfo?.userType?.toString(),
    avatar: userInfo?.avatar,
    isAdmin: userInfo?.userType === 2 || userInfo?.roleType === 'ADMIN',
    isUser: userInfo?.userType === 1 || userInfo?.roleType === 'USER'
  }
}

/**
 * 角色检查工具
 */
export const roleCheck = {
  isAdmin() {
    const state = store.getState()
    const userInfo = selectUserInfo(state)
    return userInfo?.userType === 2 || userInfo?.roleType === 'ADMIN'
  },

  isUser() {
    const state = store.getState()
    const userInfo = selectUserInfo(state)
    return userInfo?.userType === 1 || userInfo?.roleType === 'USER'
  },

  hasRole(role) {
    const state = store.getState()
    const userInfo = selectUserInfo(state)
    return (userInfo?.roleType || userInfo?.userType?.toString()) === role
  }
}
