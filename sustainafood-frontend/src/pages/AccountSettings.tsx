import React, { useState } from "react";
import Navbar from "../components/Navbar"; // Adjust the import path as needed
import Footer from "../components/Footer"; // Adjust the import path as needed
import "../assets/styles/AccountSettings.css";
import axios from "axios"; // Import axios
import { useAuth } from "../contexts/AuthContext"; // Import useAuth for user and token
import { deactivateAccount , changePassword} from "../api/userService";

const AccountSettings = () => {
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const { user, token, logout } = useAuth(); // Get user, token, and logout from AuthContext

    // State for password fields
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
  
    // Handle Change Password
    const handleChangePassword = async (e) => {
      e.preventDefault();
  
      // Make sure the new passwords match
      if (newPassword !== confirmPassword) {
        alert("New password and Confirm password do not match!");
        return;
      }
  
      try {
        // user.id must match what your backend expects as "userId"
        const response = await changePassword(user.id, currentPassword, newPassword);
  
        if (response.status === 200) {
          alert("Password changed successfully!");
          // Reset the input fields
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
        }
      } catch (error) {
        console.error("Error changing password:", error);
        alert(error.response?.data?.error || "Failed to change password");
      }
    };

  const handleDeactivateAccount = async () => {
    if (
      window.confirm(
        "Are you sure you want to deactivate your account? You can reactivate it later by logging in."
      )
    ) {
      if (user && user.id) {
        try {
          const response = await deactivateAccount(user.id, token);
  
          if (response.status === 200) {
            alert("Your account has been deactivated. You can reactivate it by logging in.");
            logout(); // Log the user out after deactivation
          }
        } catch (error) {
          console.error("Error deactivating account:", error);
          alert("Failed to deactivate account. Please try again.");
        }
      } else {
        alert("User information is not available. Please try again.");
      }
    }
  };

  const handle2FAToggle = () => {
    setIs2FAEnabled(!is2FAEnabled);
    alert(`2FA has been ${is2FAEnabled ? "disabled" : "enabled"}.`);
  };

  return (
    <div className="accountsettings-page">
      <Navbar />
      <div className="accountsettings-content">
        <div className="accountsettings-container">
          <h1 className="accountsettings-title">Account Settings</h1>

     {/* Change Password Section */}
     <section className="accountsettings-section">
            <h2>Change Password</h2>
            <form onSubmit={handleChangePassword} className="accountsettings-form">
              <div className="accountsettings-form-group">
                <label htmlFor="currentPassword">Current Password</label>
                <input
                  type="password"
                  id="currentPassword"
                  required
                  value={currentPassword}                 // <-- bind state
                  onChange={(e) => setCurrentPassword(e.target.value)} // <-- update state
                />
              </div>
              <div className="accountsettings-form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  required
                  value={newPassword}                      // <-- bind state
                  onChange={(e) => setNewPassword(e.target.value)}     // <-- update state
                />
              </div>
              <div className="accountsettings-form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  required
                  value={confirmPassword}                   // <-- bind state
                  onChange={(e) => setConfirmPassword(e.target.value)}  // <-- update state
                />
              </div>
              <button type="submit" className="accountsettings-button">
                Change Password
              </button>
            </form>
          </section>

          {/* Section de la 2FA */}
          <section className="accountsettings-section">
            <h2>Two-Factor Authentication (2FA)</h2>
            <div className="accountsettings-twofa-toggle">
              <label className="accountsettings-switch">
                <input
                  type="checkbox"
                  checked={is2FAEnabled}
                  onChange={handle2FAToggle}
                />
                <span className="accountsettings-slider accountsettings-round"></span>
              </label>
              <span>{is2FAEnabled ? "Enabled" : "Disabled"}</span>
            </div>
            {is2FAEnabled && !is2FAVerified && (
              <div className="accountsettings-twofa-verification">
                <h3>Enter the verification code sent to your email:</h3>
                <form onSubmit={handle2FAVerification}>
                  <input
                    type="text"
                    id="twoFACode"
                    value={twoFACode}
                    onChange={(e) => setTwoFACode(e.target.value)}
                    required
                  />
                  <button type="submit" className="accountsettings-button">
                    Verify 2FA Code
                  </button>
                </form>
              </div>
            )}
            {is2FAVerified && <p>2FA is now fully set up.</p>}
            {is2FAEnabled && !is2FAVerified && (
              <p>Check your email for the 2FA verification code.</p>
            )}
          </section>

          {/* Section de désactivation du compte */}
          <section className="accountsettings-section">
            <h2>Deactivate Account</h2>
            <p>
              Warning: Deactivating your account will temporarily suspend your access to
              SustainaFood. Your data will be preserved, and you can reactivate your account at
              any time by logging in.
            </p>
            <button
              onClick={handleDeactivateAccount}
              className="accountsettings-button accountsettings-deactivate"
            >
              Deactivate Account
            </button>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AccountSettings;