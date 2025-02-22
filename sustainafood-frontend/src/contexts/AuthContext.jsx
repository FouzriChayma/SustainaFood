import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

// Create the context
export const AuthContext = createContext();

// Custom hook to use AuthContext
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  // Retrieve initial authentication state from localStorage safely
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser && storedUser !== "undefined" ? JSON.parse(storedUser) : null;
  });

  const [token, setToken] = useState(() => {
    const storedToken = localStorage.getItem("token");
    return storedToken && storedToken !== "undefined" ? storedToken : null;
  });

  // Login function
  const login = (userData, token) => {
    setUser(userData);
    setToken(token);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", token);
    navigate("/profile"); // Redirect after login
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login"); // Redirect to login page
  };

  // Check if the user is authenticated
  const isAuthenticated = () => !!token;

   // Method to get the role of the current user
   const getRole = () => {
    return user?.role || null;
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated, getRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;