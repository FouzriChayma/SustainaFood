import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext"; // Import useAuth
import { validate2FACode } from "../api/userService"; // Import the validate2FACode method

const TwoFAVerification = () => {
  const [code, setCode] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const email = new URLSearchParams(location.search).get("email");
  const { login } = useAuth(); // Use the login function from AuthContext

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("Sending 2FA code for validation:", { email, code }); // Log the request data
  
      const response = await validate2FACode(email, code);
  
      console.log("Response from backend:", response); // Log the response
  
      if (response.status === 200) {
        // Proceed with login
        const { token, role, id, is2FAEnabled } = response.data;
        // Save token and user data (e.g., in context or local storage)
        login({ id, role, email }, token, is2FAEnabled); // Pass is2FAEnabled to login
        navigate("/dashboard"); // Redirect to the dashboard or home page
      }
    } catch (error) {
      console.error("Error verifying 2FA code:", error);
      if (error.response) {
        console.error("Backend error response:", error.response.data); // Log the backend error response
        alert(error.response.data.error || "Invalid 2FA code");
      } else {
        alert("An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <div className="forget-pass-container">
      <div className="forget-pass-card">
        <h2>2FA Verification</h2>
        <p>Check your email for the 2FA code and enter it below.</p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter the 2FA code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
          <button type="submit">Verify Code</button>
        </form>
      </div>
    </div>
  );
};

export default TwoFAVerification;