import  { useState, useEffect } from "react";
import Sidebar from "../../components/backoffcom/Sidebar";
import Navbar from "../../components/backoffcom/Navbar";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import ReactPaginate from "react-paginate";
import { FaFilePdf } from "react-icons/fa";
import axios from "axios"; // Import axios for making API requests
import "/src/assets/styles/backoffcss/studentList.css";
import "../../assets/styles/backoffcss/request.css";

const RequestTable = () => {
  const [requests, setRequests] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState(""); // Search query for filtering requests
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const requestsPerPage = 5; // Number of requests per page

  // Calculate pagesVisited
  const pagesVisited = currentPage * requestsPerPage;

  // Fetch requests dynamically
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true); // Start loading
        const response = await axios.get("http://localhost:3000/request"); // Ensure backend API is running
        setRequests(response.data);
        setLoading(false); // End loading
      } catch (error) {
        setLoading(false);
        setError("Error fetching requests. Please try again later."); // Handle error gracefully
        console.error("Error fetching requests:", error);
      }
    };
    fetchRequests();
  }, []); // Empty array means this effect runs once after the component mounts

  // Filtering requests based on the search query
  // const filteredRequests = requests.filter((request) => {
  //   const query = searchQuery.toLowerCase();
  //   // Check if recipient, status, or date includes the search query
  //   const recipientMatch = request.recipient?.toLowerCase().includes(query);
  //   const statusMatch = request.status?.toLowerCase().includes(query);
  //   const dateMatch = request.date?.toLowerCase().includes(query);
    
  //   return recipientMatch || statusMatch || dateMatch;
  // });

  // Exporting data to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Request List", 10, 10);

    const tableColumn = ["ID", "Recipient", "Products", "Status", "Date"];
    const tableRows = requests.map((request) => [
      request._id, // Assuming _id is the ID field from the API response
      request.recipient,
      request.requestedProducts.map(p => `${p.product} (x${p.quantity})`).join(", "),
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

  // Pagination logic
  // const displayRequests = filteredRequests.slice(pagesVisited, pagesVisited + requestsPerPage);
  const displayRequests = requests.slice(pagesVisited, pagesVisited + requestsPerPage);
  const pageCount = Math.ceil(requests.length / requestsPerPage);

  const changePage = ({ selected }) => {
    setCurrentPage(selected);
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-content">
        <Navbar setSearchQuery={setSearchQuery} /> {/* Pass search setter to Navbar */}

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

          {loading ? (
            <div>Loading requests...</div> // Show loading indicator
          ) : error ? (
            <div>{error}</div> // Show error message
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
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                {displayRequests.length > 0 ? (
  displayRequests.map((request, index) => {
    return (
      <tr key={request._id}>
        <td>{pagesVisited + index + 1}</td>
        <td>{request.recipient || "N/A"}</td> {/* Display "N/A" if recipient is empty */}
        <td>
          {request.requestedProducts && request.requestedProducts.length > 0 ? (
            request.requestedProducts
              .map((p) => `${p._id} (x${p.quantity})`) // Access _id instead of product
              .join(", ")
          ) : (
            "No Products"
          )}
        </td>
        <td>{request.status}</td>
        <td>{request.date}</td>
        <td>
          <button className="action-btn">View</button>
          <button className="action-btn">Delete</button>
        </td>
      </tr>
    );
  })
) : (
  <tr>
    <td colSpan="6">No requests found.</td>
  </tr>
                  )}
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