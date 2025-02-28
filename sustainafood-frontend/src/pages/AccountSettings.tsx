import React, { useState } from "react";
import Navbar from "../components/Navbar"; // Adjust the import path as needed
import Footer from "../components/Footer"; // Adjust the import path as needed
import "../assets/styles/AccountSettings.css";
import axios from "axios"; // Import axios
import { useAuth } from "../contexts/AuthContext"; // Import useAuth for user and token
import { deactivateAccount } from "../api/userService";

const AccountSettings = () => {
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const { user, token, logout } = useAuth(); // Get user, token, and logout from AuthContext

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Password change functionality will be implemented here.");
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

          <section className="accountsettings-section">
            <h2>Change Password</h2>
            <form onSubmit={handleChangePassword} className="accountsettings-form">
              <div className="accountsettings-form-group">
                <label htmlFor="currentPassword">Current Password</label>
                <input type="password" id="currentPassword" required />
              </div>
              <div className="accountsettings-form-group">
                <label htmlFor="newPassword">New Password</label>
                <input type="password" id="newPassword" required />
              </div>
              <div className="accountsettings-form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input type="password" id="confirmPassword" required />
              </div>
              <button type="submit" className="accountsettings-button">
                Change Password
              </button>
            </form>
          </section>

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
            {is2FAEnabled && <p>2FA is enabled. Use an authenticator app to generate codes.</p>}
          </section>

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