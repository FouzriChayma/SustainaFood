import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../../components/backoffcom/Sidebar";
import Navbar from "../../components/backoffcom/Navbar";
import "/src/assets/styles/backoffcss/supermarketList.css";
import { FaEye, FaTrash } from "react-icons/fa"; // Suppression de FaEdit
import ReactPaginate from "react-paginate";

const SupermarketList = () => {
    const [supermarkets, setSupermarkets] = useState([]); // Liste complète des supermarchés
    const [currentPage, setCurrentPage] = useState(0);
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
    const displaySupermarkets = supermarkets.slice(pagesVisited, pagesVisited + supermarketsPerPage);

    const pageCount = Math.ceil(supermarkets.length / supermarketsPerPage);

    const changePage = ({ selected }) => {
        setCurrentPage(selected);
    };

    return (
        <div className="dashboard-container">
            <Sidebar />
            <div className="dashboard-content">
                <Navbar />
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
                                        <img src={supermarket.photo || "/src/assets/User_icon_2.svg.png"} 
                                            alt="Supermarket" className="supermarket-photo" />
                                    </td>
                                    <td>{supermarket.name}</td>
                                    <td>{supermarket.email}</td>
                                    <td>{supermarket.phone}</td>
                                    <td>{supermarket.taxR || "N/A"}</td>
                                    <td className="action-buttons">
                                        <button className="view-btn"><FaEye /></button>
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
