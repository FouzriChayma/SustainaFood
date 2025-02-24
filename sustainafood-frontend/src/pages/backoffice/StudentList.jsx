import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../../components/backoffcom/Sidebar";
import Navbar from "../../components/backoffcom/Navbar";
import "/src/assets/styles/backoffcss/studentList.css";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";

const StudentList = () => {
    const [students, setStudents] = useState([]); // Stocke les étudiants récupérés

    // Fonction pour récupérer les étudiants depuis le backend
    useEffect(() => {
        axios.get("http://localhost:3000/users/list") // Assure-toi que ton backend tourne sur ce port
            .then(response => {
                // Filtrer uniquement les étudiants
                const studentUsers = response.data.filter(user => user.role === "student");
                setStudents(studentUsers);
            })
            .catch(error => console.error("Error fetching students:", error));
    }, []);

    // Fonction pour supprimer un étudiant
    const deleteUser = async (userId) => {
        if (!window.confirm("Are you sure you want to delete this student?")) return;

        try {
            await axios.delete(`http://localhost:3000/users/delete/${userId}`);
            alert("Student deleted!");
            setStudents(students.filter(user => user._id !== userId)); // Mettre à jour la liste
        } catch (error) {
            console.error("Error deleting student:", error);
        }
    };

    return (
        <div className="dashboard-container">
            <Sidebar />
            <div className="content">
                <Navbar />
                <div className="student-list">
                    <h3>Student Management</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Photo</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>CIN</th>
                                <th>Age</th>
                                <th>Sex</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((student, index) => (
                                <tr key={student._id}>
                                    <td>{index + 1}</td>
                                    <td>
                                        <img src={student.photo || "/src/assets/User_icon_2.svg.png"} 
                                            alt="Student" className="student-photo" />
                                    </td>
                                    <td>{student.name}</td>
                                    <td>{student.email}</td>
                                    <td>{student.phone}</td>
                                    <td>{student.num_cin || "N/A"}</td>
                                    <td>{student.age || "N/A"}</td>
                                    <td>{student.sexe}</td>
                                    <td className="action-buttons">
                                        <button className="view-btn"><FaEye /></button>
                                        <button className="edit-btn"><FaEdit /></button>
                                        <button className="delete-btn" onClick={() => deleteUser(student._id)}>
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

export default StudentList;
