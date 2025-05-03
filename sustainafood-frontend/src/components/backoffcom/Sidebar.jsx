// src/components/backoffcom/Sidebar.jsx
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  FaUsers, FaChartBar, FaCogs, FaTruck, FaUserCog,
  FaAppleAlt, FaChevronDown, FaChevronUp, FaUniversity,
  FaHandsHelping, FaFileAlt, FaLock, FaQuestionCircle
} from "react-icons/fa";
import logo from '../../assets/images/logooo.png';
import "/src/assets/styles/backoffcss/sidebar.css";

// Sidebar component for navigation
const Sidebar = () => {
  // State to manage dropdown visibility
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [showRecipients, setShowRecipients] = useState(false);
  const [showDonors, setShowDonors] = useState(false);
  const [showFoodDonationManagement, setShowFoodDonationManagement] = useState(false);
  const [showFoodDonation, setShowFoodDonation] = useState(false);

  const location = useLocation(); // Get current location

  // Check if the current path is related to contact submissions
  const isContactSubmissionsActive = location.pathname.startsWith("/contact/submissions");

  return (
    <div className="sidebar">
      {/* Sidebar header with logo and title */}
      <div className="sidebar-header">
        <img src={logo} alt="Logo" className="logo" />
        <h2>SustainaFood Admin</h2>
      </div>
      <nav>
        {/* Dashboard link */}
        <Link to="/dashboard" className={location.pathname === "/dashboard" ? "active" : ""}>
          <FaChartBar className="icon" /> <span>Dashboard</span>
        </Link>
        {/* Reports link */}
        <Link to="/reports">
          <FaFileAlt className="icon" /> <span>Reports</span>
        </Link>
        {/* Contact Submissions link */}
        <Link to="/contact/submissions" className={isContactSubmissionsActive ? "active" : ""}>
          <FaFileAlt className="icon" /> <span>Contact Submissions</span>
        </Link>

        {/* User Management dropdown */}
        <div className="dropdown">
          <button onClick={() => setShowUserManagement(!showUserManagement)}>
            <FaUsers className="icon" /> <span>User Management</span>
            {showUserManagement ? <FaChevronUp /> : <FaChevronDown />}
          </button>
          {showUserManagement && (
            <div className="dropdown-content-dashboard">
              {/* Recipients submenu */}
              <button className="sub-dropdown" onClick={() => setShowRecipients(!showRecipients)}>
                <FaHandsHelping className="icon" /> <span>Recipients</span>
                {showRecipients ? <FaChevronUp /> : <FaChevronDown />}
              </button>
              {showRecipients && (
                <ul className="sub-dropdown-content" id="recipients-dropdown" role="menu">
                  <li><Link to="/recipients/students" className={location.pathname === "/recipients/students" ? "active" : ""} role="menuitem">Students</Link></li>
                  <li><Link to="/recipients/ngos" className={location.pathname === "/recipients/ngos" ? "active" : ""} role="menuitem">NGOs</Link></li>
                </ul>
              )}

              {/* Donors submenu */}
              <button className="sub-dropdown" onClick={() => setShowDonors(!showDonors)}>
                <FaUniversity className="icon" /> <span>Donors</span>
                {showDonors ? <FaChevronUp /> : <FaChevronDown />}
              </button>
              {showDonors && (
                <ul className="sub-dropdown-content" id="donors-dropdown" role="menu">
                  <li><Link to="/donors/supermarkets" className={location.pathname === "/donors/supermarkets" ? "active" : ""} role="menuitem">Supermarkets</Link></li>
                  <li><Link to="/donors/restaurants" className={location.pathname === "/donors/restaurants" ? "active" : ""} role="menuitem">Restaurants</Link></li>
                  <li><Link to="/PersonnelList" className={location.pathname === "/PersonnelList" ? "active" : ""} role="menuitem">Personnel Donors</Link></li>
                </ul>
              )}

              <Link to="/transporters" className={location.pathname === "/transporters" ? "active" : ""} role="menuitem">Transporters</Link>
              <Link to="/advertisements" className={location.pathname === "/advertisements" ? "active" : ""} role="menuitem">Advertisements</Link>
            </div>
          )}
        </div>

        {/* Food Donation Management dropdown */}
        <div className="dropdown">
          <button onClick={() => setShowFoodDonationManagement(!showFoodDonationManagement)}>
            <FaAppleAlt className="icon" /> <span>Food Donation Management</span>
            {showFoodDonationManagement ? <FaChevronUp /> : <FaChevronDown />}
          </button>
          {showFoodDonationManagement && (
            <div className="dropdown-content-dashboard">
              <Link to="/Donations">Donation Management</Link>
              <Link to="/food-donation/requests" className={location.pathname === "/food-donation/requests" ? "active" : ""} role="menuitem">Request Management</Link>
              <Link to="/DonationTransList">Donation Transaction Management</Link>
              <Link to="/PredictionsDashboard">Donation Predictions Dashboard</Link>
              <Link to="/AnomaliesDashbord">Anomaly Management Dashboard</Link>
            </div>
          )}
        </div>

        {/* Logistics & Transport link */}
        <Link to="/Delivery">
          <FaTruck className="icon" /> <span>Logistics & Transport</span>
        </Link>
        {/* Settings link */}
        <Link to="/settings">
          <FaCogs className="icon" /> <span>Settings</span>
        </Link>
        {/* Authentification link */}
        <Link to="/Authentification">
          <FaLock className="icon" /> <span>Authentification</span>
        </Link>
        {/* Help Center link */}
        <Link to="/Help-Center">
          <FaQuestionCircle className="icon" /> <span>Help Center</span>
        </Link>
      </nav>
    </div>
  );
};

export default Sidebar;