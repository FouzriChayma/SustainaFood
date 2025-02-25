import React from 'react';
import DonorProfile from './DonorProfile';
import RecipientProfile from './RecipientProfile';
import TransporterProfile from './TransporterProfile';

const RoleSpecificProfile = ({ user }) => {
  if (!user || !user.role) return null;

  // En fonction de la valeur de user.role, affiche le composant adapté
  switch(user.role) {
    case 'restaurant':
    case 'supermarket':
      return <DonorProfile />;
    case 'ong':
    case 'student':
      return <RecipientProfile />;
    case 'transporter':
      return <TransporterProfile />;
    default:
      return <div>Profile not available for this role.</div>;
  }
};

export default RoleSpecificProfile;
