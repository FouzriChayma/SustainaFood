import  { useState, useEffect } from "react";
import Sidebar from "../../components/backoffcom/Sidebar";
import Navbar from "../../components/backoffcom/Navbar";
import { FaFilePdf } from "react-icons/fa";
import axios from "axios";
import "/src/assets/styles/backoffcss/studentList.css";
import ReactPaginate from "react-paginate";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState(""); // Search query for filtering products
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const productsPerPage = 5; // Number of products per page

  // Calculate pagesVisited
  const pagesVisited = currentPage * productsPerPage;

  // Fetch products dynamically
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:3000/product/all"); // API endpoint to get all products
        console.log("API Response Data:", response.data); // Check the structure here
        setProducts(response.data);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        setError("Error fetching products. Please try again later.");
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []); // Empty array means this effect runs once after the component mounts

  // Filtering products based on the search query
  const filteredProducts = products.filter((product) => {
    const query = searchQuery.toLowerCase();
    return (
      product.name?.toLowerCase().includes(query) ||
      product.productType?.toLowerCase().includes(query) ||
      product.status?.toLowerCase().includes(query)
    );
  });

  // Exporting product list to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Product List", 10, 10);

    const tableColumn = ["ID", "Name", "Type", "Status", "Description", "Weight"];
    const tableRows = products.map((product) => [
      product.id,
      product.name,
      product.productType,
      product.status,
      product.productDescription,
      product.weightPerUnit ? `${product.weightPerUnit} ${product.weightUnit}` : "N/A",
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

    doc.save("Product_List.pdf");
  };

  // Pagination logic
  const displayProducts = filteredProducts.slice(pagesVisited, pagesVisited + productsPerPage);
  const pageCount = Math.ceil(filteredProducts.length / productsPerPage);

  const changePage = ({ selected }) => {
    setCurrentPage(selected);
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-content">
        <Navbar setSearchQuery={setSearchQuery} />

        <div className="product-list">
          <div className="header-container">
            <h2>Product Management</h2>
            <button className="export-pdf-btn" onClick={exportToPDF}>
              <FaFilePdf /> Export to PDF
            </button>
          </div>

          <div className="search-container">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {loading ? (
            <div>Loading products...</div>
          ) : error ? (
            <div>{error}</div>
          ) : (
            <>
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Description</th>
                    <th>Weight</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayProducts.map((product) => (
                    <tr key={product.id}> {/* Changed _id to id here */}
                      <td>{product.id}</td>  {/* Changed the index to product.id */}
                      <td>{product.name}</td>
                      <td>{product.productType}</td>
                      <td>{product.status}</td>
                      <td>{product.productDescription}</td>
                      <td>{product.weightPerUnit ? `${product.weightPerUnit} ${product.weightUnit}` : "N/A"}</td>
                      <td>
                        <button className="action-btn">View</button>
                        <button className="action-btn">Delete</button>
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

export default ProductList;