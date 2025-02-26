import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Sidebar from "../../components/backoffcom/Sidebar";
import Navbar from "../../components/backoffcom/Navbar";
import "/src/assets/styles/backoffcss/restaurantList.css";
import { FaEye, FaTrash, FaBan, FaUnlock } from "react-icons/fa";
import ReactPaginate from "react-paginate";

const RestaurantList = () => {
    const [restaurants, setRestaurants] = useState([]); // Liste complète des restaurants
    const [currentPage, setCurrentPage] = useState(0);
    const [searchQuery, setSearchQuery] = useState(""); // State to store the search query
    const restaurantsPerPage = 5; // Nombre de restaurants par page

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

    // Pagination
    const pagesVisited = currentPage * restaurantsPerPage;

    // Filtering the restaurants based on the search query
    const filteredRestaurants = restaurants.filter(restaurant => {
        const phoneString = restaurant.phone.toString(); // Convert phone number to string for searching
        return (
            restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            restaurant.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            phoneString.includes(searchQuery) // Search in the phone number as a string
        );
    });

    const displayRestaurants = filteredRestaurants.slice(pagesVisited, pagesVisited + restaurantsPerPage);

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
                    <h3>Restaurant Management</h3>
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