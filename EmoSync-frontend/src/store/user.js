import { defineStore } from 'pinia'
import { login, logout } from '@/api/user'

// Secure localStorage utility
const storage = {
  get(key) {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch (error) {
      console.warn(`Failed to parse localStorage item: ${key}`, error)
      localStorage.removeItem(key) // Clear corrupted data
      return null
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`Failed to set localStorage item: ${key}`, error)
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error(`Failed to remove localStorage item: ${key}`, error)
    }
  }
}

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: storage.get('userInfo'),
    token: storage.get('token') || '',
    loginTime: storage.get('loginTime') || null,
    isInitialized: false
  }),

  getters: {
    // Check if logged in (includes token validity check)
    isLoggedIn: (state) => {
      if (!state.token || !state.loginTime) return false

      // Check if token has expired (assumes 24-hour expiration)
      const tokenExpireTime = 24 * 60 * 60 * 1000 // 24 hours
      const isExpired = Date.now() - state.loginTime > tokenExpireTime

      return !isExpired
    },

    // Get user role - use userType for determination
    userRole: (state) => {
      if (!state.userInfo) return ''
      // Support both roleType and userType fields
      return state.userInfo.roleType || state.userInfo.userType?.toString() || ''
    },

    // Check if user is admin - use userType = 2 or roleType = 'ADMIN'
    isAdmin: (state) => {
      if (!state.userInfo) return false
      return state.userInfo.userType === 2 || state.userInfo.roleType === 'ADMIN' || state.userInfo.roleType === '2'
    },

    // Check if user is regular user - use userType = 1 or roleType = 'USER'
    isUser: (state) => {
      if (!state.userInfo) return false
      return state.userInfo.userType === 1 || state.userInfo.roleType === 'USER' || state.userInfo.roleType === '1'
    },

    // Get user display name - prioritize nickname, then username
    displayName: (state) => {
      if (!state.userInfo) return 'Not Logged In'
      return state.userInfo.nickname || state.userInfo.username || 'User'
    },

    // Get user avatar
    avatar: (state) => state.userInfo?.avatar || '',

    // Get user ID
    userId: (state) => state.userInfo?.id || null
  },

  actions: {
    // Initialize user state
    initialize() {
      if (this.isInitialized) return

      // Check login status validity
      if (!this.isLoggedIn) {
        this.clearUserInfo()
      }

      this.isInitialized = true
    },

    // Set user information (called during login)
    setUserInfo(data) {
      if (!data) {
        console.warn('setUserInfo: Input data is empty')
        return
      }

      // Data validation
      const userInfo = data.userInfo || data
      const token = data.token

      if (!token) {
        console.error('setUserInfo: token cannot be empty')
        return
      }

      // Update state
      this.userInfo = userInfo
      this.token = token
      this.loginTime = Date.now()

      // Persist to storage
      this._saveToStorage()
    },

    // Update user information (does not update token)
    updateUserInfo(data) {
      if (!data) {
        console.warn('updateUserInfo: Input data is empty')
        return
      }

      // Merge user information
      this.userInfo = { ...this.userInfo, ...data }

      // Update storage
      storage.set('userInfo', this.userInfo)
    },

    // Clear user information
    clearUserInfo() {
      this.userInfo = null
      this.token = ''
      this.loginTime = null
      this.isInitialized = false

      // Clear storage
      this._clearStorage()
    },

    // Private method: Save to storage
    _saveToStorage() {
      storage.set('userInfo', this.userInfo)
      storage.set('token', this.token)
      storage.set('loginTime', this.loginTime)
    },

    // Private method: Clear storage
    _clearStorage() {
      storage.remove('userInfo')
      storage.remove('token')
      storage.remove('loginTime')
    },

    // Get user information
    async getUserInfo() {
      try {
        // First check local cache
        if (this.userInfo && this.isLoggedIn) {
          return { userInfo: this.userInfo }
        }

        // If no valid cache data, clear state
        this.clearUserInfo()
        throw new Error('User not logged in or session has expired')
      } catch (error) {
        this.clearUserInfo()
        throw error
      }
    },

    // Login
    async login(loginForm) {
      try {
        if (!loginForm) {
          throw new Error('Login form cannot be empty')
        }

        const res = await login(loginForm)

        if (!res || !res.token) {
          throw new Error('Login response data is abnormal')
        }

        this.setUserInfo(res)
        return res
      } catch (error) {
        this.clearUserInfo()
        console.error('Login failed:', error)
        throw error
      }
    },

    // Logout
    async logout() {
      try {
        // Call backend logout endpoint
        if (this.token) {
          await logout()
        }
      } catch (error) {
        console.error('Failed to call logout endpoint:', error)
        // Clear local state even if endpoint fails
      } finally {
        this.clearUserInfo()
      }
    },

    // Check login status (legacy method compatibility)
    checkLoginStatus() {
      return this.isLoggedIn
    },

    // Refresh token (if needed)
    async refreshToken() {
      try {
        if (!this.isLoggedIn) {
          throw new Error('User is not logged in')
        }

        // Call refresh token API here
        // const res = await refreshTokenAPI()
        // this.setUserInfo(res)

        console.log('Token refresh feature to be implemented')
      } catch (error) {
        console.error('Failed to refresh token:', error)
        this.clearUserInfo()
        throw error
      }
    },

    // Verify user permissions
    hasPermission(permission) {
      if (!this.userInfo || !this.isLoggedIn) {
        return false
      }

      // Admins have all permissions
      if (this.isAdmin) {
        return true
      }

      // Permission check logic can be implemented here based on requirements
      return this.userInfo.permissions?.includes(permission) || false
    }
  }
})