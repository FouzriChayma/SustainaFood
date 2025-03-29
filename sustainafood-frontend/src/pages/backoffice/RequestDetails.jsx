import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getRequestById } from '../../api/requestNeedsService';
import Sidebar from "../../components/backoffcom/Sidebar";
import Navbar from "../../components/backoffcom/Navbar";
import "../../assets/styles/backoffcss/RequestDetail.css";

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
      } catch (err) {
        setError('Error fetching request details.');
        console.error(err);
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
                  <td>{request.title || 'Untitled Request'}</td>
                </tr>
                <tr>
                  <td><strong>Category:</strong></td>
                  <td>{request.category || 'Not specified'}</td>
                </tr>
                <tr>
                  <td><strong>Expiration Date:</strong></td>
                  <td>
                    {request.expirationDate 
                      ? new Date(request.expirationDate).toLocaleDateString() 
                      : 'Not defined'}
                  </td>
                </tr>
                <tr>
                  <td><strong>Status:</strong></td>
                  <td>{request.status || 'Unknown'}</td>
                </tr>
                <tr>
                  <td><strong>Description:</strong></td>
                  <td>{request.description || 'N/A'}</td>
                </tr>

                {/* Conditional Rendering for Prepared Meals */}
                {request.category === 'prepared_meals' && (
                  <>
                    <tr>
                      <td colSpan="2"><strong>Meal Details:</strong></td>
                    </tr>
                    {(request.mealName || request.mealDescription || request.mealType) && (
                      <>
                        {request.mealName && (
                          <tr>
                            <td><strong>Meal Name:</strong></td>
                            <td>{request.mealName}</td>
                          </tr>
                        )}
                        {request.mealDescription && (
                          <tr>
                            <td><strong>Description:</strong></td>
                            <td>{request.mealDescription}</td>
                          </tr>
                        )}
                        {request.mealType && (
                          <tr>
                            <td><strong>Type:</strong></td>
                            <td>{request.mealType}</td>
                          </tr>
                        )}
                      </>
                    )}
                    <tr>
                      <td><strong>Number of Meals:</strong></td>
                      <td>{request.numberOfMeals || 'Not specified'}</td>
                    </tr>
                  </>
                )}

                {/* Conditional Rendering for Packaged Products */}
                {request.category === 'packaged_products' && (
                  <>
                    <tr>
                      <td colSpan="2"><strong>Requested Products:</strong></td>
                    </tr>
                    {request.requestedProducts && request.requestedProducts.length > 0 ? (
                      request.requestedProducts.map((item, index) => (
                        <tr key={index}>
                          <td colSpan="2">
                            <div>
                              <strong>Type:</strong> {item.product?.productType || 'Not specified'}<br />
                              <strong>Weight:</strong> {item.product?.weightPerUnit || 0} {item.product?.weightUnit || ''}<br />
                              <strong>Quantity:</strong> {item.quantity || 0} {item.product?.weightUnitTotale || ''}<br />
                              <strong>Status:</strong> {item.product?.status || 'Unknown'}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="2">No products requested</td>
                      </tr>
                    )}
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestDetail;
