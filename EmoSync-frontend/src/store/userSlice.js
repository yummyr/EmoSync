import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { login, logout } from '@/api/user'

// 安全的localStorage操作工具
const storage = {
  get(key) {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch (error) {
      console.warn(`Failed to parse localStorage item: ${key}`, error)
      localStorage.removeItem(key)
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

// 初始状态
const initialState = {
  userInfo: storage.get('userInfo'),
  token: storage.get('token') || '',
  loginTime: storage.get('loginTime') || null,
  isInitialized: false,
  isLoading: false,
  error: null,
  // 确保有默认的状态值
  isLoggedIn: false,
  isUser: false,
  isAdmin: false,
}

// 异步actions
export const loginUser = createAsyncThunk(
  'user/login',
  async (loginForm, { rejectWithValue }) => {
    try {
      if (!loginForm) {
        throw new Error('登录表单不能为空')
      }

      const res = await login(loginForm)

      if (!res || !res.token) {
        throw new Error('登录响应数据异常')
      }

      return res
    } catch (error) {
      return rejectWithValue(error.message || '登录失败')
    }
  }
)

export const logoutUser = createAsyncThunk(
  'user/logout',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().user
      if (token) {
        await logout()
      }
    } catch (error) {
      console.error('调用登出接口失败:', error)
      // 即使接口失败，也要继续清除本地状态
    }
  }
)

export const getUserInfo = createAsyncThunk(
  'user/getUserInfo',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { userInfo, isLoggedIn } = getState().user

      // 首先检查本地缓存
      if (userInfo && isLoggedIn) {
        return { userInfo }
      }

      throw new Error('用户未登录或登录已过期')
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// 用户slice
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    initialize: (state) => {
      if (state.isInitialized) return

      // 检查登录状态有效性
      if (!getters.isLoggedIn(state)) {
        userSlice.caseReducers.clearUserInfo(state)
      }

      state.isInitialized = true
    },

    setUserInfo: (state, action) => {
      const data = action.payload
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
      state.userInfo = userInfo
      state.token = token
      state.loginTime = Date.now()

      // 持久化存储
      saveToStorage(state)
    },

    updateUserInfo: (state, action) => {
      const data = action.payload
      if (!data) {
        console.warn('updateUserInfo: 传入数据为空')
        return
      }

      // 合并用户信息
      state.userInfo = { ...state.userInfo, ...data }

      // 更新存储
      storage.set('userInfo', state.userInfo)
    },

    clearUserInfo: (state) => {
      state.userInfo = null
      state.token = ''
      state.loginTime = null
      state.isInitialized = false
      state.error = null

      // 清除存储
      clearStorage()
    },

    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // 登录
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false
        userSlice.caseReducers.setUserInfo(state, action)
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
        userSlice.caseReducers.clearUserInfo(state)
      })
      // 登出
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false
        userSlice.caseReducers.clearUserInfo(state)
      })
      .addCase(logoutUser.rejected, (state) => {
        state.isLoading = false
        userSlice.caseReducers.clearUserInfo(state)
      })
      // 获取用户信息
      .addCase(getUserInfo.fulfilled, (state, action) => {
        if (action.payload) {
          state.userInfo = action.payload.userInfo
        }
      })
      .addCase(getUserInfo.rejected, (state) => {
        userSlice.caseReducers.clearUserInfo(state)
      })
  },
})

// 私有工具函数
const saveToStorage = (state) => {
  storage.set('userInfo', state.userInfo)
  storage.set('token', state.token)
  storage.set('loginTime', state.loginTime)
}

const clearStorage = () => {
  storage.remove('userInfo')
  storage.remove('token')
  storage.remove('loginTime')
}

// Getters (计算属性)
export const getters = {
  isLoggedIn: (state) => {
    if (!state.token || !state.loginTime) return false

    // 检查token是否过期（假设24小时过期）
    const tokenExpireTime = 24 * 60 * 60 * 1000 // 24小时
    const isExpired = Date.now() - state.loginTime > tokenExpireTime

    return !isExpired
  },

  userRole: (state) => {
    if (!state.userInfo) return ''
    // 兼容roleType和userType字段
    return state.userInfo.roleType || state.userInfo.userType?.toString() || ''
  },

  isAdmin: (state) => {
    if (!state.userInfo) return false
    return state.userInfo.userType === 2 || state.userInfo.roleType === 'ADMIN' || state.userInfo.roleType === '2'
  },

  isUser: (state) => {
    if (!state.userInfo) return false
    return state.userInfo.userType === 1 || state.userInfo.roleType === 'USER' || state.userInfo.roleType === '1'
  },

  displayName: (state) => {
    if (!state.userInfo) return '未登录'
    return state.userInfo.nickname || state.userInfo.username || '用户'
  },

  avatar: (state) => state.userInfo?.avatar || '',

  userId: (state) => state.userInfo?.id || null,
}

// 导出actions
export const { initialize, setUserInfo, updateUserInfo, clearUserInfo, clearError } = userSlice.actions

// 选择器
export const selectUser = (state) => state.user
export const selectUserInfo = (state) => state.user.userInfo
export const selectToken = (state) => state.user.token
export const selectIsLoggedIn = (state) => getters.isLoggedIn(state.user)
export const selectIsAdmin = (state) => getters.isAdmin(state.user)
export const selectIsUser = (state) => getters.isUser(state.user)
export const selectDisplayName = (state) => getters.displayName(state.user)
export const selectAvatar = (state) => getters.avatar(state.user)
export const selectUserId = (state) => getters.userId(state.user)
export const selectIsLoading = (state) => state.user.isLoading
export const selectError = (state) => state.user.error

export default userSlice.reducer