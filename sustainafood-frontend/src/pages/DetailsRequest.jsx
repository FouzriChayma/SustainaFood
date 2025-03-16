import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../assets/styles/Composantdonation.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getRequestById, deleteRequest, updateRequest } from '../api/requestNeedsService';
import { FaEdit, FaTrash, FaSave, FaTimes } from "react-icons/fa";
import styled from 'styled-components';
import logo from "../assets/images/LogoCh.png";

const Button = styled.button`
  display: inline-block;
  padding: 10px 16px;
  font-size: 16px;
  font-weight: bold;
  text-align: center;
  border-radius: 30px;
  background: #228b22;
  color: white;
  border: none;
  cursor: pointer;
  transition: background 0.3s ease-in-out;
  margin: 10px 5px;

  &:hover {
    background: #1e7a1e;
  }
`;


const DetailsRequest = () => {
  const { id } = useParams();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
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

  // Define dropdown options
  const weightUnits = ['kg', 'g', 'lb', 'oz'];
  const statuses = ['available', 'pending', 'reserved'];

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
          requestedProducts: fetchedRequest.requestedProducts || [],
          numberOfMeals: fetchedRequest.numberOfMeals || ""
        });
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
        console.log("Request successfully deleted");
        window.history.back();
      })
      .catch((error) => {
        console.error("Error deleting request:", error);
      });
  };

  const handleSaveRequest = () => {
    console.log('Sending update with data:', editedRequest);
    updateRequest(id, editedRequest)
      .then((response) => {
        console.log("Server response:", response.data);
        setRequest(response.data.updatedRequest);
        setIsEditing(false);
      })
      .catch((error) => {
        console.error("Error updating request:", error.response?.data || error);
      });
  };

  const handleProductChange = (index, field, value) => {
    const updatedProducts = [...editedRequest.requestedProducts];
    if (field === 'totalQuantity' || field === 'weightPerUnit') {
      value = Number(value); // Ensure numeric fields are numbers
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
      status: 'available' // Default status
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
        <img src={logo} alt="Logo" className="adddonation-logo" style={{marginLeft: "47%"}} />

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

          <p>
            <strong>📍 Location:</strong>{" "}
            {isEditing ? (
              <input
                type="text"
                value={editedRequest.location}
                onChange={(e) => setEditedRequest({ ...editedRequest, location: e.target.value })}
                placeholder="📍 Location"
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
                  editedRequest.expirationDate
                    ? new Date(editedRequest.expirationDate).toISOString().split('T')[0]
                    : ''
                }
                onChange={(e) => setEditedRequest({ ...editedRequest, expirationDate: e.target.value })}
              />
            ) : (
              expirationDate ? new Date(expirationDate).toLocaleDateString() : "Not set"
            )}
          </p>
          <p>
            <strong>📝 Description:</strong>{" "}
            {isEditing ? (
              <textarea
                value={editedRequest.description}
                onChange={(e) => setEditedRequest({ ...editedRequest, description: e.target.value })}
                placeholder="📝 Description"
              />
            ) : (
              description || "No description"
            )}
          </p>
          <p>
            <strong>📂 Category:</strong>{" "}
            {isEditing ? (
              <input
                type="text"
                value={editedRequest.category}
                onChange={(e) => setEditedRequest({ ...editedRequest, category: e.target.value })}
                placeholder="📂 Category"
              />
            ) : (
              category || "Not specified"
            )}
          </p>
          <p>
            <strong>🔄 Status:</strong>{" "}
            {isEditing ? (
              <input
                type="text"
                value={editedRequest.status}
                onChange={(e) => setEditedRequest({ ...editedRequest, status: e.target.value })}
                placeholder="🔄 Status"
              />
            ) : (
              status || "Unknown"
            )}
          </p>
          {category === 'prepared_meals' && (
            <p>
              <strong>🍽️ Number of Meals:</strong>{" "}
              {isEditing ? (
                <input
                  type="number"
                  value={editedRequest.numberOfMeals}
                  onChange={(e) => setEditedRequest({ ...editedRequest, numberOfMeals: e.target.value })}
                  placeholder="🍽️ Number of Meals"
                />
              ) : (
                numberOfMeals || "Not specified"
              )}
            </p>
          )}

          <h4>📦 Requested Products:</h4>
          <ul className="donation-ul">
            {isEditing ? (
              editedRequest.requestedProducts.map((product, index) => (
                <li key={index} style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
                  <input
                    type="text"
                    value={product.productType}
                    onChange={(e) => handleProductChange(index, 'productType', e.target.value)}
                    placeholder="🔖 Product Type"
                  />
                  <input
                    type="text"
                    value={product.productDescription}
                    onChange={(e) => handleProductChange(index, 'productDescription', e.target.value)}
                    placeholder="📝 Product Description"
                    style={{ marginLeft: "10px" }}
                  />
                  <input
                    type="number"
                    value={product.weightPerUnit}
                    onChange={(e) => handleProductChange(index, 'weightPerUnit', e.target.value)}
                    placeholder="⚖️ Weight per Unit"
                    style={{ marginLeft: "10px" }}
                  />
                  <select
                    value={product.weightUnit}
                    onChange={(e) => handleProductChange(index, 'weightUnit', e.target.value)}
                    style={{ marginLeft: "10px", padding: "8px", borderRadius: "5px" }}
                  >
                    <option value="">📏 Select Weight Unit</option>
                    {weightUnits.map((unit) => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={product.totalQuantity}
                    onChange={(e) => handleProductChange(index, 'totalQuantity', e.target.value)}
                    placeholder="🔢 Total Quantity"
                    style={{ marginLeft: "10px" }}
                  />
                   <select
                    value={product.weightUnitTotale}
                    onChange={(e) => handleProductChange(index, 'weightUnitTotale', e.target.value)}
                    style={{ marginLeft: "10px", padding: "8px", borderRadius: "5px" }}
                  >
                    <option value="">📏 Select Weight Unit Totale</option>
                    {weightUnits.map((unit) => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
               
                  <select
                    value={product.status}
                    onChange={(e) => handleProductChange(index, 'status', e.target.value)}
                    style={{ marginLeft: "10px", padding: "8px", borderRadius: "5px" }}
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                  <FaTimes
                    onClick={() => handleDeleteProduct(index)}
                    style={{ color: "red", cursor: "pointer", marginLeft: "10px" }}
                  />
                </li>
              ))
            ) : (
              requestedProducts && requestedProducts.length > 0 ? (
                requestedProducts.map((product, index) => (
                  <li className="donation-li-list" key={index}>
                    <span><strong>🔖 Type:</strong> {product.productType || 'Not specified'}</span> <br />
                    <span><strong>📝 Description:</strong> {product.productDescription || 'None'}</span> <br />
                    <span>
                      <strong>⚖️ Weight:</strong> {product.weightPerUnit || 0} {product.weightUnit || ''}
                    </span> <br />
                    <span>
                      <strong>🔢 Total Quantity:</strong> {product.totalQuantity || 0} {product.weightUnitTotale || ''}
                    </span> <br />
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

         

          <Button onClick={() => window.history.back()}>🔙 Go Back</Button>

          {!isTheOwner && <Button className="btnseelist">Add Request</Button>}
          {isTheOwner && !isEditing && (
            <button className="add-product-btn">👀 View Request</button>
          )}
           {isEditing && (
            <button
              onClick={handleAddProduct}
             className='add-product-btn'
            >
             ➕ Add Product
            </button>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default DetailsRequest;