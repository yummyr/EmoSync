import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";

import Home from "./pages/Home";
import EmotionDiaryPage from "./pages/admin/EmotionDiaryPage";
import ConsulationPage from "./pages/user/ConsulationPage";
import UserEmotionDiaryPage from "./pages/user/EmotionDiaryPage";
import Dashboard from "./pages/admin/Dashboard"; // 登录后才能看
import AiAnalysisPage from "./pages/admin/AiAnalysisPage";
import Profile from "./pages/auth/ProfilePage";
import HomeLayout from "./layouts/HomeLayout";
import AuthLayout from "./layouts/AuthLayout";
import AdminLayout from "./layouts/AdminLayout";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// 错误页面
import NotFound from "./pages/NotFound";
import ProfilePage from "./pages/auth/ProfilePage";
import ConsultationManagementPage from "./pages/admin/ConsultationManagementPage";
import CategoryManagementPage from "./pages/admin/CategoryManagementPage";
import KnowledgeBasePage from "./pages/admin/KnowledgeArticlePage";
import UserManagementPage from "./pages/admin/UserManagementPage";
import UserLayout from "./layouts/UserLayout";
import FavoritesPage from "./pages/user/FavoritesPage";
import KnowledgeArticlePage from "./pages/user/KnowledgeArticlePage";

function App() {
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

        {/* 普通用户路由 */}
        <Route
          element={
            <ProtectedRoute>
              <UserLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/consultation" replace />} />
          <Route path="consultation" element={<ConsulationPage />} />
          <Route path="emotion-diary" element={<UserEmotionDiaryPage />} />
          <Route path="favorites" element={<FavoritesPage />} />
          <Route path="knowledge" element={<KnowledgeArticlePage />} />
          <Route path="profile" element={<Profile />} />
        </Route>

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
