import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchCurrentUser,
  updateProfileInfo,
  changePassword,
  selectUser,
  selectIsLoading,
  selectError,
} from "@/store/userSlice";

import { formatDate } from "@/utils/date";

const ProfilePage = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const isLoading = useSelector(selectIsLoading);
  const globalError = useSelector(selectError);

  const [activeTab, setActiveTab] = useState("profile");

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    nickname: "",
    gender: 0,
    birthday: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  // Load user info
  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        email: user.email || "",
        phone: user.phone || "",
        nickname: user.nickname || "",
        gender: user.gender ?? 0,
        birthday: user.birthday || "",
      });
    }
  }, [user]);

  // Update form fields
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Fix gender change issue
  const handleGenderChange = (genderValue) => {
    setFormData((prev) => ({ ...prev, gender: genderValue }));
  };

  const handleSave = () => {
    dispatch(updateProfileInfo(formData));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitPassword = async () => {
    setPasswordError("");
    setPasswordSuccess("");

    const { oldPassword, newPassword, confirmPassword } = passwordForm;

    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordError("Please fill in all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("The new password and confirmation do not match.");
      return;
    }

    try {
      await dispatch(changePassword({ oldPassword, newPassword })).unwrap();

      setPasswordSuccess("Password updated successfully.");
      setPasswordForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      setPasswordError(err || "Failed to change password.");
    }
  };
  if (!user) {
    return (
      <p className="text-center mt-10 text-gray-500">
        Loading user information...
      </p>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* TOP BLUE HEADER */}
      <div className="w-full bg-blue-500 rounded-lg p-8 text-white shadow mb-8">
        <div className="flex items-center space-x-6">
          <div className="w-20 h-20 bg-blue-400 rounded-full flex justify-center items-center">
            <span className="text-3xl font-semibold">
              {formData.username.charAt(0).toUpperCase()}
            </span>
          </div>

          <div>
            <h2 className="text-3xl font-bold">{formData.username}</h2>
            <p className="text-md">{formData.email}</p>
            <p className="text-sm mt-1">
              Joined on:{" "}
              {formatDate(user.createTime || user.createdAt) || "Unknown"}
            </p>
          </div>
        </div>
      </div>

      {/* LAYOUT: LEFT MENU + CONTENT */}
      <div className="flex space-x-6">
        {/* LEFT SIDEBAR */}
        <div className="w-64 bg-white rounded-lg shadow p-4 space-y-4">
          <h3 className="font-semibold text-lg mb-3">Personal Center</h3>

          <button
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-2
              ${
                activeTab === "profile"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-50 text-gray-700"
              }`}
            onClick={() => setActiveTab("profile")}
          >
            <span>👤</span>
            <span>Profile Info</span>
          </button>

          <button
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-2
              ${
                activeTab === "password"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-50 text-gray-700"
              }`}
            onClick={() => setActiveTab("password")}
          >
            <span>🔑</span>
            <span>Change Password</span>
          </button>
        </div>

        {/* RIGHT CONTENT */}
        <div className="flex-1 bg-white rounded-lg shadow p-8">
          {/* ===== TAB 1: PROFILE INFO ===== */}
          {activeTab === "profile" && (
            <>
              <h3 className="text-xl font-semibold mb-6 flex items-center space-x-2">
                <span>👤</span>
                <span>Profile Information</span>
              </h3>

              <div className="grid grid-cols-2 gap-6">
                {/* Username */}
                <div>
                  <label className="font-medium">Username</label>
                  <input
                    readOnly
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="mt-2 w-full p-3 bg-gray-100 rounded border"
                  />
                </div>

                {/* Nickname */}
                <div>
                  <label className="font-medium">Nickname</label>
                  <input
                    name="nickname"
                    value={formData.nickname}
                    onChange={handleChange}
                    className="mt-2 w-full p-3 bg-gray-50 rounded border"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="font-medium">Email</label>
                  <input
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-2 w-full p-3 bg-gray-100 rounded border"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="font-medium">Phone</label>
                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="mt-2 w-full p-3 bg-gray-50 rounded border"
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="font-medium">Gender</label>
                  <div className="flex space-x-6 mt-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        checked={formData.gender === 0}
                        onChange={() => handleGenderChange(0)}
                      />
                      <span>Unknown</span>
                    </label>

                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        checked={formData.gender === 1}
                        onChange={() => handleGenderChange(1)}
                      />
                      <span>Male</span>
                    </label>

                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        checked={formData.gender === 2}
                        onChange={() => handleGenderChange(2)}
                      />
                      <span>Female</span>
                    </label>
                  </div>
                </div>

                {/* Birthday */}
                <div>
                  <label className="font-medium">Birthday</label>
                  <input
                    type="date"
                    name="birthday"
                    value={formData.birthday}
                    onChange={handleChange}
                    className="mt-2 w-full p-3 bg-gray-50 border rounded"
                  />
                </div>
              </div>

              {/* Save Button */}
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="mt-8 px-6 py-3 bg-blue-600 text-white rounded shadow hover:bg-blue-700"
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
            </>
          )}

          {/* ===== TAB 2: CHANGE PASSWORD ===== */}
          {activeTab === "password" && (
            <div>
              <h3 className="text-xl font-semibold mb-6 flex items-center space-x-2">
                <span>🔑</span>
                <span>Change Password</span>
              </h3>

              <p className="text-gray-500 mb-6">
                You can modify your account password.
              </p>
              {/* Error / Success messages */}
              {passwordError && (
                <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded">
                  {passwordError}
                </div>
              )}
              {passwordSuccess && (
                <div className="mb-4 text-sm text-green-700 bg-green-50 border border-green-200 px-3 py-2 rounded">
                  {passwordSuccess}
                </div>
              )}
              {globalError && (
                <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded">
                  {globalError}
                </div>
              )}

              <div className="space-y-4 max-w-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Old Password
                  </label>
                  <input
                    type="password"
                    name="oldPassword"
                    value={passwordForm.oldPassword}
                    onChange={handlePasswordChange}
                    className="w-full p-3 bg-gray-50 border rounded"
                    placeholder="Enter your current password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full p-3 bg-gray-50 border rounded"
                    placeholder="Enter your new password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full p-3 bg-gray-50 border rounded"
                    placeholder="Re-enter your new password"
                  />
                </div>

                <button
                  onClick={handleSubmitPassword}
                  disabled={isLoading}
                  className="mt-4 px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60"
                >
                  {isLoading ? "Updating..." : "Update Password"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
