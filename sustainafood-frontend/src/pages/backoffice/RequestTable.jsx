import React, { useState, useEffect } from "react";
import Sidebar from "../../components/backoffcom/Sidebar";
import Navbar from "../../components/backoffcom/Navbar";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import ReactPaginate from "react-paginate";
import { FaFilePdf, FaEye } from "react-icons/fa";
import { getrequests } from "../../api/requestNeedsService";
import "../../assets/styles/backoffcss/RequestTable.css";
import { Link } from "react-router-dom";
import axios from "axios";

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

  const changePage = ({ selected }) => {
    setCurrentPage(selected);
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
      request.title.trim(), // Trim on rendering
      request.category.trim(), // Trim on rendering
      new Date(request.expirationDate).toLocaleDateString(),
      request.status,
      request.description.trim(), // Trim on rendering
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
            <h2>Request Management</h2>
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
                    <th>ID</th>
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
                  {displayRequests.map((request) => (
                    <tr key={request._id}>
                      <td>{request._id}</td>
                      <td>{request.title}</td>
                      <td>{request.category}</td>
                      <td>
                          {new Date(
                            request.expirationDate
                          ).toLocaleDateString()}
                      </td>
                      <td>{request.status}</td>
                      <td>{request.description}</td>
     <td>
{request.category === "prepared_meals" ? (
    <div>
       Name: {request.mealName || "N/A"},
       Description: {request.mealDescription || "N/A"}
     
    </div>
  ) : (
    <div>requsted product: {request.requestedProducts.length}</div>
  )}
</td>
                      <td>{request.location || "N/A"}</td>
                                            <td className="action-buttons">
                        <button className="view-btn">
                          <Link to={`/requests/view/${request._id}`}>
                            <FaEye />
                          </Link>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <ReactPaginate
                previousLabel={"Previous"}
                nextLabel={"Next"}
                pageCount={pageCount}
                onPageChange={changePage}
                containerClassName={"pagination"}
                activeClassName={"active"}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestTable;