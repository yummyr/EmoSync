import React from "react";
import { useState } from "react";
import api from "@/api";

const Register = () => {
  const [registerFormData, setRegisterFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    nickname: "",
    phone: "",
    gender: "0",
    birthday: "",
    userType: "1",
  });

  const handleRegisterInputChange = (field, value) => {
    setRegisterFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  const handleRegisterFormSubmit = async (e) => {
    e.preventDefault();

    // Verify password match
    if (registerFormData.password !== registerFormData.confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    // Validate required fields
    if (!registerFormData.email || !registerFormData.password) {
      alert("Please fill in all required fields.");
      return;
    }

    // Build submission data, excluding confirm password field
    const submitData = {
      username: registerFormData.username,
      email: registerFormData.email,
      password: registerFormData.password,
      nickname: registerFormData.nickname || registerFormData.username,
      phone: registerFormData.phone || "",
      gender: parseInt(registerFormData.gender) || 0,
      birthday: registerFormData.birthday || "",
      userType: parseInt(registerFormData.userType) || 1,
    };

    try {
      const res = await api.post("/user/add", submitData);
      alert("User registered successfully.");

      // Reset form data
      setRegisterFormData({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        nickname: "",
        phone: "",
        gender: 0,
        birthday: "",
        userType: 1,
      });
      fetchUserPage();
    } catch (err) {
      console.error("Failed to register user.");
    }
  };
  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">
          Register an Account
        </h2>
        <p className="mt-2 text-gray-600">
          Already have an account？
          <a
            href="/auth/login"
            className="text-primary-600 hover:text-primary-500 font-medium"
          >
            Login
          </a>
        </p>
      </div>

        <form onSubmit={handleRegisterFormSubmit}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="username" className="block text-gray-700">
                      Username *
                    </label>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      required
                      value={registerFormData.username}
                      onChange={(e) => handleRegisterInputChange("username", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Input username"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-gray-700">
                      Email *
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={registerFormData.email}
                      onChange={(e) => handleRegisterInputChange("email", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Input your email"
                    />
                  </div>
                  <div>
                    <label htmlFor="password" className="block text-gray-700">
                      Password *
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={registerFormData.password}
                      onChange={(e) => handleRegisterInputChange("password", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Input your password"
                    />
                  </div>
                   <div>
                    <label htmlFor="confirmPassword" className="block text-gray-700">
                      Confirm Password *
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      value={registerFormData.confirmPassword}
                      onChange={(e) => handleRegisterInputChange("confirmPassword", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Confirm your password"
                    />
                  </div>
                  <div>
                    <label htmlFor="nickname" className="block text-gray-700">
                      Nickname
                    </label>
                    <input
                      id="nickname"
                      name="nickname"
                      value={registerFormData.nickname}
                      onChange={(e) => handleRegisterInputChange("nickname", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Input your nickname (optional)"
                    />
                  </div>
                   <div>
                    <label htmlFor="phone" className="block text-gray-700">
                     Phone Number
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      value={registerFormData.phone}
                      onChange={(e) => handleRegisterInputChange("phone", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Input your phone number (optional)"
                    />
                  </div>
                  <div>
                    <label htmlFor="birthday" className="block text-gray-700">
                     Birthday
                    </label>
                    <input
                      id="birthday"
                      name="birthday"
                      type="date"
                      value={registerFormData.birthday}
                      onChange={(e) => handleRegisterInputChange("birthday", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                    <div>
                    <label htmlFor="gender" className="block text-gray-700">
                      Gender
                    </label>
                    <select
                      id="gender"
                      name="gender"
                      value={registerFormData.gender}
                      onChange={(e) => handleRegisterInputChange("gender", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="0">Unknown</option>
                      <option value="1">Male</option>
                      <option value="2">Female</option>
                    </select>
                </div>
               
                 </div>
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setOpenRegisterForm(false);
                      // Reset form data
                      setRegisterFormData({
                        username: "",
                        email: "",
                        password: "",
                        confirmPassword: "",
                        nickname: "",
                        phone: "",
                        gender: "0",
                        birthday: "",
                        userType: "1",
                      });
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Register
                  </button>
                </div>
            </form>
    </div>
  );
};

export default Register;
