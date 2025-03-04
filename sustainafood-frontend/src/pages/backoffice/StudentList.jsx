import  { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../../components/backoffcom/Sidebar";
import Navbar from "../../components/backoffcom/Navbar";
import "/src/assets/styles/backoffcss/studentList.css";
import { FaEye, FaTrash, FaBan, FaUnlock, FaFilePdf, FaSort } from "react-icons/fa";
import ReactPaginate from "react-paginate";
import { Link } from "react-router-dom";

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const StudentList = () => {
    const [students, setStudents] = useState([]); // Liste complète des étudiants
    const [currentPage, setCurrentPage] = useState(0);
    const [searchQuery, setSearchQuery] = useState(""); // State to store the search query
    const [sortField, setSortField] = useState("name"); // State to store the sorting field
    const [sortOrder, setSortOrder] = useState("asc"); // State to store the sorting order
    const studentsPerPage = 3; // Nombre d'étudiants par page

    // Calculate pagesVisited
    const pagesVisited = currentPage * studentsPerPage;

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

    // Fonction pour exporter la liste en PDF
    const exportToPDF = () => {
        const doc = new jsPDF();

        // Add a title to the PDF
        doc.setFontSize(18);
        doc.text("Student List", 10, 10);

        // Define the columns for the table
        const tableColumn = ["ID", "Name", "Email", "Phone", "CIN", "Age", "Sex", "Active"];

        // Prepare the data for the table
        const tableRows = students.map((student, index) => [
            index + 1, // ID
            student.name, // Name
            student.email, // Email
            student.phone, // Phone
            student.num_cin || "N/A", // CIN
            student.age || "N/A", // Age
            student.sexe, // Sex
            student.isActive ? "Yes" : "No", // Active
        ]);

        // Add the table to the PDF
        autoTable(doc, {
            head: [tableColumn], // Table header
            body: tableRows, // Table data
            startY: 20, // Start position below the title
            theme: "grid", // Add grid lines
            styles: {
                fontSize: 10, // Font size for the table
                cellPadding: 3, // Padding for cells
            },
            headStyles: {
                fillColor: "#4CAF50", // Green background for header
                textColor: "#ffffff", // White text for header
            },
        });

        // Save the PDF
        doc.save("Student_List.pdf");
    };

    // Filtering the students based on the search query
    const filteredStudents = students.filter(student => {
        const phoneString = student.phone ? student.phone.toString() : "";
        const ageString = student.age ? student.age.toString() : "";
        const numCinString = student.num_cin ? student.num_cin.toString() : "";
        const sexeString = student.sexe ? student.sexe.toString().toLowerCase() : "";
        return (
            student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            phoneString.includes(searchQuery) || // Search in phone number
            ageString.includes(searchQuery) ||
            numCinString.includes(searchQuery) ||
            sexeString.includes(searchQuery)
        );
    });

    // Sorting the students based on the selected field and order
    const sortedStudents = filteredStudents.sort((a, b) => {
        if (sortField === "name") {
            return sortOrder === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
        } else if (sortField === "email") {
            return sortOrder === "asc" ? a.email.localeCompare(b.email) : b.email.localeCompare(a.email);
        } else if (sortField === "phone") {
            return sortOrder === "asc" ? a.phone - b.phone : b.phone - a.phone;
        } else if (sortField === "num_cin") {
            return sortOrder === "asc" ? (a.num_cin || "").localeCompare(b.num_cin || "") : (b.num_cin || "").localeCompare(a.num_cin || "");
        } else if (sortField === "age") {
            return sortOrder === "asc" ? a.age - b.age : b.age - a.age;
        } else if (sortField === "sexe") {
            return sortOrder === "asc" ? a.sexe.localeCompare(b.sexe) : b.sexe.localeCompare(a.sexe);
        } else if (sortField === "isActive") {
            return sortOrder === "asc" ? (a.isActive ? 1 : -1) - (b.isActive ? 1 : -1) : (b.isActive ? 1 : -1) - (a.isActive ? 1 : -1);
        }
        return 0;
    });

    const displayStudents = sortedStudents.slice(pagesVisited, pagesVisited + studentsPerPage);

    const pageCount = Math.ceil(filteredStudents.length / studentsPerPage);

    const changePage = ({ selected }) => {
        setCurrentPage(selected);
    };

    return (
        <div className="dashboard-container">
            <Sidebar />
            <div className="dashboard-content">
                <Navbar setSearchQuery={setSearchQuery} /> {/* Pass search setter to Navbar */}
                <div className="student-list">
                    <div className="header-container">
                        <h2>Student Management</h2>
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
                            <option value="num_cin">CIN</option>
                            <option value="age">Age</option>
                            <option value="sexe">Sex</option>
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
                                <th>CIN</th>
                                <th>Age</th>
                                <th>Sex</th>
                                <th>Active</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayStudents.map((student, index) => (
                                <tr key={student._id}>
                                    <td>{pagesVisited + index + 1}</td>
                                    <td>
                                        <img
                                            src={student.photo ? `http://localhost:3000/${student.photo}` : "/src/assets/User_icon_2.svg.png"}
                                            alt="Student"
                                            className="student-photoList"
                                        />
                                    </td>
                                    <td>{student.name}</td>
                                    <td>{student.email}</td>
                                    <td>{student.phone}</td>
                                    <td>{student.num_cin || "N/A"}</td>
                                    <td>{student.age || "N/A"}</td>
                                    <td>{student.sexe}</td>
                                    <td>{student.isActive ? "Yes" : "No"}</td>
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