import api from "./index";
/**
 * 用户登录
 * 功能描述：用户使用用户名和密码进行登录认证
 * 入参：{ username: string, password: string }
 * 返回参数：{ userInfo: object, token: string, roleCode: string, menuList?: array }
 * url地址：/user/login
 * 请求方式：POST
 */
export function login(params, config = {}) {
  return api.post('/user/login', params, config)
}

/**
 * 用户注册
 * 功能描述：新用户注册账号
 * 入参：{ username: string, password: string, confirmPassword: string, email: string, phone?: string, nickname?: string, gender?: number, userType?: number }
 * 返回参数：注册成功信息
 * url地址：/user/add
 * 请求方式：POST
 */
export function register(params, config = {}) {
  return api.post('/user/add', params, config)
}

/**
 * 获取当前登录用户信息
 * 功能描述：获取当前登录用户的详细信息
 * 入参：无
 * 返回参数：{ id: number, username: string, nickname: string, email: string, phone: string, gender: number, avatar: string, userType: number }
 * url地址：/user/current
 * 请求方式：GET
 */
export function getCurrentUser(params, config = {}) {
  return api.get('/user/current', params, config)
}

/**
 * 根据ID获取用户信息
 * 功能描述：根据用户ID获取用户详细信息
 * 入参：{ id: number }
 * 返回参数：{ id: number, username: string, nickname: string, email: string, phone: string, gender: number, avatar: string, userType: number }
 * url地址：/user/{id}
 * 请求方式：GET
 */
export function getUserById(id, config = {}) {
  return api.get(`/user/${id}`, null, config)
}

/**
 * 更新用户个人信息
 * 功能描述：用户更新自己的基本信息
 * 入参：{ nickname?: string, email?: string, phone?: string, gender?: number, avatar?: string, birthday?: string }
 * 返回参数：更新后的用户信息
 * url地址：/user/profile
 * 请求方式：PUT
 */
export function updateUser(params, config = {}) {
  return api.put('/user/profile', params, config)
}

/**
 * 修改用户密码
 * 功能描述：用户修改登录密码
 * 入参：{ oldPassword: string, newPassword: string }
 * 返回参数：修改成功信息
 * url地址：/user/password
 * 请求方式：PUT
 */
export function updatePassword(params, config = {}) {
  return api.put('/user/password', params, config)
}

/**
 * 忘记密码
 * 功能描述：通过邮箱重置密码
 * 入参：{ email: string, newPassword: string }
 * 返回参数：重置成功信息
 * url地址：/user/forget
 * 请求方式：GET
 */
export function forgetPassword(params, config = {}) {
  return request.get('/user/forget', params, config)
}

/**
 * 用户退出登录
 * 功能描述：用户退出登录，清除登录状态
 * 入参：无
 * 返回参数：退出成功信息
 * url地址：/user/logout
 * 请求方式：POST
 */
export function logout(config = {}) {
  return api.post('/user/logout', null, config)
}

/**
 * 分页查询用户列表（管理员功能）
 * 功能描述：管理员分页查询系统用户列表，支持在所有字段中同时搜索
 * 入参：{ username?: string, email?: string, nickname?: string, phone?: string, userType?: number, status?: number, currentPage?: number, size?: number }
 * 返回参数：{ records: array, total: number, current: number, size: number }
 * url地址：/user/page
 * 请求方式：GET
 */
export function getUserPage(params, config = {}) {
  return api.get('/user/page', params, config)
}

/**
 * 获取用户统计数据（管理员功能）
 * 功能描述：获取用户相关的统计数据
 * 入参：无
 * 返回参数：{ totalUsers: number, activeUsers: number, newUsers: number, riskUsers: number, totalGrowth: number, activeGrowth: number, newGrowth: number }
 * url地址：/user/statistics
 * 请求方式：GET
 */
export function getUserStatistics(config = {}) {
  return api.get('/user/statistics', null, config)
}

/**
 * 更新用户状态（管理员功能）
 * 功能描述：管理员更新用户状态（启用/禁用）
 * 入参：{ status: number }
 * 返回参数：更新成功信息
 * url地址：/user/{id}/status
 * 请求方式：PUT
 */
export function updateUserStatus(id, params, config = {}) {
  return api.put(`/user/${id}/status`, null, {
    ...config,
    params: params
  })
}

/**
 * 删除用户（管理员功能）
 * 功能描述：管理员删除指定用户
 * 入参：无
 * 返回参数：删除成功信息
 * url地址：/user/{id}
 * 请求方式：DELETE
 */
export function deleteUser(id, config = {}) {
  return api.delete(`/user/${id}`, {
    successMsg: '删除成功',
    ...config
  })
}