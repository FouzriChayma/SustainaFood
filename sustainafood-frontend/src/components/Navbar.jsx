import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSignOutAlt, FaSignInAlt, FaBell } from 'react-icons/fa';
import logo from '../assets/images/logooo.png';
import imgmouna from '../assets/images/imgmouna.png';
import { useAuth } from "../contexts/AuthContext";
import { getUserById } from "../api/userService";
import '../assets/styles/Navbar.css';

const Navbar = () => {
  const { user: authUser, token, logout } = useAuth(); // Ajout de la fonction logout du contexte
  const [user, setUser] = useState(authUser);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const navigate = useNavigate();

  const isAuthenticated = !!token;

  useEffect(() => {
    const fetchUser = async () => {
      if (!authUser || !authUser.id) {
        console.error("⛔ authUser id is undefined!");
        return;
      }
      try {
        const response = await getUserById(authUser.id);
        setUser(response.data);
      } catch (error) {
        console.error("❌ Backend Error:", error);
      }
    };

    if (authUser && authUser.id) {
      fetchUser();
    }
  }, [authUser]);

  const handleLogout = () => {
    logout(); // Utilisation de la fonction logout du contexte pour mettre à jour l'état global
    navigate('/login'); // Rediriger vers la page de connexion
  };

  return (
    <nav className="navbarfront">
      <div className="logo-container">
        <img src={logo} alt="SustainaFood Logo" className="logo" />
        <h1 className="title">SustainaFood</h1>
      </div>

      <ul className="nav-links">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/About" className="nav-link">About</Link>
        <Link to="/Contact" className="nav-link">Contact</Link>

        {isAuthenticated && (
          <>
            <div
              className="dropdown"
              onMouseEnter={() => setDropdownOpen("donations")}
              onMouseLeave={() => setDropdownOpen(null)}
            >
              <span className="dropdown-toggle">Donations</span>
              {dropdownOpen === "donations" && (
                <div className="dropdown-content">
                  <Link to="#">My Donations</Link>
                  <Link to="#">My Requests</Link>
                  <Link to="#">List of Donations</Link>
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
                  <Link to="#">Route Optimization</Link>
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

            <div className="profile-menu" onClick={() => setMenuOpen(!menuOpen)}>
              <img src={imgmouna} alt="Profile" className="profile-img" />
              <div className={`dropdown-menu ${menuOpen ? "active" : ""}`}>
                <div className="profile-info">
                  <img src={imgmouna} alt="Profile" className="dropdown-img" />
                  <div>
                    <p className="user-name">{user?.name || 'Loading...'}</p>
                    <p className="user-email">{user?.email || 'Loading...'}</p>
                  </div>
                </div>
                <hr />
                <button onClick={() => navigate("/profile")} className="menu-item">Profil and visibility</button>
                <button className="menu-item">Change account</button>
                <button className="menu-item">Generate account</button>
                <hr />
                <button onClick={handleLogout} className="menu-item logout">
                  <FaSignOutAlt /> LogOut
                </button>
              </div>
            </div>
          </>
        )}

        {!isAuthenticated && (
          <div className="social-icons">
            <Link to="/login">
              <FaSignInAlt />
            </Link>
          </div>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
