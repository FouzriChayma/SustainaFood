import React from 'react';
import './mydonations.css';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
const donations = [
  {
    title: "🛒 Essential Product Donation",
    location: "Carrefour Tunis",
    expirationDate: "March 20, 2024",
    delivery: "Pick-up on site",
    products: [
      { name: "Canned Tomatoes", quantity: "16 units", status: "available" },
      { name: "Spaghetti Pasta", quantity: "13 kg", status: "pending" }
    ]
  },
  {
    title: "🥗 Fresh Food Donation",
    location: "Monastir Market",
    expirationDate: "March 10, 2024",
    delivery: "Home delivery",
    products: [
      { name: "Fresh Carrots", quantity: "10 kg", status: "available" },
      { name: "Cucumbers", quantity: "5 kg", status: "pending" }
    ]
  }
];

export const Mydonations = () => {
  return (
    <>
    <Navbar />

    <div className="donations-container">
      {donations.map((donation, index) => (
        <div className="donation-card" key={index}>
          <h3 className="donation-title">{donation.title}</h3>
          <p><strong>📍 Location:</strong> {donation.location}</p>
          <p><strong>📆 Expiration Date:</strong> {donation.expirationDate}</p>
          <p><strong>🚚 Delivery:</strong> {donation.delivery}</p>
          <h4>📦 Available Products:</h4>
          <ul className="donation-products">
            {donation.products.map((product, productIndex) => (
              <li key={productIndex} className="donation-product">
                {product.status === 'available' ? '🟢' : '🟡'} 
                <strong>{product.name}</strong> - {product.quantity}
                <span className={`status ${product.status}`}>{product.status}</span>
              </li>
            ))}
          </ul>
          <button className="btn-seemore">See More</button>
        </div>
      ))}
    </div>
          <Footer />
</>
  );
};

export default Mydonations;
