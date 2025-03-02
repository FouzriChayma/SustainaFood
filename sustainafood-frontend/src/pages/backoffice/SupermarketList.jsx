import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../../components/backoffcom/Sidebar";
import Navbar from "../../components/backoffcom/Navbar";
import "/src/assets/styles/backoffcss/supermarketList.css";
import { FaEye, FaTrash, FaBan, FaUnlock, FaFilePdf, FaSort } from "react-icons/fa";
import ReactPaginate from "react-paginate";
import { Link } from "react-router-dom";

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const SupermarketList = () => {
    const [supermarkets, setSupermarkets] = useState([]); // Liste complète des supermarchés
    const [currentPage, setCurrentPage] = useState(0);
    const [searchQuery, setSearchQuery] = useState(""); // State to store the search query
    const [sortField, setSortField] = useState("name"); // State to store the sorting field
    const [sortOrder, setSortOrder] = useState("asc"); // State to store the sorting order
    const supermarketsPerPage = 5; // Nombre de supermarchés par page

    // Calculate pagesVisited
    const pagesVisited = currentPage * supermarketsPerPage;

    // Récupération des supermarchés depuis le backend
    useEffect(() => {
        axios.get("http://localhost:3000/users/list")
            .then(response => {
                const supermarketUsers = response.data.filter(user => user.role === "supermarket");
                setSupermarkets(supermarketUsers);
            })
            .catch(error => console.error("Error fetching supermarkets:", error));
    }, []);

    // Fonction pour bloquer/débloquer un supermarché
    const handleBlockUser = async (userId, isBlocked) => {
        try {
            const response = await axios.put(`http://localhost:3000/users/toggle-block/${userId}`, {
                isBlocked: !isBlocked
            });

            if (response.status === 200) {
                alert(`User has been ${response.data.isBlocked ? "blocked" : "unblocked"} successfully.`);
                // Update the UI after blocking/unblocking
                setSupermarkets(supermarkets.map(supermarket =>
                    supermarket._id === userId ? { ...supermarket, isBlocked: response.data.isBlocked } : supermarket
                ));
            } else {
                alert(response.data.error || "Error toggling block status.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Failed to update block status.");
        }
    };

    // Fonction pour supprimer un supermarché
    const deleteSupermarket = async (supermarketId) => {
        if (!window.confirm("Are you sure you want to delete this supermarket?")) return;

        try {
            await axios.delete(`http://localhost:3000/users/delete/${supermarketId}`);
            alert("Supermarket deleted!");
            setSupermarkets(supermarkets.filter(supermarket => supermarket._id !== supermarketId));
        } catch (error) {
            console.error("Error deleting supermarket:", error);
        }
    };

    // Fonction pour exporter la liste en PDF
    const exportToPDF = () => {
        const doc = new jsPDF();

        // Add a title to the PDF
        doc.setFontSize(18);
        doc.text("Supermarket List", 10, 10);

        // Define the columns for the table
        const tableColumn = ["ID", "Name", "Email", "Phone", "Tax Reference", "Active"];

        // Prepare the data for the table
        const tableRows = supermarkets.map((supermarket, index) => [
            index + 1, // ID
            supermarket.name, // Name
            supermarket.email, // Email
            supermarket.phone, // Phone
            supermarket.taxReference || "N/A", // Tax Reference
            supermarket.isActive ? "Yes" : "No", // Active
        ]);

        // Add the table to the PDF
        autoTable(doc, {
            head: [tableColumn], // Table header
            body: tableRows, // Table data
            startY: 20, // Start position below the title
            theme: "grid", // Add grid lines
            styles: {
                fontSize: 10, // Font size for the table
                cellPadding: 3, // Padding for cells
            },
            headStyles: {
                fillColor: "#4CAF50", // Green background for header
                textColor: "#ffffff", // White text for header
            },
        });

        // Save the PDF
        doc.save("Supermarket_List.pdf");
    };

    // Filtering the supermarkets based on the search query
    const filteredSupermarkets = supermarkets.filter(supermarket => {
        const phoneString = supermarket.phone.toString(); // Convert phone number to string for searching
        return (
            supermarket.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            supermarket.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            phoneString.includes(searchQuery) // Search in the phone number as a string
        );
    });

    // Sorting the supermarkets based on the selected field and order
    const sortedSupermarkets = filteredSupermarkets.sort((a, b) => {
        if (sortField === "name") {
            return sortOrder === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
        } else if (sortField === "email") {
            return sortOrder === "asc" ? a.email.localeCompare(b.email) : b.email.localeCompare(a.email);
        } else if (sortField === "phone") {
            return sortOrder === "asc" ? a.phone - b.phone : b.phone - a.phone;
        } else if (sortField === "taxReference") {
            return sortOrder === "asc" ? (a.taxReference || "").localeCompare(b.taxReference || "") : (b.taxReference || "").localeCompare(a.taxReference || "");
        } else if (sortField === "isActive") {
            return sortOrder === "asc" ? (a.isActive ? 1 : -1) - (b.isActive ? 1 : -1) : (b.isActive ? 1 : -1) - (a.isActive ? 1 : -1);
        }
        return 0;
    });

    const displaySupermarkets = sortedSupermarkets.slice(pagesVisited, pagesVisited + supermarketsPerPage);

    const pageCount = Math.ceil(filteredSupermarkets.length / supermarketsPerPage);

    const changePage = ({ selected }) => {
        setCurrentPage(selected);
    };

    return (
        <div className="dashboard-container">
            <Sidebar />
            <div className="dashboard-content">
                <Navbar setSearchQuery={setSearchQuery} /> {/* Pass search setter to Navbar */}
                <div className="supermarket-list">
                    <div className="header-container">
                        <h2>Supermarket Management</h2>
                        <button className="export-pdf-btn" onClick={exportToPDF}>
                            <FaFilePdf /> Export to PDF
                        </button>
                    </div>
                    <div className="sort-container">
                        <label>Sort by:</label>
                        <select value={sortField} onChange={(e) => setSortField(e.target.value)}>
                            <option value="name">Name</option>
                            <option value="email">Email</option>
                            <option value="phone">Phone</option>
                            <option value="taxReference">Tax Reference</option>
                            <option value="isActive">Active Status</option>
                        </select>
                        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                            <option value="asc">Ascending</option>
                            <option value="desc">Descending</option>
                        </select>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Photo</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Tax Reference</th>
                                <th>Active</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displaySupermarkets.map((supermarket, index) => (
                                <tr key={supermarket._id}>
                                    <td>{pagesVisited + index + 1}</td>
                                    <td>
                                        <img
                                            src={supermarket.photo ? `http://localhost:3000/${supermarket.photo}` : "/src/assets/User_icon_2.svg.png"}
                                            alt="supermarket"
                                            className="supermarket-photoList"
                                        />
                                    </td>
                                    <td>{supermarket.name}</td>
                                    <td>{supermarket.email}</td>
                                    <td>{supermarket.phone}</td>
                                    <td>{supermarket.taxReference || "N/A"}</td>
                                    <td>{supermarket.isActive ? "Yes" : "No"}</td>
                                    <td className="action-buttons">
                                        <button className="view-btn">
                                            <Link to={`/supermarkets/view/${supermarket._id}`}>
                                                <FaEye />
                                            </Link>
                                        </button>
                                        <button
                                            className="block-btn"
                                            onClick={() => handleBlockUser(supermarket._id, supermarket.isBlocked)}
                                            style={{ color: supermarket.isBlocked ? "green" : "red" }}
                                        >
                                            {supermarket.isBlocked ? <FaUnlock /> : <FaBan />}
                                        </button>
                                        <button className="delete-btn" onClick={() => deleteSupermarket(supermarket._id)}>
                                            <FaTrash />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    <ReactPaginate
                        previousLabel={"Previous"}
                        nextLabel={"Next"}
                        pageCount={pageCount}
                        onPageChange={changePage}
                        containerClassName={"pagination"}
                        previousLinkClassName={"previousBttn"}
                        nextLinkClassName={"nextBttn"}
                        disabledClassName={"paginationDisabled"}
                        activeClassName={"paginationActive"}
                    />
                </div>
            </div>
        </div>
    );
};

export default SupermarketList;