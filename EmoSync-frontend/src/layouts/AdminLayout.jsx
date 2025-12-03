import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { formatDateTime } from "@/utils/date";
import { useDispatch, useSelector } from "react-redux"; // 添加 useSelector
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { logoutUser, selectUser, selectRoleType } from "@/store/userSlice"; // 导入 selector
import {
  faRobot,
  faUsers,
  faChartPie,
  faBook,
  faLayerGroup,
  faFaceGrinWink,
  faIdBadge,
  faMessage,
  faList,
  faAward,
  faCompress,
  faClock,
  faArrowRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";

// ============================================
// SideBar Component
// ============================================
const SideBar = ({
  isCollapsed,
  onToggle,
  onNavigate,
  currentPath = "/back/dashboard",
}) => {
  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <FontAwesomeIcon icon={faChartPie} />,
      path: "/back/dashboard",
    },
    {
      id: "users",
      label: "User Management",
      icon: <FontAwesomeIcon icon={faUsers} />,
      path: "/back/users",
    },
    {
      id: "knowledge",
      label: "Knowledge Articles",
      icon: <FontAwesomeIcon icon={faBook} />,
      path: "/back/knowledge",
    },
    {
      id: "categories",
      label: "Category Management",
      icon: <FontAwesomeIcon icon={faList} />,
      path: "/back/categories",
    },
    {
      id: "consultations",
      label: "Consultation Records",
      icon: <FontAwesomeIcon icon={faLayerGroup} />,
      path: "/back/consultations",
    },
    {
      id: "emotions",
      label: "Emotion Diary",
      icon: <FontAwesomeIcon icon={faFaceGrinWink} />,
      path: "/back/emotions",
    },
    {
      id: "analytics",
      label: "AI Analysis",
      icon: <FontAwesomeIcon icon={faMessage} />,
      path: "/back/analytics",
    },
    {
      id: "profile",
      label: "Personal Profile",
      icon: <FontAwesomeIcon icon={faIdBadge} />,
      path: "/back/profile",
    },
  ];

  const handleMenuClick = (path) => {
    if (onNavigate) {
      onNavigate(path);
    }
  };

  const isActive = (path) => {
    return currentPath === path;
  };

  return (
    <div
      className={`
        fixed left-0 top-0 h-screen bg-white shadow-lg z-40
        transition-all duration-300 ease-in-out
        ${isCollapsed ? "w-20" : "w-72"}
      `}
    >
      {/* Logo Section */}
      <div className="h-16 flex items-center justify-center border-b border-gray-200 px-4">
        <div className="flex items-center gap-3">
          <div className="text-3xl">
            <FontAwesomeIcon icon={faRobot} className="text-blue-400" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-lg text-gray-800">
                Mental Health AI
              </span>
              <span className="text-xs text-gray-500">Admin Panel</span>
            </div>
          )}
        </div>
      </div>

      {/* Admin Badge */}
      {!isCollapsed && (
        <div className="mx-4 my-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-lg">
              <FontAwesomeIcon icon={faAward} />
            </div>
            <div>
              <div className="font-semibold text-gray-800">Administrator</div>
              <div className="text-xs text-gray-500">System Manager</div>
            </div>
          </div>
        </div>
      )}

      {/* Menu Items */}
      <nav className="mt-4 px-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleMenuClick(item.path)}
            className={`
              w-full flex items-center gap-3 px-4 py-3 mb-1 rounded-lg
              transition-all duration-200
              ${
                isActive(item.path)
                  ? "bg-blue-500 text-white shadow-md"
                  : "text-gray-700 hover:bg-gray-100"
              }
              ${isCollapsed ? "justify-center" : ""}
            `}
            title={isCollapsed ? item.label : ""}
          >
            <span className="text-xl">{item.icon}</span>
            {!isCollapsed && <span className="font-medium">{item.label}</span>}
          </button>
        ))}
      </nav>
    </div>
  );
};

