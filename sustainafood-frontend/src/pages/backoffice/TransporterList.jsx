import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../../components/backoffcom/Sidebar";
import Navbar from "../../components/backoffcom/Navbar";
import "/src/assets/styles/backoffcss/transporterList.css";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";

const TransporterList = () => {
    const [transporters, setTransporters] = useState([]); // Stores fetched transporters

    // Fetch transporters from the backend
    useEffect(() => {
        axios.get("http://localhost:3000/users/list")
            .then(response => {
                const transporterUsers = response.data.filter(user => user.role === "transporter");
                setTransporters(transporterUsers);
            })
            .catch(error => console.error("Error fetching transporters:", error));
    }, []);

    // Function to delete a transporter
    const deleteTransporter = async (transporterId) => {
        if (!window.confirm("Are you sure you want to delete this transporter?")) return;

        try {
            await axios.delete(`http://localhost:3000/users/delete/${transporterId}`);
            alert("Transporter deleted!");
            setTransporters(transporters.filter(transporter => transporter._id !== transporterId)); // Update the list
        } catch (error) {
            console.error("Error deleting transporter:", error);
        }
    };

    return (
        <div className="dashboard-container">
            <Sidebar />
            <div className="content">
                <Navbar />

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
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transporters.map((transporter, index) => (
                                <tr key={transporter._id}>
                                    <td>{index + 1}</td>
                                    <td>
                                        <img src={transporter.photo || "/src/assets/User_icon_2.svg.png"} 
                                            alt="Transporter" className="transporter-photo" />
                                    </td>
                                    <td>{transporter.name}</td>
                                    <td>{transporter.email}</td>
                                    <td>{transporter.phone}</td>
                                    <td>{transporter.vehiculeType || "N/A"}</td>
                                    <td className="action-buttons">
                                        <button className="view-btn"><FaEye /></button>
                                        <button className="edit-btn"><FaEdit /></button>
                                        <button className="delete-btn" onClick={() => deleteTransporter(transporter._id)}>
                                            <FaTrash />
                                        </button>
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

export default TransporterList;
