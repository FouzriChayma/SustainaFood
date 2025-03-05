import React, { useState, useEffect } from 'react';
// Uncomment the line below if you have a CSS file to style this component
// import '../assets/styles/RecipientProfile.css';
import { getDonationByUserId } from '../api/donationService'; // Hypothetical API service function
import { Link } from 'react-router-dom';

const RecipientProfile = () => {
  // Retrieve user ID from localStorage
  const userid = localStorage.getItem('user_id');

  // State variables to manage data, loading, and errors
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch donation requests when the component mounts
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await getDonationByUserId(userid); // Fetch data from API
        setRequests(response.data); // Update state with fetched requests
      } catch (err) {
        // Set error message if fetching fails
        setError(err.response?.data?.message || 'Error fetching request data');
      } finally {
        // Stop loading regardless of success or failure
        setLoading(false);
      }
    };

    // Check if user ID exists before fetching
    if (userid) {
      fetchRequests();
    } else {
      setError('User ID not found');
      setLoading(false);
    }
  }, [userid]); // Dependency array includes userid

  // Display loading message while data is being fetched
  if (loading) {
    return <div>Loading...</div>;
  }

  // Display error message if something goes wrong
  if (error) {
    return <div>{error}</div>;
  }

  // Render the list of donation requests dynamically
  return (
    <div className="recipient-profile">
      <h3>My Donation Requests</h3>
      <div className="projects">
        {requests.map((request, index) => (
          <div key={index} className="project-card">
            <div className="donation-card">
              <div className="donation-card-content">
                <h3 className="donation-title">🛒 {request.title}</h3>
                <p><strong>📍 Location:</strong> {request.location}</p>
                <p><strong>📆 Before Date:</strong> {new Date(request.expirationDate).toISOString().split('T')[0]}</p>
                <p><strong>📑 Details:</strong> {request.description}</p>
                <h4>📦 Products Request:</h4>
                <ul className="donation-ul">
                  {request.products.map((product, idx) => (
                    <li key={idx} className="donation-li">
                      {product.productType} - {product.totalQuantity} - {product.productDescription}
                      <span className={`status ${product.status.toLowerCase()}`}>
                        {product.status}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link to={`/DetailsDonations/${request._id}`} className="btnseemore">
  See More
</Link>                 </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecipientProfile;