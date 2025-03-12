import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import '../assets/styles/Composantdonation.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getDonationById, deleteDonation, updateDonation } from '../api/donationService';
import { FaEdit, FaTrash, FaSave, FaTimes } from "react-icons/fa";
//import {toLowerCase} from "lodash";
const DetailsDonations = () => {
  const { id } = useParams();
  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const userId = localStorage.getItem("user_id");
  const [isTheOwner, setIsTheOwner] = useState(false);
  const [editedDonation, setEditedDonation] = useState({
    title: "",
    location: "",
    expirationDate: "",
    type: "",
    category: "",
    description: "",
   // delivery: "",
    products: [],
  });

  // Fetch donation data when the component mounts or ID changes
  useEffect(() => {
    const fetchDonation = async () => {
      try {
        const response = await getDonationById(id);
        const fetchedDonation = response.data;
        setDonation(fetchedDonation);
        setEditedDonation({
          title: fetchedDonation.title || "",
          location: fetchedDonation.location || "",
          expirationDate: fetchedDonation.expirationDate || "",
          type: fetchedDonation.type || "",
          category: fetchedDonation.category || "",
          description: fetchedDonation.description || "",
         // delivery: fetchedDonation.delivery || "",
          products: fetchedDonation.products || [],
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching donation data');
      } finally {
        setLoading(false);
      }
    };
    fetchDonation();
  }, [id]);

  // Check if the current user is the owner of the donation
  useEffect(() => {
    console.log("Donation:", donation);
    if (donation && userId) {
      // If donation.user is a string, compare it directly; if it's an object, use its _id property.
      if (donation.donor && donation.donor._id) {
        setIsTheOwner(userId === donation.donor._id);
      } else {
        setIsTheOwner(false);
      }
    }
  }, [donation, userId]);

  // Handle deletion of the donation
  const handleDeleteDonation = () => {
    deleteDonation(id)
      .then(() => {
        console.log("Donation deleted successfully");
        window.location.href = "/myrequest";
      })
      .catch((error) => {
        console.error("Error deleting donation:", error);
      });
  };

  // Handle saving the edited donation
  const handleSaveDonation = () => {
    console.log('Sending update with data:', editedDonation);
    
    updateDonation(id, editedDonation)
      .then((response) => {
        console.log("Server response:", response.data);
        
        // Redirect to the updated donation details page
        window.location.href = `/DetailsDonations/${id}`;
  
        // Update local state with the returned donation data.
        setDonation(response.data.updatedDonation);
        setIsEditing(false);
      })
      .catch((error) => {
        console.error("Error updating donation:", error.response?.data || error);
      });
  };
  

  // Update a specific product field in the edited donation
  const handleProductChange = (index, field, value) => {
    const updatedProducts = [...editedDonation.products];
    if (field === 'totalQuantity') {
      value = Number(value); // Ensure quantity is a number
    }
    updatedProducts[index] = { ...updatedProducts[index], [field]: value };
    setEditedDonation({ ...editedDonation, products: updatedProducts });
  };

  // Delete a specific product from the edited donation
  const handleDeleteProduct = (index) => {
    const updatedProducts = editedDonation.products.filter((_, i) => i !== index);
    setEditedDonation({ ...editedDonation, products: updatedProducts });
  };

  // Add a new product to the edited donation
  const handleAddProduct = () => {
    const newProduct = { productDescription: '', totalQuantity: 0, status: 'available' };
    setEditedDonation({
      ...editedDonation,
      products: [...editedDonation.products, newProduct],
    });
  };

  // Handle loading and error states
  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!donation) return <div>No donation found.</div>;

  const { title, location, expirationDate, delivery, products } = donation;

  return (
    <>
      <Navbar />
      <div className="donation-cardlist">
        <div className="donation-card-content">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            {isEditing ? (
              <input
                type="text"
                value={editedDonation.title}
                onChange={(e) => setEditedDonation({ ...editedDonation, title: e.target.value })}
                style={{ fontSize: "1.5rem", fontWeight: "bold", width: "60%" }}
              />
            ) : (
              <h3 className="donation-title" style={{ marginLeft: "35%" }}>
                🛒 {title || "Donation Title"}
              </h3>
            )}
            {isTheOwner && (
              <div>
                <FaTrash
                  onClick={handleDeleteDonation}
                  style={{ color: "#c30010", cursor: "pointer", fontSize: "20px", marginLeft: "10px" }}
                />
                {isEditing ? (
                  <FaSave
                    onClick={handleSaveDonation}
                    style={{ color: "green", cursor: "pointer", fontSize: "20px", marginLeft: "10px" }}
                  />
                ) : (
                  <FaEdit
                    onClick={() => {
                      setIsEditing(true);
                      // Copy donation data into editedDonation state, including a shallow copy of products.
                      setEditedDonation({ ...donation, products: donation.products ? [...donation.products] : [] });
                    }}
                    style={{ color: "black", cursor: "pointer", fontSize: "20px", marginLeft: "10px" }}
                  />
                )}
              </div>
            )}
          </div>

          {/* Donation Details */}
          <p>
            <strong>📍 Location:</strong>{" "}
            {isEditing ? (
              <input
                type="text"
                value={editedDonation.location}
                onChange={(e) => setEditedDonation({ ...editedDonation, location: e.target.value })}
              />
            ) : (
              location || "Unknown location"
            )}
          </p>
          <p>
            <strong>📆 Expiration Date:</strong>{" "}
            {isEditing ? (
              <input
                type="date"
                value={
                  editedDonation.expirationDate
                    ? new Date(editedDonation.expirationDate).toISOString().split('T')[0]
                    : ''
                }
                onChange={(e) => setEditedDonation({ ...editedDonation, expirationDate: e.target.value })}
              />
            ) : (
              expirationDate ? new Date(expirationDate).toLocaleDateString() : "N/A"
            )}
          </p>
         {/* Delivery <p>
            <strong>🚚 Delivery:</strong>{" "}
            {isEditing ? (
              <input
                type="text"
                value={editedDonation.delivery}
                onChange={(e) => setEditedDonation({ ...editedDonation, delivery: e.target.value })}
              />
            ) : (
              delivery || "N/A"
            )}
          </p> */}

          {/* Product List */}
          <h4>📦 Available Products:</h4>
          <ul className="donation-ul">
            {isEditing ? (
              editedDonation.products.map((product, index) => (
                <li key={index} style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
                  <input
                    type="text"
                    value={product.productDescription}
                    onChange={(e) => handleProductChange(index, 'productDescription', e.target.value)}
                    placeholder="Product Description"
                  />
                  <input
                    type="number"
                    value={product.totalQuantity}
                    onChange={(e) => handleProductChange(index, 'totalQuantity', e.target.value)}
                    placeholder="Quantity"
                    style={{ marginLeft: "10px" }}
                  />
                  <select
                    value={product.status}
                    onChange={(e) => handleProductChange(index, 'status', e.target.value)}
                    style={{ marginLeft: "10px" }}
                  >
                    <option value="available">Available</option>
                    <option value="pending">Pending</option>
                    <option value="delivered">Delivered</option>
                  </select>
                  <FaTimes
                    onClick={() => handleDeleteProduct(index)}
                    style={{ color: "red", cursor: "pointer", marginLeft: "10px" }}
                  />
                </li>
              ))
            ) : (
              products && products.length > 0 ? (
                products.map((product, index) => (
                  <li className="donation-li-list" key={index}>
                    <span role="img" aria-label="product">🥫</span>{" "}
                    <strong>{product.productDescription}</strong> - {product.totalQuantity}{" "}
                    <span className={`status ${product.status}`}>
                      {product.status}
                    </span>
                  </li>
                ))
              ) : (
                <li className="donation-li-list">No products available</li>
              )
            )}
          </ul>

          {/* Add Product Button (visible only in edit mode) */}
          {isEditing && (
            <button
              onClick={handleAddProduct}
              style={{ marginTop: "10px", padding: "5px 10px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "5px" }}
            >
              Add Product
            </button>
          )}

          {/* Additional Action Buttons */}
          {!isTheOwner && <button className="btnseelist">Add Request</button>}
          {isTheOwner && <button className="btnseelist">See Request</button>}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default DetailsDonations;
