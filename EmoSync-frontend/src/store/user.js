import { defineStore } from 'pinia'
import { login, logout } from '@/api/user'

// 安全的localStorage操作工具
const storage = {
  get(key) {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch (error) {
      console.warn(`Failed to parse localStorage item: ${key}`, error)
      localStorage.removeItem(key) // 清除损坏的数据
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
    // 判断是否登录（包含token有效性检查）
    isLoggedIn: (state) => {
      if (!state.token || !state.loginTime) return false

      // 检查token是否过期（假设24小时过期）
      const tokenExpireTime = 24 * 60 * 60 * 1000 // 24小时
      const isExpired = Date.now() - state.loginTime > tokenExpireTime

      return !isExpired
    },

    // 获取用户角色 - 使用userType进行判断
    userRole: (state) => {
      if (!state.userInfo) return ''
      // 兼容roleType和userType字段
      return state.userInfo.roleType || state.userInfo.userType?.toString() || ''
    },

    // 判断是否是管理员 - 使用userType = 2或roleType = 'ADMIN'
    isAdmin: (state) => {
      if (!state.userInfo) return false
      return state.userInfo.userType === 2 || state.userInfo.roleType === 'ADMIN' || state.userInfo.roleType === '2'
    },

    // 判断是否是普通用户 - 使用userType = 1或roleType = 'USER'
    isUser: (state) => {
      if (!state.userInfo) return false
      return state.userInfo.userType === 1 || state.userInfo.roleType === 'USER' || state.userInfo.roleType === '1'
    },

    // 获取用户显示名称 - 优先使用nickname，其次username
    displayName: (state) => {
      if (!state.userInfo) return '未登录'
      return state.userInfo.nickname || state.userInfo.username || '用户'
    },

    // 获取用户头像
    avatar: (state) => state.userInfo?.avatar || '',

    // 获取用户ID
    userId: (state) => state.userInfo?.id || null
  },

  actions: {
    // 初始化用户状态
    initialize() {
      if (this.isInitialized) return

      // 检查登录状态有效性
      if (!this.isLoggedIn) {
        this.clearUserInfo()
      }

      this.isInitialized = true
    },

    // 设置用户信息（登录时调用）
    setUserInfo(data) {
      if (!data) {
        console.warn('setUserInfo: 传入数据为空')
        return
      }

      // 数据验证
      const userInfo = data.userInfo || data
      const token = data.token

      if (!token) {
        console.error('setUserInfo: token不能为空')
        return
      }

      // 更新状态
      this.userInfo = userInfo
      this.token = token
      this.loginTime = Date.now()

      // 持久化存储
      this._saveToStorage()
    },

    // 更新用户信息（不更新token）
    updateUserInfo(data) {
      if (!data) {
        console.warn('updateUserInfo: 传入数据为空')
        return
      }

      // 合并用户信息
      this.userInfo = { ...this.userInfo, ...data }

      // 更新存储
      storage.set('userInfo', this.userInfo)
    },

    // 清除用户信息
    clearUserInfo() {
      this.userInfo = null
      this.token = ''
      this.loginTime = null
      this.isInitialized = false

      // 清除存储
      this._clearStorage()
    },

    // 私有方法：保存到存储
    _saveToStorage() {
      storage.set('userInfo', this.userInfo)
      storage.set('token', this.token)
      storage.set('loginTime', this.loginTime)
    },

    // 私有方法：清除存储
    _clearStorage() {
      storage.remove('userInfo')
      storage.remove('token')
      storage.remove('loginTime')
    },

    // 获取用户信息
    async getUserInfo() {
      try {
        // 首先检查本地缓存
        if (this.userInfo && this.isLoggedIn) {
          return { userInfo: this.userInfo }
        }

        // 如果没有有效的缓存数据，清除状态
        this.clearUserInfo()
        throw new Error('用户未登录或登录已过期')
      } catch (error) {
        this.clearUserInfo()
        throw error
      }
    },

    // 登录
    async login(loginForm) {
      try {
        if (!loginForm) {
          throw new Error('登录表单不能为空')
        }

        const res = await login(loginForm)

        if (!res || !res.token) {
          throw new Error('登录响应数据异常')
        }

        this.setUserInfo(res)
        return res
      } catch (error) {
        this.clearUserInfo()
        console.error('登录失败:', error)
        throw error
      }
    },

    // 退出登录
    async logout() {
      try {
        // 调用后端登出接口
        if (this.token) {
          await logout()
        }
      } catch (error) {
        console.error('调用登出接口失败:', error)
        // 即使接口失败，也要清除本地状态
      } finally {
        this.clearUserInfo()
      }
    },

    // 检查登录状态（兼容旧方法）
    checkLoginStatus() {
      return this.isLoggedIn
    },

    // 刷新token（如果需要）
    async refreshToken() {
      try {
        if (!this.isLoggedIn) {
          throw new Error('用户未登录')
        }

        // 这里可以调用刷新token的API
        // const res = await refreshTokenAPI()
        // this.setUserInfo(res)

        console.log('Token刷新功能待实现')
      } catch (error) {
        console.error('刷新token失败:', error)
        this.clearUserInfo()
        throw error
      }
    },

    // 验证用户权限
    hasPermission(permission) {
      if (!this.userInfo || !this.isLoggedIn) {
        return false
      }

      // 管理员拥有所有权限
      if (this.isAdmin) {
        return true
      }

      // 这里可以根据实际需求实现权限检查逻辑
      return this.userInfo.permissions?.includes(permission) || false
    }
  }
})