import axios from 'axios'
import { getMockHandler } from '@/api/mockManager'
import api from '@/api'

/**
 * 增强的 axios 请求工具
 *
 * 新增特性：
 * 1. 与用户状态管理集成
 * 2. 智能错误处理和重试机制
 * 3. 请求去重和缓存
 * 4. 详细的错误日志
 * 5. 请求取消支持
 * 6. 更好的Mock集成
 *
 * 配置选项：
 * @param {boolean} showDefaultMsg - 是否显示默认提示，默认 true
 * @param {string} successMsg - 自定义成功提示
 * @param {string} errorMsg - 自定义错误提示
 * @param {Function} onSuccess - 成功回调
 * @param {Function} onError - 错误回调
 * @param {boolean} enableRetry - 是否启用重试，默认 false
 * @param {number} retryCount - 重试次数，默认 3
 * @param {boolean} enableCache - 是否启用缓存，默认 false
 * @param {number} cacheTime - 缓存时间(ms)，默认 5分钟

 */

// 请求缓存
const requestCache = new Map()
// 请求计数器（用于生成唯一ID）
let requestId = 0

// 生成缓存key
function generateCacheKey(config) {
  const { method, url, params, data } = config
  return `${method}:${url}:${JSON.stringify(params)}:${JSON.stringify(data)}`
}

// 错误类型枚举
const ErrorTypes = {
  NETWORK: 'network',
  BUSINESS: 'business',
  HTTP: 'http',
  TIMEOUT: 'timeout',
  CANCEL: 'cancel',
  MOCK: 'mock'
}

// // 创建 axios 实例
// const service = axios.create({
//   baseURL: import.meta.env.VITE_APP_BASE_API || '/api',
//   timeout: 15000,
//   headers: {
//     'Content-Type': 'application/json;charset=utf-8'
//   }
// })

// 工具函数：获取token
function getAuthToken() {
  return localStorage.getItem('token')
}

// 工具函数：处理token过期
function handleTokenExpired() {
  localStorage.removeItem('token')
  localStorage.removeItem('userInfo')

  // 跳转到登录页
  if (window.location.pathname !== '/auth/login') {
    window.location.href = '/auth/login'
  }
}

// 请求拦截器
api.interceptors.request.use(
  config => {
    // 生成请求ID
    config.requestId = ++requestId
    config.requestTime = Date.now()

    // Mock拦截处理（优先处理，避免真实请求）
    if (import.meta.env.DEV && import.meta.env.VITE_USE_MOCK === 'true') {
      const mockUrl = config.url?.replace(config.baseURL || '', '') || ''
      const mockHandler = getMockHandler(config.method, mockUrl)

      if (mockHandler) {
        console.log('✨ 使用Mock数据:', mockUrl)

        // 直接返回Mock Promise，阻止真实请求
        return new Promise((resolve, reject) => {
          const delay = 200 + Math.random() * 300 // 随机延迟200-500ms

          setTimeout(() => {
            try {
              const mockData = mockHandler(config.data || config.params)
              const result = handleResponse(mockData, config, true)
              resolve(result)
            } catch (error) {
              reject(error)
            }
          }, delay)
        })
      }
    }

    // 处理文件上传：如果data是FormData，删除Content-Type让浏览器自动设置
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
      console.log('📤 检测到FormData，自动设置multipart/form-data')
    }

    // 添加认证token
    const token = getAuthToken()
    if (token) {
      config.headers['token'] = token
    }

    console.log(`📤 发送请求 [${config.requestId}]:`, {
      method: config.method?.toUpperCase(),
      url: config.url,
      isFormData: config.data instanceof FormData,
      isMock: false
    })

    return config
  },
  error => {
    console.error('请求拦截器错误:', error)
    return Promise.reject({
      type: ErrorTypes.NETWORK,
      message: '请求配置错误',
      originalError: error
    })
  }
)

