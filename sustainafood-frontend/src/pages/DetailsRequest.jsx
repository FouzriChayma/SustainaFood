import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../assets/styles/Composantdonation.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getRequestById, deleteRequest, updateRequest, addDonationToRequest } from '../api/requestNeedsService';
import { FaEdit, FaTrash, FaSave, FaTimes, FaEye } from "react-icons/fa";
import styled from 'styled-components';
import logo from "../assets/images/LogoCh.png";
import { Link, useNavigate } from "react-router-dom";

import { useAlert } from '../contexts/AlertContext';

// Styled Components for Buttons
const Button = styled.button`
  display: inline-block;
  padding: 12px 20px;
  font-size: 16px;
  font-weight: 600;
  text-align: center;
  border-radius: 8px; // Slightly less rounded for a modern look
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 8px;
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  // Variant-specific styles
  ${({ variant }) => variant === 'add' && `
    background: #228b22;
    &:hover { background: #228b22; transform: translateY(-2px); }
  `}
  ${({ variant }) => variant === 'cancel' && `
    background: #dc3545;
    &:hover { background: #b02a37; transform: translateY(-2px); }
  `}
  ${({ variant }) => variant === 'submit' && `
    background: #28a745;
    &:hover { background: #218838; transform: translateY(-2px); }
  `}
  ${({ variant }) => variant === 'donate' && `
    background: #228b22; // Changed to a teal color for donation buttons
    &:hover { background: #228b22; transform: translateY(-2px); }
  `}
  ${({ variant }) => variant === 'back' && `
    background: #6c757d;
    &:hover { background: #5a6268; transform: translateY(-2px); }
  `}

  &:active {
    transform: translateY(1px);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }
`;

// Styled Component for Donation Form
const DonationForm = styled.div`
  h4 {
    color: #228b22;
    font-size: 25px;
    margin-bottom: 20px;
    font-weight: 600;
  }

  div {
    margin-bottom: 15px;
  }

  label {
    display: block;
    font-weight: 500;
    color: #495057;
    margin-bottom: 6px;
    font-size: 14px;
  }

  input {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #ced4da;
    border-radius: 6px;
    font-size: 16px;
    background: #f8f9fa;
    transition: border-color 0.3s ease, box-shadow 0.3s ease;

    &:focus {
      border-color: #17a2b8;
      box-shadow: 0 0 5px rgba(23, 162, 184, 0.3);
      outline: none;
    }
  }
`;

const DetailsRequest = () => {

  const { id } = useParams();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingDonation, setIsAddingDonation] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));
  const [userid, setUserid] = useState();
  const [isTheOwner, setIsTheOwner] = useState(false);
  const [editedRequest, setEditedRequest] = useState({
    title: "",
    location: "",
    expirationDate: "",
    description: "",
    category: "",
    status: "",
    requestedProducts: [],
    numberOfMeals: ""
  });
  const [donationQuantities, setDonationQuantities] = useState([]);

  const weightUnits = ['kg', 'g', 'lb', 'oz'];
  const statuses = ['available', 'pending', 'reserved'];
    const navigate = useNavigate();

  useEffect(() => {
    if (typeof user.id === "number") {
      setUserid(user._id);
    } else if (typeof user.id === "string") {
      setUserid(user.id);
    }
  }, [user]);

  const isDonor = user?.role === "restaurant" || user?.role === "supermarket";
  const isRecipient = user?.role === "ong" || user?.role === "student";

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const response = await getRequestById(id);
        const fetchedRequest = response.data;
        setRequest(fetchedRequest);
        setEditedRequest({
          title: fetchedRequest.title || "",
          location: fetchedRequest.location || "",
          expirationDate: fetchedRequest.expirationDate || "",
          description: fetchedRequest.description || "",
          category: fetchedRequest.category || "",
          status: fetchedRequest.status || "",
          requestedProducts: fetchedRequest.requestedProducts ? [...fetchedRequest.requestedProducts] : [],
          numberOfMeals: fetchedRequest.numberOfMeals || ""
        });
        setDonationQuantities(fetchedRequest.requestedProducts.map(() => 0));
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching request data');
      } finally {
        setLoading(false);
      }
    };
    fetchRequest();
  }, [id]);

  useEffect(() => {
    if (request && userid) {
      if (request.recipient && request.recipient._id) {
        setIsTheOwner(userid === request.recipient._id);
      } else {
        setIsTheOwner(false);
      }
    }
  }, [request, userid]);

  const handleDeleteRequest = () => {
    deleteRequest(id)
      .then(() => {
        showAlert('success', 'Request successfully deleted');
        window.history.back();
      })
      .catch((error) => {
        console.error("Error deleting request:", error);
        showAlert('error', 'Failed to delete request');
      });
  };

  const handleSaveRequest = () => {
    console.log('Sending update with data:', editedRequest);
    updateRequest(id, editedRequest)
      .then((response) => {
        console.log("Server response:", response.data);
        setRequest(response.data.updatedRequest);
        setIsEditing(false);
        showAlert('success', 'Request updated successfully');
      })
      .catch((error) => {
        console.error("Error updating request:", error.response?.data || error);
        showAlert('error', 'Failed to update request');
      });
  };

  const handleProductChange = (index, field, value) => {
    const updatedProducts = [...editedRequest.requestedProducts];
    if (field === 'totalQuantity' || field === 'weightPerUnit') {
      value = Number(value);
    }
    updatedProducts[index] = { ...updatedProducts[index], [field]: value };
    setEditedRequest({ ...editedRequest, requestedProducts: updatedProducts });
  };

  const handleDeleteProduct = (index) => {
    const updatedProducts = editedRequest.requestedProducts.filter((_, i) => i !== index);
    setEditedRequest({ ...editedRequest, requestedProducts: updatedProducts });
  };

  const handleAddProduct = () => {
    const newProduct = {
      productType: '',
      productDescription: '',
      weightPerUnit: 0,
      weightUnit: '',
      totalQuantity: 0,
      weightUnitTotale: '',
      status: 'available'
    };
    setEditedRequest({
      ...editedRequest,
      requestedProducts: [...editedRequest.requestedProducts, newProduct]
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedRequest({
      title: request.title || "",
      location: request.location || "",
      expirationDate: request.expirationDate || "",
      description: request.description || "",
      category: request.category || "",
      status: request.status || "",
      requestedProducts: request.requestedProducts ? [...request.requestedProducts] : [],
      numberOfMeals: request.numberOfMeals || ""
    });
  };

  const handleDonationQuantityChange = (index, value) => {
    const newQuantities = [...donationQuantities];
    newQuantities[index] = Math.min(Number(value), request.requestedProducts[index].totalQuantity);
    setDonationQuantities(newQuantities);
  };
  const handleSubmitDonation = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Token before request:', token);

      const donationProducts = request.requestedProducts.map((product, index) => ({
        product: product._id ? product._id.toString() : null,
        quantity: Number(donationQuantities[index]) || 0,
      })).filter(p => p.quantity > 0);

      const donationData = {
        products: donationProducts,
        donor: user?._id || user?.id,
        expirationDate: request.expirationDate || new Date().toISOString(),
      };

      console.log('Sending donation:', donationData);
      const response = await addDonationToRequest(id, donationData);
      console.log('Donation submitted:', response.donation);

      setIsAddingDonation(false);
      setDonationQuantities(request.requestedProducts.map(() => 0));
      setRequest(prev => ({
        ...prev,
        donations: [...(prev.donations || []), response.donation],
      }));
      showAlert('success', 'Donation submitted successfully');
    } catch (error) {
      console.error('Error submitting donation:', error);
      showAlert('error', `Failed to submit donation: ${error.message || 'Unknown error'}`);
    }
  };
  
  const handleDonateAll = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Token before request:', token);
      if (!token) {
        throw new Error('No authentication token found');
      }

      const donationProducts = request.requestedProducts.map((product) => ({
        product: product._id ? product._id.toString() : null,
        quantity: Number(product.totalQuantity) || 0,
      }));

      const donationData = {
        products: donationProducts,
        donor: user._id,
        expirationDate: request.expirationDate || new Date().toISOString(),
      };

      console.log('Request data:', JSON.stringify(request, null, 2));
      console.log('Sending donation:', JSON.stringify(donationData, null, 2));

      const response = await addDonationToRequest(id, donationData);
      console.log('Donated all:', response.donation);

      setIsAddingDonation(false);
      setRequest(prevRequest => ({
        ...prevRequest,
        donations: [...(prevRequest.donations || []), response.donation],
      }));
      showAlert('success', 'Donated all products successfully');
    } catch (error) {
      console.error('Error donating all:', error.response?.data || error.message);
      showAlert('error', `Failed to donate all: ${error.message || 'Unknown error'}`);
    }
  };

  
  // In the JSX:
  <Button variant="donate" onClick={handleDonateAll}>Donate all</Button>
  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!request) return <div>No request found.</div>;

  const {
    title,
    location,
    expirationDate,
    description,
    category,
    status,
    requestedProducts,
    numberOfMeals
  } = request;

  return (
    <>
      <Navbar />
      <div className="donation-cardlist">
        <div className="donation-card-content">
          <img src={logo} alt="Logo" className="adddonation-logo" style={{ marginLeft: "47%" }} />

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            {isEditing ? (
              <input
                type="text"
                value={editedRequest.title}
                onChange={(e) => setEditedRequest({ ...editedRequest, title: e.target.value })}
                placeholder="🛒 Request Title"
                style={{ fontSize: "1.5rem", fontWeight: "bold", width: "60%" }}
              />
            ) : (
              <h3 className="donation-title">
                🛒 Request: {title || "No Title"}
              </h3>
            )}
            {isTheOwner && (
              <div>
                <FaTrash className='fa-trash' onClick={handleDeleteRequest} />
                {isEditing ? (
                  <>
                    <FaSave className="fa-save" onClick={handleSaveRequest} />
                    <FaTimes className="fa-times" onClick={handleCancelEdit} />
                  </>
                ) : (
                  <FaEdit
                    className="fa-edit"
                    onClick={() => {
                      setIsEditing(true);
                      setEditedRequest({
                        ...request,
                        requestedProducts: request.requestedProducts ? [...request.requestedProducts] : []
                      });
                    }}
                  />
                )}
              </div>
            )}
          </div>

          <p><strong>📍 Location:</strong> {isEditing ? <input type="text" value={editedRequest.location} onChange={(e) => setEditedRequest({ ...editedRequest, location: e.target.value })} placeholder="📍 Location" /> : location || "Unknown location"}</p>
          <p><strong>📆 Expiration Date:</strong> {isEditing ? <input type="date" value={editedRequest.expirationDate ? new Date(editedRequest.expirationDate).toISOString().split('T')[0] : ''} onChange={(e) => setEditedRequest({ ...editedRequest, expirationDate: e.target.value })} /> : expirationDate ? new Date(expirationDate).toLocaleDateString() : "Not set"}</p>
          <p><strong>📝 Description:</strong> {isEditing ? <textarea value={editedRequest.description} onChange={(e) => setEditedRequest({ ...editedRequest, description: e.target.value })} placeholder="📝 Description" /> : description || "No description"}</p>
          <p><strong>📂 Category:</strong> {isEditing ? <input type="text" value={editedRequest.category} onChange={(e) => setEditedRequest({ ...editedRequest, category: e.target.value })} placeholder="📂 Category" /> : category || "Not specified"}</p>
          <p><strong>🔄 Status:</strong> {isEditing ? <input type="text" value={editedRequest.status} onChange={(e) => setEditedRequest({ ...editedRequest, status: e.target.value })} placeholder="🔄 Status" /> : status || "Unknown"}</p>
          {category === 'prepared_meals' && <p><strong>🍽️ Number of Meals:</strong> {isEditing ? <input type="number" value={editedRequest.numberOfMeals} onChange={(e) => setEditedRequest({ ...editedRequest, numberOfMeals: e.target.value })} placeholder="🍽️ Number of Meals" /> : numberOfMeals || "Not specified"}</p>}

          <h4>📦 Requested Products:</h4>
          <ul className="donation-ul">
            {isEditing ? (
              editedRequest.requestedProducts.map((product, index) => (
                <li key={index} style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
                  <input type="text" value={product.productType} onChange={(e) => handleProductChange(index, 'productType', e.target.value)} placeholder="🔖 Product Type" />
                  <input type="text" value={product.productDescription} onChange={(e) => handleProductChange(index, 'productDescription', e.target.value)} placeholder="📝 Product Description" style={{ marginLeft: "10px" }} />
                  <input type="number" value={product.weightPerUnit} onChange={(e) => handleProductChange(index, 'weightPerUnit', e.target.value)} placeholder="⚖️ Weight per Unit" style={{ marginLeft: "10px" }} />
                  <select value={product.weightUnit} onChange={(e) => handleProductChange(index, 'weightUnit', e.target.value)} style={{ marginLeft: "10px", padding: "8px", borderRadius: "5px" }}>
                    <option value="">📏 Select Weight Unit</option>
                    {weightUnits.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
                  </select>
                  <input type="number" value={product.totalQuantity} onChange={(e) => handleProductChange(index, 'totalQuantity', e.target.value)} placeholder="🔢 Total Quantity" style={{ marginLeft: "10px" }} />
                  <select value={product.weightUnitTotale} onChange={(e) => handleProductChange(index, 'weightUnitTotale', e.target.value)} style={{ marginLeft: "10px", padding: "8px", borderRadius: "5px" }}>
                    <option value="">📏 Select Weight Unit Totale</option>
                    {weightUnits.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
                  </select>
                  <select value={product.status} onChange={(e) => handleProductChange(index, 'status', e.target.value)} style={{ marginLeft: "10px", padding: "8px", borderRadius: "5px" }}>
                    {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                  </select>
                  <FaTimes onClick={() => handleDeleteProduct(index)} style={{ color: "red", cursor: "pointer", marginLeft: "10px" }} />
                </li>
              ))
            ) : (
              requestedProducts && requestedProducts.length > 0 ? (
                requestedProducts.map((product, index) => (
                  <li className="donation-li-list" key={index}>
                    <span><strong>🔖 Type:</strong> {product.productType || 'Not specified'}</span> <br />
                    <span><strong>📝 Description:</strong> {product.productDescription || 'None'}</span> <br />
                    <span><strong>⚖️ Weight:</strong> {product.weightPerUnit || 0} {product.weightUnit || ''}</span> <br />
                    <span><strong>🔢 Total Quantity:</strong> {product.totalQuantity || 0} {product.weightUnitTotale || ''}</span> <br />
                    <span><strong>🔄 Status:</strong> {product.status || 'Unknown'}</span> <br />
                  </li>
                ))
              ) : (
                <li className="donation-li-list">
                  {category === 'prepared_meals'
                    ? `🍽️ Number of Meals: ${numberOfMeals || 'Not specified'}`
                    : 'No product requested'}
                </li>
              )
            )}
          </ul>

          {/* Donation Form */}
          {isAddingDonation && (
            <DonationForm>
              <h4>Specify the donation</h4>
              {requestedProducts.map((product, index) => (
                <div key={index}>
                  <label>
                    {product.productType} - {product.productDescription} (Max: {product.totalQuantity})
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={product.totalQuantity}
                    value={donationQuantities[index]}
                    onChange={(e) => handleDonationQuantityChange(index, e.target.value)}
                    placeholder="Quantity to donate"
                  />
                </div>
              ))}
              <Button variant="donate" onClick={handleDonateAll}>Donate all</Button>
              <Button variant="donate" onClick={handleSubmitDonation}>Submit donation</Button>
            </DonationForm>
          )}

          <Button variant="back" onClick={() => window.history.back()}>🔙 Go Back</Button>

          {!isTheOwner && (
           <Button
           variant={isAddingDonation ? "cancel" : "add"}
           onClick={() => setIsAddingDonation(!isAddingDonation)}
         >
           {isAddingDonation ? 'Cancel' : 'Add Donation'}
         </Button>
          )}
         
          {isTheOwner && !isEditing && (
            <Button
  variant="submit"
  className="add-product-btn"
  as={Link}
  to={`/ListDonationsRequest/${id}`} // Dynamically insert the request ID
  style={{ textDecoration: 'none' }}
>
  👀 View Request
</Button>          )}
          {isEditing && (
            <Button variant="add" onClick={handleAddProduct} className="add-product-btn">
              ➕ Add Product
            </Button>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default DetailsRequest;