// ============================================
// TopBar Component
// ============================================
const TopBar = ({
  isCollapsed,
  onToggle,
  currentPage = "Dashboard",
  userName = "Administrator",
  isAdmin = true,
  onLogout,
  onProfileClick,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);



  // Handle logout
  const handleLogout = () => {
    setShowUserMenu(false);
    if (onLogout) {
      onLogout();
    }
  };

  // Handle profile click
  const handleProfile = () => {
    setShowUserMenu(false);
    if (onProfileClick) {
      onProfileClick();
    }
  };

  return (
    <div
      className={`
        fixed top-0 right-0 h-16 bg-white shadow-md z-30
        transition-all duration-300 ease-in-out flex items-center justify-between px-6
        ${isCollapsed ? "left-20" : "left-72"}
      `}
    >
      {/* Left Section - Toggle Button & Page Title */}
      <div className="flex items-center gap-2">
        {/* Toggle Sidebar Button */}
        <button
          onClick={onToggle}
          className="w-12 h-10 flex items-center justify-center rounded-lg
                     hover:bg-gray-100 transition-colors duration-200"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          <FontAwesomeIcon
            icon={faCompress}
            className="text-2xl text-blue-500"
          />
        </button>

        {/* Current Page Title */}
        <h1 className="text-xl font-semibold text-gray-800">{currentPage}</h1>
      </div>

      {/* Right Section - Time & User Menu */}
      <div className="flex items-center gap-6">
        {/* Current Time */}
        <div className="hidden md:flex items-center gap-2 text-gray-600">
          <FontAwesomeIcon icon={faClock} className="text-lg" />
          <span className="text-sm font-medium">
            {formatDateTime(currentTime)}
          </span>
        </div>

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 px-4 py-2 rounded-lg
                       hover:bg-gray-100 transition-colors duration-200"
          >
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="hidden md:block text-left">
              <div className="text-sm font-semibold text-gray-800">
                {userName}
              </div>
              <div className="text-xs text-gray-500">
                {isAdmin ? "Administrator" : "Regular User"}
              </div>
            </div>
            <svg
              className={`w-4 h-4 text-gray-500 transition-transform duration-200 
                         ${showUserMenu ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {showUserMenu && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowUserMenu(false)}
              />

              {/* Menu */}
              <div
                className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg 
                            border border-gray-200 z-50 overflow-hidden"
              >
                <div className="py-1">
                  {/* Profile */}
                  <button
                    onClick={handleProfile}
                    className="w-full flex items-center gap-3 px-4 py-3 
                             hover:bg-gray-50 transition-colors duration-200 text-left"
                  >
                    <svg
                      className="w-5 h-5 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <span className="text-sm font-medium text-gray-700">
                      Personal Profile
                    </span>
                  </button>

                  {/* Divider */}
                  <div className="border-t border-gray-200 my-1" />

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 
                             hover:bg-red-50 transition-colors duration-200 text-left"
                  >
                    <FontAwesomeIcon
                      icon={faArrowRightFromBracket}
                      className="text-red-600"
                    />
                    <span className="text-sm font-medium text-red-600">
                      Logout
                    </span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================
// AdminLayout Component
// ============================================
const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  // 从 Redux store 获取用户信息
  const user = useSelector(selectUser);
  const roleType = useSelector(selectRoleType);
  
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [currentPath, setCurrentPath] = useState("/back/dashboard");

  // Sync currentPath with actual route
  useEffect(() => {
    setCurrentPath(location.pathname);
  }, [location.pathname]);

  const handleToggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleNavigate = (path) => {
    setCurrentPath(path);
    navigate(path);
  };

  // 修改 logout 处理函数
  const handleLogout = async () => {
    console.log("Logging out...");
    try {
      // 直接 dispatch logoutUser，不需要 unwrap()
      await dispatch(logoutUser());
      // 登出成功后跳转到登录页
      navigate("/auth/login");
    } catch (error) {
      console.error("Logout failed:", error);
      // 即使登出 API 失败，也清除本地状态并跳转到登录页
      navigate("/auth/login");
    }
  };

  const handleProfileClick = () => {
    setCurrentPath("/back/profile");
    navigate("/back/profile");
  };

  // 获取用户名（从 Redux store 或使用默认值）
  const getUserName = () => {
    return user?.username || user?.name || "Administrator";
  };

  // 检查是否是管理员（从 Redux store）
  const getIsAdmin = () => {
    return roleType === 2; // 根据你的 userSlice，2 表示管理员
  };

  // Get page title from current path
  const getPageTitle = () => {
    const titles = {
      "/back/dashboard": "Analytics Dashboard",
      "/back/users": "User Management",
      "/back/knowledge": "Knowledge Base",
      "/back/categories": "Category Management",
      "/back/consultations": "Consultation Records",
      "/back/emotions": "Emotion Diary",
      "/back/analytics": "AI Analysis",
      "/back/profile": "Personal Information",
    };
    return titles[currentPath] || "Dashboard";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* SideBar */}
      <SideBar
        isCollapsed={isCollapsed}
        onToggle={handleToggleSidebar}
        onNavigate={handleNavigate}
        currentPath={currentPath}
      />

      {/* TopBar */}
      <TopBar
        isCollapsed={isCollapsed}
        onToggle={handleToggleSidebar}
        currentPage={getPageTitle()}
        userName={getUserName()} // 使用真实的用户名
        isAdmin={getIsAdmin()} // 使用真实的角色信息
        onLogout={handleLogout}
        onProfileClick={handleProfileClick}
      />

      {/* Main Content */}
      <div
        className={`
          pt-16 transition-all duration-300 ease-in-out
          ${isCollapsed ? "ml-20" : "ml-72"}
          p-6
        `}
      >
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;