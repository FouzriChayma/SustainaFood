import React, { useState, useEffect } from 'react';
// Uncomment the line below if you have a CSS file to style this component
// import '../assets/styles/DonorProfile.css';
import { getDonationByUserId } from '../api/donationService';
import { Link } from 'react-router-dom';

const DonorProfile = () => {
  const userid = localStorage.getItem('user_id');
  const [donation, setDonation] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDonation = async () => {
      try {
        const response = await getDonationByUserId(userid);
        setDonation(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching donation data');
      } finally {
        setLoading(false);
      }
    };

    if (userid) {
      fetchDonation();
    } else {
      setError('User ID not found');
      setLoading(false);
    }
  }, [userid]);

  // Handle loading state
  if (loading) {
    return <div>Loading...</div>;
  }

  // Handle error state
  if (error) {
    return <div>{error}</div>;
  }

  // Render the list of donations dynamically
  return (
    <div className="donor-profile">
      <h3>Your Donations</h3>
      <div className="projects">
        {donation.map((don, index) => (
          <div key={index} className="project-card">
            <div className="donation-card">
              <div className="donation-card-content">
                <h3 className="donation-title">🛒 {don.title}</h3>
                <p><strong>📍 Location:</strong> {don.location}</p>
                <p><strong>📆 Expiration Date:</strong> {don.expirationDate}</p>
                <p><strong>🚚 Delivery:</strong> {don.delivery}</p>
                <h4>📦 Available Products:</h4>
                <ul className="donation-ul">
                  {don.products.map((product, idx) => (
                    <li key={idx} className="donation-li">
                      {product.name} - {product.quantity}
                      <span className={`status ${product.status}`}>
                        {product.status}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link to={`/DetailsDonations/${don._id}`} className="btnseemore">
  See More
</Link>                 </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DonorProfile;