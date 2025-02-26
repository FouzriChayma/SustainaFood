import React from 'react';
//import '../assets/styles/RecipientProfile.css'; // Crée ce fichier pour des styles spécifiques

const RecipientProfile = () => {
  // Exemple statique pour illustrer des demandes
  return (<>
    <div className="donor-profile">
    <h3>My Donation Requests</h3>
    <div className="projects">
      <div className="project-card">
        <div className="donation-card">
          <div className="donation-card-content">
            <h3 className="donation-title">🛒  Request for rouffun Ramadan 2025</h3>
            <p><strong>📍 Location:</strong> crt ,ariana madina</p>
            <p><strong>📆 Befor Date:</strong> March 20, 2024</p>
            <p><strong>📑 Details:</strong> Needed for a community meal event.</p>

            <h4>📦  Products Request:</h4>
            <ul className="donation-ul">
              <li className="donation-li">
                🥫 <strong>Canned Tomatoes</strong> - 16 units 
                <span className="status available">Approved</span>
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
    
    </>
  );
};

export default RecipientProfile;
