import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaSignOutAlt, FaBell, FaSignInAlt, FaUserPlus } from "react-icons/fa";
import logo from "../assets/images/logooo.png";
import imgmouna from "../assets/images/imgmouna.png";
import { useAuth } from "../contexts/AuthContext";
import { getUserById } from "../api/userService";
import "../assets/styles/Navbar.css";

const Navbar = () => {
  const { user: authUser, token, logout } = useAuth();
  const [user, setUser] = useState(authUser);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const profilePhotoUrll = user?.photo ? `http://localhost:3000/${user.photo}` : imgmouna;

  useEffect(() => {
    const fetchUser = async () => {
      if (authUser) {
        try {
          const userId = authUser.id || authUser._id; // Handle both id and _id
          const response = await getUserById(userId);
          setUser(response.data);
        } catch (error) {
          console.error("Backend Error:", error);
        }
      }
    };

    if (authUser) {
      fetchUser();
    }
  }, [authUser]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isDonner = user?.role === "restaurant" || user?.role === "supermarket";
  const isRecipient = user?.role === "ong" || user?.role === "student";
  const isAdmin = user?.role === "admin";
  const isTransporter=user?.role === "transporter";

  return (
    <nav className="navbarfront">
      <div className="logo-container">
        <img src={logo || "/placeholder.svg"} alt="SustainaFood Logo" className="logo" />
        <h1 className="title">SustainaFood</h1>
      </div>

      {/* Menu Burger */}
      <div
        className={`menu-toggle ${mobileMenuOpen ? "open" : ""}`}
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        <span className="bar"></span>
        <span className="bar"></span>
        <span className="bar"></span>
      </div>

      {/* Navigation Links */}
      <ul className={`nav-links ${mobileMenuOpen ? "open" : ""}`}>
        <Link to="/" className="nav-link">
          Home
        </Link>
        <Link to="/About" className="nav-link">
          About
        </Link>
        <Link to="/Contact" className="nav-link">
          Contact
        </Link>

        {authUser ? (
          <>
            <div
              className="dropdown"
              onMouseEnter={() => setDropdownOpen("donations")}
              onMouseLeave={() => setDropdownOpen(null)}
            >
              <span className="dropdown-toggle">Donations</span>
              {dropdownOpen === "donations" && (
                <div className="dropdown-content">
                  <Link to="/ListOfDonations">List of Donations</Link>
                  {isRecipient && <Link to="/myrequests">My Requests</Link>}
                  {isDonner && <Link to="/mydonations">My Donations</Link>}
                </div>
              )}
            </div>
            <div
              className="dropdown"
              onMouseEnter={() => setDropdownOpen("transporter")}
              onMouseLeave={() => setDropdownOpen(null)}
            >
              <span className="dropdown-toggle">Transporter</span>
              {dropdownOpen === "transporter" && (
                <div className="dropdown-content">
                  <Link to="#">Assigned Deliveries</Link>
                  {isTransporter && <Link to="#">Route Optimization</Link>}
                </div>
              )}
            </div>
            <div
              className="dropdown"
              onMouseEnter={() => setDropdownOpen("analytics")}
              onMouseLeave={() => setDropdownOpen(null)}
            >
              <span className="dropdown-toggle">Analytics & Reporting</span>
              {dropdownOpen === "analytics" && (
                <div className="dropdown-content">
                  <Link to="#">Donation Statistics</Link>
                  <Link to="#">Personal Stats</Link>
                </div>
              )}
            </div>
            <div
              className="dropdown"
              onMouseEnter={() => setDropdownOpen("ai")}
              onMouseLeave={() => setDropdownOpen(null)}
            >
              <span className="dropdown-toggle">AI System</span>
              {dropdownOpen === "ai" && (
                <div className="dropdown-content">
                  <Link to="#">Food Item Classification</Link>
                  <Link to="#">Predictions</Link>
                </div>
              )}
            </div>

            <div className="social-icons">
              <FaBell />
            </div>

            {/* Render Profile Menu Only for Non-Admin Users */}
            {!isAdmin && (
              <div className="profile-menu" onClick={() => setMenuOpen(!menuOpen)}>
                <img
                  src={profilePhotoUrll || "/placeholder.svg"}
                  alt="Profile"
                  className="profile-img"
                />
                <div className={`dropdown-menu ${menuOpen ? "active" : ""}`}>
                  <div className="profile-info">
                    <img
                      src={profilePhotoUrll || "/placeholder.svg"}
                      alt="Profile"
                      className="dropdown-img"
                    />
                    <div>
                      <p className="user-name">{user?.name || "Loading..."}</p>
                      <p className="user-email">{user?.email || "Loading..."}</p>
                    </div>
                  </div>
                  <hr />
                  <button onClick={() => navigate("/profile")} className="menu-item">
                    Profile and visibility
                  </button>
                  <button
                    className="menu-item"
                    onClick={() => navigate("/account-settings")}
                  >
                    Account Settings
                  </button>
                  <button
                    className="menu-item"
                    onClick={() => navigate("/edit-profile")}
                  >
                    Edit Profile
                  </button>
                  <hr />
                  <button onClick={handleLogout} className="menu-item logout">
                    <FaSignOutAlt /> LogOut
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="auth-buttons">
            <Link to="/login" className="auth-button signin">
              <FaSignInAlt /> Sign In
            </Link>
            <Link to="/signup" className="auth-button signup">
              <FaUserPlus /> Sign Up
            </Link>
          </div>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;