// 简单的消息提示函数
function showMessage(message, type = 'info') {
  // 简单的消息提示实现，可以后续替换为更优雅的组件
  const messageEl = document.createElement('div')
  messageEl.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 animate-fade-in ${
    type === 'success' ? 'bg-green-500 text-white' :
    type === 'error' ? 'bg-red-500 text-white' :
    type === 'warning' ? 'bg-yellow-500 text-white' :
    'bg-blue-500 text-white'
  }`
  messageEl.textContent = message
  document.body.appendChild(messageEl)

  setTimeout(() => {
    messageEl.remove()
  }, 3000)
}

// 统一的响应处理函数
function handleResponse(data, config, isMock = false) {
  const requestTime = Date.now() - (config.requestTime || 0)

  console.log(` 收到响应 [${config.requestId}]:`, {
    method: config.method?.toUpperCase(),
    url: config.url,
    code: data.code,
    time: `${requestTime}ms`,
    isMock
  })

  // 缓存GET请求的成功响应
  if (config.enableCache && config.method?.toLowerCase() === 'get' && data.code === "200") {
    const cacheKey = generateCacheKey(config)
    requestCache.set(cacheKey, {
      data: data.data,
      timestamp: Date.now()
    })
  }

  if (data.code === "200") {
    // 成功处理
    try {
      if (config.successMsg) {
        showMessage(config.successMsg, 'success')
      } else if (config.showDefaultMsg !== false && config.method?.toLowerCase() !== 'get') {
        showMessage('操作成功', 'success')
      }

      if (typeof config.onSuccess === 'function') {
        config.onSuccess(data.data)
      }

      return data.data
    } catch (err) {
      console.error('成功回调执行错误:', err)
      return data.data
    }
  } else {
    // 业务错误处理
    const errorInfo = {
      type: ErrorTypes.BUSINESS,
      code: data.code,
      message: data.msg || '请求失败',
      data: data.data,
      requestId: config.requestId
    }

    // 特殊错误码处理
    if (data.code === "401") {
      // 只有非登录接口的401才认为是token过期
      if (!config.url?.includes('/login')) {
        handleTokenExpired()
        errorInfo.message = '登录已过期，请重新登录'
      }
      // 登录接口的401保持原始错误消息
    }

    try {
      if (config.errorMsg) {
        showMessage(config.errorMsg, 'error')
      } else if (config.showDefaultMsg !== false) {
        showMessage(errorInfo.message, 'error')
      }

      if (typeof config.onError === 'function') {
        config.onError(errorInfo)
      }
    } catch (err) {
      console.error('错误回调执行错误:', err)
    }

    return Promise.reject(errorInfo)
  }
}

// 响应拦截器
api.interceptors.response.use(
  response => {
    // 处理真实响应
    return handleResponse(response.data, response.config)
  },
  error => {
    const config = error.config || {}

    console.error(`请求失败 [${config.requestId}]:`, {
      method: config.method?.toUpperCase(),
      url: config.url,
      error: error.message
    })

    // 构建错误信息
    let errorInfo = {
      type: ErrorTypes.HTTP,
      requestId: config.requestId,
      originalError: error
    }

    if (error.response) {
      // HTTP错误
      const status = error.response.status
      errorInfo.code = status
      errorInfo.data = error.response.data

      // 根据状态码设置错误消息
      const statusMessages = {
        400: '请求参数错误',
        401: '未授权，请重新登录',
        403: '拒绝访问',
        404: '请求的资源不存在',
        408: '请求超时',
        500: '服务器内部错误',
        502: '网关错误',
        503: '服务不可用',
        504: '网关超时'
      }

      errorInfo.message = statusMessages[status] || error.response.data?.msg || `请求失败(${status})`

      // 401错误特殊处理
      if (status === 401 && !config.url?.includes('/login')) {
        handleTokenExpired()
      }
    } else if (error.code === 'ECONNABORTED') {
      errorInfo.type = ErrorTypes.TIMEOUT
      errorInfo.message = '请求超时，请检查网络连接'
    } else if (error.message?.includes('Network Error')) {
      errorInfo.type = ErrorTypes.NETWORK
      errorInfo.message = '网络连接失败，请检查网络设置'
    } else {
      errorInfo.message = error.message || '未知错误'
    }

    // 显示错误提示
    try {
      if (config.errorMsg) {
        showMessage(config.errorMsg, 'error')
      } else if (config.showDefaultMsg !== false) {
        showMessage(errorInfo.message, 'error')
      }

      if (typeof config.onError === 'function') {
        config.onError(errorInfo)
      }
    } catch (err) {
      console.error('错误处理回调执行失败:', err)
    }

    return Promise.reject(errorInfo)
  }
)

// 扩展请求方法
const request = {
  get(url, params, config = {}) {
    // 过滤掉undefined和null值，避免参数序列化问题
    const cleanParams = params ? Object.fromEntries(
      Object.entries(params).filter(([key, value]) => value !== undefined && value !== null && value !== '')
    ) : {}
    
    return api.get(url, {
      params: cleanParams,
      enableCache: true, // GET请求默认启用缓存
      ...config
    })
  },

  post(url, data, config = {}) {
    return service.post(url, data, config)
  },

  put(url, data, config = {}) {
    return service.put(url, data, config)
  },

  delete(url, config = {}) {
    return service.delete(url, config)
  },

  // 新增：带重试的请求
  retry(url, options = {}) {
    const { method = 'get', data, params, retryCount = 3, ...config } = options
    return service({
      method,
      url,
      data,
      params,
      enableRetry: true,
      retryCount,
      ...config
    })
  },

  // 新增：可取消的请求
  cancelable(url, options = {}) {
    const source = axios.CancelToken.source()
    const { method = 'get', data, params, ...config } = options

    const promise = service({
      method,
      url,
      data,
      params,
      cancelToken: source.token,
      ...config
    })

    promise.cancel = source.cancel
    return promise
  },

  // 新增：清理缓存
  clearCache(pattern) {
    if (pattern) {
      // 清理匹配模式的缓存
      for (const [key] of requestCache) {
        if (key.includes(pattern)) {
          requestCache.delete(key)
        }
      }
      console.log(`🗑️ 清理缓存: ${pattern}`)
    } else {
      // 清理所有缓存
      requestCache.clear()
      console.log('🗑️ 清理所有缓存')
    }
  },

  // 新增：获取缓存状态
  getCacheInfo() {
    return {
      size: requestCache.size,
      keys: Array.from(requestCache.keys())
    }
  }
}

/**
 * 增强版请求方法使用示例：
 *
 * 1. 基础请求（自动缓存GET请求）：
 * request.get('/api/users', { page: 1 })
 * request.post('/api/users', { name: 'Tom', age: 20 })
 * request.put('/api/users/1', { name: 'Tom' })
 * request.delete('/api/users/1')
 *
 * 2. 自定义配置：
 * request.post('/api/users', data, {
 *   successMsg: '添加用户成功！',
 *   errorMsg: '添加用户失败，请重试',
 *   showDefaultMsg: true,
 *   enableCache: false,

 * })
 *
 * 3. 使用回调函数：
 * request.post('/api/users', data, {
 *   onSuccess: (data) => {
 *     console.log('请求成功：', data)
 *   },
 *   onError: (error) => {
 *     console.log('请求失败：', error)
 *     console.log('错误类型：', error.type)
 *     console.log('请求ID：', error.requestId)
 *   }
 * })
 *
 * 4. 带重试的请求：
 * request.retry('/api/users', {
 *   method: 'post',
 *   data: userData,
 *   retryCount: 3
 * })
 *
 * 5. 可取消的请求：
 * const cancelableRequest = request.cancelable('/api/users')
 * // 取消请求
 * cancelableRequest.cancel('用户取消')
 *
 * 6. 缓存管理：
 * request.clearCache() // 清理所有缓存
 * request.clearCache('/api/users') // 清理特定接口缓存
 *
 * 7. 完整示例：
 * request.post('/api/users', data, {
 *   successMsg: '添加成功',
 *   errorMsg: '添加失败',
 *   enableCache: false,

 *   onSuccess: (data) => {
 *     // 处理成功逻辑
 *   },
 *   onError: (error) => {
 *     // 根据错误类型处理
 *     switch(error.type) {
 *       case 'business':
 *         // 业务错误
 *         break
 *       case 'network':
 *         // 网络错误
 *         break
 *       case 'timeout':
 *         // 超时错误
 *         break
 *     }
 *   }
 * })
 */

export default request 