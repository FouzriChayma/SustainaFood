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
import { useAlert } from "../contexts/AlertContext";

export const AddDonation = () => {
  const { authUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const mealsFileInputRef = useRef(null);
  const { showAlert } = useAlert();

  // Form states
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [type, setType] = useState("donation");
  const [category, setCategory] = useState("prepared_meals");
  const [description, setDescription] = useState("");
  const [numberOfMeals, setNumberOfMeals] = useState(""); // Total meals for display/validation

  // Error handling
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});

  // Products and Meals state
  const [products, setProducts] = useState([]);
  const [meals, setMeals] = useState([]);
  const [manualProducts, setManualProducts] = useState([{
    name: "",
    productType: "Canned_Goods",
    productDescription: "",
    weightPerUnit: "",
    weightUnit: "kg",
    weightUnitTotale: "kg",
    totalQuantity: "",
    image: "",
    status: "available",
  }]);
  const [manualMeals, setManualMeals] = useState([{
    mealName: "",
    mealDescription: "",
    mealType: "Lunch",
    quantity: "", // Added quantity field for each meal
  }]);

  // Editing state
  const [editableRow, setEditableRow] = useState(null);
  const [editedItem, setEditedItem] = useState({});
  const [editableType, setEditableType] = useState(null);

  // Entry mode
  const [productEntryMode, setProductEntryMode] = useState("csv");
  const [mealsEntryMode, setMealsEntryMode] = useState("csv");

  // User data
  const user = JSON.parse(localStorage.getItem("user"));
  const [userid, setUserid] = useState();

  const isDonner = user?.role === "restaurant" || user?.role === "supermarket";
  const isRecipient = user?.role === "ong" || user?.role === "student";

  const productTypes = ["Canned_Goods", "Dry_Goods", "Beverages", "Snacks", "Soup", "Main_Course", "Dessert", "Vegetables", "Fruits", "Meat", "Fish", "Fastfood", "Other"];
  const weightUnits = ["kg", "g", "lb", "oz", "ml", "l"];
  const statuses = ["available", "pending", "reserved", "out_of_stock"];
  const mealTypes = ["Breakfast", "Lunch", "Dinner", "Snack", "Dessert", "Other"];

  useEffect(() => {
    const fetchUser = async () => {
      if (typeof user?.id === "number") {
        if (!user || !user._id) return;
        try {
          setUserid(user._id);
        } catch (error) {
          console.error("Backend Error:", error);
        }
      } else if (typeof user?.id === "string") {
        if (!user || !user.id) return;
        try {
          setUserid(user.id);
        } catch (error) {
          console.error("Backend Error:", error);
        }
      }
    };

    if (user && (user._id || user.id)) {
      fetchUser();
    }
  }, [user]);

  useEffect(() => {
    // Calculate total meals from manualMeals when in form mode
    if (isDonner && category === "prepared_meals" && mealsEntryMode === "form") {
      const total = manualMeals.reduce((sum, meal) => sum + (parseInt(meal.quantity) || 0), 0);
      setNumberOfMeals(total || "");
    }
  }, [manualMeals, mealsEntryMode, category, isDonner]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      Papa.parse(file, {
        complete: (result) => setProducts(result.data),
        header: true,
        skipEmptyLines: true,
      });
      showAlert("success", "Products uploaded successfully.");
    }
  };

  const handleFileUploadMeals = (event) => {
    const file = event.target.files[0];
    if (file) {
      Papa.parse(file, {
        complete: (result) => {
          const parsedMeals = result.data.map(meal => ({
            ...meal,
            quantity: parseInt(meal.quantity) || 0
          }));
          setMeals(parsedMeals);
          const total = parsedMeals.reduce((sum, meal) => sum + (meal.quantity || 0), 0);
          setNumberOfMeals(total || "");
          showAlert("success", "Meals uploaded successfully.");
        },
        header: true,
        skipEmptyLines: true,
      });
    }
  };

  const validateForm = () => {
    let tempErrors = {};
    if (!title.trim()) tempErrors.title = "Title is required";
    else if (title.length < 3) tempErrors.title = "Title must be at least 3 characters long";

    if (!location.trim()) tempErrors.location = "Location is required";
    else if (location.length < 3) tempErrors.location = "Location must be at least 3 characters long";

    if (!expirationDate) tempErrors.expirationDate = "Expiration date is required";
    else if (new Date(expirationDate) < new Date()) tempErrors.expirationDate = "Expiration date cannot be in the past";

    if (!description.trim()) tempErrors.description = "Description is required";
    else if (description.length < 10) tempErrors.description = "Description must be at least 10 characters long";

    if (category === "prepared_meals" && isDonner) {
      if (!numberOfMeals || numberOfMeals <= 0) {
        tempErrors.numberOfMeals = "Number of meals must be greater than 0";
      }
      if (mealsEntryMode === "csv" && meals.length === 0) {
        tempErrors.meals = "Meals list is required when uploading via CSV";
      } else if (mealsEntryMode === "form") {
        const invalidMeals = manualMeals.filter(
          meal => !meal.mealName.trim() || !meal.mealType || !meal.mealDescription.trim() || !meal.quantity || meal.quantity <= 0
        );
        if (invalidMeals.length > 0) {
          tempErrors.meals = "All meals must have a name, type, description, and valid quantity";
        }
      }
    }

    if (category === "packaged_products") {
      if (productEntryMode === "csv" && products.length === 0) {
        tempErrors.products = "Please upload a CSV file with products";
      } else if (productEntryMode === "form") {
        const invalidProducts = manualProducts.filter(
          p => !p.name.trim() || !p.productType || !p.productDescription || (p.totalQuantity && p.totalQuantity <= 0)
        );
        if (invalidProducts.length > 0) {
          tempErrors.products = "All products must have valid details and quantity";
        }
      }
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleEditRow = (index, type) => {
    setEditableRow(index);
    setEditableType(type);
    setEditedItem(type === "products" ? { ...products[index] } : { ...meals[index] });
    showAlert("warning", `Editing ${type === "products" ? "product" : "meal"} row.`);
  };

  const handleRowInputChange = (e, key) => {
    const value = key === "quantity" || key === "weightPerUnit" || key === "totalQuantity" ? parseInt(e.target.value) || "" : e.target.value;
    setEditedItem(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveRow = (index) => {
    if (editableType === "products") {
      const updatedProducts = [...products];
      updatedProducts[index] = editedItem;
      setProducts(updatedProducts);
      showAlert("success", "Product updated successfully!");
    } else if (editableType === "meals") {
      const updatedMeals = [...meals];
      updatedMeals[index] = editedItem;
      setMeals(updatedMeals);
      const total = updatedMeals.reduce((sum, meal) => sum + (parseInt(meal.quantity) || 0), 0);
      setNumberOfMeals(total || "");
      showAlert("success", "Meal updated successfully!");
    }
    setEditableRow(null);
    setEditedItem({});
    setEditableType(null);
  };

  const handleDeleteRow = (index, type) => {
    if (type === "products") {
      setProducts(products.filter((_, i) => i !== index));
      showAlert("success", "Product removed from list.");
    } else if (type === "meals") {
      const updatedMeals = meals.filter((_, i) => i !== index);
      setMeals(updatedMeals);
      const total = updatedMeals.reduce((sum, meal) => sum + (parseInt(meal.quantity) || 0), 0);
      setNumberOfMeals(total || "");
      showAlert("success", "Meal removed from list.");
    }
  };

  const handleDeleteList = (type) => {
    if (type === "products") {
      setProducts([]);
      showAlert("success", "Product list cleared.");
    } else if (type === "meals") {
      setMeals([]);
      setNumberOfMeals("");
      showAlert("success", "Meal list cleared.");
    }
  };

  const handleManualProductChange = (index, field, value) => {
    const updated = [...manualProducts];
    updated[index][field] = field === "totalQuantity" || field === "weightPerUnit" ? parseInt(value) || "" : value;
    setManualProducts(updated);
  };

  const handleManualMealChange = (index, field, value) => {
    const updated = [...manualMeals];
    updated[index][field] = field === "quantity" ? parseInt(value) || "" : value;
    setManualMeals(updated);
  };

  const handleAddManualProduct = () => {
    setManualProducts([...manualProducts, {
      name: "",
      productType: "Canned_Goods",
      productDescription: "",
      weightPerUnit: "",
      weightUnit: "kg",
      weightUnitTotale: "kg",
      totalQuantity: "",
      image: "",
      status: "available",
    }]);
    showAlert("success", "New product entry added.");
  };

  const handleAddManualMeal = () => {
    setManualMeals([...manualMeals, {
      mealName: "",
      mealDescription: "",
      mealType: "Lunch",
      quantity: "",
    }]);
    showAlert("success", "New meal entry added.");
  };

  const handleRemoveManualProduct = (index) => {
    setManualProducts(manualProducts.filter((_, i) => i !== index));
    showAlert("success", "Manual product removed.");
  };

  const handleRemoveManualMeal = (index) => {
    setManualMeals(manualMeals.filter((_, i) => i !== index));
    showAlert("success", "Manual meal removed.");
  };

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
    donationData.append("status", "pending");

    if (category === "prepared_meals" && isDonner) {
      donationData.append("numberOfMeals", numberOfMeals);
      const mealsToSend = mealsEntryMode === "form" ? manualMeals : meals;
      // Ensure quantity is an integer and all fields are present
      const formattedMeals = mealsToSend.map(meal => ({
        mealName: meal.mealName,
        mealDescription: meal.mealDescription,
        mealType: meal.mealType,
        quantity: parseInt(meal.quantity), // Ensure quantity is an integer
      }));
      console.log("Formatted Meals to Send:", formattedMeals); // Debugging
      donationData.append("meals", JSON.stringify(formattedMeals));
    }

    if (category === "packaged_products") {
      const productsToSend = productEntryMode === "csv" ? products : manualProducts;
      // Ensure totalQuantity is an integer
      const formattedProducts = productsToSend.map(product => ({
        ...product,
        totalQuantity: parseInt(product.totalQuantity),
        weightPerUnit: parseFloat(product.weightPerUnit),
      }));
      console.log("Formatted Products to Send:", formattedProducts); // Debugging
      donationData.append(isDonner ? "products" : "requestedProducts", JSON.stringify(formattedProducts));
    }

    try {
      let response;
      if (isDonner) {
        donationData.append("type", type);
        donationData.append("donor", userid);

        console.log("Sending Donation Data:", [...donationData.entries()]); // Debugging
        response = await addDonation(donationData);
        console.log("Donation created successfully:", response.data);
        showAlert("success", "Donation created successfully!");
      } else if (isRecipient) {
        donationData.append("recipient", userid);
        console.log("Sending Request Data:", [...donationData.entries()]); // Debugging
        response = await createrequests(donationData);
        console.log("Request created successfully:", response.data);
        showAlert("success", "Request created successfully!");
      }
      navigate("/ListOfDonations");
    } catch (err) {
      console.error("Error creating donation/request:", err);
      const errorMessage = err.response?.data?.message || "An error occurred while creating the donation/request.";
      setError(errorMessage);
      showAlert("error", errorMessage);
    }
  };

  useEffect(() => {
    if (category !== "packaged_products") {
      setProducts([]);
      setManualProducts([{
        name: "",
        productType: "Canned_Goods",
        productDescription: "",
        weightPerUnit: "",
        weightUnit: "kg",
        weightUnitTotale: "kg",
        totalQuantity: "",
        image: "",
        status: "available",
      }]);
    }
    if (category !== "prepared_meals") {
      setMeals([]);
      setManualMeals([{
        mealName: "",
        mealDescription: "",
        mealType: "Lunch",
        quantity: "",
      }]);
      setNumberOfMeals("");
    }
  }, [category]);

  return (
    <>
      <Navbar />
      <div className="add-donation">
        <form className="signup-form" onSubmit={handleSubmit}>
          <img src={logo} alt="Logo" className="adddonation-logo" />
          <h1 className="signup-h1">{isDonner ? "Add Donation" : "Add Request Need"}</h1>

          <input className="signup-input" type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          {errors.title && <p className="error-message">{errors.title}</p>}

          <input className="signup-input" type="text" placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} required />
          {errors.location && <p className="error-message">{errors.location}</p>}

          <input className="signup-input" type="date" value={expirationDate} onChange={(e) => setExpirationDate(e.target.value)} required />
          {errors.expirationDate && <p className="error-message">{errors.expirationDate}</p>}

          <select className="signup-input" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="prepared_meals">Prepared Meals</option>
            <option value="packaged_products">Packaged Products</option>
          </select>

          <textarea className="signup-input" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required />
          {errors.description && <p className="error-message">{errors.description}</p>}

          {category === "prepared_meals" && isDonner && (
            <>
              <input className="signup-input" type="number" placeholder="Total Number of Meals" value={numberOfMeals} readOnly />
              {errors.numberOfMeals && <p className="error-message">{errors.numberOfMeals}</p>}

              <div className="radio-buttons-container-adddonation">
                <div className="radio-button-adddonation">
                  <input name="radio-group-meals" id="radio-csv-meals" className="radio-button__input-adddonation" type="radio" checked={mealsEntryMode === "csv"} onChange={() => setMealsEntryMode("csv")} />
                  <label htmlFor="radio-csv-meals" className="radio-button__label-adddonation">
                    <span className="radio-button__custom-adddonation"></span>CSV File
                  </label>
                </div>
                <div className="radio-button-adddonation">
                  <input name="radio-group-meals" id="radio-form-meals" className="radio-button__input-adddonation" type="radio" checked={mealsEntryMode === "form"} onChange={() => setMealsEntryMode("form")} />
                  <label htmlFor="radio-form-meals" className="radio-button__label-adddonation">
                    <span className="radio-button__custom-adddonation"></span>Form
                  </label>
                </div>
              </div>

              {mealsEntryMode === "csv" && meals.length === 0 && (
                <>
                  <input ref={mealsFileInputRef} type="file" accept=".csv" onChange={handleFileUploadMeals} style={{ display: "none" }} />
                  <button type="button" className="container-btn-file" onClick={() => mealsFileInputRef.current.click()}>
                    <svg fill="#fff" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 50 50">
                      <path d="M 25 2 C 12.309295 2 2 12.309295 2 25 C 2 37.690705 12.309295 48 25 48 C 37.690705 48 48 37.690705 48 25 C 48 12.309295 37.690705 2 25 2 z M 25 4 C 36.609824 4 46 13.390176 46 25 C 46 36.609824 36.609824 46 25 46 C 13.390176 46 4 36.609824 4 25 C 4 13.390176 13.390176 4 25 4 z M 24 13 L 24 24 L 13 24 L 13 26 L 24 26 L 24 37 L 26 37 L 26 26 L 37 26 L 37 24 L 26 24 L 26 13 L 24 13 z" />
                    </svg>
                    Upload List of Meals
                  </button>
                </>
              )}

              {mealsEntryMode === "csv" && meals.length > 0 && (
                <>
                  <p style={{ marginLeft: "-656px", color: "#8dc73f" }}>List of meals uploaded</p>
                  <div className="file-actions" style={{ marginLeft: "812px" }}>
                    <FaEdit className="fa-edit" onClick={() => mealsFileInputRef.current.click()} />
                    <FaTrash className="fa-trash" onClick={() => handleDeleteList("meals")} />
                  </div>
                  <table className="product-table">
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
                      {meals.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          {editableRow === rowIndex && editableType === "meals" ? (
                            <>
                              <td><input value={editedItem.mealName || ""} onChange={(e) => handleRowInputChange(e, "mealName")} className="edit-input" /></td>
                              <td><input value={editedItem.mealDescription || ""} onChange={(e) => handleRowInputChange(e, "mealDescription")} className="edit-input" /></td>
                              <td>
                                <select value={editedItem.mealType || ""} onChange={(e) => handleRowInputChange(e, "mealType")} className="edit-input">
                                  {mealTypes.map(mt => <option key={mt} value={mt}>{mt}</option>)}
                                </select>
                              </td>
                              <td><input type="number" value={editedItem.quantity || ""} onChange={(e) => handleRowInputChange(e, "quantity")} className="edit-input" min="1" /></td>
                              <td><FaSave className="fa-save" onClick={() => handleSaveRow(rowIndex)} /></td>
                            </>
                          ) : (
                            <>
                              <td>{row.mealName}</td>
                              <td>{row.mealDescription}</td>
                              <td>{row.mealType}</td>
                              <td>{row.quantity}</td>
                              <td>
                                <FaEdit className="fa-edit" onClick={() => handleEditRow(rowIndex, "meals")} style={{ color: "black", cursor: "pointer", fontSize: "20px" }} />
                                <FaTrash className="fa-trash" onClick={() => handleDeleteRow(rowIndex, "meals")} style={{ color: "red", cursor: "pointer", fontSize: "20px", marginLeft: "10px" }} />
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
                <div className="manual-product-entry">
                  {manualMeals.map((meal, index) => (
                    <div key={index} className="manual-product-row">
                      <input type="text" placeholder="Meal Name" value={meal.mealName} onChange={(e) => handleManualMealChange(index, "mealName", e.target.value)} className="signup-input" />
                      <textarea placeholder="Meal Description" value={meal.mealDescription} onChange={(e) => handleManualMealChange(index, "mealDescription", e.target.value)} className="signup-input" />
                      <select value={meal.mealType} onChange={(e) => handleManualMealChange(index, "mealType", e.target.value)} className="signup-input">
                        {mealTypes.map(type => <option key={type} value={type}>{type}</option>)}
                      </select>
                      <input type="number" placeholder="Quantity" value={meal.quantity} onChange={(e) => handleManualMealChange(index, "quantity", e.target.value)} className="signup-input" min="1" />
                      {manualMeals.length > 1 && <button type="button" onClick={() => handleRemoveManualMeal(index)}>Remove</button>}
                    </div>
                  ))}
                  <button type="button" onClick={handleAddManualMeal} className="signup-button">Add Another Meal</button>
                </div>
              )}
              {errors.meals && <p className="error-message">{errors.meals}</p>}
            </>
          )}

          {category === "packaged_products" && (
            <>
              <div className="radio-buttons-container-adddonation">
                <div className="radio-button-adddonation">
                  <input name="radio-group-products" id="radio-csv-products" className="radio-button__input-adddonation" type="radio" checked={productEntryMode === "csv"} onChange={() => setProductEntryMode("csv")} />
                  <label htmlFor="radio-csv-products" className="radio-button__label-adddonation">
                    <span className="radio-button__custom-adddonation"></span>CSV File
                  </label>
                </div>
                <div className="radio-button-adddonation">
                  <input name="radio-group-products" id="radio-form-products" className="radio-button__input-adddonation" type="radio" checked={productEntryMode === "form"} onChange={() => setProductEntryMode("form")} />
                  <label htmlFor="radio-form-products" className="radio-button__label-adddonation">
                    <span className="radio-button__custom-adddonation"></span>Form
                  </label>
                </div>
              </div>

              {productEntryMode === "csv" && products.length === 0 && (
                <>
                  <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileUpload} style={{ display: "none" }} />
                  <button type="button" className="container-btn-file" onClick={() => fileInputRef.current.click()}>
                    <svg fill="#fff" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 50 50">
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
                      <input type="text" placeholder="Product Name" value={product.name} onChange={(e) => handleManualProductChange(index, "name", e.target.value)} className="signup-input" />
                      <select className="signup-input" value={product.productType} onChange={(e) => handleManualProductChange(index, "productType", e.target.value)}>
                        {productTypes.map(pt => <option key={pt} value={pt}>{pt}</option>)}
                      </select>
                      <textarea className="signup-input" placeholder="Product Description" value={product.productDescription} onChange={(e) => handleManualProductChange(index, "productDescription", e.target.value)} />
                      <input type="number" placeholder="Weight Per Unit" value={product.weightPerUnit} onChange={(e) => handleManualProductChange(index, "weightPerUnit", e.target.value)} className="signup-input" />
                      <select className="signup-input" value={product.weightUnit} onChange={(e) => handleManualProductChange(index, "weightUnit", e.target.value)}>
                        {weightUnits.map(wu => <option key={wu} value={wu}>{wu}</option>)}
                      </select>
                      <select className="signup-input" value={product.weightUnitTotale} onChange={(e) => handleManualProductChange(index, "weightUnitTotale", e.target.value)}>
                        {weightUnits.map(wu => <option key={wu} value={wu}>{wu}</option>)}
                      </select>
                      <input type="number" placeholder="Total Quantity" value={product.totalQuantity} onChange={(e) => handleManualProductChange(index, "totalQuantity", e.target.value)} className="signup-input" />
                      <input type="text" placeholder="Image URL" value={product.image} onChange={(e) => handleManualProductChange(index, "image", e.target.value)} className="signup-input" />
                      <select className="signup-input" value={product.status} onChange={(e) => handleManualProductChange(index, "status", e.target.value)}>
                        {statuses.map(status => <option key={status} value={status}>{status}</option>)}
                      </select>
                      {manualProducts.length > 1 && <button type="button" onClick={() => handleRemoveManualProduct(index)}>Remove</button>}
                    </div>
                  ))}
                  <button type="button" onClick={handleAddManualProduct} className="signup-button">Add Another Product</button>
                </div>
              )}

              {productEntryMode === "csv" && products.length > 0 && (
                <>
                  <p style={{ marginLeft: "-656px", color: "#8dc73f" }}>List of products uploaded</p>
                  <div className="file-actions" style={{ marginLeft: "812px" }}>
                    <FaEdit className="fa-edit" onClick={() => fileInputRef.current.click()} />
                    <FaTrash className="fa-trash" onClick={() => handleDeleteList("products")} />
                  </div>
                  <table className="product-table">
                    <thead>
                      <tr>
                        {Object.keys(products[0]).map((key) => <th key={key}>{key}</th>)}
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          {editableRow === rowIndex && editableType === "products" ? (
                            Object.keys(row).map((key) => (
                              <td key={key}>
                                {key === "productType" ? (
                                  <select value={editedItem[key] || ""} onChange={(e) => handleRowInputChange(e, key)} className="edit-input">
                                    {productTypes.map(pt => <option key={pt} value={pt}>{pt}</option>)}
                                  </select>
                                ) : key === "weightUnit" || key === "weightUnitTotale" ? (
                                  <select value={editedItem[key] || ""} onChange={(e) => handleRowInputChange(e, "key")} className="edit-input">
                                    {weightUnits.map(wu => <option key={wu} value={wu}>{wu}</option>)}
                                  </select>
                                ) : key === "status" ? (
                                  <select value={editedItem[key] || ""} onChange={(e) => handleRowInputChange(e, "key")} className="edit-input">
                                    {statuses.map(status => <option key={status} value={status}>{status}</option>)}
                                  </select>
                                ) : (
                                  <input type={key === "weightPerUnit" || key === "totalQuantity" ? "number" : "text"} value={editedItem[key] || ""} onChange={(e) => handleRowInputChange(e, key)} className="edit-input" />
                                )}
                              </td>
                            ))
                          ) : (
                            Object.values(row).map((value, colIndex) => <td key={colIndex}>{value}</td>)
                          )}
                          <td>
                            {editableRow === rowIndex && editableType === "products" ? (
                              <FaSave className="fa-save" onClick={() => handleSaveRow(rowIndex)} />
                            ) : (
                              <FaEdit className="fa-edit" onClick={() => handleEditRow(rowIndex, "products")} style={{ color: "black", cursor: "pointer", fontSize: "20px" }} />
                            )}
                            <FaTrash className="fa-trash" onClick={() => handleDeleteRow(rowIndex, "products")} style={{ color: "red", cursor: "pointer", fontSize: "20px", marginLeft: "10px" }} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}

              {errors.products && <p className="error-message">{errors.products}</p>}
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