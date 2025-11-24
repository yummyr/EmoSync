import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./routes/PrivateRoute";
import { useSelector } from "react-redux";



import Home from "./pages/Home";
import ConsultationManagement from "./pages/admin/ConsultationManagement.jsx";
import AiAnalysisQueue from './pages/admin/AiAnalysisQueue'
import Dashboard from "./pages/admin/Dashboard"; // 登录后才能看
import Profile from "./pages/user/Profile";
import HomeLayout from "./layouts/HomeLayout";
import AuthLayout from "./layouts/AuthLayout";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";


// 错误页面
import NotFound from './pages/NotFound'


function App() {
  const { isLoggedIn, isUser } = useSelector((state) => state?.user || { isLoggedIn: false, isUser: false })

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* 前台路由 */}
        <Route path="/" element={<HomeLayout />}>
          <Route index element={<Home />} />
          <Route path="profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
        </Route>
        {/* 认证路由 */}
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>

        {/* 兼容旧路由 */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* 管理员路由 */}
        <Route path="/admin" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="consultation-management" element={<ConsultationManagement />} />
          <Route path="ai-analysis-queue" element={<AiAnalysisQueue />} />
          <Route path="profile" element={<Profile />} />
        </Route>
       

     
        {/* 404页面 */}
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  )
}

export default App