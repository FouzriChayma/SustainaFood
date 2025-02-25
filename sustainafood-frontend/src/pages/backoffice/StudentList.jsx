import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../../components/backoffcom/Sidebar";
import Navbar from "../../components/backoffcom/Navbar";
import "/src/assets/styles/backoffcss/studentList.css";
import { FaEye, FaTrash, FaBan, FaUnlock } from "react-icons/fa"; // Suppression de FaEdit
import ReactPaginate from "react-paginate";
import { Link } from "react-router-dom";

const StudentList = () => {
    const [students, setStudents] = useState([]); // Liste complète des étudiants
    const [currentPage, setCurrentPage] = useState(0);
    const studentsPerPage = 3; // Nombre d'étudiants par page

    // Récupération des étudiants depuis le backend
    useEffect(() => {
        axios.get("http://localhost:3000/users/list")
            .then(response => {
                const studentUsers = response.data.filter(user => user.role === "student");
                setStudents(studentUsers);
            })
            .catch(error => console.error("Error fetching students:", error));
    }, []);
// Fonction pour bloquer/débloquer un étudiant    
const handleBlockUser = async (userId, isBlocked) => {
    try {
        const response = await axios.put(`http://localhost:3000/users/toggle-block/${userId}`, {
            isBlocked: !isBlocked
        });

        if (response.status === 200) {
            alert(`User has been ${response.data.isBlocked ? "blocked" : "unblocked"} successfully.`);
            // Update the UI after blocking/unblocking
            setStudents(students.map(student =>
                student._id === userId ? { ...student, isBlocked: response.data.isBlocked } : student
            ));
        } else {
            alert(response.data.error || "Error toggling block status.");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Failed to update block status.");
    }
};

    // Fonction pour supprimer un étudiant
    const deleteUser = async (userId) => {
        if (!window.confirm("Are you sure you want to delete this student?")) return;

        try {
            await axios.delete(`http://localhost:3000/users/delete/${userId}`);
            alert("Student deleted!");
            setStudents(students.filter(user => user._id !== userId));
        } catch (error) {
            console.error("Error deleting student:", error);
        }
    };

    // Pagination
    const pagesVisited = currentPage * studentsPerPage;
    const displayStudents = students.slice(pagesVisited, pagesVisited + studentsPerPage);

    const pageCount = Math.ceil(students.length / studentsPerPage);

    const changePage = ({ selected }) => {
        setCurrentPage(selected);
    };

    return (
        <div className="dashboard-container">
            <Sidebar />
            <div className="dashboard-content">
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
                            {displayStudents.map((student, index) => (
                                <tr key={student._id}>
                                    <td>{pagesVisited + index + 1}</td>
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
                                        <button className="view-btn">
                                            <Link to={`/students/view/${student._id}`}>
                                                <FaEye />
                                            </Link>
                                        </button>
                                        <button
                                            className="block-btn"
                                            onClick={() => handleBlockUser(student._id, student.isBlocked)}
                                            style={{ color: student.isBlocked ? "green" : "red" }}
                                        >
                                            {student.isBlocked ? <FaUnlock /> : <FaBan />}
                                        </button>
                                        <button className="delete-btn" onClick={() => deleteUser(student._id)}>
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

export default StudentList;
