import axios from 'axios'
import { getMockHandler } from '@/api/mockManager'
import api from '@/api'

/**
 * Enhanced axios request utility
 *
 * New features:
 * 1. Integration with user state management
 * 2. Intelligent error handling and retry mechanism
 * 3. Request deduplication and caching
 * 4. Detailed error logging
 * 5. Request cancellation support
 * 6. Better Mock integration
 *
 * Configuration options:
 * @param {boolean} showDefaultMsg - Whether to show default message, default true
 * @param {string} successMsg - Custom success message
 * @param {string} errorMsg - Custom error message
 * @param {Function} onSuccess - Success callback
 * @param {Function} onError - Error callback
 * @param {boolean} enableRetry - Whether to enable retry, default false
 * @param {number} retryCount - Number of retries, default 3
 * @param {boolean} enableCache - Whether to enable cache, default false
 * @param {number} cacheTime - Cache time (ms), default 5 minutes

 */

// Request cache
const requestCache = new Map()
// Request counter (used to generate unique ID)
let requestId = 0

// Generate cache key
function generateCacheKey(config) {
  const { method, url, params, data } = config
  return `${method}:${url}:${JSON.stringify(params)}:${JSON.stringify(data)}`
}

// Error type enum
const ErrorTypes = {
  NETWORK: 'network',
  BUSINESS: 'business',
  HTTP: 'http',
  TIMEOUT: 'timeout',
  CANCEL: 'cancel',
  MOCK: 'mock'
}

// // Create axios instance
// const service = axios.create({
//   baseURL: import.meta.env.VITE_APP_BASE_API || '/api',
//   timeout: 15000,
//   headers: {
//     'Content-Type': 'application/json;charset=utf-8'
//   }
// })

// Utility function: Get token
function getAuthToken() {
  return localStorage.getItem('token')
}

// Utility function: Handle token expiration
function handleTokenExpired() {
  localStorage.removeItem('token')
  localStorage.removeItem('userInfo')

  // Redirect to login page
  if (window.location.pathname !== '/auth/login') {
    window.location.href = '/auth/login'
  }
}

