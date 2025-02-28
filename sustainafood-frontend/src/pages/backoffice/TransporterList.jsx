import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../../components/backoffcom/Sidebar";
import Navbar from "../../components/backoffcom/Navbar";
import "/src/assets/styles/backoffcss/transporterList.css";
import { FaEye, FaTrash, FaBan, FaUnlock } from "react-icons/fa";
import ReactPaginate from "react-paginate";
import { Link } from "react-router-dom";

const TransporterList = () => {
    const [transporters, setTransporters] = useState([]); // Liste complète des transporteurs
    const [currentPage, setCurrentPage] = useState(0);
    const [searchQuery, setSearchQuery] = useState(""); // State to store the search query
    const transportersPerPage = 5; // Nombre de transporteurs par page

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

    // Pagination
    const pagesVisited = currentPage * transportersPerPage;

    // Filtering the transporters based on the search query
    const filteredTransporters = transporters.filter(transporter =>  {
        const phoneString = transporter.phone.toString(); // Convert phone number to string for searching
        return (
            transporter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            transporter.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            phoneString.includes(searchQuery) // Search in the phone number as a string
        );
    });

    const displayTransporters = filteredTransporters.slice(pagesVisited, pagesVisited + transportersPerPage);

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
                    <h3>Transporter Management</h3>
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