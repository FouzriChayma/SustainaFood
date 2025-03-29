import React, { useState, useEffect } from "react";
import Sidebar from "../../components/backoffcom/Sidebar";
import Navbar from "../../components/backoffcom/Navbar";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { FaFilePdf, FaEye } from "react-icons/fa";
import { getrequests } from "../../api/requestNeedsService";
import "../../assets/styles/backoffcss/RequestTable.css";
import { Link } from "react-router-dom";
import axios from "axios";
import styled from "styled-components";
import imgmouna from '../../assets/images/imgmouna.png';

// Styled component for pagination controls
const PaginationControls = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  gap: 10px;

  button {
    padding: 10px 20px;
    font-size: 16px;
    background: #228b22;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background 0.3s;

    &:hover {
      background: #56ab2f;
    }

    &:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
  }

  span {
    font-size: 16px;
    color: #333;
  }
`;

const ProfileImg = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #228b22;
`;

const RequestTable = () => {
  const [requests, setRequests] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("title");
  const [sortOrder, setSortOrder] = useState("asc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const requestsPerPage = 5;

  // Sanitize data function
  const sanitizeRequest = (request) => {
    return {
      ...request,
      title: request.title ? request.title.trim() : "",
      category: request.category ? request.category.trim() : "",
      description: request.description ? request.description.trim() : "",
    };
  };

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:3000/request");
        const sanitizedData = response.data.map(sanitizeRequest);
        setRequests(sanitizedData);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        setError("Error fetching requests. Please try again later.");
        console.error("Error fetching requests:", error);
      }
    };
    fetchRequests();
  }, []);

  const sortedRequests = [...requests].sort((a, b) => {
    let comparison = 0;
    if (sortField === "title") {
      comparison = (a.title || "").localeCompare(b.title || "");
    } else if (sortField === "status") {
      comparison = (a.status || "").localeCompare(b.status || "");
    } else if (sortField === "expirationDate") {
      const dateA = a.expirationDate ? new Date(a.expirationDate) : null;
      const dateB = b.expirationDate ? new Date(b.expirationDate) : null;
      if (dateA && dateB) {
        comparison = dateA.getTime() - dateB.getTime();
      } else if (dateA) {
        comparison = -1;
      } else if (dateB) {
        comparison = 1;
      } else {
        comparison = 0;
      }
    } else if (sortField === "_id") {
      comparison = (a._id || "").localeCompare(b._id || "");
    } else if (sortField === "category") {
      comparison = (a.category || "").localeCompare(b.category || "");
    }
    return sortOrder === "asc" ? comparison : comparison * -1;
  });

  const pagesVisited = currentPage * requestsPerPage;
  const displayRequests = sortedRequests.slice(
    pagesVisited,
    pagesVisited + requestsPerPage
  );
  const pageCount = Math.ceil(requests.length / requestsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSortChange = (e) => {
    setSortField(e.target.value);
  };

  const handleSortOrderChange = (e) => {
    setSortOrder(e.target.value);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Request List", 10, 10);

    const tableColumn = [
      "ID",
      "Title",
      "Category",
      "Expiration Date",
      "Status",
      "Description",
      "Products",
      "Location",
    ];

    const tableRows = sortedRequests.map((request) => [
      request._id,
      request.title.trim(),
      request.category.trim(),
      new Date(request.expirationDate).toLocaleDateString(),
      request.status,
      request.description.trim(),
      request.category === "prepared_meals"
        ? `Name: ${request.mealName || "N/A"}, Description: ${
            request.mealDescription || "N/A"
          }, Number of Meals: ${request.numberOfMeals || "N/A"}, Meal Type: ${request.mealType || "N/A"}`
        : request.requestedProducts && request.requestedProducts.length > 0
        ? request.requestedProducts
            .map((p) => `${p.name.trim()} (${p.productDescription.trim()})`)
            .join(", ")
        : "No Products",
      request.location || "N/A",
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      theme: "grid",
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: "#4CAF50",
        textColor: "#ffffff",
      },
    });

    doc.save("Request_List.pdf");
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-content">
        <Navbar setSearchQuery={setSearchQuery} />

        <div className="request-list">
          <div className="header-container">
            <h2 style={{ color:"green"}}>Request Management</h2>
            <button className="export-pdf-btn" onClick={exportToPDF}>
              <FaFilePdf />
              Export to PDF
            </button>
          </div>

          <div className="sort-container">
            <label htmlFor="sortField">Sort By:</label>
            <select
              id="sortField"
              value={sortField}
              onChange={handleSortChange}
            >
              <option value="title">Title</option>
              <option value="category">Category</option>
              <option value="expirationDate">Expiration Date</option>
              <option value="status">Status</option>
              <option value="_id">ID</option>
            </select>
            <label htmlFor="sortOrder">Order:</label>
            <select
              id="sortOrder"
              value={sortOrder}
              onChange={handleSortOrderChange}
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>

          {loading ? (
            <div>Loading requests...</div>
          ) : error ? (
            <div>{error}</div>
          ) : (
            <>
              <table>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Expiration Date</th>
                    <th>Status</th>
                    <th>Description</th>
                    <th>Products</th>
                    <th>Location</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayRequests.map((request) => {
                    const userPhoto = request.recipient?.photo
                      ? `http://localhost:3000/${request.recipient.photo}`
                      : imgmouna;
                    return (
                      <tr key={request._id}>
                      <td>
                        <ProfileImg
                          src={userPhoto}
                          alt="Profile"
                          onError={(e) => {
                            e.target.src = imgmouna;
                            console.error(`Failed to load image: ${userPhoto}`);
                          }}
                        />
                        <br />
                        <span style={{ fontWeight: "bold" }}>
                          {request.recipient
                            ? `${request.recipient.name || "Unknown"}`.trim() || "Unknown User"
                            : "Unknown User"}
                        </span>
                        <br />
                        <span style={{ color: "#228b22" }}>
                          {request.recipient?.role || "Role Not Specified"}
                        </span>
                      </td>
                        <td>{request.title}</td>
                        <td>{request.category}</td>
                        <td>
                          {new Date(request.expirationDate).toLocaleDateString()}
                        </td>
                        <td>{request.status}</td>
                        <td>{request.description}</td>
                        <td>
                          {request.category === "prepared_meals" ? (
                            <div>
                              Name: {request.mealName || "N/A"}, Description:{" "}
                              {request.mealDescription || "N/A"}
                            </div>
                          ) : (
                            <div>
                              requsted product: {request.requestedProducts.length}
                            </div>
                          )}
                        </td>
                        <td>{request.location || "N/A"}</td>
                        <td >
                          <button className="view-btn">
                            <Link to={`/requests/view/${request._id}`}>
                              <FaEye />
                            </Link>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <PaginationControls>
                <button
                  onClick={() => handlePageChange(Math.max(currentPage - 1, 0))}
                  disabled={currentPage === 0}
                >
                  Previous
                </button>
                <span>
                  Page {currentPage + 1} of {pageCount}
                </span>
                <button
                  onClick={() =>
                    handlePageChange(Math.min(currentPage + 1, pageCount - 1))
                  }
                  disabled={currentPage === pageCount - 1}
                >
                  Next
                </button>
              </PaginationControls>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestTable;