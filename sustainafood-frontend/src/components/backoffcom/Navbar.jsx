import { FaSearch, FaGlobe, FaMoon, FaBell, FaUserCircle, FaSignOutAlt } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext"; // Import useAuth
import { getUserById } from "../../api/userService"; // Import getUserById
import "/src/assets/styles/backoffcss/navbar.css";

const Navbar = ({ setSearchQuery }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchQuery, setSearchQueryLocal] = useState("");
    const [menuOpen, setMenuOpen] = useState(false); // State for dropdown menu
    const { user: authUser, logout } = useAuth(); // Get user and logout from AuthContext
    const [user, setUser] = useState(authUser); // State for admin details

    // Fetch admin details when the component mounts or authUser changes
    useEffect(() => {
        const fetchAdminDetails = async () => {
            if (authUser && (authUser._id || authUser.id)) {
                try {
                    const response = await getUserById(authUser._id || authUser.id);
                    setUser(response.data); // Set the admin details
                } catch (error) {
                    console.error("Error fetching admin details:", error);
                }
            }
        };

        fetchAdminDetails();
    }, [authUser]);

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

    const handleLogout = () => {
        logout(); // Call the logout function from AuthContext
        navigate("/login"); // Redirect to login page
    };

    // Get the profile photo URL
    const profilePhotoUrl = user?.photo ? `http://localhost:3000/${user.photo}` : null;

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
                <button type="submit" >
                    <FaSearch  />
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

                {/* Profile Dropdown Menu */}
                <div className="profile-menu" onClick={() => setMenuOpen(!menuOpen)}>
                    {profilePhotoUrl ? (
                        <img src={profilePhotoUrl} alt="Profile" className="profile-img" />
                    ) : (
                        <FaUserCircle className="icon user" />
                    )}
                    <div className={`dropdown-menu ${menuOpen ? "active" : ""}`}>
                        <div className="profile-info">
                            {profilePhotoUrl ? (
                                <img src={profilePhotoUrl} alt="Profile" className="dropdown-img" />
                            ) : (
                                <FaUserCircle className="dropdown-img" />
                            )}
                            <div>
                                <p className="user-name">{user?.name || "Loading..."}</p>
                                <p className="user-email">{user?.email || "Loading..."}</p>
                            </div>
                        </div>
                        <hr />
                        
                        <button className="menu-item" onClick={() => navigate("/admin-profile")}>
                        Your account
                        </button>
                        <hr />
                        <button onClick={handleLogout} className="menu-item logout">
                            <FaSignOutAlt /> Logout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Navbar;