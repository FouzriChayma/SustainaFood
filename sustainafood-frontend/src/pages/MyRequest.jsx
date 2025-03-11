import React, { useEffect, useState } from 'react';
import { getDonationsByUserId } from "../api/donationService";
import { useAuth } from "../contexts/AuthContext";
import Composantdonation from "../components/Composantdonation"; // Assure-toi que le chemin est correct
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
export default function MyRequest() {
  const [donations, setDonations] = useState([]);
  const { user: authUser, token } = useAuth();
  const [userId, setUserId] = useState(null);
  const [user, setUser] = useState(null); // Ajouté pour stocker l'utilisateur récupéré

  useEffect(() => {
    const fetchUser = async () => {
      if (authUser) {
        const id = authUser._id || authUser.id;
        if (!id) return;

        setUserId(id);
      }
    };

    fetchUser();
  }, [authUser]);

  useEffect(() => {
    const fetchDonations = async () => {
      if (!userId) return; // On attend d'avoir l'ID avant de fetch

      try {
        const response = await getDonationsByUserId(userId);
        setDonations(response.data);
        console.log("Donations fetched:", response.data);
      } catch (error) {
        console.error("Backend Error:", error);
      }
    };

    fetchDonations();
  }, [userId]); // Ajout de userId comme dépendance

  return (
    <>
      <Navbar />
    <div className="container-listdonation">
      <header>
        <div className="profile-headerLIST">
          <h1 style={{ color: '#228b22', fontSize: '40px' }}>List Of My Requests</h1>
          <div className="date-switcher">
            <div className="groupsearch">
              <svg className="iconsearch" aria-hidden="true" viewBox="0 0 24 24">
                <g>
                  <path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z" />
                </g>
              </svg>
              <input placeholder="Search" type="search" className="inputsearch" />
            </div>
          </div>
        </div>
      </header>
      <div className='contentlist'>
        <div style={{ marginBottom: "40px" }}>
          <div className="donor-profile">
            <div className="projects">
              {donations.length > 0 ? (
                donations.map((donationItem) => (
                  <Composantdonation key={donationItem._id} donation={donationItem} />
                ))
              ) : (
                <p>No donations found.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    <Footer />
    </>
  );
}
