import React, { useState, useEffect } from "react";
import Sidebar from "../../components/backoffcom/Sidebar";
import Navbar from "../../components/backoffcom/Navbar";
import { FaFilePdf, FaSort } from "react-icons/fa";
import axios from "axios";
import ReactPaginate from "react-paginate";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "../../assets/styles/backoffcss/ProductList.css";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("name"); // Default sort field
  const [sortOrder, setSortOrder] = useState("asc"); // Default sort order
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const productsPerPage = 5;

  const pagesVisited = currentPage * productsPerPage;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:3000/product/all");
        console.log("API Response Data:", response.data);
        setProducts(response.data);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        setError("Error fetching products. Please try again later.");
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = products.filter((product) => {
    const query = searchQuery.toLowerCase();
    return (
      product.name?.toLowerCase().includes(query) ||
      product.productType?.toLowerCase().includes(query) ||
      product.status?.toLowerCase().includes(query)
    );
  });

  // Sorting Logic
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let comparison = 0;

    if (sortField === "name") {
      comparison = (a.name || "").localeCompare(b.name || ""); // handles null/undefined names
    } else if (sortField === "productType") {
      comparison = (a.productType || "").localeCompare(b.productType || "");
    } else if (sortField === "status") {
      comparison = (a.status || "").localeCompare(b.status || "");
    } else if (sortField === "weight") {
      const weightA = a.weightPerUnit || 0;  // Treat missing weight as 0
      const weightB = b.weightPerUnit || 0;
      comparison = weightA - weightB;       // Numeric comparison
    } else if (sortField === "id") {
        comparison = a.id - b.id;  // numeric comparison for IDs
    }

    return sortOrder === "asc" ? comparison : comparison * -1;
  });


  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Product List", 10, 10);

    const tableColumn = ["ID", "Name", "Type", "Status", "Description", "Weight"];
    const tableRows = sortedProducts.map((product) => [  // Use sortedProducts here
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

  const displayProducts = sortedProducts.slice(pagesVisited, pagesVisited + productsPerPage);
  const pageCount = Math.ceil(filteredProducts.length / productsPerPage);

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

          <div className="sort-container">
            <label htmlFor="sortField">Sort By:</label>
            <select
              id="sortField"
              value={sortField}
              onChange={handleSortChange}
            >
              <option value="name">Name</option>
              <option value="productType">Type</option>
              <option value="status">Status</option>
              <option value="weight">Weight</option>
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
                  </tr>
                </thead>
                <tbody>
                  {displayProducts.map((product) => (
                    <tr key={product.id}>
                      <td>{product.id}</td>
                      <td>{product.name}</td>
                      <td>{product.productType}</td>
                      <td>{product.status}</td>
                      <td>{product.productDescription}</td>
                      <td>{product.weightPerUnit ? `${product.weightPerUnit} ${product.weightUnit}` : "N/A"}</td>
                    
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