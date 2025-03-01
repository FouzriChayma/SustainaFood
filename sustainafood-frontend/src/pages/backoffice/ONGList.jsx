import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../../components/backoffcom/Sidebar";
import Navbar from "../../components/backoffcom/Navbar";
import "/src/assets/styles/backoffcss/ngoList.css";
import { FaEye, FaTrash, FaBan, FaUnlock, FaFilePdf, FaSort } from "react-icons/fa";
import ReactPaginate from "react-paginate";
import { Link } from "react-router-dom";

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const ONGList = () => {
    const [ongs, setONGs] = useState([]); // Liste complète des ONGs
    const [currentPage, setCurrentPage] = useState(0);
    const [searchQuery, setSearchQuery] = useState(""); // State to store the search query
    const [sortField, setSortField] = useState("name"); // State to store the sorting field
    const [sortOrder, setSortOrder] = useState("asc"); // State to store the sorting order
    const ongsPerPage = 5; // Nombre d'ONGs par page

    // Calculate pagesVisited
    const pagesVisited = currentPage * ongsPerPage;

    // Récupération des ONGs depuis le backend
    useEffect(() => {
        axios.get("http://localhost:3000/users/list")
            .then(response => {
                const ongUsers = response.data.filter(user => user.role === "ong");
                setONGs(ongUsers);
            })
            .catch(error => console.error("Error fetching ONGs:", error));
    }, []);

    // Fonction pour bloquer/débloquer une ONG
    const handleBlockONG = async (ongId, isBlocked) => {
        try {
            const response = await axios.put(`http://localhost:3000/users/toggle-block/${ongId}`, {
                isBlocked: !isBlocked
            });

            if (response.status === 200) {
                alert(`ONG has been ${response.data.isBlocked ? "blocked" : "unblocked"} successfully.`);
                // Update the UI after blocking/unblocking
                setONGs(ongs.map(ong =>
                    ong._id === ongId ? { ...ong, isBlocked: response.data.isBlocked } : ong
                ));
            } else {
                alert(response.data.error || "Error toggling block status.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Failed to update block status.");
        }
    };

    // Fonction pour supprimer une ONG
    const deleteONG = async (ongId) => {
        if (!window.confirm("Are you sure you want to delete this ONG?")) return;

        try {
            await axios.delete(`http://localhost:3000/users/delete/${ongId}`);
            alert("ONG deleted!");
            setONGs(ongs.filter(ong => ong._id !== ongId));
        } catch (error) {
            console.error("Error deleting ONG:", error);
        }
    };

    // Fonction pour exporter la liste en PDF
    const exportToPDF = () => {
        const doc = new jsPDF();

        // Add a title to the PDF
        doc.text("ONG List", 10, 10);

        // Define the columns for the table
        const tableColumn = ["ID", "Name", "Email", "Phone", "Tax Reference", "Active"];

        // Prepare the data for the table
        const tableRows = ongs.map((ong, index) => [
            index + 1, // ID
            ong.name, // Name
            ong.email, // Email
            ong.phone, // Phone
            ong.id_fiscale || "N/A", // Tax Reference
            ong.isActive ? "Yes" : "No", // Active
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
        doc.save("ONG_List.pdf");
    };

    // Filtering the ONGs based on the search query
    const filteredONGs = ongs.filter(ong => {
        const phoneString = ong.phone.toString(); // Convert phone number to string for searching
        return (
            ong.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ong.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            phoneString.includes(searchQuery) // Search in the phone number as a string
        );
    });

    // Sorting the ONGs based on the selected field and order
    const sortedONGs = filteredONGs.sort((a, b) => {
        if (sortField === "name") {
            return sortOrder === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
        } else if (sortField === "email") {
            return sortOrder === "asc" ? a.email.localeCompare(b.email) : b.email.localeCompare(a.email);
        } else if (sortField === "phone") {
            return sortOrder === "asc" ? a.phone - b.phone : b.phone - a.phone;
        } else if (sortField === "id_fiscale") {
            return sortOrder === "asc" ? (a.id_fiscale || "").localeCompare(b.id_fiscale || "") : (b.id_fiscale || "").localeCompare(a.id_fiscale || "");
        } else if (sortField === "isActive") {
            return sortOrder === "asc" ? (a.isActive ? 1 : -1) - (b.isActive ? 1 : -1) : (b.isActive ? 1 : -1) - (a.isActive ? 1 : -1);
        }
        return 0;
    });

    const displayONGs = sortedONGs.slice(pagesVisited, pagesVisited + ongsPerPage);

    const pageCount = Math.ceil(filteredONGs.length / ongsPerPage);

    const changePage = ({ selected }) => {
        setCurrentPage(selected);
    };

    return (
        <div className="dashboard-container">
            <Sidebar />
            <div className="dashboard-content">
                <Navbar setSearchQuery={setSearchQuery} /> {/* Pass search setter to Navbar */}
                <div className="ong-list">
                    <div className="header-container">
                        <h2>ONG Management</h2>
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
                            <option value="id_fiscale">Tax Reference</option>
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
                            {displayONGs.map((ong, index) => (
                                <tr key={ong._id}>
                                    <td>{pagesVisited + index + 1}</td>
                                    <td>
                                        <img
                                            src={ong.photo ? `http://localhost:3000/${ong.photo}` : "/src/assets/User_icon_2.svg.png"}
                                            alt="ong"
                                            className="ong-photoList"
                                        />
                                    </td>
                                    <td>{ong.name}</td>
                                    <td>{ong.email}</td>
                                    <td>{ong.phone}</td>
                                    <td>{ong.id_fiscale || "N/A"}</td>
                                    <td>{ong.isActive ? "Yes" : "No"}</td>
                                    <td className="action-buttons">
                                        <button className="view-btn">
                                            <Link to={`/ongs/view/${ong._id}`}>
                                                <FaEye />
                                            </Link>
                                        </button>
                                        <button
                                            className="block-btn"
                                            onClick={() => handleBlockONG(ong._id, ong.isBlocked)}
                                            style={{ color: ong.isBlocked ? "green" : "red" }}
                                        >
                                            {ong.isBlocked ? <FaUnlock /> : <FaBan />}
                                        </button>
                                        <button className="delete-btn" onClick={() => deleteONG(ong._id)}>
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

export default ONGList;