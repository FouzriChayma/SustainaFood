import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import '../assets/styles/Composantdonation.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getDonationById } from '../api/donationService';

const DetailsDonations = () => {
  const { id } = useParams(); // Retrieves the "id" parameter from the URL
  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDonation = async () => {
      try {
        const response = await getDonationById(id);
        setDonation(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching donation data');
      } finally {
        setLoading(false);
      }
    };
    fetchDonation();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!donation) return <div>No donation found.</div>;

  const { title, location, expirationDate, delivery, products } = donation;

  return (
    <>
      <Navbar />
      <div className="donation-cardlist">
        <div className="donation-card-content">
          <h3 className="donation-title">🛒 {title || "Donation Title"}</h3>
          <p>
            <strong>📍 Location:</strong> {location || "Unknown location"}
          </p>
          <p>
            <strong>📆 Expiration Date:</strong>{" "}
            {expirationDate ? new Date(expirationDate).toLocaleDateString() : "N/A"}
          </p>
          <p>
            <strong>🚚 Delivery:</strong> {delivery || "N/A"}
          </p>
          <h4>📦 Available Products:</h4>
          <ul className="donation-ul">
            {products && products.length > 0 ? (
              products.map((product, index) => (
                <li className="donation-li-list" key={index}>
                  {product.productType && product.productDescription ? (
                    <>
                      <span role="img" aria-label="product">🥫</span>{" "}
                      <strong>{product.productDescription}</strong> - {product.totalQuantity}{" "}
                      <span className={`status ${product.status.toLowerCase()}`}>
                        {product.status}
                      </span>
                    </>
                  ) : (
                    <span>No product data</span>
                  )}
                </li>
              ))
            ) : (
              <li className="donation-li-list">No products available</li>
            )}
          </ul>
          <button className="btnseemorelist">See More</button>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default DetailsDonations;
