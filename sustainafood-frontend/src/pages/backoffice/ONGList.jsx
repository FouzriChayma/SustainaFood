import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../../components/backoffcom/Sidebar";
import Navbar from "../../components/backoffcom/Navbar";
import "/src/assets/styles/backoffcss/ngoList.css";
import { FaEye, FaTrash, FaBan, FaUnlock } from "react-icons/fa";
import ReactPaginate from "react-paginate";
import { Link } from "react-router-dom";

const ONGList = () => {
    const [ongs, setONGs] = useState([]); // Liste complète des ONGs
    const [currentPage, setCurrentPage] = useState(0);
    const [searchQuery, setSearchQuery] = useState(""); // State to store the search query
    const ongsPerPage = 5; // Nombre d'ONGs par page

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

    // Pagination
    const pagesVisited = currentPage * ongsPerPage;

    // Filtering the ONGs based on the search query
    const filteredONGs = ongs.filter(ong => {
        const phoneString = ong.phone.toString(); // Convert phone number to string for searching
        return (
            ong.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ong.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            phoneString.includes(searchQuery) // Search in the phone number as a string
        );
    });

    const displayONGs = filteredONGs.slice(pagesVisited, pagesVisited + ongsPerPage);

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
                    <h3>ONG Management</h3>
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
                                    <td>{ong.isActive ? "Yes" : "No"}</td>
                                    <td>{ong.taxReference || "N/A"}</td>
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