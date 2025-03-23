import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import '../assets/styles/DetailsDonations.css'; // Ensure this path is correct
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getDonationById, deleteDonation, updateDonation } from '../api/donationService';
import { FaEdit, FaTrash, FaSave, FaTimes } from "react-icons/fa";

const DetailsDonations = () => {
  const { id } = useParams();
  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));
  const [userid, setUserid] = useState();
  const [isTheOwner, setIsTheOwner] = useState(false);
  const [editedDonation, setEditedDonation] = useState({
    title: "",
    location: "",
    expirationDate: "",
    type: "",
    category: "",
    description: "",
    products: [],
  });

  const isDonner = user?.role === "restaurant" || user?.role === "supermarket";
  const isRecipient = user?.role === "ong" || user?.role === "student";

  useEffect(() => {
    if (typeof user.id === "number") {
      setUserid(user._id);
    } else if (typeof user.id === "string") {
      setUserid(user.id);
    }
  }, [user]);

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

  useEffect(() => {
    if (donation && userid) {
      if (donation.donor && donation.donor._id) {
        setIsTheOwner(userid === donation.donor._id);
      } else {
        setIsTheOwner(false);
      }
    }
  }, [donation, userid]);

  const handleDeleteDonation = () => {
    deleteDonation(id)
      .then(() => {
        window.history.back();
      })
      .catch((error) => {
        console.error("Error deleting donation:", error);
      });
  };

  const handleSaveDonation = () => {
    updateDonation(id, editedDonation)
      .then((response) => {
        window.location.href = `/DetailsDonations/${id}`;
        setDonation(response.data.updatedDonation);
        setIsEditing(false);
      })
      .catch((error) => {
        console.error("Error updating donation:", error.response?.data || error);
      });
  };

  const handleProductChange = (index, field, value) => {
    const updatedProducts = [...editedDonation.products];
    if (field === 'totalQuantity') {
      value = Number(value);
    }
    updatedProducts[index] = { ...updatedProducts[index], [field]: value };
    setEditedDonation({ ...editedDonation, products: updatedProducts });
  };

  const handleDeleteProduct = (index) => {
    const updatedProducts = editedDonation.products.filter((_, i) => i !== index);
    setEditedDonation({ ...editedDonation, products: updatedProducts });
  };

  const handleAddProduct = () => {
    const newProduct = { productDescription: '', totalQuantity: 0, status: 'available' };
    setEditedDonation({
      ...editedDonation,
      products: [...editedDonation.products, newProduct],
    });
  };

  if (loading) return <div className="details-donation-loading">Loading...</div>;
  if (error) return <div className="details-donation-error">{error}</div>;
  if (!donation) return <div className="details-donation-error">No donation found.</div>;

  const { title, location, expirationDate, products } = donation;

  return (
    <>
      <Navbar />
      <div className="details-donation-page">
        <div className="details-donation-container">
          <div className="details-donation-header">
            <div className="details-donation-title-container">
              {isEditing ? (
                <input
                  type="text"
                  value={editedDonation.title}
                  onChange={(e) => setEditedDonation({ ...editedDonation, title: e.target.value })}
                  className="details-donation-edit-input"
                />
              ) : (
                <h1 className="details-donation-title">🛒 {title || "Donation Title"}</h1>
              )}
              {isTheOwner && (
                <div className="details-donation-actions">
                  <button className="details-donation-action-icon delete" onClick={handleDeleteDonation}>
                    <FaTrash />
                  </button>
                  {isEditing ? (
                    <button className="details-donation-action-icon" onClick={handleSaveDonation}>
                      <FaSave />
                    </button>
                  ) : (
                    <button className="details-donation-action-icon" onClick={() => setIsEditing(true)}>
                      <FaEdit />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="details-donation-content">
          <div className="details-donation-info-grid">
  <div className="details-donation-info-item">
    <div className="details-donation-info-icon">📍</div>
    <div className="details-donation-info-content">
      <div className="details-donation-info-label">Location</div>
      {isEditing ? (
        <input
          type="text"
          value={editedDonation.location}
          onChange={(e) => {
            console.log("Location changed:", e.target.value); // Debugging
            setEditedDonation({ ...editedDonation, location: e.target.value });
          }}
          className="details-donation-edit-input"
          placeholder="Enter location"
        />
      ) : (
        <div className="details-donation-info-value">{location || "Unknown location"}</div>
      )}
    </div>
  </div>

  <div className="details-donation-info-item">
    <div className="details-donation-info-icon">📆</div>
    <div className="details-donation-info-content">
      <div className="details-donation-info-label">Expiration Date</div>
      {isEditing ? (
        <input
          type="date"
          value={
            editedDonation.expirationDate
              ? new Date(editedDonation.expirationDate).toISOString().split("T")[0]
              : ""
          }
          onChange={(e) => {
            console.log("Expiration Date changed:", e.target.value); // Debugging
            setEditedDonation({ ...editedDonation, expirationDate: e.target.value });
          }}
          className="details-donation-edit-date"
        />
      ) : (
        <div className="details-donation-info-value">
          {expirationDate ? new Date(expirationDate).toLocaleDateString() : "N/A"}
        </div>
      )}
    </div>
  </div>
</div>

            <div className="details-donation-products-section">
              <h2 className="details-donation-section-title">📦 Available Products</h2>
              <ul className="details-donation-products-list">
                {isEditing ? (
                  editedDonation.products.map((product, index) => (
                    <li key={index} className="details-donation-product-item">
                      <div className="details-donation-product-info">
                        <div className="details-donation-product-icon">🥫</div>
                        <div className="details-donation-product-details">
                          <input
                            type="text"
                            value={product.productDescription}
                            onChange={(e) => handleProductChange(index, 'productDescription', e.target.value)}
                            className="details-donation-edit-input"
                            placeholder="Product Description"
                          />
                          <input
                            type="number"
                            value={product.totalQuantity}
                            onChange={(e) => handleProductChange(index, 'totalQuantity', e.target.value)}
                            className="details-donation-edit-input"
                            placeholder="Quantity"
                          />
                          <select
                            value={product.status}
                            onChange={(e) => handleProductChange(index, 'status', e.target.value)}
                            className="details-donation-edit-select"
                          >
                            <option value="available">Available</option>
                            <option value="pending">Pending</option>
                            <option value="delivered">Delivered</option>
                          </select>
                        </div>
                      </div>
                      <button
                        className="details-donation-delete-product-button"
                        onClick={() => handleDeleteProduct(index)}
                      >
                        <FaTimes />
                      </button>
                    </li>
                  ))
                ) : (
                  products && products.length > 0 ? (
                    products.map((product, index) => (
                      <li key={index} className="details-donation-product-item">
                        <div className="details-donation-product-info">
                          <div className="details-donation-product-icon">🥫</div>
                          <div className="details-donation-product-details">
                            <div className="details-donation-product-name">{product.productDescription}</div>
                            <div className="details-donation-product-quantity">{product.totalQuantity}</div>
                            <div className={`details-donation-product-status ${product.status}`}>
                              {product.status}
                            </div>
                          </div>
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="details-donation-product-item">No products available</li>
                  )
                )}
              </ul>

              {isEditing && (
                <button
                  onClick={handleAddProduct}
                  className="details-donation-add-product-button"
                >
                  Add Product
                </button>
              )}
            </div>

            <div className="details-donation-actions-container">
              {!isTheOwner && (
                <button className="details-donation-request-button">Add Request</button>
              )}
              {isTheOwner && (
                <button className="details-donation-request-button">See Request</button>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default DetailsDonations;