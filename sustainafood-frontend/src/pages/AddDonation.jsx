import React, { useState, useRef } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../assets/styles/AddDonation.css";
import { useNavigate } from "react-router-dom";
import logo from "../assets/images/LogoCh.png";
import Papa from "papaparse"; // Import CSV parsing library
import { IoIosCloseCircleOutline } from "react-icons/io";
import { FaEdit } from "react-icons/fa";


export const AddDonation = () => {
  const [error, setError] = useState(null);
  const [Type, setType] = useState("donation");
  const [Category, setCategory] = useState("donation");
  const [products, setProducts] = useState([]); // State to hold CSV data

  const fileInputRef = useRef(null); // Create a ref for the file input

  // Handle CSV File Upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];

    if (file) {
      Papa.parse(file, {
        complete: (result) => {
          setProducts(result.data); // Store parsed CSV data
        },
        header: true, // Use first row as headers
        skipEmptyLines: true,
      });
    }
  };

  // Handle Deleting the Product List
  const handleDeleteList = () => {
    setProducts([]); // Clear the product list
  };

  return (
    <>
      <Navbar />
      <div className="add-donation">
        <div>
          <form className="signup-form">
            <img src={logo} alt="Logo" className="adddonation-logo" />
            <h1 className="signup-h1">Add Donation</h1>

            <input className="signup-input" type="text" placeholder="Title" name="title" required />
            <input className="signup-input" type="text" placeholder="Location" name="Location" required />
            <input className="signup-input" type="date" placeholder="Expiration Date" name="Expiration Date" required />

            <select className="signup-input" value={Type} onChange={(e) => setType(e.target.value)} required>
              <option value="donation">Donation</option>
              <option value="request">Request</option>
            </select>

            <select className="signup-input" value={Category} onChange={(e) => setCategory(e.target.value)} required>
              <option value="Prepared_Meals">Prepared Meals</option>
              <option value="Packaged_Products">Packaged Products</option>
            </select>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              className="file"
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              style={{ display: "none" }} // Hide input
            />

            {/* Conditionally Show Upload or Modify/Delete Buttons */}
            {products.length === 0 ? (
              <button className="container-btn-file" onClick={() => fileInputRef.current.click()}>
                Upload List of Products
              </button>
            ) : (
                <>
                <p style={{marginLeft: "-656px",color:" #8dc73f"}}>List of products uploaded</p>
              <div className="file-actions" style={{marginLeft:'812px'}} >

                <button type="button"  className="delete-btn"  style={{color:"black"}} onClick={() => fileInputRef.current.click()}>
                <FaEdit />
                </button>
                <button type="button" className="delete-btn" onClick={handleDeleteList}>
                <IoIosCloseCircleOutline />
                </button>
              </div>
              </>
            )}

            {/* Display Table if Products Exist */}
            {products.length > 0 && (
              <table className="product-table">
                <thead>
                  <tr>
                    {Object.keys(products[0]).map((key, index) => (
                      <th key={index}>{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {products.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {Object.values(row).map((value, colIndex) => (
                        <td key={colIndex}>{value}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {error && <p className="error-message">{error}</p>}

            <button type="submit" className="signup-button">Add</button>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AddDonation;
