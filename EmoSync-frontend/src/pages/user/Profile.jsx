import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { FaUser, FaKey, FaCamera, FaSave, FaShieldAlt } from 'react-icons/fa';
import { IoIosWarning } from 'react-icons/io'; // 用于模拟 ElMessage 警告
import { FaCalendarAlt } from 'react-icons/fa'; // 用于模拟日期选择器图标

// --- 模拟状态管理和 API 响应 (用于结构展示) ---

// 模拟用户信息数据
const mockUserProfile = {
  id: 'u12345',
  username: 'psych_ai',
  nickname: '心理助手',
  email: 'ai_support@example.com',
  phone: '13812345678',
  gender: 1, // 1: 男, 2: 女, 0: 未知
  birthday: '1990-01-01T00:00:00.000Z',
  avatar: 'https://placehold.co/96x96/4A90E2/FFFFFF/png?text=AI', // 模拟头像URL
  createdAt: '2023-01-15T00:00:00.000Z',
};

// 模拟实用函数
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
};

// 模拟 Toast/Message 提示
const Toast = {
  success: (msg) => console.log(`[SUCCESS]: ${msg}`),
  error: (msg) => console.error(`[ERROR]: ${msg}`),
  info: (msg) => console.info(`[INFO]: ${msg}`),
};

// 标签配置
const tabs = [
  { key: 'personal', label: '个人信息', icon: FaUser },
  { key: 'password', label: '修改密码', icon: FaKey },
];

