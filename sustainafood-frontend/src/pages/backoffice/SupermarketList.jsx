import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../../components/backoffcom/Sidebar";
import Navbar from "../../components/backoffcom/Navbar";
import "/src/assets/styles/backoffcss/supermarketList.css";
import { FaEye, FaTrash, FaBan, FaUnlock } from "react-icons/fa";
import ReactPaginate from "react-paginate";
import { Link } from "react-router-dom";

const SupermarketList = () => {
    const [supermarkets, setSupermarkets] = useState([]); // Liste complète des supermarchés
    const [currentPage, setCurrentPage] = useState(0);
    const [searchQuery, setSearchQuery] = useState(""); // State to store the search query
    const supermarketsPerPage = 5; // Nombre de supermarchés par page

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

    // Pagination
    const pagesVisited = currentPage * supermarketsPerPage;
    const pageCount = Math.ceil(supermarkets.length / supermarketsPerPage);

    const changePage = ({ selected }) => {
        setCurrentPage(selected);
    };

    // Filtering the supermarkets based on the search query
    const filteredSupermarkets = supermarkets.filter(supermarket =>  {
        const phoneString = supermarket.phone.toString(); // Convert phone number to string for searching
        return (
            supermarket.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            supermarket.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            phoneString.includes(searchQuery) // Search in the phone number as a string
        );
    });
    

    const displaySupermarkets = filteredSupermarkets.slice(pagesVisited, pagesVisited + supermarketsPerPage);

    return (
        <div className="dashboard-container">
            <Sidebar />
            <div className="dashboard-content">
                <Navbar setSearchQuery={setSearchQuery} /> {/* Pass search setter to Navbar */}
                <div className="supermarket-list">
                    <h3>Supermarket Management</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Photo</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>TaxR</th>
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
                                    <td>{supermarket.taxR || "N/A"}</td>
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