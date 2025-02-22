import React, { useEffect, useState } from 'react';
import '../assets/styles/Profile.css';
import pdp from '../assets/images/pdp.png';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import edit from '../assets/images/edit.png';
import { Link, useNavigate } from 'react-router-dom';
import { getUserById } from "../api/userService";
import { useAuth } from "../contexts/AuthContext";
import RoleSpecificProfile from '../components/RoleSpecificProfile';

const Profile = () => {
  const navigate = useNavigate();
  const { user: authUser, token } = useAuth();
  const [user, setUser] = useState(authUser);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    const fetchUser = async () => {
      try {
        if (!authUser || !authUser.id) {
          console.error("⛔ authUser id is undefined!");
          return;
        }
        const response = await getUserById(authUser.id);
        setUser(response.data);
      } catch (error) {
        console.error("❌ Backend Error:", error);
        setError("Failed to fetch user data");
      }
    };
    if (authUser && authUser.id) {
      fetchUser();
    }
  }, [authUser, token, navigate]);

  return (
    <>
      <Navbar />
      <div className="container">
        <header>
          <div className="profile-header">
            <h1>My Profile</h1>
            <div className="date-switcher">
              <button className='btnProfile'>
                <Link to="/edit-profile">
                  <img style={{ marginRight:'8px', marginTop:'6px' }} width="18px" src={edit} alt="Edit Profile" />
                </Link>
                Edit
              </button>
            </div>
          </div>
        </header>
    
        <div className="main">
          <div className="left-column">
            <div className="profile-card">
              <div className="card">
                <button className="mail">
                  <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <rect width={20} height={16} x={2} y={4} rx={2} />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </button>
                <div className="profile-pic">
                  <img src={pdp} alt="Profile" />
                </div>
                <div className="bottom">
                  <div className="content">
                    <span className="name">Description</span>
                    <span className="about-me">
                      Lorem ipsum dolor sit amet consectetur adipisicinFcls Lorem ipsum dolor sit amet consectetur adipisicinFcls
                    </span>
                  </div>
                  <div className="bottom-bottom">
                    <h1 style={{ color:'white', fontSize:'40px', fontStyle: 'oblique' }}>
                      {user?.role || 'Loading...'}
                    </h1>
                    <button className="button">Contact Me</button>
                  </div>
                </div>
              </div>
            </div>
    
            <div className="detailed-info">
              <h3>Detailed Information</h3>
              <ul>
                <li><strong>Name:</strong> {user?.name || 'Loading...'}</li>
                <li><strong>Email Address:</strong> {user?.email || 'Loading...'}</li>
                <li><strong>Phone:</strong> {user?.phone || 'Loading...'}</li>
                <li><strong>Address:</strong> {user?.address || 'Loading...'}</li>
              </ul>
            </div>
          </div>
          
          <div className="center-column">
            {/* Affichage personnalisé en fonction du rôle */}
            <RoleSpecificProfile user={user} />
          </div>
          
          <div className="right-column">
            {/* Contenu statique ou feedbacks */}
            <div className="winner-cards">
              {/* Code pour winner cards */}
            </div>
            <div className="inbox-section">
              <h3>FeedBacks</h3>
              <div className="feedback-cards">
                {/* Code pour feedback cards */}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Profile;
