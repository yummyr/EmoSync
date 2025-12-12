import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import { selectIsAdmin, selectIsUser } from "@/store/userSlice";
import ProfilePage from "@/pages/auth/ProfilePage";

const ProfileRoute = () => {
  const isAdmin = useSelector(selectIsAdmin);
  const isUser = useSelector(selectIsUser);
  const location = useLocation();

  // 根据用户角色重定向到正确的 profile 路径
  if (isAdmin) {
    // 如果当前路径不是 /back/profile，重定向到正确的管理员 profile 路径
    if (location.pathname !== '/back/profile') {
      return <Navigate to="/back/profile" replace />;
    }
    // 管理员 profile 由管理员路由处理
    return <Navigate to="/back" replace />;
  }

  if (isUser) {
    // 如果当前路径不是 /user/profile，重定向到正确的用户 profile 路径
    if (location.pathname !== '/user/profile') {
      return <Navigate to="/user/profile" replace />;
    }
    // 用户 profile 由用户路由处理
    return <Navigate to="/user" replace />;
  }

  // 如果角色未知，重定向到首页
  return <Navigate to="/" replace />;
};

export default ProfileRoute;