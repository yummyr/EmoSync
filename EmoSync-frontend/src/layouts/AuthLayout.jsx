import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot } from '@fortawesome/free-solid-svg-icons';
import './AuthLayout.css'; // 导入自定义CSS文件，用于实现复杂的动画和玻璃拟态

// 假设我们处于 'Login' 状态以匹配第一张图片中的文本
const mockRouteName = 'Login'; 

const getWelcomeText = (routeName) => {
  switch (routeName) {
    case 'Login':
      return {
        title: 'AI Mental Health Companion',
        description:
          'In every late night and every moment of anxiety, we are here. You don’t have to face it alone — let heart-to-heart connection warm your every day.',
      };
    case 'Register':
      return {
        title: 'Join Us',
        description:
          'A warm conversation that turns loneliness into comfort. Let us accompany you on every step of your journey with empathy and care.',
      };
    default:
      return {
        title: 'Your Mental Wellness Assistant',
        description:
          'Listening with heart, supporting with care. Let meaningful emotional connection brighten every day.',
      };
  }
};

const AuthLayout = () => {
  const [routeName] = useState(mockRouteName);
  const welcomeText = getWelcomeText(routeName);

  return (
    <div className="min-h-screen bg-gray-50 auth-layout">
      {/* 主内容区域 */}
      <div className="h-screen auth-content">
        <div className="flex h-full auth-container">
          {/* LEFT SECTION */}
          <div className="relative hidden w-1/2 overflow-hidden lg:flex left-section">
            <div className="absolute inset-0 bg-black/20 left-overlay"></div>
            <div className="relative z-10 flex flex-col items-center justify-center w-full h-full text-white gap-8 left-content">
              
                  {/* Title + Description */}
              <div className="flex items-center justify-center text-center welcome-content">
                <div className="max-w-xl breathing-animation">
                  <h2 className="text-4xl font-bold leading-tight mb-4 mt-0 sm:text-3xl welcome-title">
                    {welcomeText.title}
                  </h2>
                  <p className="text-xl leading-relaxed text-white/90 sm:text-lg welcome-text">
                    {welcomeText.description}
                  </p>
                </div>
              </div>

              {/* Robot Glass Icon */}
              <div className="flex items-center justify-center robot-section">
                <div className="flex items-center justify-center robot-wrapper">
                  <div className="robot-icon">
                   
                    <FontAwesomeIcon 
                      icon={faRobot} 
                      className="text-6xl text-white/95 relative z-10 drop-shadow-lg sm:text-5xl xs:text-4xl" 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

           {/* RIGHT SECTION (form goes here) */}
          <div className="flex flex-col justify-center flex-1 p-12 right-section sm:p-6 lg:p-20 xl:p-24">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;