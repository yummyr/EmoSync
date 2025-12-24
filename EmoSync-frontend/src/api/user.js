import api from "./index";
/**
 * User login
 * Description: User authentication with username and password
 * Parameters: { username: string, password: string }
 * Returns: { userInfo: object, token: string, roleCode: string, menuList?: array }
 * URL: /user/login
 * Method: POST
 */
export function login(loginForm) {
  return api.post("/user/login", loginForm)
    .then(res => {
      console.log("Login API response:", res.data);
      const data = res.data?.data || res.data;

      if (!data) {
        throw new Error("No data returned from server");
      }

      return data;
    })
    .catch(err => {
      console.error("Login API error:", err);
      // Extract error message from response if available
      const errorMessage = err.response?.data?.message || err.message || "Login failed";
      throw new Error(errorMessage);
    });
}

/**
 * User registration
 * Description: Register new user account
 * Parameters: { username: string, password: string, confirmPassword: string, email: string, phone?: string, nickname?: string, gender?: number, userType?: number }
 * Returns: Registration success message
 * URL: /user/add
 * Method: POST
 */
export function register(params, config = {}) {
  return api.post('/user/add', params, config)
}

/**
 * Get current logged-in user info
 * Description: Get detailed information of current logged-in user
 * Parameters: None
 * Returns: { id: number, username: string, nickname: string, email: string, phone: string, gender: number, avatar: string, userType: number }
 * URL: /user/current
 * Method: GET
 */
export function getCurrentUser() {
  return api.get('/user/current').then(res => res.data.data);
}


/**
 * Get user info by ID
 * Description: Get detailed user information by user ID
 * Parameters: { id: number }
 * Returns: { id: number, username: string, nickname: string, email: string, phone: string, gender: number, avatar: string, userType: number }
 * URL: /user/{id}
 * Method: GET
 */
export function getUserById(id) {
  return api.get(`/user/${id}`).then(res => res.data.data);
}


/**
 * Update user profile
 * Description: User updates their basic information
 * Parameters: { nickname?: string, email?: string, phone?: string, gender?: number, avatar?: string, birthday?: string }
 * Returns: Updated user information
 * URL: /user/profile
 * Method: PUT
 */
export function updateUser(params) {
  return api.put('/user/profile', params).then(res => res.data.data);
}


/**
 * Change user password
 * Description: User changes login password
 * Parameters: { oldPassword: string, newPassword: string }
 * Returns: Password change success message
 * URL: /user/password
 * Method: PUT
 */
export function updatePassword(params) {
  return api.put('/user/password', params).then(res => res.data.data);
}


/**
 * Forgot password
 * Description: Reset password via email
 * Parameters: { email: string, newPassword: string }
 * Returns: Password reset success message
 * URL: /user/forget
 * Method: GET
 */
export function forgetPassword(params, config = {}) {
  return request.get('/user/forget', params, config)
}

/**
 * User logout
 * Description: User logs out and clears login status
 * Parameters: None
 * Returns: Logout success message
 * URL: /user/logout
 * Method: POST
 */
export function logout() {
  return api.post('/user/logout').then(res => res.data);
}

/**
 * Get paginated user list (admin function)
 * Description: Admin paginates system user list with full-field search support
 * Parameters: { username?: string, email?: string, nickname?: string, phone?: string, userType?: number, status?: number, currentPage?: number, size?: number }
 * Returns: { records: array, total: number, current: number, size: number }
 * URL: /user/page
 * Method: GET
 */
export function getUserPage(params) {
  return api.get('/user/page', { params }).then(res => res.data.data);
}


/**
 * Get user statistics (admin function)
 * Description: Get user-related statistics data
 * Parameters: None
 * Returns: { totalUsers: number, activeUsers: number, newUsers: number, riskUsers: number, totalGrowth: number, activeGrowth: number, newGrowth: number }
 * URL: /user/statistics
 * Method: GET
 */
export function getUserStatistics() {
  return api.get('/user/statistics').then(res => res.data.data);
}


/**
 * Update user status (admin function)
 * Description: Admin updates user status (enable/disable)
 * Parameters: { status: number }
 * Returns: Update success message
 * URL: /user/{id}/status
 * Method: PUT
 */
export function updateUserStatus(id, params) {
  return api.put(`/user/${id}/status`, null, { params })
    .then(res => res.data.data);
}


/**
 * Delete user (admin function)
 * Description: Admin deletes specified user
 * Parameters: None
 * Returns: Deletion success message
 * URL: /user/{id}
 * Method: DELETE
 */
export function deleteUser(id) {
  return api.delete(`/user/${id}`).then(res => res.data.data);
}
