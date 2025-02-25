import React from 'react';
//import '../assets/styles/DonorProfile.css'; // Crée ce fichier pour des styles spécifiques

const DonorProfile = () => {
  // Exemple statique, à remplacer par des données dynamiques
  return (
    <div className="donor-profile">
      <h3>Your Donations</h3>
      <div className="projects">
        <div className="project-card">
          <div className="donation-card">
            <div className="donation-card-content">
              <h3 className="donation-title">🛒 Essential Product Donation</h3>
              <p><strong>📍 Location:</strong> Carrefour Tunis</p>
              <p><strong>📆 Expiration Date:</strong> March 20, 2024</p>
              <p><strong>🚚 Delivery:</strong> Pick-up on site</p>
              <h4>📦 Available Products:</h4>
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
              <button className="btnseemore">See More</button>
            </div>
          </div>
        </div>
        {/* Ajoute d'autres cartes de donations ici */}
      </div>
    </div>
  );
};

export default DonorProfile;
