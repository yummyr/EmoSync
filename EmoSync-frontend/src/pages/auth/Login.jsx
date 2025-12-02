import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, selectIsLoading, selectError } from "@/store/userSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faLock,
  faEye,
  faEyeSlash,
  faSignInAlt,
} from "@fortawesome/free-solid-svg-icons";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const isLoading = useSelector(selectIsLoading) || false;
  const error = useSelector(selectError) || null;

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const from = location.state?.from?.pathname;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      console.log("开始登录，表单数据:", formData);
      console.log("当前from路径:", from);

      // Clear any existing token before login to avoid conflicts
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("roleType");

      // Dispatch the loginUser action
      const result = await dispatch(loginUser(formData)).unwrap();

      console.log("Login success:", result);

      const { roleType } = result;

      // Redirect rules - prioritize dashboard over profile for fresh login
      let redirectPath = "/back/dashboard"; // Always go to dashboard after successful login
      navigate(redirectPath, { replace: true });
    } catch (err) {
      console.error("登录失败:", err);
      // error is already stored in Redux
    }
  };

  return (
    <div className="max-w-md w-full mx-auto">
      {/* Title / Subtitle */}
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold text-gray-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-gray-600">
          Don't have an account?
          <Link
            to="/auth/register"
            className="text-blue-600 ml-2 hover:underline font-medium"
          >
            Create one
          </Link>
        </p>
      </div>

      {/* Form */}
      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Error banner */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md shadow-sm flex">
            <span className="font-semibold mr-2">Error:</span> {error}
          </div>
        )}

        {/* Username */}
        <div>
          <label
            htmlFor="username"
            className="block mb-1 text-sm font-medium text-gray-700"
          >
            Username or Email
          </label>
          <div className="relative">
            <FontAwesomeIcon
              icon={faUser}
              className="absolute top-3 left-3 text-gray-400"
            />
            <input
              name="username"
              type="text"
              required
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username or email"
              className="
                w-full pl-11 pr-4 py-3
                border rounded-lg
                focus:ring-2 focus:ring-blue-400 outline-none
                text-gray-800
              "
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="block mb-1 text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <div className="relative">
            <FontAwesomeIcon
              icon={faLock}
              className="absolute top-3 left-3 text-gray-400"
            />
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="
                w-full pl-11 pr-11 py-3
                border rounded-lg
                focus:ring-2 focus:ring-blue-400 outline-none
                text-gray-800
              "
            />

            {/* Toggle password visibility */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
            </button>
          </div>
        </div>

        {/* Remember me + Forgot password */}
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center text-gray-700">
            <input type="checkbox" className="mr-2 h-4 w-4 text-blue-600" />
            Remember me
          </label>

          <button type="button" className="text-blue-600 hover:underline">
            Forgot password?
          </button>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isLoading}
          className="
            w-full py-3 rounded-lg text-white bg-blue-600
            hover:bg-blue-700 transition shadow-md hover:shadow-lg
            flex items-center justify-center gap-2 text-lg
            disabled:opacity-70 disabled:cursor-not-allowed
          "
        >
          {isLoading ? (
            <>
              <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
              Signing in...
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faSignInAlt} />
              Sign in
            </>
          )}
        </button>
      </form>

      {/* Security notice */}
      <div className="mt-10 p-4 border rounded-lg bg-blue-50 text-blue-700 text-sm flex gap-3">
        <span>🔒</span>
        <p>
          For your security, please do not save login information on public
          devices.
        </p>
      </div>
    </div>
  );
};

export default Login;
