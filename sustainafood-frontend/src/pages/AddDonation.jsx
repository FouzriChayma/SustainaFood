import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../assets/styles/AddDonation.css";
import logo from "../assets/images/LogoCh.png";
import Papa from "papaparse";
import { FaEdit, FaTrash, FaSave } from "react-icons/fa";
import { addDonation } from "../api/donationService";

export const AddDonation = () => {
  const userid = localStorage.getItem("user_id");
  const [error, setError] = useState(null);
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [type, setType] = useState("donation"); // Fixed variable name from Type to type
  const [category, setCategory] = useState("Prepared_Meals"); // Fixed variable name from Category to category
  const [description, setDescription] = useState("");
  const [delivery, setDelivery] = useState("pickup"); // Fixed variable name from Delivery to delivery
  const [errors, setErrors] = useState({});
  const [products, setProducts] = useState([]);
  const [editableRow, setEditableRow] = useState(null); // Tracks the row being edited
  const [editedProduct, setEditedProduct] = useState({}); // Tracks the edited values for the row
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Handle CSV File Upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      Papa.parse(file, {
        complete: (result) => {
          setProducts(result.data);
        },
        header: true,
        skipEmptyLines: true,
      });
    }
  };

  // Validate the form
  const validateForm = () => {
    let tempErrors = {};

    if (!title.trim()) tempErrors.title = "Title is required";
    else if (title.length < 3) tempErrors.title = "Title must be at least 3 characters long";

    if (!location.trim()) tempErrors.location = "Location is required";
    else if (location.length < 3) tempErrors.location = "Location must be at least 3 characters long";

    if (!expirationDate) tempErrors.expirationDate = "Expiration date is required";
    else {
      const today = new Date();
      const expDate = new Date(expirationDate);
      if (expDate < today) tempErrors.expirationDate = "Expiration date cannot be in the past";
    }

    if (!description.trim()) tempErrors.description = "Description is required";
    else if (description.length < 10) tempErrors.description = "Description must be at least 10 characters long";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  // Handle Edit Button Click
  const handleEditRow = (index) => {
    setEditableRow(index);
    setEditedProduct({ ...products[index] }); // Copy the current row's data to edit
  };

  // Handle Input Changes in Editable Row
  const handleRowInputChange = (e, key) => {
    setEditedProduct((prev) => ({
      ...prev,
      [key]: e.target.value,
    }));
  };

  // Handle Save Button Click
  const handleSaveRow = (index) => {
    const updatedProducts = [...products];
    updatedProducts[index] = editedProduct; // Update the row with edited data
    setProducts(updatedProducts);
    setEditableRow(null); // Exit edit mode
    setEditedProduct({}); // Reset edited product state
  };

  // Handle Delete Row
  const handleDeleteRow = (index) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  // Handle Delete Entire List
  const handleDeleteList = () => {
    setProducts([]);
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    const donationData = new FormData();
    donationData.append("title", title);
    donationData.append("location", location);
    donationData.append("expirationDate", expirationDate);
    donationData.append("type", type); // Fixed variable name
    donationData.append("category", category); // Fixed variable name
    donationData.append("description", description);
    donationData.append("user", userid);
    donationData.append("delivery", delivery); // Fixed variable name
    donationData.append("status", "pending");
    donationData.append("created_at", new Date().toISOString());
    donationData.append("updated_at", new Date().toISOString());

    if (products.length) {
      donationData.append("products", JSON.stringify(products));
    }

    try {
      const response = await addDonation(donationData);
      console.log("Donation created successfully:", response.data);
      navigate("/ListOfDonations");
    } catch (err) {
      console.error("Error creating donation:", err);
      setError(err.response?.data?.message || "An error occurred while creating the donation.");
    }
  };

  return (
    <>
      <Navbar />
      <div className="add-donation">
        <form className="signup-form" onSubmit={handleSubmit}>
          <img src={logo} alt="Logo" className="adddonation-logo" />
          <h1 className="signup-h1">Add Donation</h1>

          <input
            className="signup-input"
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          {errors.title && <p className="error-message">{errors.title}</p>}
          <input
            className="signup-input"
            type="text"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
          {errors.location && <p className="error-message">{errors.location}</p>}
          <input
            className="signup-input"
            type="date"
            placeholder="Expiration Date"
            value={expirationDate}
            onChange={(e) => setExpirationDate(e.target.value)}
            required
          />
          {errors.expirationDate && <p className="error-message">{errors.expirationDate}</p>}
          <select className="signup-input" value={type} onChange={(e) => setType(e.target.value)} required>
            <option value="donation">Donation</option>
            <option value="request">Request</option>
          </select>
          <select className="signup-input" value={category} onChange={(e) => setCategory(e.target.value)} required>
            <option value="Prepared_Meals">Prepared Meals</option>
            <option value="Packaged_Products">Packaged Products</option>
          </select>
          <select className="signup-input" value={delivery} onChange={(e) => setDelivery(e.target.value)} required>
            <option value="pickup">Pickup</option>
            <option value="same_day">Same Day</option>
            <option value="standard">Standard</option>
            <option value="overnight">Overnight</option>
            <option value="express">Express</option>
          </select>
          <textarea
            className="signup-input"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          {errors.description && <p className="error-message">{errors.description}</p>}

          {/* File Upload */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            style={{ display: "none" }}
          />

          {/* Upload or Modify/Delete Buttons */}
          {products.length === 0 ? (
            <button type="button" className="container-btn-file" onClick={() => fileInputRef.current.click()}>
              <svg fill="#fff" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 50 50">
                <path d="M28.8125 .03125L.8125 5.34375C.339844 5.433594 0 5.863281 0 6.34375L0 43.65625C0 44.136719 .339844 44.566406 .8125 44.65625L28.8125 49.96875C28.875 49.980469 28.9375 50 29 50C29.230469 50 29.445313 49.929688 29.625 49.78125C29.855469 49.589844 30 49.296875 30 49L30 1C30 .703125 29.855469 .410156 29.625 .21875C29.394531 .0273438 29.105469 -.0234375 28.8125 .03125ZM32 6L32 13L34 13L34 15L32 15L32 20L34 20L34 22L32 22L32 27L34 27L34 29L32 29L32 35L34 35L34 37L32 37L32 44L47 44C48.101563 44 49 43.101563 49 42L49 8C49 6.898438 48.101563 6 47 6ZM36 13L44 13L44 15L36 15ZM6.6875 15.6875L11.8125 15.6875L14.5 21.28125C14.710938 21.722656 14.898438 22.265625 15.0625 22.875L15.09375 22.875C15.199219 22.511719 15.402344 21.941406 15.6875 21.21875L18.65625 15.6875L23.34375 15.6875L17.75 24.9375L23.5 34.375L18.53125 34.375L15.28125 28.28125C15.160156 28.054688 15.035156 27.636719 14.90625 27.03125L14.875 27.03125C14.8125 27.316406 14.664063 27.761719 14.4375 28.34375L11.1875 34.375L6.1875 34.375L12.15625 25.03125ZM36 20L44 20L44 22L36 22ZM36 27L44 27L44 29L36 29ZM36 35L44 35L44 37L36 37Z"></path>
              </svg>
              Upload List of Products
            </button>
          ) : (
            <>
              <p style={{ marginLeft: "-656px", color: "#8dc73f" }}>List of products uploaded</p>
              <div className="file-actions" style={{ marginLeft: "812px" }}>
                <button
                  type="button"
                  className="delete-btn"
                  style={{ color: "black" }}
                  onClick={() => fileInputRef.current.click()}
                >
                  <FaEdit />
                </button>
                <button type="button" className="delete-btn" onClick={handleDeleteList}>
                  <FaTrash />
                </button>
              </div>
            </>
          )}

          {/* Product Table */}
          {products.length > 0 && (
            <table className="product-table">
              <thead>
                <tr>
                  {Object.keys(products[0]).map((key) => (
                    <th key={key}>{key}</th>
                  ))}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {editableRow === rowIndex ? (
                      // Editable row with inputs
                      Object.keys(row).map((key) => (
                        <td key={key}>
                          <input
                            type="text"
                            value={editedProduct[key] || ""}
                            onChange={(e) => handleRowInputChange(e, key)}
                            className="edit-input"
                          />
                        </td>
                      ))
                    ) : (
                      // Non-editable row
                      Object.values(row).map((value, colIndex) => (
                        <td key={colIndex}>{value}</td>
                      ))
                    )}
                    <td>
                      {editableRow === rowIndex ? (
                        <FaSave
                          onClick={() => handleSaveRow(rowIndex)}
                          style={{ color: "black", cursor: "pointer", fontSize: "20px" }}
                        />
                      ) : (
                        <FaEdit
                          onClick={() => handleEditRow(rowIndex)}
                          style={{ color: "black", cursor: "pointer", fontSize: "20px" }}
                        />
                      )}
                      <FaTrash
                        onClick={() => handleDeleteRow(rowIndex)}
                        style={{ color: "red", cursor: "pointer", fontSize: "20px", marginLeft: "10px" }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="signup-button">
            Add
          </button>
        </form>
      </div>
      <Footer />
    </>
  );
};

export default AddDonation;