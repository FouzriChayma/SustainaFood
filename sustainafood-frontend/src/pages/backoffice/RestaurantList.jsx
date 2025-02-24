import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../../components/backoffcom/Sidebar";
import Navbar from "../../components/backoffcom/Navbar";
import "/src/assets/styles/backoffcss/restaurantList.css";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";

const RestaurantList = () => {
    const [restaurants, setRestaurants] = useState([]); // Stores fetched restaurants

    // Fetch restaurants from the backend
    useEffect(() => {
        axios.get("http://localhost:3000/users/list")
            .then(response => {
                const restaurantUsers = response.data.filter(user => user.role === "restaurant");
                setRestaurants(restaurantUsers);
            })
            .catch(error => console.error("Error fetching restaurants:", error));
    }, []);

    // Function to delete a restaurant
    const deleteRestaurant = async (restaurantId) => {
        if (!window.confirm("Are you sure you want to delete this restaurant?")) return;

        try {
            await axios.delete(`http://localhost:3000/users/delete/${restaurantId}`);
            alert("Restaurant deleted!");
            setRestaurants(restaurants.filter(restaurant => restaurant._id !== restaurantId)); // Update the list
        } catch (error) {
            console.error("Error deleting restaurant:", error);
        }
    };

    return (
        <div className="dashboard-container">
            <Sidebar />
            <div className="content">
                <Navbar />

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
                            {restaurants.map((restaurant, index) => (
                                <tr key={restaurant._id}>
                                    <td>{index + 1}</td>
                                    <td>
                                        <img src={restaurant.photo || "/src/assets/User_icon_2.svg.png"} 
                                            alt="Restaurant" className="restaurant-photo" />
                                    </td>
                                    <td>{restaurant.name}</td>
                                    <td>{restaurant.email}</td>
                                    <td>{restaurant.phone}</td>
                                    <td>{restaurant.taxR || "N/A"}</td>
                                    <td className="action-buttons">
                                        <button className="view-btn"><FaEye /></button>
                                        <button className="edit-btn"><FaEdit /></button>
                                        <button className="delete-btn" onClick={() => deleteRestaurant(restaurant._id)}>
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

export default RestaurantList;
