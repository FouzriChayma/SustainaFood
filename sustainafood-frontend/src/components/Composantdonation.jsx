import React from 'react'
import '../assets/styles/Composantdonation.css'

export const Composantdonation = () => {
  return (
    <div className="donor-profile">
    <div className="projects">
        <div className="donation-cardlist">
          <div className="donation-card-content">
            <h3 className="donation-title">🛒 Essential Product Donation</h3>
            <p><strong>📍 Location:</strong> Carrefour Tunis</p>
            <p><strong>📆 Expiration Date:</strong> March 20, 2024</p>
            <p><strong>🚚 Delivery:</strong> Pick-up on site</p>
            <h4>📦 Available Products:</h4>
            <ul className="donation-ul">
              <li className="donation-li-list">
                🥫 <strong>Canned Tomatoes</strong> - 16 units 
                <span className="status available">Available</span>
              </li>
              <li className="donation-li-list">
                🍝 <strong>Spaghetti Pasta</strong> - 13 kg 
                <span className="status pending">Pending</span>
              </li>
            </ul>
            <button className="btnseemorelist">See More</button>
          </div>
        </div>
      
      {/* Ajoute d'autres cartes de donations ici */}
    </div>
  </div>  )
}
export default Composantdonation;