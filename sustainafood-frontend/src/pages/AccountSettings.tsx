import React, { useState } from "react";
import Navbar from "../components/Navbar"; 
import Footer from "../components/Footer"; 
import "../assets/styles/AccountSettings.css";
import axios from "axios"; 

const AccountSettings = () => {
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [is2FAVerified, setIs2FAVerified] = useState(false);
  const [show2FAVerification, setShow2FAVerification] = useState(false);
  const [twoFACode, setTwoFACode] = useState("");
  
  // Fonction pour changer le mot de passe
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Password change functionality will be implemented here.");
  };

  // Fonction pour désactiver le compte
  const handleDeactivateAccount = () => {
    if (window.confirm('Are you sure you want to deactivate your account? You can reactivate it later by logging in.')) {
      alert('Your account has been deactivated. You can reactivate it at any time by logging in.');
      // Ajouter ici la logique réelle de désactivation
    }
  };

  // Fonction pour activer ou désactiver la 2FA
  const handle2FAToggle = async () => {
    setIs2FAEnabled(!is2FAEnabled);
    if (!is2FAEnabled) {
      try {
        const response = await axios.post("/api/2fa/enable"); 
        alert("2FA has been enabled. Check your email for setup instructions.");
        setShow2FAVerification(true); // Afficher le formulaire de vérification
      } catch (error) {
        console.error("Error enabling 2FA:", error);
        alert("Failed to enable 2FA.");
      }
    } else {
      alert("2FA has been disabled.");
      setIs2FAEnabled(false);
    }
  };

  // Fonction pour vérifier le code 2FA
  const handle2FAVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post("/api/verify-2fa", { code: twoFACode });
      if (response.data.success) {
        alert("2FA setup completed successfully.");
        setIs2FAVerified(true);
        setShow2FAVerification(false); // Masquer le formulaire de vérification
      } else {
        alert("Invalid verification code.");
      }
    } catch (error) {
      console.error("Error verifying 2FA:", error);
      alert("Failed to verify 2FA code.");
    }
  };

  return (
    <div className="accountsettings-page">
      <Navbar />
      <div className="accountsettings-content">
        <div className="accountsettings-container">
          <h1 className="accountsettings-title">Account Settings</h1>

          {/* Section de changement de mot de passe */}
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

          {/* Section de la 2FA */}
          <section className="accountsettings-section">
            <h2>Two-Factor Authentication (2FA)</h2>
            <div className="accountsettings-twofa-toggle">
              <label className="accountsettings-switch">
                <input type="checkbox" checked={is2FAEnabled} onChange={handle2FAToggle} />
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
              Warning: Deactivating your account will temporarily suspend your access to SustainaFood. 
              Your data will be preserved, and you can reactivate your account at any time by logging in.
            </p>
            <button onClick={handleDeactivateAccount} className="accountsettings-button accountsettings-deactivate">
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
