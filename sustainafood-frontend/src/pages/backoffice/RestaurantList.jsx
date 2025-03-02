import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Sidebar from "../../components/backoffcom/Sidebar";
import Navbar from "../../components/backoffcom/Navbar";
import "/src/assets/styles/backoffcss/restaurantList.css";
import { FaEye, FaTrash, FaBan, FaUnlock, FaFilePdf, FaSort } from "react-icons/fa";
import ReactPaginate from "react-paginate";

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const RestaurantList = () => {
    const [restaurants, setRestaurants] = useState([]); // Liste complète des restaurants
    const [currentPage, setCurrentPage] = useState(0);
    const [searchQuery, setSearchQuery] = useState(""); // State to store the search query
    const [sortField, setSortField] = useState("name"); // State to store the sorting field
    const [sortOrder, setSortOrder] = useState("asc"); // State to store the sorting order
    const restaurantsPerPage = 5; // Nombre de restaurants par page

    // Calculate pagesVisited
    const pagesVisited = currentPage * restaurantsPerPage;

    // Récupération des restaurants depuis le backend
    useEffect(() => {
        axios.get("http://localhost:3000/users/list")
            .then(response => {
                const restaurantUsers = response.data.filter(user => user.role === "restaurant");
                setRestaurants(restaurantUsers);
            })
            .catch(error => console.error("Error fetching restaurants:", error));
    }, []);

    // Fonction pour bloquer/débloquer un restaurant
    const handleBlockRestaurant = async (restaurantId, isBlocked) => {
        try {
            const response = await axios.put(`http://localhost:3000/users/toggle-block/${restaurantId}`, {
                isBlocked: !isBlocked
            });

            if (response.status === 200) {
                alert(`Restaurant has been ${response.data.isBlocked ? "blocked" : "unblocked"} successfully.`);
                // Update the UI after blocking/unblocking
                setRestaurants(restaurants.map(restaurant =>
                    restaurant._id === restaurantId ? { ...restaurant, isBlocked: response.data.isBlocked } : restaurant
                ));
            } else {
                alert(response.data.error || "Error toggling block status.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Failed to update block status.");
        }
    };

    // Fonction pour supprimer un restaurant
    const deleteRestaurant = async (restaurantId) => {
        if (!window.confirm("Are you sure you want to delete this restaurant?")) return;

        try {
            await axios.delete(`http://localhost:3000/users/delete/${restaurantId}`);
            alert("Restaurant deleted!");
            setRestaurants(restaurants.filter(restaurant => restaurant._id !== restaurantId));
        } catch (error) {
            console.error("Error deleting restaurant:", error);
        }
    };

    // Fonction pour exporter la liste en PDF
    const exportToPDF = () => {
        const doc = new jsPDF();

        // Add a title to the PDF
        doc.setFontSize(20);
        doc.text("Restaurant List", 10, 10);

        // Define the columns for the table
        const tableColumn = ["ID", "Name", "Email", "Phone", "Tax Reference", "Active"];

        // Prepare the data for the table
        const tableRows = restaurants.map((restaurant, index) => [
            index + 1, // ID
            restaurant.name, // Name
            restaurant.email, // Email
            restaurant.phone, // Phone
            restaurant.taxReference || "N/A", // Tax Reference
            restaurant.isActive ? "Yes" : "No", // Active
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
        doc.save("Restaurant_List.pdf");
    };

    // Filtering the restaurants based on the search query
    const filteredRestaurants = restaurants.filter(restaurant => {
        const phoneString = restaurant.phone.toString(); // Convert phone number to string for searching
        return (
            restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            restaurant.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            phoneString.includes(searchQuery) // Search in the phone number as a string
        );
    });

    // Sorting the restaurants based on the selected field and order
    const sortedRestaurants = filteredRestaurants.sort((a, b) => {
        if (sortField === "name") {
            return sortOrder === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
        } else if (sortField === "email") {
            return sortOrder === "asc" ? a.email.localeCompare(b.email) : b.email.localeCompare(a.email);
        } else if (sortField === "phone") {
            return sortOrder === "asc" ? a.phone - b.phone : b.phone - a.phone;
        } else if (sortField === "taxReference") {
            return sortOrder === "asc" ? (a.taxReference || "").localeCompare(b.taxReference || "") : (b.taxReference || "").localeCompare(a.taxReference || "");
        } else if (sortField === "isActive") {
            return sortOrder === "asc" ? (a.isActive ? 1 : -1) - (b.isActive ? 1 : -1) : (b.isActive ? 1 : -1) - (a.isActive ? 1 : -1);
        }
        return 0;
    });

    const displayRestaurants = sortedRestaurants.slice(pagesVisited, pagesVisited + restaurantsPerPage);

    const pageCount = Math.ceil(filteredRestaurants.length / restaurantsPerPage);

    const changePage = ({ selected }) => {
        setCurrentPage(selected);
    };

    return (
        <div className="dashboard-container">
            <Sidebar />
            <div className="dashboard-content">
                <Navbar setSearchQuery={setSearchQuery} /> {/* Pass search setter to Navbar */}
                <div className="restaurant-list">
                    <div className="header-container">
                        <h2>Restaurant Management</h2>
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
                            <option value="taxReference">Tax Reference</option>
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
                                <th>Tax Reference</th>
                                <th>Active</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayRestaurants.map((restaurant, index) => (
                                <tr key={restaurant._id}>
                                    <td>{pagesVisited + index + 1}</td>
                                    <td>
                                        <img
                                            src={restaurant.photo ? `http://localhost:3000/${restaurant.photo}` : "/src/assets/User_icon_2.svg.png"}
                                            alt="restaurant"
                                            className="restaurant-photoList"
                                        />
                                    </td>
                                    <td>{restaurant.name}</td>
                                    <td>{restaurant.email}</td>
                                    <td>{restaurant.phone}</td>
                                    <td>{restaurant.taxReference || "N/A"}</td>
                                    <td>{restaurant.isActive ? "Yes" : "No"}</td>
                                    <td className="action-buttons">
                                        <button className="view-btn">
                                            <Link to={`/restaurants/view/${restaurant._id}`} className="view-btn">
                                                <FaEye />
                                            </Link>
                                        </button>
                                        <button
                                            className="block-btn"
                                            onClick={() => handleBlockRestaurant(restaurant._id, restaurant.isBlocked)}
                                            style={{ color: restaurant.isBlocked ? "green" : "red" }}
                                        >
                                            {restaurant.isBlocked ? <FaUnlock /> : <FaBan />}
                                        </button>
                                        <button className="delete-btn" onClick={() => deleteRestaurant(restaurant._id)}>
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

export default RestaurantList;