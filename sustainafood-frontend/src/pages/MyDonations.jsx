import React, { useState } from "react";
import { FaTrash, FaEdit, FaSave } from "react-icons/fa";
import Navbar from "../components/Navbar";  
import Footer from "../components/Footer";  
import "/src/assets/styles/MyDonations.css";  

const MyDonations = () => {
  const [donations, setDonations] = useState([
    { id: 1, foodType: "Rice", quantity: 10, expirationDate: "2024-03-15", location: "Ariana", selfDelivery: true, status: "pending" },
    { id: 2, foodType: "Vegetables", quantity: 5, expirationDate: "2024-03-10", location: "Soukra", selfDelivery: false, status: "approved" },
    { id: 3, foodType: "Fruits", quantity: 8, expirationDate: "2024-03-08", location: "Manar 2", selfDelivery: true, status: "delivered" },
    { id: 4, foodType: "Canned Food", quantity: 3, expirationDate: "2024-04-01", location: "Ben Arous", selfDelivery: false, status: "pending" },
    { id: 5, foodType: "Pasta", quantity: 7, expirationDate: "2024-03-18", location: "Tunis", selfDelivery: true, status: "approved" },
  ]);

  const [editMode, setEditMode] = useState(null);
  const [editedDonation, setEditedDonation] = useState({});

  const handleEdit = (donation) => {
    setEditMode(donation.id);
    setEditedDonation({ ...donation });
  };

  const handleChange = (e) => {
    setEditedDonation({ ...editedDonation, [e.target.name]: e.target.value });
  };

  const handleSave = (donationId) => {
    setDonations(donations.map(don => don.id === donationId ? editedDonation : don));
    setEditMode(null);
  };

  const handleDelete = (donationId) => {
    if (window.confirm("Are you sure you want to delete this donation?")) {
      setDonations(donations.filter(don => don.id !== donationId));
    }
  };

  return (
    <div className="mydonations-container">  
      <Navbar />  

      <div className="mydonations-content">  
        <h2 className="mydonations-title">My Donations</h2>

        {donations.length === 0 ? (
          <p className="no-donations">No donations found.</p>
        ) : (
          <div className="mydonations-list">  
            <table>
              <thead>
                <tr>
                  <th>Food Type</th>
                  <th>Quantity</th>
                  <th>Expiration Date</th>
                  <th>Location</th>
                  <th>Self-Delivery</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {donations.map(donation => (
                  <tr key={donation.id}>
                    <td>
                      {editMode === donation.id ? (
                        <input
                          type="text"
                          name="foodType"
                          value={editedDonation.foodType}
                          onChange={handleChange}
                          className="edit-input"
                        />
                      ) : (
                        donation.foodType
                      )}
                    </td>
                    <td>
                      {editMode === donation.id ? (
                        <input
                          type="number"
                          name="quantity"
                          value={editedDonation.quantity}
                          onChange={handleChange}
                          className="edit-input"
                        />
                      ) : (
                        donation.quantity
                      )}
                    </td>
                    <td>{donation.expirationDate}</td>
                    <td>{donation.location}</td>
                    <td>
                      {donation.selfDelivery ? "✅ Yes" : "❌ No"}
                    </td>
                    <td>
                      <span className={`status ${donation.status}`}>
                        {donation.status}
                      </span>
                    </td>
                    <td className="action-buttons">
                      {editMode === donation.id ? (
                        <button className="save-btn" onClick={() => handleSave(donation.id)}>
                          <FaSave />
                        </button>
                      ) : (
                        <button className="edit-btn" onClick={() => handleEdit(donation)}>
                          <FaEdit />
                        </button>
                      )}
                      <button className="delete-btn" onClick={() => handleDelete(donation.id)}>
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Footer />  
    </div>
  );
};

export default MyDonations;
