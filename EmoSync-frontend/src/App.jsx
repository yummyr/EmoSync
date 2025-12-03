import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";
import { useSelector } from "react-redux";
import { selectIsLoggedIn, selectIsUser } from "./store/userSlice";

import Home from "./pages/Home";
import EmotionDiaryPage from "./pages/admin/EmotionDiaryPage";
import Dashboard from "./pages/admin/Dashboard"; // 登录后才能看
import AiAnalysisPage from "./pages/admin/AiAnalysisPage";
import Profile from "./pages/admin/ProfilePage";
import HomeLayout from "./layouts/HomeLayout";
import AuthLayout from "./layouts/AuthLayout";
import AdminLayout from "./layouts/AdminLayout";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// 错误页面
import NotFound from "./pages/NotFound";
import ProfilePage from "./pages/admin/ProfilePage";
import ConsultationManagementPage from "./pages/admin/ConsultationManagementPage";
import CategoryManagementPage from "./pages/admin/CategoryManagementPage";
import KnowledgeBasePage from "./pages/admin/KnowledgeArticlePage";
import UserManagementPage from "./pages/admin/UserManagementPage";

function App() {
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const isUser = useSelector(selectIsUser);

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* 前台路由 */}
        <Route path="/" element={<HomeLayout />}>
          <Route index element={<Home />} />
          <Route
            path="profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
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
        <Route
          path="/back"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route
            path="consultations"
            element={<ConsultationManagementPage />}
          />
          <Route path="analytics" element={<AiAnalysisPage />} />
          <Route path="emotions" element={<EmotionDiaryPage />} />
          <Route path="knowledge" element={<KnowledgeBasePage />} />
          <Route path="users" element={<UserManagementPage />} />
          <Route path="categories" element={<CategoryManagementPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        {/* 404页面 */}
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
