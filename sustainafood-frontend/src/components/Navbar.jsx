import { FaSearch, FaGlobe, FaMoon, FaBell, FaUserCircle } from "react-icons/fa";
import "../assets/styles/navbar.css";

const Navbar = () => {
  return (
    <div className="navbar">
      {/* Barre de recherche */}
      <div className="search-container">
        <input type="text" placeholder="Search..." />
        <FaSearch className="search-icon" />
      </div>

      {/* Icônes de la navbar */}
      <div className="navbar-actions">
        <FaGlobe className="icon globe" />
        <FaMoon className="icon moon" />
        <div className="notification-container">
          <FaBell className="icon bell" />
          <span className="badge">3</span>
        </div>
        <FaUserCircle className="icon user" />
      </div>
    </div>
  );
};

export default Navbar;
