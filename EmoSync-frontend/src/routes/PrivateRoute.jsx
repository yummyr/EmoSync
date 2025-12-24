// src/routes/PrivateRoute.jsx
import React from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import { selectIsLoggedIn } from "@/store/userSlice";

const PrivateRoute = ({ children }) => {
  const isAuthenticated = useSelector(selectIsLoggedIn);
  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/auth/login"
        replace
        state={{ from: location }} // Redirect back logic
      />
    );
  }

  return children;
};

export default PrivateRoute;
