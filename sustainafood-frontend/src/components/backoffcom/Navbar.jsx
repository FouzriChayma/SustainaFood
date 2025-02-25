import { FaSearch, FaGlobe, FaMoon, FaBell, FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom"; 
import "/src/assets/styles/backoffcss/navbar.css";

const Navbar = ({ sidebarCollapsed }) => {
    const navigate = useNavigate();

    return (
        <div className={`navbar ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
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
                {/* Redirection vers le profil admin */}
                <FaUserCircle className="icon user" onClick={() => navigate("/admin-profile")} />
            </div>
        </div>
    );
};

export default Navbar;
