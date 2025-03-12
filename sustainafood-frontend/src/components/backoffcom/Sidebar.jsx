import { Link } from "react-router-dom";
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

  return (
    <div className="sidebar">
      {/* Sidebar header with logo and title */}
      <div className="sidebar-header">
        <img src={logo} alt="Logo" className="logo" />
        <h2>SustainaFood Admin</h2>
      </div>
      <nav>
        {/* Dashboard link */}
        <Link to="/dashboard">
          <FaChartBar className="icon" /> <span>Dashboard</span>
        </Link>
        {/* Reports link */}
        <Link to="/reports">
          <FaFileAlt className="icon" /> <span>Reports</span>
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
                <div className="sub-dropdown-content">
                  <Link to="/recipients/students">Students</Link>
                  <Link to="/recipients/ngos">NGOs</Link>
                </div>
              )}

              {/* Donors submenu */}
              <button className="sub-dropdown" onClick={() => setShowDonors(!showDonors)}>
                <FaUniversity className="icon" /> <span>Donors</span> 
                {showDonors ? <FaChevronUp /> : <FaChevronDown />}
              </button>
              {showDonors && (
                <div className="sub-dropdown-content">
                  <Link to="/donors/supermarkets">Supermarkets</Link>
                  <Link to="/donors/restaurants">Restaurants</Link>
                </div>
              )}

              <Link to="/transporters">Transporters</Link>
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
              <Link to="/DonationTransList">Donation Transaction List</Link>
            </div>
          )}
        </div>

        {/* Logistics & Transport link */}
        <Link to="/logistics">
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