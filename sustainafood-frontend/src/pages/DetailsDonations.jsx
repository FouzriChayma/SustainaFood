import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import '../assets/styles/DetailsDonations.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getDonationById, deleteDonation, updateDonation } from '../api/donationService';
import { createProduct, updateProduct, getProductById, deleteProduct } from '../api/productService';
import { createRequestNeedForExistingDonation } from '../api/requestNeedsService';
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
  const [isAddingRequest, setIsAddingRequest] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));
  const [userid, setUserid] = useState();
  const [isTheOwner, setIsTheOwner] = useState(false);
  const [donationQuantities, setDonationQuantities] = useState([]);
  const [requestQuantities, setRequestQuantities] = useState([]);
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
    meals: [],
    numberOfMeals: 0, // Added for schema compliance
    donationType: 'products', // 'products' or 'meals'
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
        const hasProducts = fetchedDonation.products && fetchedDonation.products.length > 0;
        const hasMeals = fetchedDonation.meals && fetchedDonation.meals.length > 0;
        const donationType = hasMeals && !hasProducts ? 'meals' : 'products';

        setDonation(fetchedDonation);
        setEditedDonation({
          title: fetchedDonation.title || "",
          location: fetchedDonation.location || "",
          expirationDate: fetchedDonation.expirationDate || "",
          type: fetchedDonation.type || "",
          category: fetchedDonation.category || "",
          description: fetchedDonation.description || "",
          products: hasProducts
            ? fetchedDonation.products.map(item => ({
                id: item.product?._id || item.product,
                name: item.product?.name || '',
                quantity: item.quantity || 0,
                totalQuantity: item.product?.totalQuantity || 0,
                status: item.product?.status || 'available',
                productDescription: item.product?.productDescription || 'Default description',
                productType: item.product?.productType || 'Other',
                weightPerUnit: item.product?.weightPerUnit || 0,
                weightUnit: item.product?.weightUnit || 'kg',
              }))
            : [],
          meals: hasMeals
            ? fetchedDonation.meals.map(item => ({
                id: item._id || item, // Just the ObjectId if not populated, or populated meal object
                mealName: item.mealName || 'Unnamed Meal',
                mealDescription: item.mealDescription || 'Default meal description',
                mealType: item.mealType || 'Other',
              }))
            : [],
          numberOfMeals: fetchedDonation.numberOfMeals || 0,
          donationType,
        });
        setDonationQuantities((hasProducts ? fetchedDonation.products : fetchedDonation.meals || []).map(() => 0));
        setRequestQuantities((hasProducts ? fetchedDonation.products : fetchedDonation.meals || []).map(() => 0));
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
    const invalidMeal = editedDonation.meals.find(
      (item) => !item.mealName?.trim() || !item.mealDescription?.trim() || !item.mealType?.trim()
    );
  
    if (editedDonation.donationType === 'products' && invalidProduct) {
      showAlert('error', 'Please fill in all required fields for products.');
      return;
    }
    if (editedDonation.donationType === 'meals' && invalidMeal) {
      showAlert('error', 'Please fill in all required fields for meals.');
      return;
    }
    if (editedDonation.donationType === 'meals' && editedDonation.category === 'prepared_meals' && (!editedDonation.meals.length || editedDonation.numberOfMeals < 1)) {
      showAlert('error', 'List of meals and a valid number of meals are required for prepared meals.');
      return;
    }
  
    if (new Date(editedDonation.expirationDate) <= new Date()) {
      showAlert('error', 'Expiration date must be in the future.');
      return;
    }
  
    const donationData = {
      ...editedDonation,
      products: editedDonation.donationType === 'products'
        ? editedDonation.products.map(item => ({
            product: item.id,
            quantity: Number(item.quantity) || 0,
          }))
        : [],
      meals: editedDonation.donationType === 'meals'
        ? editedDonation.meals.map(item => item.id)
        : [],
      numberOfMeals: editedDonation.donationType === 'meals' ? Number(editedDonation.numberOfMeals) || 0 : 0,
    };
  
    console.log('Sending update with data:', donationData);
  
    // Note: If you need to update/create meals, you'd need a separate API call here
    updateDonation(id, donationData)
      .then((response) => {
        console.log("Server response:", response.data);
        window.location.reload();
        setDonation(response.data);
        setIsEditing(false);
        showAlert('success', 'Donation updated successfully');
      })
      .catch((error) => {
        console.error("Error updating donation:", error.response?.data || error);
        showAlert('error', 'Failed to update donation: ' + (error.response?.data?.message || error.message));
      });
  };

  const handleProductChange = (index, field, value) => {
    const updatedProducts = [...editedDonation.products];
    if (field === 'quantity' || field === 'totalQuantity' || field === 'weightPerUnit') {
      value = Number(value);
    }
    updatedProducts[index] = { ...updatedProducts[index], [field]: value };
    setEditedDonation({ ...editedDonation, products: updatedProducts });
  };

  const handleMealChange = (index, field, value) => {
    const updatedMeals = [...editedDonation.meals];
    updatedMeals[index] = { ...updatedMeals[index], [field]: value };
    setEditedDonation({ ...editedDonation, meals: updatedMeals });
  };

  const handleDeleteProduct = async (index) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      const productToDelete = editedDonation.products[index];
      if (productToDelete.id) {
        try {
          await deleteProduct(productToDelete.id);
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

  const handleDeleteMeal = async (index) => {
    if (window.confirm("Are you sure you want to delete this meal?")) {
      const updatedMeals = editedDonation.meals.filter((_, i) => i !== index);
      setEditedDonation({ ...editedDonation, meals: updatedMeals });
    }
  };

  const handleAddProduct = () => {
    const newProduct = {
      id: null,
      name: '',
      quantity: 0,
      totalQuantity: 0,
      status: 'available',
      productDescription: 'New product description',
      productType: 'Other',
      weightPerUnit: 0,
      weightUnit: 'kg',
    };
    setEditedDonation({
      ...editedDonation,
      products: [...editedDonation.products, newProduct],
    });
  };

  const handleAddMeal = () => {
    const newMeal = {
      id: null,
      mealName: '',
      mealDescription: 'New meal description',
      mealType: 'Other',
    };
    setEditedDonation({
      ...editedDonation,
      meals: [...editedDonation.meals, newMeal],
    });
  };

  const handleDonationQuantityChange = (index, value) => {
    const newQuantities = [...donationQuantities];
    const maxQuantity = donation.products ? donation.products[index]?.quantity || 0 : 0; // Only for products
    newQuantities[index] = Math.min(Number(value), maxQuantity);
    setDonationQuantities(newQuantities);
  };

  const handleSubmitDonation = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const donationItems = donation.products?.map((item, index) => ({
        product: item.product?._id || item.product,
        quantity: Number(donationQuantities[index]) || 0,
      })).filter(p => p.quantity > 0) || [];

      const donationData = {
        ...editedDonation,
        products: donationItems,
        meals: editedDonation.donationType === 'meals' ? editedDonation.meals.map(item => item.id) : [],
        donor: user?._id || user?.id,
        expirationDate: donation.expirationDate || new Date().toISOString(),
      };

      const response = await updateDonation(id, donationData);
      setIsAddingDonation(false);
      setDonationQuantities(donation.products?.map(() => 0) || []);
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
      if (!token) throw new Error('No authentication token found');

      const donationItems = donation.products?.map(item => ({
        product: item.product?._id || item.product,
        quantity: Number(item.quantity) || 0,
      })) || [];

      const donationData = {
        ...editedDonation,
        products: donationItems,
        meals: editedDonation.donationType === 'meals' ? editedDonation.meals.map(item => item.id) : [],
        donor: user?._id || user?.id,
        expirationDate: donation.expirationDate || new Date().toISOString(),
      };

      const response = await updateDonation(id, donationData);
      setIsAddingDonation(false);
      setDonation(response.data);
      showAlert('success', 'Donated all items successfully');
    } catch (error) {
      console.error('Error donating all:', error);
      showAlert('error', `Failed to donate all: ${error.message || 'Unknown error'}`);
    }
  };

  const handleRequestQuantityChange = (index, value) => {
    const newQuantities = [...requestQuantities];
    const maxQuantity = donation.products ? donation.products[index]?.quantity || 0 : 0; // Only for products
    newQuantities[index] = Math.min(Number(value), maxQuantity);
    setRequestQuantities(newQuantities);
  };

  const handleSubmitRequest = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const requestedItems = donation.products?.map((item, index) => ({
        product: item.product?._id || item.product,
        quantity: Number(requestQuantities[index]) || 0,
      })).filter(p => p.quantity > 0) || [];

      const requestData = {
        donation: id,
        requestedProducts: editedDonation.donationType === 'products' ? requestedItems : [],
        requestedMeals: editedDonation.donationType === 'meals' ? editedDonation.meals.map(item => ({ meal: item.id })) : [],
        recipientId: user?._id || user?.id,
        expirationDate: donation.expirationDate || new Date().toISOString(),
      };

      const response = await createRequestNeedForExistingDonation(id, requestData);
      setIsAddingRequest(false);
      setRequestQuantities(donation.products?.map(() => 0) || []);
      showAlert('success', 'Request submitted successfully');
    } catch (error) {
      console.error('Error submitting request:', error);
      showAlert('error', `Failed to submit request: ${error.message || 'Unknown error'}`);
    }
  };

  const handleRequestAll = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const requestedItems = donation.products?.map(item => ({
        product: item.product?._id || item.product,
        quantity: Number(item.quantity) || 0,
      })) || [];

      const requestData = {
        donation: id,
        requestedProducts: editedDonation.donationType === 'products' ? requestedItems : [],
        requestedMeals: editedDonation.donationType === 'meals' ? editedDonation.meals.map(item => ({ meal: item.id })) : [],
        recipientId: user?._id || user?.id,
        expirationDate: donation.expirationDate || new Date().toISOString(),
      };

      const response = await createRequestNeedForExistingDonation(id, requestData);
      setIsAddingRequest(false);
      setRequestQuantities(donation.products?.map(() => 0) || []);
      showAlert('success', 'Requested all items successfully');
    } catch (error) {
      console.error('Error requesting all:', error);
      showAlert('error', `Failed to request all: ${error.message || 'Unknown error'}`);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!donation) return <div>No donation found.</div>;

  const { title, location, expirationDate, products, meals } = donation;

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
                  <FaEdit className="fa-edit" onClick={() => setIsEditing(true)} />
                )}
              </div>
            )}
          </div>

          <p><strong>📍 Location:</strong> {isEditing ? <input type="text" value={editedDonation.location} onChange={(e) => setEditedDonation({ ...editedDonation, location: e.target.value })} placeholder="📍 Location" /> : location || "Unknown location"}</p>
          <p><strong>📆 Expiration Date:</strong> {isEditing ? <input type="date" value={editedDonation.expirationDate ? new Date(editedDonation.expirationDate).toISOString().split('T')[0] : ''} onChange={(e) => setEditedDonation({ ...editedDonation, expirationDate: e.target.value })} /> : expirationDate ? new Date(expirationDate).toLocaleDateString() : "Not set"}</p>
      
          {editedDonation.donationType === 'meals' && isEditing && editedDonation.category === 'prepared_meals' && (
            <p>
              <strong>🔢 Number of Meals:</strong>
              <input
                type="number"
                min="1"
                value={editedDonation.numberOfMeals}
                onChange={(e) => setEditedDonation({ ...editedDonation, numberOfMeals: Number(e.target.value) })}
                placeholder="Number of Meals"
                style={{ marginLeft: "10px", width: "100px" }}
              />
            </p>
          )}

          {editedDonation.donationType === 'products' ? (
            <>
              <h4>📦 Products:</h4>
              <ul className="donation-ul">
                {isEditing ? (
                  editedDonation.products.map((product, index) => (
                    <li key={index} style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
                      <input type="text" value={product.name} onChange={(e) => handleProductChange(index, 'name', e.target.value)} placeholder="🔖 Product Name" />
                      <input type="text" value={product.productDescription} onChange={(e) => handleProductChange(index, 'productDescription', e.target.value)} placeholder="📝 Description" style={{ marginLeft: "10px" }} />
                      <input type="number" value={product.quantity} onChange={(e) => handleProductChange(index, 'quantity', e.target.value)} placeholder="🔢 Quantity" style={{ marginLeft: "10px" }} />
                      <input type="number" value={product.weightPerUnit} onChange={(e) => handleProductChange(index, 'weightPerUnit', e.target.value)} placeholder="⚖️ Weight" style={{ marginLeft: "10px" }} />
                      <select value={product.weightUnit} onChange={(e) => handleProductChange(index, 'weightUnit', e.target.value)} style={{ marginLeft: "10px", padding: "8px", borderRadius: "5px" }}>
                        <option value="kg">kg</option>
                        <option value="g">g</option>
                        <option value="lb">lb</option>
                        <option value="oz">oz</option>
                      </select>
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
                        <span><strong>🔖 Name:</strong> {product.product?.name || 'Not specified'}</span> <br />
                        <span><strong>📝 Description:</strong> {product.product?.productDescription || 'None'}</span> <br />
                        <span><strong>🔢 Quantity:</strong> {product.quantity || 0}</span> <br />
                        <span><strong>⚖️ Weight:</strong> {product.product?.weightPerUnit || 0} {product.product?.weightUnit || 'kg'}</span> <br />
                        <span><strong>🔄 Status:</strong> {product.product?.status || 'Unknown'}</span>
                      </li>
                    ))
                  ) : (
                    <li className="donation-li-list">No products available</li>
                  )
                )}
              </ul>
            </>
          ) : (
            <>
              <h4>🍽️ Meals:</h4>
              <ul className="donation-ul">
                {isEditing ? (
                  editedDonation.meals.map((meal, index) => (
                    <li key={index} style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
                      <input type="text" value={meal.mealName} onChange={(e) => handleMealChange(index, 'mealName', e.target.value)} placeholder="🍽️ Meal Name" />
                      <input type="text" value={meal.mealDescription} onChange={(e) => handleMealChange(index, 'mealDescription', e.target.value)} placeholder="📝 Description" style={{ marginLeft: "10px" }} />
                      <select value={meal.mealType} onChange={(e) => handleMealChange(index, 'mealType', e.target.value)} style={{ marginLeft: "10px", padding: "8px", borderRadius: "5px" }}>
                        <option value="Breakfast">Breakfast</option>
                        <option value="Lunch">Lunch</option>
                        <option value="Dinner">Dinner</option>
                        <option value="Snack">Snack</option>
                        <option value="Other">Other</option>
                      </select>
                      <FaTimes onClick={() => handleDeleteMeal(index)} style={{ color: "red", cursor: "pointer", marginLeft: "10px" }} />
                    </li>
                  ))
                ) : (
                  meals && meals.length > 0 ? (
                    meals.map((meal, index) => (
                      <li className="donation-li-list" key={index}>
                        <span><strong>🍽️ Name:</strong> {meal.mealName || 'Not specified'}</span> <br />
                        <span><strong>📝 Description:</strong> {meal.mealDescription || 'None'}</span> <br />
                        <span><strong>🍴 Type:</strong> {meal.mealType || 'Unknown'}</span>
                      </li>
                    ))
                  ) : (
                    <li className="donation-li-list">No meals available</li>
                  )
                )}
              </ul>
            </>
          )}

          {isAddingDonation && editedDonation.donationType === 'products' && (
            <DonationForm>
              <h4>Update Donation Quantities</h4>
              {donation.products.map((item, index) => (
                <div key={index}>
                  <label>
                    {item.product?.name} - {item.product?.productDescription} (Max: {item.quantity})
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={item.quantity}
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

          {isAddingRequest && editedDonation.donationType === 'products' && (
            <DonationForm>
              <h4>Specify the Request</h4>
              {donation.products.map((item, index) => (
                <div key={index}>
                  <label>
                    {item.product?.name} - {item.product?.productDescription} (Max: {item.quantity})
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={item.quantity}
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
            <Button variant="submit" as={Link} to={`/ListDonationsRequest/${id}`}>
              👀 See Requests
            </Button>
          )}

          {!isTheOwner && isRecipient && (
            <Button
              variant={isAddingRequest ? "cancel" : "add"}
              onClick={() => setIsAddingRequest(!isAddingRequest)}
            >
              {isAddingRequest ? 'Cancel' : 'Add Request'}
            </Button>
          )}

          {isEditing && (
            <Button variant="add" onClick={editedDonation.donationType === 'products' ? handleAddProduct : handleAddMeal}>
              ➕ Add {editedDonation.donationType === 'products' ? 'Product' : 'Meal'}
            </Button>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default DetailsDonations;