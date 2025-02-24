import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../../components/backoffcom/Sidebar";
import Navbar from "../../components/backoffcom/Navbar";
import "/src/assets/styles/backoffcss/ngoList.css";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";

const NGOList = () => {
    const [ngos, setNgos] = useState([]); // Stocke les ONG récupérés

    // Fonction pour récupérer les ONG depuis le backend
    useEffect(() => {
        axios.get("http://localhost:3000/users/list")
            .then(response => {
                const ngoUsers = response.data.filter(user => user.role === "ong");
                setNgos(ngoUsers);
            })
            .catch(error => console.error("Error fetching NGOs:", error));
    }, []);

    // Fonction pour supprimer un ONG
    const deleteNGO = async (ngoId) => {
        if (!window.confirm("Are you sure you want to delete this NGO?")) return;

        try {
            await axios.delete(`http://localhost:3000/users/delete/${ngoId}`);
            alert("NGO deleted!");
            setNgos(ngos.filter(ngo => ngo._id !== ngoId)); // Mettre à jour la liste
        } catch (error) {
            console.error("Error deleting NGO:", error);
        }
    };

    return (
        <div className="dashboard-container">
            <Sidebar />
            <div className="content">
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
                                <th>Type</th>
                                <th>Fiscal ID</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ngos.map((ngo, index) => (
                                <tr key={ngo._id}>
                                    <td>{index + 1}</td>
                                    <td><img src={ngo.photo || "/src/assets/User_icon_2.svg.png"} alt="NGO" className="ngo-photo" /></td>
                                    <td>{ngo.name}</td>
                                    <td>{ngo.email}</td>
                                    <td>{ngo.phone}</td>
                                    <td>{ngo.type || "N/A"}</td>
                                    <td>{ngo.id_fiscale || "N/A"}</td>
                                    <td className="action-buttons">
                                        <button className="view-btn"><FaEye /></button>
                                        <button className="edit-btn"><FaEdit /></button>
                                        <button className="delete-btn" onClick={() => deleteNGO(ngo._id)}><FaTrash /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default NGOList;
