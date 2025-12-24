/**
 * permission utils
 * all permission related helper functions
 */

import store from '@/store'
import { selectIsLoggedIn, selectUserInfo, selectToken } from '@/store/userSlice'

/**
 * initialize auth state
 * check if token is expired and clear user info if needed
 */
export function initAuth() {
  const state = store.getState()

  // if not logged in but token exists, token might be expired
  if (!selectIsLoggedIn(state) && selectToken(state)) {
    console.log('Token expired, redirecting to login page...')
    store.dispatch({ type: 'user/clearUserInfo' })
    redirectToLogin()
  }
}

/**
 * redirect to login page with current path as redirect param
 */
export function redirectToLogin() {
  const currentPath = window.location.pathname

  // avoid redirect loop
  if (currentPath.includes('/auth/')) {
    return
  }

  window.location.href = `/auth/login?redirect=${encodeURIComponent(currentPath)}`
}

/**
 * check if user has specific permission
 * @param {string} permission permission string to check
 * @returns {boolean}
 */
export function checkPermission(permission) {
  const state = store.getState()
  const userInfo = selectUserInfo(state)

  if (!userInfo || !selectIsLoggedIn(state)) {
    return false
  }

  // admin has all permissions by default
  if (userInfo.userType === 2 || userInfo.roleType === 'ADMIN') {
    return true
  }

  return userInfo.permissions?.includes(permission) || false
}

/**
 * permission guard function
 * used before accessing protected routes or actions
 * @param {string|Array} permissions needed permission(s)
 * @returns {boolean}
 */
export function requireAuth(permissions = []) {
  const state = store.getState()

  // check login status
  if (!selectIsLoggedIn(state)) {
    redirectToLogin()
    return false
  }

  // check permissions
  if (permissions.length > 0) {
    const hasPermission = Array.isArray(permissions)
      ? permissions.some(p => checkPermission(p))
      : checkPermission(permissions)

    if (!hasPermission) {
      console.warn('Permission denied:', permissions)
      return false
    }
  }

  return true
}

/**
 * logout user safely
 * calls logout action and redirects to login page
 */
export async function safeLogout() {
  try {
    await store.dispatch({ type: 'user/logoutUser' })
  } catch (error) {
    console.error('Error while logging out:', error)
  } finally {
    // ensure redirect to login page
    window.location.href = '/auth/login'
  }
}

/**
 * Safe wrapper to get user info
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
 * roleCheck function
 * provide methods to check user roles
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
