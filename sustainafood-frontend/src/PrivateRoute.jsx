import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext"; // Adjust the path based on your project

const PrivateRoute = ({ roles }) => {
  const { user, token } = useAuth(); // Use AuthContext directly

  console.log("User Roles:", user?.roles || "No user logged in");
  console.log("Required Roles:", roles);

  // Redirect to login if no JWT token
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Redirect unauthorized users
  if (roles?.length > 0 && !user?.roles?.some((role) => roles.includes(role))) {
    console.warn("Unauthorized access: Redirecting...");
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