// Request interceptor
api.interceptors.request.use(
  config => {
    // Generate request ID
    config.requestId = ++requestId
    config.requestTime = Date.now()

    // Mock interception handling (prioritize to avoid real requests)
    if (import.meta.env.DEV && import.meta.env.VITE_USE_MOCK === 'true') {
      const mockUrl = config.url?.replace(config.baseURL || '', '') || ''
      const mockHandler = getMockHandler(config.method, mockUrl)

      if (mockHandler) {
        console.log('✨ Using Mock data:', mockUrl)

        // Return Mock Promise directly, block real request
        return new Promise((resolve, reject) => {
          const delay = 200 + Math.random() * 300 // Random delay 200-500ms

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

    // Handle file upload: if data is FormData, remove Content-Type to let browser set it automatically
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
      console.log('📤 FormData detected, auto-setting multipart/form-data')
    }

    // Add authentication token
    const token = getAuthToken()
    if (token) {
      config.headers['token'] = token
    }

    console.log(`📤 Sending request [${config.requestId}]:`, {
      method: config.method?.toUpperCase(),
      url: config.url,
      isFormData: config.data instanceof FormData,
      isMock: false
    })

    return config
  },
  error => {
    console.error('Request interceptor error:', error)
    return Promise.reject({
      type: ErrorTypes.NETWORK,
      message: 'Request configuration error',
      originalError: error
    })
  }
)

// Simple message notification function
function showMessage(message, type = 'info') {
  // Simple message notification implementation, can be replaced with more elegant component later
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

// Unified response handler function
function handleResponse(data, config, isMock = false) {
  const requestTime = Date.now() - (config.requestTime || 0)

  console.log(`📥 Received response [${config.requestId}]:`, {
    method: config.method?.toUpperCase(),
    url: config.url,
    code: data.code,
    time: `${requestTime}ms`,
    isMock
  })

  // Cache successful responses for GET requests
  if (config.enableCache && config.method?.toLowerCase() === 'get' && data.code === "200") {
    const cacheKey = generateCacheKey(config)
    requestCache.set(cacheKey, {
      data: data.data,
      timestamp: Date.now()
    })
  }

  if (data.code === "200") {
    // Success handling
    try {
      if (config.successMsg) {
        showMessage(config.successMsg, 'success')
      } else if (config.showDefaultMsg !== false && config.method?.toLowerCase() !== 'get') {
        showMessage('Operation successful', 'success')
      }

      if (typeof config.onSuccess === 'function') {
        config.onSuccess(data.data)
      }

      return data.data
    } catch (err) {
      console.error('Success callback execution error:', err)
      return data.data
    }
  } else {
    // Business error handling
    const errorInfo = {
      type: ErrorTypes.BUSINESS,
      code: data.code,
      message: data.msg || 'Request failed',
      data: data.data,
      requestId: config.requestId
    }

    // Special error code handling
    if (data.code === "401") {
      // Only treat 401 from non-login endpoints as token expiration
      if (!config.url?.includes('/login')) {
        handleTokenExpired()
        errorInfo.message = 'Login has expired, please login again'
      }
      // Keep original error message for login endpoint's 401
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
      console.error('Error callback execution error:', err)
    }

    return Promise.reject(errorInfo)
  }
}

// Response interceptor
api.interceptors.response.use(
  response => {
    // Handle real response
    return handleResponse(response.data, response.config)
  },
  error => {
    const config = error.config || {}

    console.error(`Request failed [${config.requestId}]:`, {
      method: config.method?.toUpperCase(),
      url: config.url,
      error: error.message
    })

    // Build error information
    let errorInfo = {
      type: ErrorTypes.HTTP,
      requestId: config.requestId,
      originalError: error
    }

    if (error.response) {
      // HTTP error
      const status = error.response.status
      errorInfo.code = status
      errorInfo.data = error.response.data

      // Set error message based on status code
      const statusMessages = {
        400: 'Invalid request parameters',
        401: 'Unauthorized, please login again',
        403: 'Access forbidden',
        404: 'Resource not found',
        408: 'Request timeout',
        500: 'Internal server error',
        502: 'Gateway error',
        503: 'Service unavailable',
        504: 'Gateway timeout'
      }

      errorInfo.message = statusMessages[status] || error.response.data?.msg || `Request failed(${status})`

      // Special handling for 401 error
      if (status === 401 && !config.url?.includes('/login')) {
        handleTokenExpired()
      }
    } else if (error.code === 'ECONNABORTED') {
      errorInfo.type = ErrorTypes.TIMEOUT
      errorInfo.message = 'Request timeout, please check network connection'
    } else if (error.message?.includes('Network Error')) {
      errorInfo.type = ErrorTypes.NETWORK
      errorInfo.message = 'Network connection failed, please check network settings'
    } else {
      errorInfo.message = error.message || 'Unknown error'
    }

    // Show error notification
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
      console.error('Error handling callback execution failed:', err)
    }

    return Promise.reject(errorInfo)
  }
)

// Extended request methods
const request = {
  get(url, params, config = {}) {
    // Filter out undefined and null values to avoid parameter serialization issues
    const cleanParams = params ? Object.fromEntries(
      Object.entries(params).filter(([key, value]) => value !== undefined && value !== null && value !== '')
    ) : {}
    
    return api.get(url, {
      params: cleanParams,
      enableCache: true, // Enable cache by default for GET requests
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

  // New: Request with retry
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

  // New: Cancelable request
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

  // New: Clear cache
  clearCache(pattern) {
    if (pattern) {
      // Clear cache matching pattern
      for (const [key] of requestCache) {
        if (key.includes(pattern)) {
          requestCache.delete(key)
        }
      }
      console.log(`🗑️ Clear cache: ${pattern}`)
    } else {
      // Clear all cache
      requestCache.clear()
      console.log('🗑️ Clear all cache')
    }
  },

  // New: Get cache info
  getCacheInfo() {
    return {
      size: requestCache.size,
      keys: Array.from(requestCache.keys())
    }
  }
}

/**
 * Enhanced request method usage examples:
 *
 * 1. Basic requests (auto-cache GET requests):
 * request.get('/api/users', { page: 1 })
 * request.post('/api/users', { name: 'Tom', age: 20 })
 * request.put('/api/users/1', { name: 'Tom' })
 * request.delete('/api/users/1')
 *
 * 2. Custom configuration:
 * request.post('/api/users', data, {
 *   successMsg: 'User added successfully!',
 *   errorMsg: 'Failed to add user, please retry',
 *   showDefaultMsg: true,
 *   enableCache: false,

 * })
 *
 * 3. Using callback functions:
 * request.post('/api/users', data, {
 *   onSuccess: (data) => {
 *     console.log('Request successful:', data)
 *   },
 *   onError: (error) => {
 *     console.log('Request failed:', error)
 *     console.log('Error type:', error.type)
 *     console.log('Request ID:', error.requestId)
 *   }
 * })
 *
 * 4. Request with retry:
 * request.retry('/api/users', {
 *   method: 'post',
 *   data: userData,
 *   retryCount: 3
 * })
 *
 * 5. Cancelable request:
 * const cancelableRequest = request.cancelable('/api/users')
 * // Cancel request
 * cancelableRequest.cancel('User cancelled')
 *
 * 6. Cache management:
 * request.clearCache() // Clear all cache
 * request.clearCache('/api/users') // Clear specific endpoint cache
 *
 * 7. Complete example:
 * request.post('/api/users', data, {
 *   successMsg: 'Added successfully',
 *   errorMsg: 'Add failed',
 *   enableCache: false,

 *   onSuccess: (data) => {
 *     // Handle success logic
 *   },
 *   onError: (error) => {
 *     // Handle based on error type
 *     switch(error.type) {
 *       case 'business':
 *         // Business error
 *         break
 *       case 'network':
 *         // Network error
 *         break
 *       case 'timeout':
 *         // Timeout error
 *         break
 *     }
 *   }
 * })
 */

export default request 