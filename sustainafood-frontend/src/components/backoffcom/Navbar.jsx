import { FaSearch, FaGlobe, FaMoon, FaBell, FaUserCircle } from "react-icons/fa";
import { useNavigate , useLocation } from "react-router-dom";
import { useState } from "react";

import "/src/assets/styles/backoffcss/navbar.css";

const Navbar = ({ setSearchQuery }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchQuery, setSearchQueryLocal] = useState("");

    const handleSearch = (e) => {
        setSearchQueryLocal(e.target.value);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setSearchQuery(searchQuery.trim()); // Update searchQuery in the parent component
        if (searchQuery.trim()) {
            navigate(`${location.pathname}?search=${searchQuery}`); // You can handle navigation here as well
        }
    };
    
    return (
        <div className="navbar">
            {/* Barre de recherche */}
            <form className="search-container" onSubmit={handleSearchSubmit}>
                <input 
                    type="text" 
                    placeholder="Search..." 
                    value={searchQuery} 
                    onChange={handleSearch} 
                />
                <button type="submit" className="search-icon-btn">
                    <FaSearch className="search-icon" />
                </button>
            </form>

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