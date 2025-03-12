import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import {
    FaUsers, FaChartBar, FaCogs, FaTruck, FaUserCog,
    FaAppleAlt, FaChevronDown, FaChevronUp, FaUniversity,
    FaHandsHelping, FaFileAlt, FaLock, FaQuestionCircle
} from "react-icons/fa";
import logo from '../../assets/images/logooo.png';
import "/src/assets/styles/backoffcss/sidebar.css";

const Sidebar = () => {
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [showRecipients, setShowRecipients] = useState(false);
  const [showDonors, setShowDonors] = useState(false);
  const [showFoodDonation, setShowFoodDonation] = useState(false);

  const location = useLocation(); // Get current location

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <img src={logo} alt="Logo" className="logo" />
        <h2>SustainaFood Admin</h2>
      </div>
      <nav>
        <Link to="/dashboard" className={location.pathname === "/dashboard" ? "active" : ""}>
          <FaChartBar className="icon" /> <span>Dashboard</span>
        </Link>
        <Link to="/reports" className={location.pathname === "/reports" ? "active" : ""}>
          <FaFileAlt className="icon" /> <span>Reports</span>
        </Link>

        {/* User Management avec sous-menu */}
        <div className="dropdown">
          <button
            onClick={() => setShowUserManagement(!showUserManagement)}
            aria-expanded={showUserManagement}
            aria-controls="user-management-dropdown"
          >
            <FaUsers className="icon" /> <span>User Management</span> {showUserManagement ? <FaChevronUp /> : <FaChevronDown />}
          </button>
          {showUserManagement && (
            <nav className="dropdown-content-dashboard" id="user-management-dropdown" role="menu">
               {/* Recipients sous-menu */}
              <button
                className="sub-dropdown"
                onClick={() => setShowRecipients(!showRecipients)}
                aria-expanded={showRecipients}
                aria-controls="recipients-dropdown"
              >
                <FaHandsHelping className="icon" /> <span>Recipients</span> {showRecipients ? <FaChevronUp /> : <FaChevronDown />}
              </button>
              {showRecipients && (
                <ul className="sub-dropdown-content" id="recipients-dropdown" role="menu">
                  <li><Link to="/recipients/students" className={location.pathname === "/recipients/students" ? "active" : ""} role="menuitem">Students</Link></li>
                  <li><Link to="/recipients/ngos" className={location.pathname === "/recipients/ngos" ? "active" : ""} role="menuitem">NGOs</Link></li>
                </ul>
              )}

              {/* Donors sous-menu */}
              <button
                className="sub-dropdown"
                onClick={() => setShowDonors(!showDonors)}
                aria-expanded={showDonors}
                aria-controls="donors-dropdown"
              >
                <FaUniversity className="icon" /> <span>Donors</span> {showDonors ? <FaChevronUp /> : <FaChevronDown />}
              </button>
              {showDonors && (
                <ul className="sub-dropdown-content" id="donors-dropdown" role="menu">
                  <li><Link to="/donors/supermarkets" className={location.pathname === "/donors/supermarkets" ? "active" : ""} role="menuitem">Supermarkets</Link></li>
                  <li><Link to="/donors/restaurants" className={location.pathname === "/donors/restaurants" ? "active" : ""} role="menuitem">Restaurants</Link></li>
                </ul>
              )}

              <Link to="/transporters" className={location.pathname === "/transporters" ? "active" : ""} role="menuitem">Transporters</Link>
            </nav>
          )}
        </div>

        {/* Food Donation Management avec sous-menu ✅ */}
        <div className="dropdown">
          <button
            onClick={() => setShowFoodDonation(!showFoodDonation)}
            aria-expanded={showFoodDonation}
            aria-controls="food-donation-dropdown"
          >
            <FaAppleAlt className="icon" /> <span>Food Donation Management</span> {showFoodDonation ? <FaChevronUp /> : <FaChevronDown />}
          </button>
          {showFoodDonation && (
            <nav className="dropdown-content-dashboard" id="food-donation-dropdown" role="menu">
              <Link to="/food-donation/requests" className={location.pathname === "/food-donation/requests" ? "active" : ""} role="menuitem">Request list</Link>
              <Link to="/food-donation/product" className={location.pathname === "/food-donation/product" ? "active" : ""} role="menuitem">Product list</Link>
            </nav>
          )}
        </div>

        <Link to="/logistics" className={location.pathname === "/logistics" ? "active" : ""}>
          <FaTruck className="icon" /> <span>Logistics & Transport</span>
        </Link>
        <Link to="/settings" className={location.pathname === "/settings" ? "active" : ""}>
          <FaCogs className="icon" /> <span>Settings</span>
        </Link>
        <Link to="/Authentification" className={location.pathname === "/Authentification" ? "active" : ""}>
          <FaLock className="icon" /> <span>Authentification</span>
        </Link>
        <Link to="/Help-Center" className={location.pathname === "/Help-Center" ? "active" : ""}>
          <FaQuestionCircle className="icon" /> <span>Help Center</span>
        </Link>
      </nav>
    </div>
  );
};

export default Sidebar;