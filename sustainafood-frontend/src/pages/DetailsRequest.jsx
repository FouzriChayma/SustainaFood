import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../assets/styles/Composantdonation.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getRequestById, deleteRequest, updateRequest, addDonationToRequest } from '../api/requestNeedsService';
import { FaEdit, FaTrash, FaSave, FaTimes, FaEye } from "react-icons/fa";
import styled from 'styled-components';
import logo from "../assets/images/LogoCh.png";
import { useNavigate } from "react-router-dom";
import { useAlert } from '../contexts/AlertContext';
import Papa from "papaparse";

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
    &:hover { background: #1e7b1e; transform: translateY(-2px); }
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
    &:hover { background: #1e7b1e; transform: translateY(-2px); }
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

  input, select, textarea {
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

  .manual-meal-row {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 10px;
    align-items: center;
  }

  .manual-meal-row > * {
    flex: 1;
    min-width: 200px;
  }

  .error-message {
    color: red;
    font-size: 14px;
    margin-top: 5px;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 10px;
  }

  th, td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
  }

  th {
    background-color: #f2f2f2;
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
  const [userid, setUserid] = useState("");
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
  const [donationMeals, setDonationMeals] = useState([]);
  const [manualDonationMeals, setManualDonationMeals] = useState([{
    mealName: "",
    mealDescription: "",
    mealType: "Lunch",
    quantity: ""
  }]);
  const [mealsEntryMode, setMealsEntryMode] = useState("csv");
  const [donationErrors, setDonationErrors] = useState({});
  const [editableRow, setEditableRow] = useState(null);
  const [editedMeal, setEditedMeal] = useState({});
  const mealsFileInputRef = useRef(null);

  const weightUnits = ['kg', 'g', 'lb', 'oz'];
  const statuses = ['available', 'pending', 'reserved'];
  const mealTypes = ["Breakfast", "Lunch", "Dinner", "Snack", "Dessert", "Other"];
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  useEffect(() => {
    if (user) {
      setUserid(user._id || user.id);
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
      setIsTheOwner(userid === (request.recipient?._id || request.recipient));
    }
  }, [request, userid]);

  useEffect(() => {
    if (request?.category === "prepared_meals" && mealsEntryMode === "form") {
      const total = manualDonationMeals.reduce((sum, meal) => sum + (parseInt(meal.quantity) || 0), 0);
      setEditedRequest(prev => ({ ...prev, numberOfMeals: total || "" }));
    }
  }, [manualDonationMeals, mealsEntryMode, request?.category]);

  const handleDeleteRequest = () => {
    deleteRequest(id)
      .then(() => {
        showAlert('success', 'Request successfully deleted');
        navigate('/ListOfDonations');
      })
      .catch((error) => {
        console.error("Error deleting request:", error);
        showAlert('error', 'Failed to delete request');
      });
  };

  const handleSaveRequest = () => {
    updateRequest(id, editedRequest)
      .then((response) => {
        setRequest(response.data.updatedRequest);
        setIsEditing(false);
        showAlert('success', 'Request updated successfully');
      })
      .catch((error) => {
        console.error("Error updating request:", error);
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
    const maxQty = request.requestedProducts[index].totalQuantity;
    const newQuantities = [...donationQuantities];
    newQuantities[index] = Math.min(Number(value) || 0, maxQty);
    setDonationQuantities(newQuantities);
  };

  const handleFileUploadMeals = (event) => {
    const file = event.target.files[0];
    if (file) {
      Papa.parse(file, {
        complete: (result) => {
          const parsedMeals = result.data.map(meal => ({
            mealName: meal.mealName,
            mealDescription: meal.mealDescription,
            mealType: meal.mealType,
            quantity: parseInt(meal.quantity) || 0
          }));
          setDonationMeals(parsedMeals);
          const total = parsedMeals.reduce((sum, meal) => sum + (meal.quantity || 0), 0);
          setEditedRequest(prev => ({ ...prev, numberOfMeals: total || "" }));
          showAlert("success", "Meals uploaded successfully.");
        },
        header: true,
        skipEmptyLines: true,
      });
    }
  };

  const handleManualMealChange = (index, field, value) => {
    const updated = [...manualDonationMeals];
    updated[index][field] = field === "quantity" ? parseInt(value) || "" : value;
    setManualDonationMeals(updated);
  };

  const handleAddManualMeal = () => {
    setManualDonationMeals([...manualDonationMeals, {
      mealName: "",
      mealDescription: "",
      mealType: "Lunch",
      quantity: ""
    }]);
    showAlert("success", "New meal entry added.");
  };

  const handleRemoveManualMeal = (index) => {
    setManualDonationMeals(manualDonationMeals.filter((_, i) => i !== index));
    showAlert("success", "Manual meal removed.");
  };

  const handleEditMealRow = (index) => {
    setEditableRow(index);
    setEditedMeal({ ...donationMeals[index] });
  };

  const handleMealRowChange = (e, field) => {
    setEditedMeal(prev => ({ ...prev, [field]: field === "quantity" ? parseInt(e.target.value) || 0 : e.target.value }));
  };

  const handleSaveMealRow = (index) => {
    const updatedMeals = [...donationMeals];
    updatedMeals[index] = editedMeal;
    setDonationMeals(updatedMeals);
    const total = updatedMeals.reduce((sum, meal) => sum + (meal.quantity || 0), 0);
    setEditedRequest(prev => ({ ...prev, numberOfMeals: total || "" }));
    setEditableRow(null);
    setEditedMeal({});
    showAlert("success", "Meal updated successfully.");
  };

  const handleDeleteMealRow = (index) => {
    const updatedMeals = donationMeals.filter((_, i) => i !== index);
    setDonationMeals(updatedMeals);
    const total = updatedMeals.reduce((sum, meal) => sum + (meal.quantity || 0), 0);
    setEditedRequest(prev => ({ ...prev, numberOfMeals: total || "" }));
    showAlert("success", "Meal removed from list.");
  };

  const validateDonation = () => {
    let tempErrors = {};
    if (request.category === "prepared_meals") {
      const totalMeals = mealsEntryMode === "form"
        ? manualDonationMeals.reduce((sum, meal) => sum + (parseInt(meal.quantity) || 0), 0)
        : donationMeals.reduce((sum, meal) => sum + (meal.quantity || 0), 0);
      
      if (mealsEntryMode === "csv" && donationMeals.length === 0) {
        tempErrors.meals = "Please upload a CSV file with meals";
      } else if (mealsEntryMode === "form") {
        const invalidMeals = manualDonationMeals.filter(
          meal => !meal.mealName.trim() || !meal.mealType || !meal.mealDescription.trim() || !meal.quantity || meal.quantity <= 0
        );
        if (invalidMeals.length > 0) {
          tempErrors.meals = "All meals must have a name, type, description, and valid quantity";
        }
      }
      if (!totalMeals || totalMeals <= 0) {
        tempErrors.numberOfMeals = "Total number of meals must be greater than 0";
      } else if (totalMeals > request.numberOfMeals) {
        tempErrors.numberOfMeals = `Total number of meals (${totalMeals}) exceeds requested amount (${request.numberOfMeals})`;
      }
    } else if (request.category === "packaged_products") {
      const hasValidQuantity = donationQuantities.some(qty => qty > 0);
      if (!hasValidQuantity) {
        tempErrors.products = "Please specify at least one product quantity to donate";
      }
      donationQuantities.forEach((qty, index) => {
        if (qty > request.requestedProducts[index].totalQuantity) {
          tempErrors[`product_${index}`] = `Quantity (${qty}) exceeds requested amount (${request.requestedProducts[index].totalQuantity}) for ${request.requestedProducts[index].productType}`;
        }
      });
    }
    setDonationErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmitDonation = async () => {
    if (!validateDonation()) return;

    try {
      const donationData = {
        donor: userid,
        expirationDate: request.expirationDate || new Date().toISOString(),
      };

      if (request.category === "packaged_products") {
        const donationProducts = request.requestedProducts.map((product, index) => ({
          product: product._id ? product._id.toString() : null,
          quantity: Number(donationQuantities[index]) || 0,
        })).filter(p => p.quantity > 0);
        donationData.products = donationProducts;
      } else if (request.category === "prepared_meals") {
        const mealsToSend = mealsEntryMode === "form" ? manualDonationMeals : donationMeals;
        const formattedMeals = mealsToSend.map(meal => ({
          mealName: meal.mealName,
          mealDescription: meal.mealDescription,
          mealType: meal.mealType,
          quantity: parseInt(meal.quantity),
        }));
        donationData.meals = formattedMeals;
        donationData.numberOfMeals = mealsEntryMode === "form"
          ? manualDonationMeals.reduce((sum, meal) => sum + (parseInt(meal.quantity) || 0), 0)
          : donationMeals.reduce((sum, meal) => sum + (meal.quantity || 0), 0);
      }

      const response = await addDonationToRequest(id, donationData);
      setIsAddingDonation(false);
      setDonationQuantities(request.requestedProducts.map(() => 0));
      setDonationMeals([]);
      setManualDonationMeals([{
        mealName: "",
        mealDescription: "",
        mealType: "Lunch",
        quantity: ""
      }]);
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
    if (request.category === "prepared_meals") {
      showAlert('error', 'Cannot use "Donate all" for prepared meals. Please specify meals manually.');
      return;
    }

    try {
      const donationProducts = request.requestedProducts.map((product) => ({
        product: product._id ? product._id.toString() : null,
        quantity: Number(product.totalQuantity) || 0,
      }));

      const donationData = {
        products: donationProducts,
        donor: userid,
        expirationDate: request.expirationDate || new Date().toISOString(),
      };

      const response = await addDonationToRequest(id, donationData);
      setIsAddingDonation(false);
      setRequest(prev => ({
        ...prev,
        donations: [...(prev.donations || []), response.donation],
      }));
      showAlert('success', 'Donated all products successfully');
    } catch (error) {
      console.error('Error donating all:', error);
      showAlert('error', `Failed to donate all: ${error.message || 'Unknown error'}`);
    }
  };

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
              {request.category === "packaged_products" && requestedProducts.map((product, index) => (
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
                  {donationErrors[`product_${index}`] && <p className="error-message">{donationErrors[`product_${index}`]}</p>}
                </div>
              ))}
              {request.category === "prepared_meals" && (
                <>
                  <div>
                    <label>Total Number of Meals (Requested: {request.numberOfMeals})</label>
                    <input
                      type="number"
                      value={editedRequest.numberOfMeals}
                      readOnly
                    />
                    {donationErrors.numberOfMeals && <p className="error-message">{donationErrors.numberOfMeals}</p>}
                  </div>
                  <div className="radio-buttons-container-adddonation"> 
  <div className="radio-button-adddonation">
    <input
      name="radio-group-meals"
      id="radio-csv-meals"
      className="radio-button__input-adddonation"
      type="radio"
      checked={mealsEntryMode === "csv"}
      onChange={() => setMealsEntryMode("csv")}
    />
    <label htmlFor="radio-csv-meals" className="radio-button__label-adddonation">
      <span className="radio-button__custom-adddonation"></span>CSV File
    </label>
  </div>
  <div className="radio-button-adddonation">
    <input
      name="radio-group-meals"
      id="radio-form-meals"
      className="radio-button__input-adddonation"
      type="radio"
      checked={mealsEntryMode === "form"}
      onChange={() => setMealsEntryMode("form")}
    />
    <label htmlFor="radio-form-meals" className="radio-button__label-adddonation">
      <span className="radio-button__custom-adddonation"></span>Form
    </label>
  </div>
</div>

                  {mealsEntryMode === "csv" && donationMeals.length === 0 && (
                    <>
                      <input
                        ref={mealsFileInputRef}
                        type="file"
                        accept=".csv"
                        onChange={handleFileUploadMeals}
                        style={{ display: "none" }}
                      />
                      <Button
                        variant="add"
                        onClick={() => mealsFileInputRef.current.click()}
                      >
                        Upload List of Meals
                      </Button>
                    </>
                  )}
                  {mealsEntryMode === "csv" && donationMeals.length > 0 && (
                    <>
                      <p style={{ color: "#8dc73f" }}>List of Meals Uploaded</p>
                      <table className="meals-table">
                        <thead>
                          <tr>
                            <th>Meal Name</th>
                            <th>Description</th>
                            <th>Type</th>
                            <th>Quantity</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {donationMeals.map((meal, index) => (
                            <tr key={index}>
                              {editableRow === index ? (
                                <>
                                  <td><input value={editedMeal.mealName || ""} onChange={(e) => handleMealRowChange(e, "mealName")} /></td>
                                  <td><input value={editedMeal.mealDescription || ""} onChange={(e) => handleMealRowChange(e, "mealDescription")} /></td>
                                  <td>
                                    <select value={editedMeal.mealType || ""} onChange={(e) => handleMealRowChange(e, "mealType")}>
                                      {mealTypes.map(type => <option key={type} value={type}>{type}</option>)}
                                    </select>
                                  </td>
                                  <td><input type="number" min="1" value={editedMeal.quantity || ""} onChange={(e) => handleMealRowChange(e, "quantity")} /></td>
                                  <td>
                                    <FaSave onClick={() => handleSaveMealRow(index)} style={{ cursor: "pointer", marginRight: "10px" }} />
                                    <FaTimes onClick={() => setEditableRow(null)} style={{ cursor: "pointer" }} />
                                  </td>
                                </>
                              ) : (
                                <>
                                  <td>{meal.mealName}</td>
                                  <td>{meal.mealDescription}</td>
                                  <td>{meal.mealType}</td>
                                  <td>{meal.quantity}</td>
                                  <td>
                                    <FaEdit onClick={() => handleEditMealRow(index)} style={{ cursor: "pointer", marginRight: "10px" }} />
                                    <FaTrash onClick={() => handleDeleteMealRow(index)} style={{ cursor: "pointer", color: "red" }} />
                                  </td>
                                </>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </>
                  )}
                  {mealsEntryMode === "form" && (
                    <div className="manual-meal-entry">
                      {manualDonationMeals.map((meal, index) => (
                        <div key={index} className="manual-meal-row">
                          <input
                            type="text"
                            placeholder="Meal Name"
                            value={meal.mealName}
                            onChange={(e) => handleManualMealChange(index, "mealName", e.target.value)}
                          />
                          <textarea
                            placeholder="Meal Description"
                            value={meal.mealDescription}
                            onChange={(e) => handleManualMealChange(index, "mealDescription", e.target.value)}
                          />
                          <select
                            value={meal.mealType}
                            onChange={(e) => handleManualMealChange(index, "mealType", e.target.value)}
                          >
                            {mealTypes.map(type => <option key={type} value={type}>{type}</option>)}
                          </select>
                          <input
                            type="number"
                            placeholder="Quantity"
                            value={meal.quantity}
                            onChange={(e) => handleManualMealChange(index, "quantity", e.target.value)}
                            min="1"
                          />
                          {manualDonationMeals.length > 1 && (
                            <Button
                              variant="cancel"
                              onClick={() => handleRemoveManualMeal(index)}
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        variant="add"
                        onClick={handleAddManualMeal}
                      >
                        Add Another Meal
                      </Button>
                    </div>
                  )}
                  {donationErrors.meals && <p className="error-message">{donationErrors.meals}</p>}
                </>
              )}
              {request.category === "packaged_products" && (
                <Button variant="donate" onClick={handleDonateAll}>Donate all</Button>
              )}
              <Button variant="donate" onClick={handleSubmitDonation}>Submit donation</Button>
            </DonationForm>
          )}

          <Button variant="back" onClick={() => navigate('/ListOfDonations')}>🔙 Go Back</Button>

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
              as={Link}
              to={`/ListDonationsRequest/${id}`}
              style={{ textDecoration: 'none' }}
            >
              👀 View Request
            </Button>
          )}
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