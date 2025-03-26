import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../assets/styles/AddDonation.css";
import logo from "../assets/images/LogoCh.png";
import Papa from "papaparse";
import { FaEdit, FaTrash, FaSave } from "react-icons/fa";
import { addDonation } from "../api/donationService";
import { createrequests } from "../api/requestNeedsService";
import { useAuth } from "../contexts/AuthContext";

const AddDonation = () => {
  const { authUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const mealFileInputRef = useRef(null); // Ref for the meal CSV file input

  // Donation/Request fields
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [type, setType] = useState("donation");
  const [category, setCategory] = useState("prepared_meals");
  const [description, setDescription] = useState("");
  const [numberOfMeals, setNumberOfMeals] = useState("");
  //Prepared meals state
  const [mealName, setMealName] = useState(""); //name of the meal
  const [mealDescription, setMealDescription] = useState(""); //meal description
  const [mealType, setMealType] = useState("Breakfast");

  // Error handling
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});

  // Products state
  const [products, setProducts] = useState([]); // CSV products
  const [manualProducts, setManualProducts] = useState([
    {
      name: "",
      productType: "Canned_Goods",
      productDescription: "",
      weightPerUnit: "",
      weightUnit: "kg",
      weightUnitTotale: "kg",
      totalQuantity: "",
      image: "",
      status: "available",
    },
  ]); // Manual products

  // Editing state for CSV table
  const [editableRow, setEditableRow] = useState(null);
  const [editedProduct, setEditedProduct] = useState({});

  // Toggle between CSV and manual entry
  const [mealEntryMode, setMealEntryMode] = useState("form"); // "form" or "upload"
  const [productEntryMode, setProductEntryMode] = useState("csv"); // "csv" or "form"

  // User data
  const user = JSON.parse(localStorage.getItem("user"));
  const [userid, setUserid] = useState();

  const isDonner = user?.role === "restaurant" || user?.role === "supermarket";
  const isRecipient = user?.role === "ong" || user?.role === "student";

  // Options for select fields
  const productTypes = [
    "Canned_Goods",
    "Dry_Goods",
    "Beverages",
    "Snacks",
    "Soup",
    "Main_Course",
    "Dessert",
    "Drinks",
    "Vegetables",
    "Fruits",
    "Meat",
    "Fish",
    "Fastfood",
    "Other",
  ];
  const MealTypes = ["Breakfast", "Lunch", "Dinner", "Snack", "Dessert", "Soup", "Other"];
  const weightUnits = ["kg", "g", "lb", "oz", "ml", "l"];
  const statuses = ["available", "pending", "reserved", "out_of_stock"];

  useEffect(() => {
    if (typeof user.id === "number") {
      setUserid(user._id);
    } else if (typeof user.id === "string") {
      setUserid(user.id);
    }
  }, [user]);

  // CSV File Upload handler for Products
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      Papa.parse(file, {
        complete: (result) => setProducts(result.data),
        header: true,
        skipEmptyLines: true,
      });
    }
  };

  // Form validation
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
      if (isNaN(expDate.getTime())) tempErrors.expirationDate = "Invalid date format";
      else if (expDate < today) tempErrors.expirationDate = "Expiration date cannot be in the past";
    }

    if (!description.trim()) tempErrors.description = "Description is required";
    else if (description.length < 10) tempErrors.description = "Description must be at least 10 characters long";

    if (category === "prepared_meals") {
      if (!numberOfMeals || numberOfMeals <= 0) {
        tempErrors.numberOfMeals = "Number of meals is required and must be greater than 0";
      }
    }

    if (category === "packaged_products") {
      if (productEntryMode === "csv" && products.length === 0) {
        tempErrors.products = "Please upload a CSV file with products";
      } else if (productEntryMode === "form") {
        const invalidProducts = manualProducts.filter(
          (p) =>
            !p.name.trim() ||
            p.name.length < 2 ||
            !p.productType ||
            !p.productDescription ||
            p.productDescription.length > 500 ||
            !p.status ||
            (p.weightPerUnit && (isNaN(p.weightPerUnit) || p.weightPerUnit < 0)) ||
            (p.totalQuantity && (isNaN(p.totalQuantity) || p.totalQuantity < 0))
        );
        if (invalidProducts.length > 0) {
          tempErrors.products = "All manual products must have valid name (min 2 chars), type, description (max 500 chars), and status. Weight and quantity must be positive numbers if provided.";
        }
      }
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  // CSV table handlers
  const handleEditRow = (index) => {
    setEditableRow(index);
    setEditedProduct({ ...products[index] });
  };

  const handleRowInputChange = (e, key) => {
    setEditedProduct((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const handleSaveRow = (index) => {
    const updatedProducts = [...products];
    updatedProducts[index] = editedProduct;
    setProducts(updatedProducts);
    setEditableRow(null);
    setEditedProduct({});
  };

  const handleDeleteRow = (index) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  const handleDeleteList = () => {
    setProducts([]);
  };

  // Manual product handlers
  const handleManualProductChange = (index, field, value) => {
    const updated = [...manualProducts];
    updated[index][field] = value;
    setManualProducts(updated);
  };

  const handleAddManualProduct = () => {
    setManualProducts([
      ...manualProducts,
      {
        name: "",
        productType: "Canned_Goods",
        productDescription: "",
        weightPerUnit: "",
        weightUnit: "kg",
        weightUnitTotale: "kg",
        totalQuantity: "",
        image: "",
        status: "available",
      },
    ]);
  };

  const handleRemoveManualProduct = (index) => {
    setManualProducts(manualProducts.filter((_, i) => i !== index));
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const donationData = new FormData();
    donationData.append("title", title);
    donationData.append("location", location);
    donationData.append("expirationDate", expirationDate);
    donationData.append("description", description);
    donationData.append("category", category);
    donationData.append("created_at", new Date().toISOString());
    donationData.append("updated_at", new Date().toISOString());

    if (category === "prepared_meals") {
      donationData.append("numberOfMeals", numberOfMeals);
      donationData.append("mealName", mealName);
      donationData.append("mealDescription", mealDescription);
      donationData.append("mealType", mealType);
    }

    if (isDonner) {
      donationData.append("type", type);
      donationData.append("donor", userid);
      donationData.append("status", "pending");
    } else if (isRecipient) {
      donationData.append("recipient", userid);
      donationData.append("status", "pending");
    }


    if (category === "packaged_products") {
      const productsToSend = productEntryMode === "csv" ? products : manualProducts;
      donationData.append("products", JSON.stringify(productsToSend)); // Always append products, even if empty array

    }

    try {
      let response;
      if (isDonner) {
        response = await addDonation(donationData);
        console.log("Donation created successfully:", response.data);

      } else {
        response = await createrequests(donationData);
        console.log("Request created successfully:", response.data);
      }
      navigate("/ListOfDonations");
    } catch (err) {
      console.error("Error creating donation/request:", err);
      setError(err.response?.data?.message || "An error occurred while creating the donation/request.");
    }

  };

  // Reset product states when category changes
  useEffect(() => {
    if (category !== "packaged_products") {
      setProducts([]);
      setManualProducts([
        {
          name: "",
          productType: "Canned_Goods",
          productDescription: "",
          weightPerUnit: "",
          weightUnit: "kg",
          weightUnitTotale: "kg",
          totalQuantity: "",
          image: "",
          status: "available",
        },
      ]);
    }
  }, [category]);

  return (
    <>
      <Navbar />
      <div className="add-donation">
        <form className="signup-form" onSubmit={handleSubmit}>
          <img src={logo} alt="Logo" className="adddonation-logo" />
          {isDonner && <h1 className="signup-h1">Add Donation</h1>}
          {isRecipient && <h1 className="signup-h1">Add Request Need</h1>}

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
            value={expirationDate}
            onChange={(e) => setExpirationDate(e.target.value)}
            required
          />
          {errors.expirationDate && <p className="error-message">{errors.expirationDate}</p>}

          {isDonner && (
            <select className="signup-input" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="donation">Donation</option>
              <option value="request">Request</option>
            </select>
          )}

          <select
            className="signup-input"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="prepared_meals">Prepared Meals</option>
            <option value="packaged_products">Packaged Products</option>
          </select>

          {category === "prepared_meals" && (
            <>
              <div className="radio-buttons-container-adddonation">
                <div className="radio-button-adddonation">
                  <input
                    type="radio"
                    id="meal-form"
                    name="mealEntryMode"
                    value="form"
                    checked={mealEntryMode === "form"}
                    onChange={() => setMealEntryMode("form")}
                  />
                  <label htmlFor="meal-form">Form</label>
                </div>
                <div className="radio-button-adddonation">
                  <input
                    type="radio"
                    id="meal-csv"
                    name="mealEntryMode"
                    value="csv"
                    checked={mealEntryMode === "csv"}
                    onChange={() => setMealEntryMode("csv")}
                  />
                  <label htmlFor="meal-csv">CSV File</label>
                </div>
              </div>

              {mealEntryMode === "form" && (
                <>
                  <input
                    className="signup-input"
                    type="text"
                    placeholder="Meal Name"
                    value={mealName}
                    onChange={(e) => setMealName(e.target.value)}
                    required
                  />
                  <textarea
                    className="signup-input"
                    placeholder="Meal Description"
                    value={mealDescription}
                    onChange={(e) => setMealDescription(e.target.value)}
                    required
                  />
                  <select
                    className="signup-input"
                    value={mealType}
                    onChange={(e) => setMealType(e.target.value)}
                  >
                    {MealTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </>
              )}


              <input
                className="signup-input"
                type="number"
                placeholder="Number of Meals"
                value={numberOfMeals}
                onChange={(e) => setNumberOfMeals(e.target.value)}
                required
              />
            </>
          )}

          <textarea
            className="signup-input"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          {errors.description && <p className="error-message">{errors.description}</p>}

          {category === "packaged_products" && (
            <>
              <div className="radio-buttons-container-adddonation">
                <div className="radio-button-adddonation">
                  <input
                    name="radio-group"
                    id="radio-csv"
                    className="radio-button__input-adddonation"
                    type="radio"
                    checked={productEntryMode === "csv"}
                    onChange={() => setProductEntryMode("csv")}
                  />
                  <label htmlFor="radio-csv" className="radio-button__label-adddonation">
                    <span className="radio-button__custom-adddonation"></span>
                    CSV File
                  </label>
                </div>
                <div className="radio-button-adddonation">
                  <input
                    name="radio-group"
                    id="radio-form"
                    class fiscalName="radio-button__input-adddonation"
                    type="radio"
                    checked={productEntryMode === "form"}
                    onChange={() => setProductEntryMode("form")}
                  />
                  <label htmlFor="radio-form" className="radio-button__label-adddonation">
                    <span className="radio-button__custom-adddonation"></span>
                    Form
                  </label>
                </div>
              </div>

              {productEntryMode === "csv" && products.length === 0 && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    style={{ display: "none" }}
                  />
                  <button
                    type="button"
                    className="container-btn-file"
                    onClick={() => fileInputRef.current.click()}
                  >
                    <svg
                      fill="#fff"
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 50 50"
                    >
                      <path d="M 25 2 C 12.309295 2 2 12.309295 2 25 C 2 37.690705 12.309295 48 25 48 C 37.690705 48 48 37.690705 48 25 C 48 12.309295 37.690705 2 25 2 z M 25 4 C 36.609824 4 46 13.390176 46 25 C 46 36.609824 36.609824 46 25 46 C 13.390176 46 4 36.609824 4 25 C 4 13.390176 13.390176 4 25 4 z M 24 13 L 24 24 L 13 24 L 13 26 L 24 26 L 24 37 L 26 37 L 26 26 L 37 26 L 37 24 L 26 24 L 26 13 L 24 13 z" />
                    </svg>
                    Upload List of Products
                  </button>
                </>
              )}

              {productEntryMode === "form" && (
                <div className="manual-product-entry">
                  {manualProducts.map((product, index) => (
                    <div key={index} className="manual-product-row">
                      <input
                        type="text"
                        placeholder="Product Name"
                        value={product.name}
                        onChange={(e) => handleManualProductChange(index, "name", e.target.value)}
                        className="signup-input"
                      />
                      <select
                        className="signup-input"
                        value={product.productType}
                        onChange={(e) => handleManualProductChange(index, "productType", e.target.value)}
                      >
                        {productTypes.map((pt) => (
                          <option key={pt} value={pt}>
                            {pt}
                          </option>
                        ))}
                      </select>
                      <textarea
                        className="signup-input"
                        placeholder="Product Description"
                        value={product.productDescription}
                        onChange={(e) =>
                          handleManualProductChange(index, "productDescription", e.target.value)
                        }
                      />
                      <input
                        type="number"
                        placeholder="Weight Per Unit"
                        value={product.weightPerUnit}
                        onChange={(e) => handleManualProductChange(index, "weightPerUnit", e.target.value)}
                        className="signup-input"
                      />
                      <select
                        className="signup-input"
                        value={product.weightUnit}
                        onChange={(e) => handleManualProductChange(index, "weightUnit", e.target.value)}
                      >
                        {weightUnits.map((wu) => (
                          <option key={wu} value={wu}>
                            {wu}
                          </option>
                        ))}
                      </select>
                      <select
                        className="signup-input"
                        value={product.weightUnitTotale}
                        onChange={(e) =>
                          handleManualProductChange(index, "weightUnitTotale", e.target.value)
                        }
                      >
                        {weightUnits.map((wu) => (
                          <option key={wu} value={wu}>
                            {wu}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        placeholder="Total Quantity"
                        value={product.totalQuantity}
                        onChange={(e) => handleManualProductChange(index, "totalQuantity", e.target.value)}
                        className="signup-input"
                      />
                      <input
                        type="text"
                        placeholder="Image URL"
                        value={product.image}
                        onChange={(e) => handleManualProductChange(index, "image", e.target.value)}
                        className="signup-input"
                      />
                      <select
                        className="signup-input"
                        value={product.status}
                        onChange={(e) => handleManualProductChange(index, "status", e.target.value)}
                      >
                        <option value="available">Available</option>
                        <option value="pending">Pending</option>
                        <option value="reserved">Reserved</option>
                        <option value="out_of_stock">Out of Stock</option>
                      </select>
                      {manualProducts.length > 1 && (
                        <button type="button" onClick={() => handleRemoveManualProduct(index)}>
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={handleAddManualProduct} className="signup-button">
                    Add Another Product
                  </button>
                </div>
              )}
              {errors.products && <p className="error-message">{errors.products}</p>}
            </>
          )}

          {products.length > 0 && productEntryMode === "csv" && (
            <>
              <p style={{ marginLeft: "-656px", color: "#8dc73f" }}>List of products uploaded</p>
              <div className="file-actions" style={{ marginLeft: "812px" }}>
                <FaEdit className="fa-edit" onClick={() => fileInputRef.current.click()} />
                <FaTrash className="fa-trash" onClick={handleDeleteList} />
              </div>
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
                        Object.keys(row).map((key) => (
                          <td key={key}>
                            {key === "productType" ? (
                              <select
                                value={editedProduct[key] || ""}
                                onChange={(e) => handleRowInputChange(e, key)}
                                className="edit-input"
                              >
                                {productTypes.map((pt) => (
                                  <option key={pt} value={pt}>
                                    {pt}
                                  </option>
                                ))}
                              </select>
                            ) : key === "weightUnit" ? (
                              <select
                                value={editedProduct[key] || ""}
                                onChange={(e) => handleRowInputChange(e, key)}
                                className="edit-input"
                              >
                                {weightUnits.map((wu) => (
                                  <option key={wu} value={wu}>
                                    {wu}
                                  </option>
                                ))}
                              </select>
                            ) : key === "weightUnitTotale" ? (
                              <select
                                value={editedProduct[key] || ""}
                                onChange={(e) => handleRowInputChange(e, key)}
                                className="edit-input"
                              >
                                {weightUnits.map((wu) => (
                                  <option key={wu} value={wu}>
                                    {wu}
                                  </option>
                                ))}
                              </select>
                            ) : key === "status" ? (
                              <select
                                value={editedProduct[key] || ""}
                                onChange={(e) => handleRowInputChange(e, key)}
                                className="edit-input"
                              >
                                {statuses.map((status) => (
                                  <option key={status} value={status}>
                                    {status}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <input
                                type={key === "weightPerUnit" || key === "totalQuantity" ? "number" : "text"}
                                value={editedProduct[key] || ""}
                                onChange={(e) => handleRowInputChange(e, key)}
                                className="edit-input"
                              />
                            )}
                          </td>
                        ))
                      ) : (
                        Object.values(row).map((value, colIndex) => (
                          <td key={colIndex}>{value}</td>
                        ))
                      )}
                      <td>
                        {editableRow === rowIndex ? (
                          <FaSave className="fa-save" onClick={() => handleSaveRow(rowIndex)} />
                        ) : (
                          <FaEdit
                            className="fa-edit"
                            onClick={() => handleEditRow(rowIndex)}
                            style={{ color: "black", cursor: "pointer", fontSize: "20px" }}
                          />
                        )}
                        <FaTrash
                          className="fa-trash"
                          onClick={() => handleDeleteRow(rowIndex)}
                          style={{ color: "red", cursor: "pointer", fontSize: "20px", marginLeft: "10px" }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="signup-button">Add</button>
        </form>
      </div>
      <Footer />
    </>
  );
};

export default AddDonation;