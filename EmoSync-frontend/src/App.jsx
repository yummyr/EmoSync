import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import ProtectedRoute from "./routes/ProtectedRoute";
import { tokenManager, handleTokenExpiration } from "./utils/tokenManager";

import Home from "./pages/Home";
import EmotionDiaryPage from "./pages/admin/EmotionDiaryPage";
import ConsulationPage from "./pages/user/ConsulationPage";
import UserEmotionDiaryPage from "./pages/user/EmotionDiaryPage";
import Dashboard from "./pages/admin/Dashboard"; // Requires login to view
import AiAnalysisPage from "./pages/admin/AiAnalysisPage";
import ProfilePage from "./pages/auth/ProfilePage";
import HomeLayout from "./layouts/HomeLayout";
import AuthLayout from "./layouts/AuthLayout";
import AdminLayout from "./layouts/AdminLayout";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Error pages
import NotFound from "./pages/NotFound";
import ConsultationManagementPage from "./pages/admin/ConsultationManagementPage";
import CategoryManagementPage from "./pages/admin/CategoryManagementPage";
import KnowledgeBasePage from "./pages/admin/KnowledgeArticlePage";
import UserManagementPage from "./pages/admin/UserManagementPage";
import UserLayout from "./layouts/UserLayout";
import FavoritesPage from "./pages/user/FavoritesPage";
import KnowledgeArticlePage from "./pages/user/KnowledgeArticlePage";

function App() {
  // Initialize tokenManager on app mount
  useEffect(() => {
    // Initialize tokenManager with unified logout handler
    tokenManager.init(handleTokenExpiration);

    // Cleanup tokenManager on unmount
    return () => {
      tokenManager.cleanup();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomeLayout />}>
          <Route index element={<Home />} />
        </Route>
        {/* Authentication routes */}
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>

        {/* Legacy routes for backward compatibility */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* User routes */}
        <Route
          path="/user"
          element={
            <ProtectedRoute>
              <UserLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/user/consultation" replace />} />
          <Route path="consultation" element={<ConsulationPage />} />
          <Route path="emotion-diary" element={<UserEmotionDiaryPage />} />
          <Route path="favorites" element={<FavoritesPage />} />
          <Route path="knowledge" element={<KnowledgeArticlePage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        {/* Admin routes */}
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

        {/* 404 page */}
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
