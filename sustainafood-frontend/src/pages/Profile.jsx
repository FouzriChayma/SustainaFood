import React, { useEffect, useState } from 'react'; // Added useEffect here
import styled from 'styled-components';
import '../assets/styles/Profile.css';
import pdp from '../assets/images/pdp.png';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import edit from '../assets/images/edit.png';
import dhiaphoto from '../assets/images/dhiaphoto.png';
import assilphoto from '../assets/images/assilphoto.png';
import { Link, useNavigate } from 'react-router-dom';
import { getUserById } from "../api/userService"; // Vérifiez le bon chemin

const Profile = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem('iduser'); // Get the user ID from local storage
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    console.log("🔍 Vérification du localStorage...");
    console.log("🌍 Tous les éléments dans localStorage :", localStorage);
    console.log("🔍 Lecture directe de iduser :", localStorage.getItem("iduser"));
    const token = localStorage.getItem('token');

    // if (!isTokenValid(token)) {
    if (token == null) {

      // Redirigez l'utilisateur vers la page de connexion s'il n'est pas valide
      navigate('/login');
    }
    const fetchUser = async () => {
      try {
        if (!userId) {
          console.error("⛔ userId est indéfini !");
          return;
        }
        const response = await getUserById(userId);
        setUser(response.data);
      } catch (error) {
        console.error("❌ Backend Error:", error);
      }
    };

    if (userId) {
      fetchUser();
    }
  }, []);

  return (
    <>
      <Navbar />

      <div className="container">
        <header>
          <div className="profile-header">
            <h1>My Profile</h1>
            <div className="date-switcher">


              <button className='btnProfile'>
                <Link to="/edit-profile"><img

                  style={{ marginRight: '8px', marginTop: '6px' }}
                  width="18px"
                  src={edit}
                  alt="Profile"
                /></Link>Edit</button>

            </div>

          </div>
        </header>

        <div className="main">

          <div className="left-column">

            <div className="profile-card">
              <div className="card">

                <button className="mail">
                  <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-mail"><rect width={20} height={16} x={2} y={4} rx={2} /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                </button>
                <div className="profile-pic">
                  <img

                    src={pdp}
                    alt="Profile"
                  />
                </div>
                <div className="bottom">
                  <div className="content">
                    <span className="name">Description</span>
                    <span className="about-me">Lorem ipsum dolor sit amet consectetur adipisicinFcls Lorem ipsum dolor sit amet consectetur adipisicinFcls </span>
                  </div>
                  <div className="bottom-bottom">
                    <h1 style={{ color: 'white', fontSize: '40px', fontStyle: 'oblique' }}>{user?.role || 'Loading...'}</h1>
                    <button className="button">Contact Me</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="detailed-info">
              <h3>Detailed Information</h3>
              <ul>
                <li><strong>Name:</strong> {user?.name || 'Loading...'}</li>
                <li><strong>Email Address:</strong>{user?.email || 'Loading...'}</li>
                <li><strong>Phone:</strong>{user?.phone || 'Loading...'}</li>
                <li><strong>Address:</strong> {user?.address || 'Loading...'}</li>
              </ul>
            </div>
          </div>

          <div className="center-column">
            <h3>Your Donations</h3>
            <div className="projects">
              <div className="project-card">
                <div className="donation-card">
                  <div className="donation-card-content">
                    <h3 className="donation-title">🛒 Essential Product Donation</h3>
                    <p><strong>📍 Location:</strong> Carrefour Tunis</p>
                    <p><strong>📆 Expiration Date:</strong> March 20, 2024</p>
                    <p><strong>🚚 Delivery:</strong> Pick-up on site</p>
                    <h3>📦 Available Products:</h3>
                    <ul className="donation-ul">
                      <li className="donation-li">
                        🥫 <strong>Canned Tomatoes</strong> - 16 units
                        <span className="status available">Available</span>
                      </li>
                      <li className="donation-li">
                        🍝 <strong>Spaghetti Pasta</strong> - 13 kg
                        <span className="status pending">Pending</span>
                      </li>
                    </ul>
                    <button className='btnseemore'>See More</button>
                  </div>
                </div>

              </div>


              <div className="project-card">
                <div className="donation-card">
                  <div className="donation-card-content">
                    <h3 className="donation-title">🥦 Fresh Food Donation</h3>
                    <p><strong>📍 Location:</strong> Monoprix La Marsa</p>
                    <p><strong>📆 Expiration Date:</strong> April 5, 2024</p>
                    <p><strong>🚚 Delivery:</strong> Pick-up on site</p>
                    <h3>📦 Available Products:</h3>
                    <ul className="donation-ul">
                      <li className="donation-li">
                        🍎 <strong>Apples</strong> - 10 kg
                        <span className="status available">Available</span>
                      </li>
                      <li className="donation-li">
                        🥦 <strong>Broccoli</strong> - 8 kg
                        <span className="status pending">Pending</span>
                      </li>
                    </ul>
                    <button className='btnseemore'>See More</button>
                  </div>
                </div>

              </div>

              <div className="project-card">
                <div className="donation-card">
                  <div className="donation-card-content">
                    <h3 className="donation-title">🍞 Bakery Items Donation</h3>
                    <p><strong>📍 Location:</strong> Géant Tunis</p>
                    <p><strong>📆 Expiration Date:</strong> March 25, 2024</p>
                    <p><strong>🚚 Delivery:</strong> Pick-up on site</p>
                    <h3>📦 Available Products:</h3>
                    <ul className="donation-ul">
                      <li className="donation-li">
                        🥖 <strong>Baguettes</strong> - 20 pieces
                        <span className="status available">Available</span>
                      </li>
                      <li className="donation-li">
                        🧁 <strong>Chocolate Muffins</strong> - 12 pieces
                        <span className="status pending">Pending</span>
                      </li>
                    </ul>
                    <button className='btnseemore'>See More</button>
                  </div>
                </div>

              </div>
            </div>
          </div>

          <div className="right-column">

            <div >

              <div className="winner-cards">
                <div className="winner-outlinePage">
                  <svg
                    className="winner-icon winner-trophy"
                    viewBox="0 0 1024 1024"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    width="160"
                    height="160"
                  >
                    <path
                      d="M469.333333 682.666667h85.333334v128h-85.333334zM435.2 810.666667h153.6c4.693333 0 8.533333 3.84 8.533333 8.533333v34.133333h-170.666666v-34.133333c0-4.693333 3.84-8.533333 8.533333-8.533333z"
                      fill="#ea9518"
                      data-spm-anchor-id="a313x.search_index.0.i10.40193a81WcxQiT"
                      className=""
                    ></path>
                    <path
                      d="M384 853.333333h256a42.666667 42.666667 0 0 1 42.666667 42.666667v42.666667H341.333333v-42.666667a42.666667 42.666667 0 0 1 42.666667-42.666667z"
                      fill="#6e4a32"
                      data-spm-anchor-id="a313x.search_index.0.i1.40193a81WcxQiT"
                      className=""
                    ></path>
                    <path
                      d="M213.333333 256v85.333333a42.666667 42.666667 0 0 0 85.333334 0V256H213.333333zM170.666667 213.333333h170.666666v128a85.333333 85.333333 0 1 1-170.666666 0V213.333333zM725.333333 256v85.333333a42.666667 42.666667 0 0 0 85.333334 0V256h-85.333334z m-42.666666-42.666667h170.666666v128a85.333333 85.333333 0 1 1-170.666666 0V213.333333z"
                      fill="#f4ea2a"
                      data-spm-anchor-id="a313x.search_index.0.i9.40193a81WcxQiT"
                      className=""
                    ></path>
                    <path
                      d="M298.666667 85.333333h426.666666a42.666667 42.666667 0 0 1 42.666667 42.666667v341.333333a256 256 0 1 1-512 0V128a42.666667 42.666667 0 0 1 42.666667-42.666667z"
                      fill="#f2be45"
                      data-spm-anchor-id="a313x.search_index.0.i5.40193a81WcxQiT"
                      className=""
                    ></path>
                    <path
                      d="M512 469.333333l-100.309333 52.736 19.157333-111.701333-81.152-79.104 112.128-16.298667L512 213.333333l50.176 101.632 112.128 16.298667-81.152 79.104 19.157333 111.701333z"
                      fill="#FFF2A0"
                    ></path>
                  </svg>
                  <p className="winner-ranking_number">1<span className="winner-ranking_word">st</span></p>
                  <div className="winner-splitLine"></div>
                  <svg
                    className="winner-icon winner-userAvatar"
                    viewBox="0 0 1024 1024"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    width="25"
                    height="25"
                  >
                    <path
                      d="M512 0C228.693 0 0 228.693 0 512s228.693 512 512 512 512-228.693 512-512S795.307 0 512 0z m0 69.973c244.053 0 442.027 197.973 442.027 442.027 0 87.04-25.6 168.96-69.973 237.227-73.387-78.507-170.667-133.12-281.6-151.893 69.973-34.133 119.467-105.813 119.467-187.733 0-116.053-93.867-209.92-209.92-209.92s-209.92 93.867-209.92 209.92c0 83.627 47.787 155.307 119.467 187.733-110.933 20.48-208.213 75.093-281.6 153.6-44.373-68.267-69.973-150.187-69.973-238.933 0-244.053 197.973-442.027 442.027-442.027z"
                      fill="#8a8a8a"
                    ></path>
                  </svg>
                  <p className="winner-userName">{user?.name || 'Loading...'}</p>
                </div>
                <div className="winner-detailPage">
                  <svg
                    className="winner-icon winner-medals winner-slide-in-top"
                    viewBox="0 0 1024 1024"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    width="80"
                    height="80"
                  >
                    <path
                      d="M896 42.666667h-128l-170.666667 213.333333h128z"
                      fill="#FF4C4C"
                    ></path>
                    <path
                      d="M768 42.666667h-128l-170.666667 213.333333h128z"
                      fill="#3B8CFF"
                    ></path>
                    <path d="M640 42.666667h-128L341.333333 256h128z" fill="#F1F1F1"></path>
                    <path
                      d="M128 42.666667h128l170.666667 213.333333H298.666667z"
                      fill="#FF4C4C"
                    ></path>
                    <path
                      d="M256 42.666667h128l170.666667 213.333333h-128z"
                      fill="#3B8CFF"
                    ></path>
                    <path
                      d="M384 42.666667h128l170.666667 213.333333h-128z"
                      fill="#FBFBFB"
                    ></path>
                    <path
                      d="M298.666667 256h426.666666v213.333333H298.666667z"
                      fill="#E3A815"
                    ></path>
                    <path
                      d="M512 661.333333m-320 0a320 320 0 1 0 640 0 320 320 0 1 0-640 0Z"
                      fill="#FDDC3A"
                    ></path>
                    <path
                      d="M512 661.333333m-256 0a256 256 0 1 0 512 0 256 256 0 1 0-512 0Z"
                      fill="#E3A815"
                    ></path>
                    <path
                      d="M512 661.333333m-213.333333 0a213.333333 213.333333 0 1 0 426.666666 0 213.333333 213.333333 0 1 0-426.666666 0Z"
                      fill="#F5CF41"
                    ></path>
                    <path
                      d="M277.333333 256h469.333334a21.333333 21.333333 0 0 1 0 42.666667h-469.333334a21.333333 21.333333 0 0 1 0-42.666667z"
                      fill="#D19A0E"
                    ></path>
                    <path
                      d="M277.333333 264.533333a12.8 12.8 0 1 0 0 25.6h469.333334a12.8 12.8 0 1 0 0-25.6h-469.333334z m0-17.066666h469.333334a29.866667 29.866667 0 1 1 0 59.733333h-469.333334a29.866667 29.866667 0 1 1 0-59.733333z"
                      fill="#F9D525"
                    ></path>
                    <path
                      d="M512 746.666667l-100.309333 52.736 19.157333-111.701334-81.152-79.104 112.128-16.298666L512 490.666667l50.176 101.632 112.128 16.298666-81.152 79.104 19.157333 111.701334z"
                      fill="#FFF2A0"
                    ></path>
                  </svg>
                  <div className="winner-gradesBox">
                    <svg
                      className="winner-icon winner-gradesIcon"
                      viewBox="0 0 1024 1024"
                      version="1.1"
                      xmlns="http://www.w3.org/2000/svg"
                      width="60"
                      height="60"
                    >
                      <path
                        d="M382.6 805H242.2c-6.7 0-12.2-5.5-12.2-12.2V434.3c0-6.7 5.5-12.2 12.2-12.2h140.4c6.7 0 12.2 5.5 12.2 12.2v358.6c0 6.6-5.4 12.1-12.2 12.1z"
                        fill="#ea9518"
                        data-spm-anchor-id="a313x.search_index.0.i36.40193a81WcxQiT"
                        className=""
                      ></path>
                      <path
                        d="M591.1 805H450.7c-6.7 0-12.2-5.5-12.2-12.2V254.9c0-6.7 5.5-12.2 12.2-12.2h140.4c6.7 0 12.2 5.5 12.2 12.2v537.9c0 6.7-5.5 12.2-12.2 12.2z"
                        fill="#f2be45"
                        data-spm-anchor-id="a313x.search_index.0.i35.40193a81WcxQiT"
                        className=""
                      ></path>
                      <path
                        d="M804.4 805H663.9c-6.7 0-12.2-5.5-12.2-12.2v-281c0-6.7 5.5-12.2 12.2-12.2h140.4c6.7 0 12.2 5.5 12.2 12.2v281c0.1 6.7-5.4 12.2-12.1 12.2z"
                        fill="#ea9518"
                        data-spm-anchor-id="a313x.search_index.0.i37.40193a81WcxQiT"
                        className=""
                      ></path>
                    </svg>
                    <p className="winner-gradesBoxLabel">SCORE</p>
                    <p className="winner-gradesBoxNum">1105</p>
                  </div>
                </div>
              </div>

            </div>

            <div className="inbox-section">
              <h3>FeedBacks</h3>
              <div className="feedback-cards">
                <div className="feedback-card ">
                  <div className="message ">
                    <div className="message-header feedback-tip">
                      <img src={dhiaphoto} alt="Avatar" />
                      <div>
                        <strong>Borji Dhia </strong>
                        <p>thank you for your donation </p>
                      </div>
                    </div>
                    <span className="time">10:30 AM</span>
                  </div>
                </div>
                <div className="feedback-card " >
                  <div className="message " >
                    <div className="message-header feedback-tip">
                      <img src={dhiaphoto} alt="Avatar" />
                      <div>
                        <strong>BEN REBAH Ahmed</strong>
                        <p>thank you for your donation </p>
                      </div>
                    </div>
                    <span className="time">10:30 AM</span>
                  </div>
                </div>
                <div className="feedback-card " >
                  <div className="message " >
                    <div className="message-header feedback-tip">
                      <img src={assilphoto} alt="Avatar" />
                      <div>
                        <strong>HAMMEMI Assil</strong>
                        <p>thank you for your donation </p>
                      </div>
                    </div>
                    <span className="time">10:30 AM</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}



export default Profile;
