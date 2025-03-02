import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../../components/backoffcom/Sidebar";
import Navbar from "../../components/backoffcom/Navbar";
import "/src/assets/styles/backoffcss/transporterList.css";
import { FaEye, FaTrash, FaBan, FaUnlock, FaFilePdf, FaSort } from "react-icons/fa";
import ReactPaginate from "react-paginate";
import { Link } from "react-router-dom";

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const TransporterList = () => {
    const [transporters, setTransporters] = useState([]); // Liste complète des transporteurs
    const [currentPage, setCurrentPage] = useState(0);
    const [searchQuery, setSearchQuery] = useState(""); // State to store the search query
    const [sortField, setSortField] = useState("name"); // State to store the sorting field
    const [sortOrder, setSortOrder] = useState("asc"); // State to store the sorting order
    const transportersPerPage = 5; // Nombre de transporteurs par page

    // Calculate pagesVisited
    const pagesVisited = currentPage * transportersPerPage;

    // Récupération des transporteurs depuis le backend
    useEffect(() => {
        axios.get("http://localhost:3000/users/list")
            .then(response => {
                const transporterUsers = response.data.filter(user => user.role === "transporter");
                setTransporters(transporterUsers);
            })
            .catch(error => console.error("Error fetching transporters:", error));
    }, []);

    // Fonction pour bloquer/débloquer un transporteur
    const handleBlockUser = async (userId, isBlocked) => {
        try {
            const response = await axios.put(`http://localhost:3000/users/toggle-block/${userId}`, {
                isBlocked: !isBlocked
            });

            if (response.status === 200) {
                alert(`User has been ${response.data.isBlocked ? "blocked" : "unblocked"} successfully.`);
                // Update the UI after blocking/unblocking
                setTransporters(transporters.map(transporter =>
                    transporter._id === userId ? { ...transporter, isBlocked: response.data.isBlocked } : transporter
                ));
            } else {
                alert(response.data.error || "Error toggling block status.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Failed to update block status.");
        }
    };

    // Fonction pour supprimer un transporteur
    const deleteTransporter = async (transporterId) => {
        if (!window.confirm("Are you sure you want to delete this transporter?")) return;

        try {
            await axios.delete(`http://localhost:3000/users/delete/${transporterId}`);
            alert("Transporter deleted!");
            setTransporters(transporters.filter(transporter => transporter._id !== transporterId));
        } catch (error) {
            console.error("Error deleting transporter:", error);
        }
    };

    // Fonction pour exporter la liste en PDF
    const exportToPDF = () => {
        const doc = new jsPDF();

        // Ajouter un titre au PDF
        doc.text("Transporter List", 10, 10);

        // Colonnes du tableau
        const tableColumn = ["ID", "Name", "Email", "Phone", "Vehicle Type", "Active"];

        // Préparation des données du tableau
        const tableRows = displayTransporters.map((transporter, index) => {
            return [
                pagesVisited + index + 1, // ID
                transporter.name, // Name
                transporter.email, // Email
                transporter.phone, // Phone
                transporter.vehiculeType || "N/A", // Vehicle Type
                transporter.isActive ? "Yes" : "No", // Active status
            ];
        });

        // Ajouter le tableau au PDF
        autoTable(doc, {
            head: [tableColumn], // En-tête du tableau
            body: tableRows, // Corps du tableau avec les données
            startY: 20, // Position de départ sous le titre
        });

        // Sauvegarder le PDF
        doc.save("Transporter_List.pdf");
    };

    // Filtering the transporters based on the search query
    const filteredTransporters = transporters.filter(transporter => {
        const phoneString = transporter.phone.toString(); // Convert phone number to string for searching
        return (
            transporter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            transporter.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            phoneString.includes(searchQuery) // Search in the phone number as a string
        );
    });

    // Sorting the transporters based on the selected field and order
    const sortedTransporters = filteredTransporters.sort((a, b) => {
        if (sortField === "name") {
            return sortOrder === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
        } else if (sortField === "email") {
            return sortOrder === "asc" ? a.email.localeCompare(b.email) : b.email.localeCompare(a.email);
        } else if (sortField === "phone") {
            return sortOrder === "asc" ? a.phone - b.phone : b.phone - a.phone;
        } else if (sortField === "vehiculeType") {
            return sortOrder === "asc" ? (a.vehiculeType || "").localeCompare(b.vehiculeType || "") : (b.vehiculeType || "").localeCompare(a.vehiculeType || "");
        } else if (sortField === "isActive") {
            return sortOrder === "asc" ? (a.isActive ? 1 : -1) - (b.isActive ? 1 : -1) : (b.isActive ? 1 : -1) - (a.isActive ? 1 : -1);
        }
        return 0;
    });

    const displayTransporters = sortedTransporters.slice(pagesVisited, pagesVisited + transportersPerPage);

    const pageCount = Math.ceil(filteredTransporters.length / transportersPerPage);

    const changePage = ({ selected }) => {
        setCurrentPage(selected);
    };

    return (
        <div className="dashboard-container">
            <Sidebar />
            <div className="dashboard-content">
                <Navbar setSearchQuery={setSearchQuery} /> {/* Pass search setter to Navbar */}
                <div className="transporter-list">
                    <div className="header-container">
                        <h2>Transporter Management</h2>
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
                            <option value="vehiculeType">Vehicle Type</option>
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
                                <th>Vehicle Type</th>
                                <th>Active</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayTransporters.map((transporter, index) => (
                                <tr key={transporter._id}>
                                    <td>{pagesVisited + index + 1}</td>
                                    <td>
                                        <img
                                            src={transporter.photo ? `http://localhost:3000/${transporter.photo}` : "/src/assets/User_icon_2.svg.png"}
                                            alt="transporter"
                                            className="transporter-photoList"
                                        />
                                    </td>
                                    <td>{transporter.name}</td>
                                    <td>{transporter.email}</td>
                                    <td>{transporter.phone}</td>
                                    <td>{transporter.vehiculeType || "N/A"}</td>
                                    <td>{transporter.isActive ? "Yes" : "No"}</td>
                                    <td className="action-buttons">
                                        <button className="view-btn">
                                            <Link to={`/transporters/view/${transporter._id}`}>
                                                <FaEye />
                                            </Link>
                                        </button>
                                        <button
                                            className="block-btn"
                                            onClick={() => handleBlockUser(transporter._id, transporter.isBlocked)}
                                            style={{ color: transporter.isBlocked ? "green" : "red" }}
                                        >
                                            {transporter.isBlocked ? <FaUnlock /> : <FaBan />}
                                        </button>
                                        <button className="delete-btn" onClick={() => deleteTransporter(transporter._id)}>
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

export default TransporterList;