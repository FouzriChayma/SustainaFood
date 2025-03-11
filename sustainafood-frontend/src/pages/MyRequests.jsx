import React, { useState } from "react";
import { FaTrash, FaEdit, FaSave } from "react-icons/fa";
import Navbar from "../components/Navbar";  
import Footer from "../components/Footer";  
import "/src/assets/styles/MyRequests.css";  

const MyRequests = () => {
  const [requests, setRequests] = useState([
    { id: 1, foodType: "Rice", quantity: 10, requestDate: "2024-03-01", status: "pending" },
    { id: 2, foodType: "Vegetables", quantity: 5, requestDate: "2024-02-28", status: "approved" },
    { id: 3, foodType: "Fruits", quantity: 8, requestDate: "2024-02-27", status: "rejected" },
    { id: 4, foodType: "Canned Food", quantity: 3, requestDate: "2024-03-02", status: "pending" },
    { id: 5, foodType: "Pasta", quantity: 7, requestDate: "2024-03-04", status: "approved" },
  ]);

  const [editMode, setEditMode] = useState(null);
  const [editedRequest, setEditedRequest] = useState({});

  const handleEdit = (request) => {
    setEditMode(request.id);
    setEditedRequest({ ...request });
  };

  const handleChange = (e) => {
    setEditedRequest({ ...editedRequest, [e.target.name]: e.target.value });
  };

  const handleSave = (requestId) => {
    setRequests(requests.map(req => req.id === requestId ? editedRequest : req));
    setEditMode(null);
  };

  const handleDelete = (requestId) => {
    if (window.confirm("Are you sure you want to delete this request?")) {
      setRequests(requests.filter(req => req.id !== requestId));
    }
  };

  return (
    <div className="myrequests-container">  
      <Navbar />  

      <div className="myrequests-content">  
        <h2 className="myrequests-title">My Requests</h2>

        {requests.length === 0 ? (
          <p className="no-requests">No requests found.</p>
        ) : (
          <div className="myrequests-list">  
            <table>
              <thead>
                <tr>
                  <th>Food Type</th>
                  <th>Quantity</th>
                  <th>Request Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(request => (
                  <tr key={request.id}>
                    <td>
                      {editMode === request.id ? (
                        <input
                          type="text"
                          name="foodType"
                          value={editedRequest.foodType}
                          onChange={handleChange}
                          className="edit-input"
                        />
                      ) : (
                        request.foodType
                      )}
                    </td>
                    <td>
                      {editMode === request.id ? (
                        <input
                          type="number"
                          name="quantity"
                          value={editedRequest.quantity}
                          onChange={handleChange}
                          className="edit-input"
                        />
                      ) : (
                        request.quantity
                      )}
                    </td>
                    <td>{request.requestDate}</td>
                    <td>
                      <span className={`status ${request.status}`}>
                        {request.status}
                      </span>
                    </td>
                    <td className="action-buttons">
                      {editMode === request.id ? (
                        <button className="save-btn" onClick={() => handleSave(request.id)}>
                          <FaSave />
                        </button>
                      ) : (
                        <button className="edit-btn" onClick={() => handleEdit(request)}>
                          <FaEdit />
                        </button>
                      )}
                      <button className="delete-btn" onClick={() => handleDelete(request.id)}>
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Footer />  
    </div>
  );
};

export default MyRequests;
