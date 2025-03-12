import React, { useState, useEffect } from "react";
import Sidebar from "../../components/backoffcom/Sidebar";
import Navbar from "../../components/backoffcom/Navbar";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import ReactPaginate from "react-paginate";
import { FaFilePdf } from "react-icons/fa";
import axios from "axios";
import "../../assets/styles/backoffcss/RequestTable.css";

const RequestTable = () => {
  const [requests, setRequests] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("recipient"); // Default sort field
  const [sortOrder, setSortOrder] = useState("asc"); // Default sort order
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const requestsPerPage = 5;

  const pagesVisited = currentPage * requestsPerPage;

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:3000/request");
        setRequests(response.data);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        setError("Error fetching requests. Please try again later.");
        console.error("Error fetching requests:", error);
      }
    };
    fetchRequests();
  }, []);

  const filteredRequests = requests.filter((request) => {
    const query = searchQuery.toLowerCase();
    return (
      request.recipient?.toLowerCase().includes(query) ||
      request.status?.toLowerCase().includes(query) ||
      request.date?.toLowerCase().includes(query)
    );
  });

  // Sorting Logic
  const sortedRequests = [...filteredRequests].sort((a, b) => {
    let comparison = 0;

    if (sortField === "recipient") {
      comparison = (a.recipient || "").localeCompare(b.recipient || "");
    } else if (sortField === "status") {
      comparison = (a.status || "").localeCompare(b.status || "");
    } else if (sortField === "date") {
       // Handle date sorting, ensuring valid Date objects are used
       const dateA = a.date ? new Date(a.date) : null;
       const dateB = b.date ? new Date(b.date) : null;

       if (dateA && dateB) {
           comparison = dateA.getTime() - dateB.getTime(); // Compare timestamps
       } else if (dateA) {
           comparison = -1; // Treat a null date as earlier
       } else if (dateB) {
           comparison = 1;  // Treat a null date as earlier
       } else {
           comparison = 0;  // Both are null, so equal
       }
    } else if (sortField === "id") {
        comparison = (a._id || "").localeCompare(b._id || ""); // sort by _id
    }

    return sortOrder === "asc" ? comparison : comparison * -1;
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Request List", 10, 10);

    const tableColumn = ["ID", "Recipient", "Products", "Status", "Date"];
    const tableRows = sortedRequests.map((request) => [  // Use sortedRequests here
      request._id,
      request.recipient,
      request.requestedProducts.map(p => `${p._id} (x${p.quantity})`).join(", "),
      request.status,
      request.date,
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

  const displayRequests = sortedRequests.slice(pagesVisited, pagesVisited + requestsPerPage);
  const pageCount = Math.ceil(filteredRequests.length / requestsPerPage);

  const changePage = ({ selected }) => {
    setCurrentPage(selected);
  };

  const handleSortChange = (e) => {
    setSortField(e.target.value);
  };

  const handleSortOrderChange = (e) => {
    setSortOrder(e.target.value);
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
              <FaFilePdf /> Export to PDF
            </button>
          </div>

          <div className="search-container">
            <input
              type="text"
              placeholder="Search requests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="sort-container">
            <label htmlFor="sortField">Sort By:</label>
            <select
              id="sortField"
              value={sortField}
              onChange={handleSortChange}
            >
              <option value="recipient">Recipient</option>
              <option value="status">Status</option>
              <option value="date">Date</option>
              <option value="id">ID</option>
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
                    <th>Recipient</th>
                    <th>Products</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {displayRequests.map((request) => (
                    <tr key={request._id}>
                      <td>{request._id}</td>
                      <td>{request.recipient}</td>
                      <td>
                        {request.requestedProducts.map(p => `${p._id} (x${p.quantity})`).join(", ")}
                      </td>
                      <td>{request.status}</td>
                      <td>{request.date}</td>
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