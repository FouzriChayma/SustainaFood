// RequestDetail.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getRequestById } from '../../api/requestNeedsService';
import Sidebar from "../../components/backoffcom/Sidebar";
import Navbar from "../../components/backoffcom/Navbar";
import "../../assets/styles/backoffcss/RequestDetail.css"; // Crée ce fichier CSS

const RequestDetail = () => {
  const { id } = useParams();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        setLoading(true);
        const response = await getRequestById(id);
        setRequest(response.data);
        setLoading(false);
          // Vérification du status de la réponse
        console.log("✅ API Response Status:", response.status);
          // Data received:
        console.log("✅ Request Data:", response.data);
      } catch (error) {
        setError('Error fetching request details.');
        console.error(error);
        setLoading(false);
      }
    };

    fetchRequest();
  }, [id]);

  if (loading) {
    return <div className="loading">Loading request details...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!request) {
    return <div>Request not found.</div>;
  }

  return (
    <div className="request-detail-container">
      <Sidebar />
      <div className="request-detail-content">
        <Navbar />
        <div className="request-card">
          <div className="request-header">
            <h2>Request Details</h2>
          </div>
          <div className="request-details">
            <table className="details-table">
              <tbody>
                <tr>
                  <td><strong>ID:</strong></td>
                  <td>{request._id}</td>
                </tr>
                <tr>
                  <td><strong>Title:</strong></td>
                  <td>{request.title}</td>
                </tr>
                <tr>
                  <td><strong>Category:</strong></td>
                  <td>{request.category}</td>
                </tr>
                <tr>
                  <td><strong>Expiration Date:</strong></td>
                  <td>{new Date(request.expirationDate).toLocaleDateString()}</td>
                </tr>
                <tr>
                  <td><strong>Status:</strong></td>
                  <td>{request.status}</td>
                </tr>
                <tr>
                  <td><strong>Description:</strong></td>
                  <td>{request.description}</td>
                </tr>
                <tr>
                  <td><strong>Products:</strong></td>
                  <td>
                    {request.requestedProducts && request.requestedProducts.length > 0 ? (
                      <ul>
                        {request.requestedProducts.map(product => (
                          <li key={product._id}>
                            {product.name} ({product.productDescription})
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div>No products requested</div>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestDetail;