import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import '../assets/styles/DetailsDonations.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getDonationById, deleteDonation, updateDonation } from '../api/donationService';
import { createProduct, updateProduct, getProductById, deleteProduct } from '../api/productService';
import { createRequestNeedForExistingDonation } from '../api/requestNeedsService'; // Re-added
import { FaEdit, FaTrash, FaSave, FaTimes, FaEye } from "react-icons/fa";
import styled from 'styled-components';
import logo from "../assets/images/LogoCh.png";
import { useAlert } from '../contexts/AlertContext';

// Styled Components for Buttons
const Button = styled.button`
  display: inline-block;
  padding: 12px 20px;
  font-size: 16px;
  font-weight: 600;
  text-align: center;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 8px;
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  ${({ variant }) => variant === 'add' && `
    background: #228b22;
    &:hover { background: #1e7a1e; transform: translateY(-2px); }
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
    background: #228b22;
    &:hover { background: #1e7a1e; transform: translateY(-2px); }
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

// Styled Component for Donation/Request Form
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

const DetailsDonations = () => {
  const { id } = useParams();
  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingDonation, setIsAddingDonation] = useState(false);
  const [isAddingRequest, setIsAddingRequest] = useState(false); // Added for request form
  const user = JSON.parse(localStorage.getItem("user"));
  const [userid, setUserid] = useState();
  const [isTheOwner, setIsTheOwner] = useState(false);
  const [donationQuantities, setDonationQuantities] = useState([]);
  const [requestQuantities, setRequestQuantities] = useState([]); // Added for request quantities
  const navigate = useNavigate();
  const isDonor = user?.role === "restaurant" || user?.role === "supermarket";
  const isRecipient = user?.role === "ong" || user?.role === "student";
  const { showAlert } = useAlert();

  const [editedDonation, setEditedDonation] = useState({
    title: "",
    location: "",
    expirationDate: "",
    type: "",
    category: "",
    description: "",
    products: [],
  });

  useEffect(() => {
    if (typeof user?.id === "number") {
      setUserid(user._id);
    } else if (typeof user?.id === "string") {
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
          products: fetchedDonation.products && Array.isArray(fetchedDonation.products)
            ? fetchedDonation.products.map(item => ({
                product: item.product?._id || item.product,
                name: item.product?.name || '',
                quantity: item.quantity || 0,
                totalQuantity: item.product?.totalQuantity || 0,
                status: item.product?.status || 'available',
                productDescription: item.product?.productDescription || 'Default description',
                productType: item.product?.productType || 'Other',
                _id: item.product?._id,
              }))
            : [],
        });
        setDonationQuantities(fetchedDonation.products.map(() => 0));
        setRequestQuantities(fetchedDonation.products.map(() => 0)); // Initialize request quantities
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
      setIsTheOwner(userid === (donation.donor?._id || donation.donor));
    }
  }, [donation, userid]);

  const handleDeleteDonation = () => {
    deleteDonation(id)
      .then(() => {
        showAlert('success', 'Donation successfully deleted');
        window.history.back();
      })
      .catch((error) => {
        console.error("Error deleting donation:", error);
        showAlert('error', 'Failed to delete donation');
      });
  };

  const handleSaveDonation = () => {
    const invalidProduct = editedDonation.products.find(
      (item) => !item.name?.trim() || !item.productDescription?.trim() || !item.productType?.trim()
    );
    if (invalidProduct) {
      showAlert('error', 'Please fill in all required fields for all products.');
      return;
    }

    if (new Date(editedDonation.expirationDate) <= new Date()) {
      showAlert('error', 'Expiration date must be in the future.');
      return;
    }

    const formattedProducts = editedDonation.products.map(product => ({
      product: product._id || product.product,
      quantity: Number(product.quantity) || 0,
    }));

    const donationData = {
      ...editedDonation,
      products: formattedProducts,
    };

    console.log('Sending update with data:', donationData);
    updateDonation(id, donationData)
      .then((response) => {
        console.log("Server response:", response.data);
        window.location.reload()
        setDonation(response.data);
        setIsEditing(false);
        showAlert('success', 'Donation updated successfully');
      })
      .catch((error) => {
        console.error("Error updating donation:", error.response?.data || error);
        showAlert('error', 'Failed to update donation');
      });
  };

  const handleProductChange = (index, field, value) => {
    const updatedProducts = [...editedDonation.products];
    if (field === 'quantity' || field === 'totalQuantity') {
      value = Number(value);
    }
    updatedProducts[index] = { ...updatedProducts[index], [field]: value };
    setEditedDonation({ ...editedDonation, products: updatedProducts });
  };

  const handleDeleteProduct = async (index) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      const productToDelete = editedDonation.products[index];
      if (productToDelete.product) {
        try {
          await deleteProduct(productToDelete.product);
        } catch (error) {
          console.error("Error deleting product:", error);
          showAlert('error', "Failed to delete product. Please try again.");
          return;
        }
      }
      const updatedProducts = editedDonation.products.filter((_, i) => i !== index);
      setEditedDonation({ ...editedDonation, products: updatedProducts });
    }
  };

  const handleAddProduct = () => {
    const newProduct = {
      product: null,
      name: '',
      quantity: 0,
      totalQuantity: 0,
      status: 'available',
      productDescription: 'New product description',
      productType: 'Other',
    };
    setEditedDonation({
      ...editedDonation,
      products: [...editedDonation.products, newProduct],
    });
  };

  const handleDonationQuantityChange = (index, value) => {
    const newQuantities = [...donationQuantities];
    newQuantities[index] = Math.min(Number(value), donation.products[index].quantity);
    setDonationQuantities(newQuantities);
  };

  const handleSubmitDonation = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Token before request:', token);

      const donationProducts = donation.products.map((product, index) => ({
        product: product.product._id ? product.product._id.toString() : null,
        quantity: Number(donationQuantities[index]) || 0,
      })).filter(p => p.quantity > 0);

      const donationData = {
        ...editedDonation,
        products: donationProducts,
        donor: user?._id || user?.id,
        expirationDate: donation.expirationDate || new Date().toISOString(),
      };

      console.log('Sending donation update:', donationData);
      const response = await updateDonation(id, donationData);
      console.log('Donation updated:', response.data);

      setIsAddingDonation(false);
      setDonationQuantities(donation.products.map(() => 0));
      setDonation(response.data);
      showAlert('success', 'Donation updated successfully');
    } catch (error) {
      console.error('Error submitting donation:', error);
      showAlert('error', `Failed to update donation: ${error.message || 'Unknown error'}`);
    }
  };

  const handleDonateAll = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Token before request:', token);
      if (!token) {
        throw new Error('No authentication token found');
      }

      const donationProducts = donation.products.map((product) => ({
        product: product.product._id ? product.product._id.toString() : null,
        quantity: Number(product.quantity) || 0,
      }));

      const donationData = {
        ...editedDonation,
        products: donationProducts,
        donor: user._id,
        expirationDate: donation.expirationDate || new Date().toISOString(),
      };

      console.log('Sending donation update:', JSON.stringify(donationData, null, 2));
      const response = await updateDonation(id, donationData);
      console.log('Donated all:', response.data);

      setIsAddingDonation(false);
      setDonation(response.data);
      showAlert('success', 'Donated all products successfully');
    } catch (error) {
      console.error('Error donating all:', error.response?.data || error.message);
      showAlert('error', `Failed to donate all: ${error.message || 'Unknown error'}`);
    }
  };

  // New Request Logic
  const handleRequestQuantityChange = (index, value) => {
    const newQuantities = [...requestQuantities];
    newQuantities[index] = Math.min(Number(value), donation.products[index].quantity);
    setRequestQuantities(newQuantities);
  };

  const handleSubmitRequest = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Token before request:', token);

      const requestedProducts = donation.products.map((product, index) => ({
        product: product.product._id ? product.product._id.toString() : null,
        quantity: Number(requestQuantities[index]) || 0,
      })).filter(p => p.quantity > 0);

      const requestData = {
        donation: id,
        requestedProducts,
        recipient: user?._id || user?.id,
        expirationDate: donation.expirationDate || new Date().toISOString(),
      };

      console.log('Sending request:', requestData);
      const response = await createRequestNeedForExistingDonation(id, requestData);
      console.log('Request submitted:', response.data);

      setIsAddingRequest(false);
      setRequestQuantities(donation.products.map(() => 0));
      showAlert('success', 'Request submitted successfully');
    } catch (error) {
      console.error('Error submitting request:', error);
      showAlert('error', `Failed to submit request: ${error.message || 'Unknown error'}`);
    }
  };

  const handleRequestAll = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Token before request:', token);
      if (!token) {
        throw new Error('No authentication token found');
      }

      const requestedProducts = donation.products.map((product) => ({
        product: product.product._id ? product.product._id.toString() : null,
        quantity: Number(product.quantity) || 0,
      }));

      const requestData = {
        donation: id,
        requestedProducts,
        recipient: user?._id || user?.id,
        expirationDate: donation.expirationDate || new Date().toISOString(),
      };

      console.log('Sending request:', JSON.stringify(requestData, null, 2));
      const response = await createRequestNeedForExistingDonation(id, requestData);
      console.log('Requested all:', response.data);

      setIsAddingRequest(false);
      setRequestQuantities(donation.products.map(() => 0));
      showAlert('success', 'Requested all products successfully');
    } catch (error) {
      console.error('Error requesting all:', error.response?.data || error.message);
      showAlert('error', `Failed to request all: ${error.message || 'Unknown error'}`);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!donation) return <div>No donation found.</div>;

  const { title, location, expirationDate, products } = donation;

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
                value={editedDonation.title}
                onChange={(e) => setEditedDonation({ ...editedDonation, title: e.target.value })}
                placeholder="🛒 Donation Title"
                style={{ fontSize: "1.5rem", fontWeight: "bold", width: "60%" }}
              />
            ) : (
              <h3 className="donation-title">🛒 Donation: {title || "No Title"}</h3>
            )}
            {isTheOwner && (
              <div>
                <FaTrash className='fa-trash' onClick={handleDeleteDonation} />
                {isEditing ? (
                  <>
                    <FaSave className="fa-save" onClick={handleSaveDonation} />
                    <FaTimes className="fa-times" onClick={() => setIsEditing(false)} />
                  </>
                ) : (
                  <FaEdit
                    className="fa-edit"
                    onClick={() => setIsEditing(true)}
                  />
                )}
              </div>
            )}
          </div>

          <p><strong>📍 Location:</strong> {isEditing ? <input type="text" value={editedDonation.location} onChange={(e) => setEditedDonation({ ...editedDonation, location: e.target.value })} placeholder="📍 Location" /> : location || "Unknown location"}</p>
          <p><strong>📆 Expiration Date:</strong> {isEditing ? <input type="date" value={editedDonation.expirationDate ? new Date(editedDonation.expirationDate).toISOString().split('T')[0] : ''} onChange={(e) => setEditedDonation({ ...editedDonation, expirationDate: e.target.value })} /> : expirationDate ? new Date(expirationDate).toLocaleDateString() : "Not set"}</p>

          <h4>📦 Products:</h4>
          <ul className="donation-ul">
            {isEditing ? (
              editedDonation.products.map((product, index) => (
                <li key={index} style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
                  <input type="text" value={product.name} onChange={(e) => handleProductChange(index, 'name', e.target.value)} placeholder="🔖 Product Name" />
                  <input type="text" value={product.productDescription} onChange={(e) => handleProductChange(index, 'productDescription', e.target.value)} placeholder="📝 Description" style={{ marginLeft: "10px" }} />
                  <input type="number" value={product.quantity} onChange={(e) => handleProductChange(index, 'quantity', e.target.value)} placeholder="🔢 Quantity" style={{ marginLeft: "10px" }} />
                  <select value={product.productType} onChange={(e) => handleProductChange(index, 'productType', e.target.value)} style={{ marginLeft: "10px", padding: "8px", borderRadius: "5px" }}>
                    <option value="Canned_Goods">Canned Goods</option>
                    <option value="Dry_Goods">Dry Goods</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Snacks">Snacks</option>
                    <option value="Other">Other</option>
                  </select>
                  <select value={product.status} onChange={(e) => handleProductChange(index, 'status', e.target.value)} style={{ marginLeft: "10px", padding: "8px", borderRadius: "5px" }}>
                    <option value="available">Available</option>
                    <option value="pending">Pending</option>
                    <option value="delivered">Delivered</option>
                  </select>
                  <FaTimes onClick={() => handleDeleteProduct(index)} style={{ color: "red", cursor: "pointer", marginLeft: "10px" }} />
                </li>
              ))
            ) : (
              products && products.length > 0 ? (
                products.map((product, index) => (
                  <li className="donation-li-list" key={index}>
                    <span><strong>🔖 Name:</strong> {product.product.name || 'Not specified'}</span> <br />
                    <span><strong>📝 Description:</strong> {product.product.productDescription || 'None'}</span> <br />
                    <span><strong>🔢 Quantity:</strong> {product.quantity || 0}</span> <br />
                    <span><strong>🔄 Status:</strong> {product.product.status || 'Unknown'}</span>
                  </li>
                ))
              ) : (
                <li className="donation-li-list">No products available</li>
              )
            )}
          </ul>

          {/* Donation Form */}
          {isAddingDonation && (
            <DonationForm>
              <h4>Update Donation Quantities</h4>
              {donation.products.map((product, index) => (
                <div key={index}>
                  <label>
                    {product.product.name} - {product.product.productDescription} (Max: {product.quantity})
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={product.quantity}
                    value={donationQuantities[index]}
                    onChange={(e) => handleDonationQuantityChange(index, e.target.value)}
                    placeholder="Quantity to update"
                  />
                </div>
              ))}
              <Button variant="donate" onClick={handleDonateAll}>Donate All</Button>
              <Button variant="donate" onClick={handleSubmitDonation}>Submit Donation</Button>
            </DonationForm>
          )}

          {/* Request Form */}
          {isAddingRequest && (
            <DonationForm>
              <h4>Specify the Request</h4>
              {donation.products.map((product, index) => (
                <div key={index}>
                  <label>
                    {product.product.name} - {product.product.productDescription} (Max: {product.quantity})
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={product.quantity}
                    value={requestQuantities[index]}
                    onChange={(e) => handleRequestQuantityChange(index, e.target.value)}
                    placeholder="Quantity to request"
                  />
                </div>
              ))}
              <Button variant="donate" onClick={handleRequestAll}>Request All</Button>
              <Button variant="donate" onClick={handleSubmitRequest}>Submit Request</Button>
            </DonationForm>
          )}

          <Button variant="back" onClick={() => window.history.back()}>🔙 Go Back</Button>

          {isTheOwner && !isEditing && (
            <>
           
              <Button variant="submit" as={Link} to={`/ListDonationsRequest/${id}`}>
                👀 See Requests
              </Button>
            </>
          )}

          {!isTheOwner && isRecipient  && (
            <Button
              variant={isAddingRequest ? "cancel" : "add"}
              onClick={() => setIsAddingRequest(!isAddingRequest)}
            >
              {isAddingRequest ? 'Cancel' : 'Add Request'}
            </Button>
          )}

          {isEditing && (
            <Button variant="add" onClick={handleAddProduct}>➕ Add Product</Button>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default DetailsDonations;