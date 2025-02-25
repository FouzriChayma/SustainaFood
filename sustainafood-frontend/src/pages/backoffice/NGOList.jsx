import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../../components/backoffcom/Sidebar";
import Navbar from "../../components/backoffcom/Navbar";
import "/src/assets/styles/backoffcss/ngoList.css";
import { FaEye, FaTrash } from "react-icons/fa"; // Suppression de FaEdit
import ReactPaginate from "react-paginate";

const NGOList = () => {
    const [ngos, setNGOs] = useState([]); // Liste complète des ONG
    const [currentPage, setCurrentPage] = useState(0);
    const ngosPerPage = 5; // Nombre d'ONG par page

    // Récupération des ONG depuis le backend
    useEffect(() => {
        axios.get("http://localhost:3000/users/list")
            .then(response => {
                const ngoUsers = response.data.filter(user => user.role === "ngo");
                setNGOs(ngoUsers);
            })
            .catch(error => console.error("Error fetching NGOs:", error));
    }, []);

    // Fonction pour supprimer une ONG
    const deleteNGO = async (ngoId) => {
        if (!window.confirm("Are you sure you want to delete this NGO?")) return;

        try {
            await axios.delete(`http://localhost:3000/users/delete/${ngoId}`);
            alert("NGO deleted!");
            setNGOs(ngos.filter(ngo => ngo._id !== ngoId));
        } catch (error) {
            console.error("Error deleting NGO:", error);
        }
    };

    // Pagination
    const pagesVisited = currentPage * ngosPerPage;
    const displayNGOs = ngos.slice(pagesVisited, pagesVisited + ngosPerPage);

    const pageCount = Math.ceil(ngos.length / ngosPerPage);

    const changePage = ({ selected }) => {
        setCurrentPage(selected);
    };

    return (
        <div className="dashboard-container">
            <Sidebar />
            <div className="dashboard-content">
                <Navbar />
                <div className="ngo-list">
                    <h3>NGO Management</h3>
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
                            {displayNGOs.map((ngo, index) => (
                                <tr key={ngo._id}>
                                    <td>{pagesVisited + index + 1}</td>
                                    <td>
                                        <img src={ngo.photo || "/src/assets/User_icon_2.svg.png"} 
                                            alt="NGO" className="ngo-photo" />
                                    </td>
                                    <td>{ngo.name}</td>
                                    <td>{ngo.email}</td>
                                    <td>{ngo.phone}</td>
                                    <td>{ngo.taxR || "N/A"}</td>
                                    <td className="action-buttons">
                                        <button className="view-btn"><FaEye /></button>
                                        <button className="delete-btn" onClick={() => deleteNGO(ngo._id)}>
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

export default NGOList;
