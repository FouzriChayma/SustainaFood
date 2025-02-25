import React from 'react';
//import '../assets/styles/RecipientProfile.css'; // Crée ce fichier pour des styles spécifiques

const RecipientProfile = () => {
  // Exemple statique pour illustrer des demandes
  return (
    <div className="recipient-profile">
      <h3>My Donation Requests</h3>
      <div className="request-list">
        <div className="request-card">
          <h3 className="request-title">Request for 10 kg Rice</h3>
          <p><strong>Status:</strong> Pending</p>
          <p><strong>Details:</strong> Needed for a community meal event.</p>
          <button className="btnsee">View Details</button>
        </div>
        <div className="request-card">
          <h3 className="request-title">Request for 20 liters Milk</h3>
          <p><strong>Status:</strong> Approved</p>
          <p><strong>Details:</strong> Request submitted by our local NGO.</p>
          <button className="btnsee">View Details</button>
        </div>
        {/* Ajoute d'autres demandes si nécessaire */}
      </div>
    </div>
  );
};

export default RecipientProfile;