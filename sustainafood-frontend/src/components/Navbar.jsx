import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaSignOutAlt, FaBell, FaSignInAlt, FaUserPlus } from "react-icons/fa";
import logo from "../assets/images/logooo.png";
import imgmouna from "../assets/images/imgmouna.png";
import { useAuth } from "../contexts/AuthContext";
import { getUserById } from "../api/userService";
import { getNotificationsByReceiver, markNotificationAsRead } from "../api/notificationService";
import "../assets/styles/Navbar.css";

const Navbar = () => {
  const { user: authUser, token, logout } = useAuth();
  const [user, setUser] = useState(authUser);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const profilePhotoUrl = user?.photo ? `http://localhost:3000/${user.photo}` : imgmouna;

  // Fetch user details
  useEffect(() => {
    const fetchUser = async () => {
      if (!authUser || (!authUser._id && !authUser.id)) return;

      const userId = authUser._id || authUser.id;
      try {
        const response = await getUserById(userId);
        setUser(response.data);
      } catch (error) {
        console.error("Backend Error:", error);
      }
    };

    if (authUser) {
      fetchUser();
    }
  }, [authUser]);

  // Fetch notifications for the logged-in user
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!authUser || !token) return;
      const userId = authUser._id || authUser.id;
      if (!userId) return;

      try {
        const response = await getNotificationsByReceiver(userId, token);
        setNotifications(response.notifications || []);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
  }, [authUser, token]);

  // Handle marking a notification as read
  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId, token);
      setNotifications((prevNotifications) =>
        prevNotifications.map((notif) =>
          notif._id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
    localStorage.clear();
  };

  const isDonner = user?.role === "restaurant" || user?.role === "supermarket";
  const isRecipient = user?.role === "ong" || user?.role === "student";
  const isAdmin = user?.role === "admin";
  const isTransporter = user?.role === "transporter";

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
                  <Link to="/ListOfRequests">List of Requests</Link>
                  {isRecipient && <Link to="/myrequest">My Requests</Link>}
                  {isDonner && <Link to="/mydonations">My Donations</Link>}
                  {isDonner && <Link to="/addDonation">Add Donation</Link>}
                  {isRecipient && <Link to="/addDonation">Add Request</Link>}
                  {isDonner && <Link to="/DonationRecommendations">Donation Recommendations</Link>}
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

            {/* Notification Bell with Dropdown */}
            <div className="social-icons">
              <div
                className="notification-bell"
                onClick={() => setNotificationDropdownOpen(!notificationDropdownOpen)}
              >
                <FaBell />
                {notifications.filter((notif) => !notif.isRead).length > 0 && (
                  <span className="notification-count">
                    {notifications.filter((notif) => !notif.isRead).length}
                  </span>
                )}
              </div>
              {notificationDropdownOpen && (
                <div className="notification-dropdown">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => {
                      // Safely handle sender photo
                      const senderPhotoUrl = notification.sender?.photo
                        ? `http://localhost:3000/${notification.sender.photo}`
                        : imgmouna;

                      return (
                        <div
                          key={notification._id}
                          className={`notification-item ${notification.isRead ? "read" : "unread"}`}
                          onClick={() => handleMarkAsRead(notification._id)}
                        >
                          {/* Avatar à gauche */}
                          <img
                            src={senderPhotoUrl}
                            alt="Sender"
                            className="notification-avatar"
                            onError={(e) => (e.target.src = imgmouna)} // Fallback on error
                          />

                          {/* Contenu à droite */}
                          <div className="notification-content">
                            <p>
                              <strong>{notification.sender?.name || "Unknown User"}</strong>{" "}
                              {notification.message}
                            </p>
                            <small>{new Date(notification.createdAt).toLocaleString()}</small>
                          </div>

                          {/* Indicateur de non-lu */}
                          {!notification.isRead && <div className="notification-status"></div>}
                        </div>
                      );
                    })
                  ) : (
                    <div className="notification-item">
                      <p>No notifications</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Render Profile Menu Only for Non-Admin Users */}
            {!isAdmin && (
              <div className="profile-menu" onClick={() => setMenuOpen(!menuOpen)}>
                <img
                  src={profilePhotoUrl || "/placeholder.svg"}
                  alt="Profile"
                  className="profile-img"
                />
                <div className={`dropdown-menu ${menuOpen ? "active" : ""}`}>
                  <div className="profile-info">
                    <img
                      src={profilePhotoUrl || "/placeholder.svg"}
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