const Profile = () => {
  // 标签状态
  const [activeTab, setActiveTab] = useState('personal');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // 用户资料和表单状态
  const [userProfile, setUserProfile] = useState(mockUserProfile);
  const [userForm, setUserForm] = useState({
    username: mockUserProfile.username,
    nickname: mockUserProfile.nickname || '',
    email: mockUserProfile.email || '',
    phone: mockUserProfile.phone || '',
    gender: mockUserProfile.gender || 0,
    birthday: mockUserProfile.birthday ? formatDate(mockUserProfile.birthday) : '',
    avatar: mockUserProfile.avatar,
  });
  const [tempAvatarUrl, setTempAvatarUrl] = useState(null);
  const fileInputRef = useRef(null); // 用于触发文件选择

  // 密码表单状态
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Computed 属性
  const currentAvatarUrl = useMemo(() => tempAvatarUrl || userProfile.avatar, [tempAvatarUrl, userProfile.avatar]);
  const displayName = useMemo(() => userProfile.nickname || userProfile.username, [userProfile.nickname, userProfile.username]);

  // --- 表单事件处理 ---

  const handleUserFormChange = (e) => {
    const { name, value } = e.target;
    setUserForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordFormChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
  };

  const handleRadioChange = (name, value) => {
    setUserForm(prev => ({ ...prev, [name]: parseInt(value) }));
  };
  
  // --- 文件上传逻辑简化 ---

  const handleAvatarSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const isJPG = file.type === 'image/jpeg' || file.type === 'image/png';
    const isLt2M = file.size / 1024 / 1024 < 2;

    if (!isJPG) {
      Toast.error('头像图片只能是 JPG/PNG 格式!');
      return;
    }
    if (!isLt2M) {
      Toast.error('头像图片大小不能超过 2MB!');
      return;
    }

    setUploadingAvatar(true);
    // 模拟上传和预览
    const previewUrl = URL.createObjectURL(file);
    setTempAvatarUrl(previewUrl);
    
    // 模拟异步上传完成
    setTimeout(() => {
        setUploadingAvatar(false);
        Toast.success('头像预上传成功，请点击保存修改完成头像更新');
    }, 1500);
  };
  
  // 清理临时URL
  useEffect(() => {
    return () => {
      if (tempAvatarUrl) {
        URL.revokeObjectURL(tempAvatarUrl);
      }
    };
  }, [tempAvatarUrl]);


  // --- 提交函数 (简化验证和 API 调用) ---

  const updateUserInfo = (e) => {
    e.preventDefault();
    // 简化验证逻辑
    if (!userForm.nickname || !userForm.email) {
      Toast.error('昵称和邮箱为必填项！');
      return;
    }

    setUpdateLoading(true);

    // 模拟 API 调用
    setTimeout(() => {
      // 成功逻辑
      const updatedProfile = { 
          ...userProfile, 
          ...userForm, 
          avatar: tempAvatarUrl ? currentAvatarUrl : userProfile.avatar // 确认头像更新
      };
      
      setUserProfile(updatedProfile);
      setUserForm(prev => ({ ...prev, avatar: updatedProfile.avatar }));
      setTempAvatarUrl(null); // 清理临时预览
      
      Toast.success('用户信息更新成功！');
      setUpdateLoading(false);
    }, 1000);
  };

  const updatePassword = (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      Toast.error('两次输入密码不一致！');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
        Toast.error('密码长度需在 6 到 20 个字符之间！');
        return;
    }

    setPasswordLoading(true);

    // 模拟 API 调用
    setTimeout(() => {
      Toast.success('密码修改成功！');
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordLoading(false);
    }, 1000);
  };

  // --- 渲染部分 ---

  const TabIcon = tabs.find(t => t.key === activeTab)?.icon;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 个人资料头部 */}
      <section className="bg-[#4A90E2] text-white py-12 profile-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 header-content">
          <div className="flex justify-center profile-info">
            <div className="flex items-center gap-6 sm:gap-4 avatar-section">
              {/* 头像区 */}
              <div className="relative avatar-wrapper">
                {/* 模拟 El-Avatar */}
                <div className="w-24 h-24 rounded-full bg-blue-700 flex items-center justify-center text-4xl text-white overflow-hidden shadow-lg">
                  {currentAvatarUrl ? (
                    <img src={currentAvatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <FaUser />
                  )}
                </div>
                
                {/* 模拟 El-Upload 按钮 */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png"
                    className="hidden"
                    onChange={handleAvatarSelect}
                    disabled={uploadingAvatar}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-[-0.5rem] right-[-0.5rem] w-8 h-8 rounded-full bg-blue-500 hover:bg-blue-600 transition duration-300 flex items-center justify-center text-white shadow-md upload-btn"
                  disabled={uploadingAvatar}
                >
                  {uploadingAvatar ? (
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  ) : (
                    <FaCamera className="w-3 h-3" />
                  )}
                </button>
              </div>

              <div className="text-left user-details">
                <h2 className="text-3xl font-bold mb-1 user-name sm:text-2xl">
                    {displayName}
                </h2>
                <p className="text-white/80 mb-0.5 user-email sm:text-sm">
                    {userProfile.email}
                </p>
                <p className="text-white/80 text-sm join-date">
                    加入时间：{formatDate(userProfile.createdAt)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 main-content">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 content-wrapper">
          
          {/* 左侧导航菜单 */}
          <div className="lg:col-span-1 sidebar">
            <div className="bg-white rounded-xl shadow-lg p-6 lg:sticky lg:top-24 nav-card">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 nav-title">个人中心</h3>
              <nav className="flex flex-col gap-2 nav-menu lg:flex-row lg:overflow-x-auto">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button 
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`
                        w-full text-left py-3 px-4 rounded-lg font-medium transition-all duration-300 flex items-center whitespace-nowrap min-w-max
                        ${activeTab === tab.key 
                          ? 'bg-[#4A90E2] text-white shadow-md shadow-blue-300/50 transform -translate-y-px' 
                          : 'text-gray-700 hover:bg-gray-100'
                        }
                      `}
                    >
                      <Icon className="mr-3 w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* 主内容区域 */}
          <div className="lg:col-span-3 main-section">
            
            {/* 个人信息卡片 */}
            {activeTab === 'personal' && (
              <div className="bg-white rounded-xl shadow-lg p-8 content-card">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center section-title">
                  <FaUser className="mr-3 text-[#4A90E2]" />个人信息
                </h3>
                
                <form onSubmit={updateUserInfo} className="user-form max-w-3xl">
                  <div className="grid gap-6 form-grid md:grid-cols-2">
                    
                    {/* 用户名 (禁用) */}
                    <div className="form-item">
                      <label className="block text-sm font-medium text-gray-600 mb-2">用户名</label>
                      <input 
                        type="text"
                        name="username"
                        value={userForm.username}
                        disabled
                        className="w-full p-2 border border-gray-200 rounded-lg bg-gray-100 cursor-not-allowed focus:ring-blue-500 focus:border-blue-500 transition duration-300"
                      />
                    </div>
                    
                    {/* 昵称 */}
                    <div className="form-item">
                      <label className="block text-sm font-medium text-gray-600 mb-2">昵称</label>
                      <input 
                        type="text"
                        name="nickname"
                        value={userForm.nickname}
                        onChange={handleUserFormChange}
                        placeholder="请输入昵称"
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-300"
                      />
                    </div>
                    
                    {/* 邮箱 */}
                    <div className="form-item">
                      <label className="block text-sm font-medium text-gray-600 mb-2">邮箱</label>
                      <input 
                        type="email"
                        name="email"
                        value={userForm.email}
                        onChange={handleUserFormChange}
                        placeholder="请输入邮箱"
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-300"
                      />
                    </div>
                    
                    {/* 手机号 */}
                    <div className="form-item">
                      <label className="block text-sm font-medium text-gray-600 mb-2">手机号</label>
                      <input 
                        type="tel"
                        name="phone"
                        value={userForm.phone}
                        onChange={handleUserFormChange}
                        placeholder="请输入手机号"
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-300"
                      />
                    </div>
                    
                    {/* 性别 */}
                    <div className="form-item">
                      <label className="block text-sm font-medium text-gray-600 mb-2">性别</label>
                      <div className="flex space-x-4">
                        <label className="inline-flex items-center">
                          <input 
                            type="radio" 
                            name="gender" 
                            value="0" 
                            checked={userForm.gender === 0} 
                            onChange={(e) => handleRadioChange('gender', e.target.value)}
                            className="text-blue-500 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-gray-700">未知</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input 
                            type="radio" 
                            name="gender" 
                            value="1" 
                            checked={userForm.gender === 1} 
                            onChange={(e) => handleRadioChange('gender', e.target.value)}
                            className="text-blue-500 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-gray-700">男</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input 
                            type="radio" 
                            name="gender" 
                            value="2" 
                            checked={userForm.gender === 2} 
                            onChange={(e) => handleRadioChange('gender', e.target.value)}
                            className="text-blue-500 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-gray-700">女</span>
                        </label>
                      </div>
                    </div>
                    
                    {/* 生日 */}
                    <div className="form-item">
                      <label className="block text-sm font-medium text-gray-600 mb-2">生日</label>
                      <div className="relative">
                        <input
                            type="date"
                            name="birthday"
                            value={userForm.birthday ? new Date(userForm.birthday).toISOString().split('T')[0] : ''} // ISO格式化日期，以便date input正确显示
                            onChange={handleUserFormChange}
                            placeholder="选择生日"
                            className="w-full p-2 border border-gray-300 rounded-lg pr-10 focus:ring-blue-500 focus:border-blue-500 transition duration-300"
                        />
                        <FaCalendarAlt className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8">
                    <button
                      type="submit"
                      disabled={updateLoading}
                      className="inline-flex items-center px-6 py-2 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-[#4A90E2] hover:bg-[#357abd] transition duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4A90E2] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FaSave className="mr-2" />
                      {updateLoading ? '保存中...' : '保存修改'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* 修改密码卡片 */}
            {activeTab === 'password' && (
              <div className="bg-white rounded-xl shadow-lg p-8 content-card">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center section-title">
                  <FaKey className="mr-3 text-[#4A90E2]" />修改密码
                </h3>
                
                <form onSubmit={updatePassword} className="password-form max-w-lg">
                  
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-600 mb-2">原密码</label>
                    <input 
                      type="password" 
                      name="oldPassword"
                      value={passwordForm.oldPassword} 
                      onChange={handlePasswordFormChange}
                      placeholder="请输入原密码"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-300"
                    />
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-600 mb-2">新密码</label>
                    <input 
                      type="password" 
                      name="newPassword"
                      value={passwordForm.newPassword} 
                      onChange={handlePasswordFormChange}
                      placeholder="请输入新密码"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-300"
                    />
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-600 mb-2">确认密码</label>
                    <input 
                      type="password" 
                      name="confirmPassword"
                      value={passwordForm.confirmPassword} 
                      onChange={handlePasswordFormChange}
                      placeholder="请再次输入新密码"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-300"
                    />
                  </div>
                  
                  <div className="mt-8">
                    <button
                      type="submit"
                      disabled={passwordLoading}
                      className="inline-flex items-center px-6 py-2 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-[#4A90E2] hover:bg-[#357abd] transition duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4A90E2] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FaShieldAlt className="mr-2" />
                      {passwordLoading ? '修改中...' : '修改密码'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;