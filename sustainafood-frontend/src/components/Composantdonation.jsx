import React from 'react';
import '../assets/styles/Composantdonation.css';
import { Link } from 'react-router-dom';
import { addDonation } from "../api/donationService"; // Adjust the import path accordingly


export const Composantdonation = ({ donation }) => {
  const {
    title,
    location,
    expirationDate,
    delivery,
    products,
  } = donation || {};

  return (
   
          
    <div className="donation-cardlist">
      <div className="donation-card-content">
        <h3 className="donation-title">🛒{title || "Donation Title"}</h3>
        <p>
          <strong>📍 Location:</strong> {location || "Unknown location"}
        </p>
        <p>
          <strong>📆 Expiration Date:</strong>{" "}
          {expirationDate ? new Date(expirationDate).toLocaleDateString() : "N/A"}
        </p>
        <p>
          <strong>🚚 Delivery:</strong> {delivery || "N/A"}
        </p>
        <h4>📦 Available Products:</h4>
        <ul className="donation-ul">
          {products && products.length > 0 ? (
            products.slice(0, 2).map((product, index) => (
              <li className="donation-li-list" key={index}>
                {product.productType && product.productDescription ? (
                  <>
                    <span role="img" aria-label="product">🥫</span>{" "}
                    <strong>{product.productDescription}</strong> - {product.totalQuantity}{" "}
                    <span className={`status ${product.status.toLowerCase()}`}>
                      {product.status}
                    </span>
                  </>
                ) : (
                  <span>No product data</span>
                )}
              </li>
            ))
          ) : (
            <li className="donation-li-list">No products available</li>
          )}
        </ul>
        <Link to={`/DetailsDonations/${donation._id}`} className="btnseemorelist">
  See More
</Link>      </div>
    </div>

  );
};

export default Composantdonation;
