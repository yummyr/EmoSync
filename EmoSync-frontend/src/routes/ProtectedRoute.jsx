import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'
import { selectIsLoggedIn, selectIsUser } from '@/store/userSlice'

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const isLoggedIn = useSelector(selectIsLoggedIn) || false
  const isUser = useSelector(selectIsUser) || false
  const location = useLocation()

  // 检查是否需要登录权限
  if (!isLoggedIn) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />
  }

  // 如果需要管理员权限
  if (requireAdmin && isUser) {
    return <Navigate to="/" replace />
  }

  // 普通用户不能访问后台路由
  if (!requireAdmin && !isUser && location.pathname.startsWith('/back')) {
    return <Navigate to="/back/dashboard" replace />
  }

  // 管理员不能访问前台路由
  if (requireAdmin && location.pathname === '/' && !isUser) {
    return <Navigate to="/back/dashboard" replace />
  }

  return children
}

export default ProtectedRoute