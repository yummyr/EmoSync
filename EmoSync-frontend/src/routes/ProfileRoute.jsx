import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import { selectIsAdmin, selectIsUser } from "@/store/userSlice";
import ProfilePage from "@/pages/auth/ProfilePage";

const ProfileRoute = () => {
  const isAdmin = useSelector(selectIsAdmin);
  const isUser = useSelector(selectIsUser);
  const location = useLocation();

  // Redirect to correct profile path based on user role
  if (isAdmin) {
    // If current path is not /back/profile, redirect to correct admin profile path
    if (location.pathname !== '/back/profile') {
      return <Navigate to="/back/profile" replace />;
    }
    // Admin profile handled by admin routes
    return <Navigate to="/back" replace />;
  }

  if (isUser) {
    // If current path is not /user/profile, redirect to correct user profile path
    if (location.pathname !== '/user/profile') {
      return <Navigate to="/user/profile" replace />;
    }
    // User profile handled by user routes
    return <Navigate to="/user" replace />;
  }

  // If role is unknown, redirect to home page
  return <Navigate to="/" replace />;
};

export default ProfileRoute;