import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import '../assets/styles/DetailsDonations.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getDonationById, deleteDonation, updateDonation } from '../api/donationService';
import { createProduct, updateProduct, getProductById } from '../api/productService';
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
        console.log("API Response:", response);
        const fetchedDonation = response.data;
        console.log("Fetched Donation:", fetchedDonation);
        console.log("Products:", fetchedDonation.products);

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
              product: item.product,
              name: item.product?.name || '',
              quantity: item.quantity || 0, // Donated amount
              totalQuantity: item.product?.totalQuantity || 0, // Total stock
              status: item.product?.status || 'available',
              productDescription: item.product?.productDescription || 'Default description',
              productType: item.product?.productType || 'Other',
              _id: item.product?._id,
              }))
            : [],
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

  const handleSaveDonation = async () => {
    try {
      // Validate required fields for products
      const invalidProduct = editedDonation.products.find(
        (item) => !item.name?.trim() || !item.productDescription?.trim() || !item.productType?.trim()
      );
      if (invalidProduct) {
        setError('Please fill in all required fields for all products.');
        return;
      }
  
      // Validate expirationDate
      if (new Date(editedDonation.expirationDate) <= new Date()) {
        setError('Expiration date must be in the future.');
        return;
      }
  
      // Process products
      const updatedProducts = await Promise.all(
        editedDonation.products.map(async (item) => {
          if (!item.product) {
            // New product
            const newProduct = {
              name: item.name,
              status: item.status || 'available',
              productType: item.productType,
              productDescription: item.productDescription,
              totalQuantity: item.quantity, // Stock in Product
              donation: id,
            };
            const response = await createProduct(newProduct);
            return { product: response.data._id, quantity: item.quantity };
          } else {
            // Existing product
            const existingProductResponse = await getProductById(item.product._id || item.product);
            const existingProduct = existingProductResponse.data;
            const updatedProduct = {
              ...existingProduct,
              name: item.name !== existingProduct.name ? item.name : existingProduct.name,
              status: item.status !== existingProduct.status ? item.status : existingProduct.status,
              productDescription:
                item.productDescription !== existingProduct.productDescription
                  ? item.productDescription
                  : existingProduct.productDescription,
              productType:
                item.productType !== existingProduct.productType
                  ? item.productType
                  : existingProduct.productType,
              totalQuantity:
                item.quantity !== existingProduct.totalQuantity
                  ? item.quantity
                  : existingProduct.totalQuantity,
            };
            await updateProduct(item.product._id || item.product, updatedProduct);
            return { product: item.product._id || item.product, quantity: item.quantity };
          }
        })
      );
  
      // Prepare donation data
      const updatedData = {
        ...editedDonation,
        products: updatedProducts,
      };
  
      // Update donation
      const response = await updateDonation(id, updatedData);
      setDonation(response.data);
      setIsEditing(false);
      window.location.href = `/DetailsDonations/${id}`;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update donation';
      console.error('Error updating donation:', errorMessage, error);
      setError(errorMessage);
    }
  };

  const handleProductChange = (index, field, value) => {
    const updatedProducts = [...editedDonation.products];
    if (field === 'quantity') {
      value = Number(value);
    }
    updatedProducts[index] = { ...updatedProducts[index], [field]: value };
    setEditedDonation({ ...editedDonation, products: updatedProducts });
  };

  const handleDeleteProduct = async (index) => {
    const productToDelete = editedDonation.products[index];
    if (productToDelete.product) {
      await deleteProduct(productToDelete.product._id || productToDelete.product);
    }
    const updatedProducts = editedDonation.products.filter((_, i) => i !== index);
    setEditedDonation({ ...editedDonation, products: updatedProducts });
  };

  const handleAddProduct = () => {
    const newProduct = {
      product: null,
      name: '',
      quantity: 0,
      status: 'available',
      productDescription: 'New product description',
      productType: 'Other',
    };
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
                        console.log("Location changed:", e.target.value);
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
                        console.log("Expiration Date changed:", e.target.value);
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
                            value={product.name || ''}
                            onChange={(e) => handleProductChange(index, 'name', e.target.value)}
                            className="details-donation-edit-input"
                            placeholder="Product Name"
                          />
                          <input
                            type="text"
                            value={product.productDescription || ''}
                            onChange={(e) => handleProductChange(index, 'productDescription', e.target.value)}
                            className="details-donation-edit-input"
                            placeholder="Product Description"
                          />
                          <select
                            value={product.productType || 'Other'}
                            onChange={(e) => handleProductChange(index, 'productType', e.target.value)}
                            className="details-donation-edit-select"
                          >
                            <option value="Canned_Goods">Canned Goods</option>
                            <option value="Dry_Goods">Dry Goods</option>
                            <option value="Beverages">Beverages</option>
                            <option value="Snacks">Snacks</option>
                            <option value="Cereals">Cereals</option>
                            <option value="Baked_Goods">Baked Goods</option>
                            <option value="Condiments">Condiments</option>
                            <option value="Vegetables">Vegetables</option>
                            <option value="Fruits">Fruits</option>
                            <option value="Meat">Meat</option>
                            <option value="Fish">Fish</option>
                            <option value="Dairy">Dairy</option>
                            <option value="Eggs">Eggs</option>
                            <option value="Baby_Food">Baby Food</option>
                            <option value="Pet_Food">Pet Food</option>
                            <option value="Other">Other</option>
                          </select>
                          <input
                            type="number"
                            value={product.quantity || 0}
                            onChange={(e) => handleProductChange(index, 'quantity', e.target.value)}
                            className="details-donation-edit-input"
                            placeholder="Quantity"
                          />
                          <select
                            value={product.status || 'available'}
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
                  products && Array.isArray(products) && products.length > 0 ? (
                    products.map((product, index) => (
                      <li key={index} className="details-donation-product-item">
                        <div className="details-donation-product-info">
                          <div className="details-donation-product-icon">🥫</div>
                          <div className="details-donation-product-details">
                            <div className="details-donation-product-name">{product.product.name || 'Unknown Product'}</div>
                            <div className="details-donation-product-quantity">{product.quantity || 0}</div>
                            <div className={`details-donation-product-status ${product.product.status || 'available'}`}>
                              {product.product.status || ''}
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