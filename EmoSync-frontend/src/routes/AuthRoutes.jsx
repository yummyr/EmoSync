// src/routes/AuthRoutes.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";

import AuthLayout from "@/layouts/AuthLayout";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";

const AuthRoutes = () => {
  return (
    <AuthLayout>
      <Routes>
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
      </Routes>
    </AuthLayout>
  );
};

export default AuthRoutes;
