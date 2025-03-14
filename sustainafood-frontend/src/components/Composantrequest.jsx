import React from 'react';
import { Link } from 'react-router-dom';
import '../assets/styles/Composantdonation.css';

export const Composantrequest = ({ request }) => {
  // Vérification de base pour s'assurer que les données sont valides
  if (!request || typeof request !== 'object') {
    return <div>Les données de la demande sont invalides.</div>;
  }

  // Déstructuration de tous les attributs de RequestNeed
  const {
    _id,
    title,
    location,
    expirationDate,
    description,
    category,
    recipient,
    status,
    linkedDonation,
    requestedProducts,
    numberOfMeals,
  } = request;

  // Vérification de l'identifiant
  if (!_id) {
    return <div>L’ID de la demande est manquant.</div>;
  }

  return (
    <div className="donation-cardlist">
      <div className="donation-card-content">
        {/* Section des informations de la demande */}
        <h3 className="donation-title">🛒 Demande : {title || 'Sans titre'}</h3>
        <p><strong>📍 Lieu :</strong> {location || 'Non spécifié'}</p>
        <p>
          <strong>📆 Date d’expiration :</strong>{' '}
          {expirationDate ? new Date(expirationDate).toLocaleDateString() : 'Non définie'}
        </p>
        <p><strong>📝 Description :</strong> {description || 'Aucune description'}</p>
        <p><strong>📂 Catégorie :</strong> {category || 'Non spécifiée'}</p>
        <p><strong>🔄 Statut :</strong> {status || 'Inconnu'}</p>
       
       

        {/* Section des produits demandés */}
     {/* Section des produits demandés */}
<h4>📦 Produits demandés :</h4>
<ul className="donation-ul">
  {Array.isArray(requestedProducts) && requestedProducts.length > 0 ? (
    requestedProducts.map((product, index) => (
      product && typeof product === 'object' ? (
        <li className="donation-li-list" key={index}>
          <span><strong>Type :</strong> {product.productType || 'Non spécifié'}</span> <br />
          <span><strong>Description :</strong> {product.productDescription || 'Aucune'}</span> <br />
          <span><strong>Poids :</strong> {product.weightPerUnit || 0} {product.weightUnit || ''}</span> <br />
          <span><strong>Quantité totale :</strong> {product.totalQuantity || 0} {product.weightUnitTotale || ''}</span> <br />
          <span><strong>Statut :</strong> {product.status || 'Inconnu'}</span> <br />
        </li>
      ) : (
        <li className="donation-li-list" key={index}>
          <span>Aucune donnée valide pour ce produit</span>
        </li>
      )
    ))
  ) : (
    <li className="donation-li-list">
      {category === 'prepared_meals' ? `🍽️ Nombre de repas : ${numberOfMeals || 'Non spécifié'}` : 'Aucun produit demandé'}
    </li>
  )}
</ul>


        {/* Lien pour voir plus de détails */}
        <Link to={`/DetailsRequest/${_id}`} className="btnseemorelist">
          Voir plus
        </Link>
      </div>
    </div>
  );
};

export default Composantrequest;