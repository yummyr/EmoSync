import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRobot,
  faBell,
  faUser,
  faArrowRightFromBracket,
  faFaceGrinWink,
  faBook,
  faHeart,
  faComments,
  faIdCard,
} from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser, selectUser, selectRoleType } from "@/store/userSlice";
import { Link, useLocation, Outlet } from "react-router-dom";

export default function UserLayout() {
  const dispatch = useDispatch();
  const location = useLocation();

  const user = useSelector(selectUser);
  const roleType = useSelector(selectRoleType);

  // User Info - Using correct field names from backend UserDetailResponseDTO
  const userInfo = {
    name: user?.nickname || user?.username || "User",
    email: user?.email || "",
    avatar: user?.avatar || null
  };

  // Main Navigation Menu Items
  const menuItems = [
    
    { name: "AI Consultation", icon: faComments, path: "/user/consultation", id: "consultation" },
    { name: "Emotion Diary", icon: faFaceGrinWink, path: "/user/emotion-diary", id: "emotion-diary" },
    { name: "My Favorites", icon: faHeart, path: "/user/favorites", id: "favorites" },
    { name: "Knowledge Articles", icon: faBook, path: "/user/knowledge", id: "knowledge" },
    { name: "Profile", icon: faIdCard, path: "/user/profile", id: "profile" },
  ];

  
  const handleLogout = () => {
    if (!window.confirm("Are you sure you want to log out?")) return;
    dispatch(logoutUser());
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* TOPBAR */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left - Logo */}
          <div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-400 rounded-lg flex items-center justify-center">
              <FontAwesomeIcon icon={faRobot} className="text-white text-sm" />
            </div>
            <h1 className="text-xl font-bold text-blue-600">EmoSync</h1>
            
          </div>
          <span className="text-gray-400 text-xs">AI Emotional Support Platform</span>
          </div>

          {/* Middle - Navigation Menu */}
          <nav className="flex items-center gap-6">
            {menuItems.map((item) => (
              <Link
                key={item.id}
                to={item.path}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  location.pathname === item.path
                    ? 'bg-blue-50 text-blue-600 font-semibold'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                }`}
              >
                <FontAwesomeIcon icon={item.icon} className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* Right - User Info & Actions */}
          <div className="flex items-center gap-4">
            <button className="relative text-gray-500 hover:text-gray-700">
              <FontAwesomeIcon icon={faBell} className="text-xl" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-700">{userInfo.name}</p>
                <p className="text-xs text-gray-500">{userInfo.email}</p>
              </div>
              <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center">
                {userInfo.avatar ? (
                  <img
                    src={userInfo.avatar}
                    alt="User Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                    <FontAwesomeIcon icon={faUser} className="text-gray-600" />
                  </div>
                )}
              </div>
            </div>
            <button
              className="text-gray-500 hover:text-gray-700"
              onClick={handleLogout}
            >
              <FontAwesomeIcon icon={faArrowRightFromBracket} className="text-xl" />
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
      {/* FOOTER */}
      <footer className="bg-white border-t border-gray-200 px-6 py-4">
        <p className="text-sm text-center text-gray-500">
          &copy; 2025 EmoSync. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
