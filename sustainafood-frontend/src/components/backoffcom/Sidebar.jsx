import { Link } from "react-router-dom";
import { useState } from "react";
import { 
    FaUsers, FaChartBar, FaCogs, FaTruck, FaUserCog, 
    FaAppleAlt, FaChevronDown, FaChevronUp, FaUniversity, 
    FaHandsHelping, FaFileAlt, FaLock, FaQuestionCircle 
  } from "react-icons/fa";
  
import "/src/assets/styles/backoffcss/sidebar.css";

const Sidebar = () => {
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [showRecipients, setShowRecipients] = useState(false);
  const [showDonors, setShowDonors] = useState(false);

  return (
    <div className="sidebar">
        <div className="sidebar-header">
  <img src="\src\assets\logo.png" alt="Logo" className="logo" />
  <h2>SustainaFood Admin</h2>
</div>
      <nav>
        <Link to="/dashboard">
          <FaChartBar className="icon" /> <span>Dashboard</span>
        </Link>
        <Link to="/reports">
          <FaFileAlt  className="icon" /> <span>Reports</span>
        </Link>

        {/* User Management avec sous-menu */}
        <div className="dropdown">
          <button onClick={() => setShowUserManagement(!showUserManagement)}>
            <FaUsers className="icon" /> <span>User Management</span> {showUserManagement ? <FaChevronUp /> : <FaChevronDown />}
          </button>
          {showUserManagement && (
            <div className="dropdown-content">
              {/* Recipients sous-menu */}
              <button className="sub-dropdown" onClick={() => setShowRecipients(!showRecipients)}>
                <FaHandsHelping className="icon" /> <span>Recipients</span> {showRecipients ? <FaChevronUp /> : <FaChevronDown />}
              </button>
              {showRecipients && (
                <div className="sub-dropdown-content">
                  <Link to="/recipients/students">Students</Link>
                  <Link to="/recipients/ngos">NGOs</Link>
                </div>
              )}

              {/* Donors sous-menu */}
              <button className="sub-dropdown" onClick={() => setShowDonors(!showDonors)}>
                <FaUniversity className="icon" /> <span>Donors</span> {showDonors ? <FaChevronUp /> : <FaChevronDown />}
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

        {/* ✅ Ajout du lien vers NGO Management */}
    

        <Link to="/food-donation">
          <FaAppleAlt className="icon" /> <span>Food Donation Management</span>
        </Link>
        <Link to="/logistics">
          <FaTruck className="icon" /> <span>Logistics & Transport</span>
        </Link>
        <Link to="/settings">
          <FaCogs className="icon" /> <span>Settings</span>
        </Link>
        <Link to="/Authentification">
          <FaLock  className="icon" /> <span>Authentification</span>
        </Link>
        <Link to="/Help-Center">
          <FaQuestionCircle  className="icon" /> <span>Help Center</span>
        </Link>
      </nav>
    </div>
  );
};

export default Sidebar;
