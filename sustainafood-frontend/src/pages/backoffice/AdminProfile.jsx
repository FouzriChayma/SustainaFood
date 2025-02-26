import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../../components/backoffcom/Sidebar";
import Navbar from "../../components/backoffcom/Navbar";
import "/src/assets/styles/backoffcss/adminProfile.css";
import { FaCamera, FaEdit, FaTimes , FaSave  } from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";
import { getUserById, updateUser } from "../../api/userService";

const AdminProfile = () => {
  const { user: authUser, token } = useAuth();
  const [admin, setAdmin] = useState({
    name: "",
    email: "",
    address: "",
    phone: "",
    photo: "/src/assets/admin.jpg", // default fallback
  });

  // File for new profile photo
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);

  // For editing personal info
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editedData, setEditedData] = useState({ ...admin });

  useEffect(() => {
    if (!token) {
      console.error("No token found. User is not authenticated.");
      return;
    }

    const fetchUserData = async () => {
      try {
        if (!authUser || !authUser.id) {
          console.error("⛔ authUser id is undefined!");
          return;
        }

        const response = await getUserById(authUser.id);
        const userData = response.data;

        setAdmin({
          name: userData.name || "",
          email: userData.email || "",
          address: userData.address || "",
          phone: userData.phone || "",
          photo: userData.photo
            ? `http://localhost:3000/${userData.photo}`
            : "/src/assets/admin.jpg",
        });
      } catch (error) {
        console.error("❌ Backend Error:", error);
      }
    };

    fetchUserData();
  }, [authUser, token]);

  // When user selects a file for profile photo
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // For immediate preview
      setAdmin((prev) => ({
        ...prev,
        photo: URL.createObjectURL(file),
      }));
      // Store the actual file for uploading
      setProfilePhotoFile(file);
    }
  };

  // Save only the image
  const handleSaveImage = async (e) => {
    e.preventDefault(); // Prevent default form submission
    try {
      if (!authUser || !authUser.id) {
        console.error("⛔ authUser id is undefined!");
        return;
      }

      if (!profilePhotoFile) {
        alert("No new image selected.");
        return;
      }

      const formData = new FormData();
      // Append the new photo file
      formData.append("photo", profilePhotoFile);

      // Call the updateUser API
      const response = await updateUser(authUser.id, formData);

      if (response.status === 200) {
        alert("Profile image updated successfully!");
      } else {
        alert("Failed to update profile image.");
      }
    } catch (error) {
      console.error("❌ Error updating profile image:", error);
      alert("An error occurred while updating the profile image.");
    }
  };

  // Open/Close the personal info edit modal
  const openEditModal = () => {
    setEditedData({ ...admin });
    setIsEditModalOpen(true);
  };
  const closeModal = () => {
    setIsEditModalOpen(false);
  };

  // Save personal info changes (name, email, address, phone)
  const handleSaveChanges = async () => {
    try {
      if (!authUser || !authUser.id) {
        console.error("⛔ authUser id is undefined!");
        return;
      }

      const formData = new FormData();
      formData.append("name", editedData.name);
      formData.append("email", editedData.email);
      formData.append("address", editedData.address);
      formData.append("phone", editedData.phone);

      // We are not dealing with the photo here, so skip it

      const response = await updateUser(authUser.id, formData);

      if (response.status === 200) {
        // Update local state
        setAdmin((prev) => ({
          ...prev,
          name: editedData.name,
          email: editedData.email,
          address: editedData.address,
          phone: editedData.phone,
        }));
        alert("Profile updated successfully!");
      } else {
        alert("Failed to update profile.");
      }
    } catch (error) {
      console.error("❌ Error updating profile:", error);
      alert("An error occurred while updating the profile.");
    } finally {
      closeModal();
    }
  };

  return (
    <div className="admin-dashboard">
      <Sidebar />
      <div className="profile-container">
        <Navbar />

        <div className="profile-header">
          <h2>My Profile</h2>
          <div className="profile-line"></div>
        </div>
        
        <div className="profile-card">
        <form onSubmit={handleSaveImage}>
          <div className="profile-pic">
            {/* We wrap the image + camera icon + "Save Image" button in a form */}
            
              <img src={admin.photo} alt="Profile" />
              <label className="upload-icon">
                <FaCamera />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="file-input"
                />
              </label>
              </div>
              <button type="submit" className="save-image-btn" onClick={handleSaveChanges}>
                    <FaSave className="save-icon" /> {/* Use the save icon */}
                </button>
            
          
        </form>
        <div >
    <h2>{admin.name}</h2>
    <p>{admin.email}</p>
    <p>{admin.address}</p>
    <p>{admin.phone}</p>
</div>

        </div>

        <div className="info-section">
          <div className="section-header">
            <h3>Personal Information</h3>
            <button className="edit-btn" onClick={openEditModal}>
              <FaEdit /> Edit
            </button>
          </div>
          <div className="profile-line"></div>
          <div className="info-grid">
            <div>
              <p className="label">Name</p>
              <p>{admin.name}</p>
            </div>
            <div>
              <p className="label">Email Address</p>
              <p>{admin.email}</p>
            </div>
            <div>
              <p className="label">Address</p>
              <p>{admin.address}</p>
            </div>
            <div>
              <p className="label">Phone Number</p>
              <p>{admin.phone}</p>
            </div>
          </div>
        </div>

        {isEditModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Edit Personal Information</h3>
                <button className="close-btn" onClick={closeModal}>
                  <FaTimes />
                </button>
              </div>
              <div className="modal-body">
                <label>Name</label>
                <input
                  type="text"
                  value={editedData.name}
                  onChange={(e) =>
                    setEditedData({ ...editedData, name: e.target.value })
                  }
                />

                <label>Email Address</label>
                <input
                  type="email"
                  value={editedData.email}
                  onChange={(e) =>
                    setEditedData({ ...editedData, email: e.target.value })
                  }
                />

                <label>Address</label>
                <input
                  type="text"
                  value={editedData.address}
                  onChange={(e) =>
                    setEditedData({ ...editedData, address: e.target.value })
                  }
                />

                <label>Phone Number</label>
                <input
                  type="text"
                  value={editedData.phone}
                  onChange={(e) =>
                    setEditedData({ ...editedData, phone: e.target.value })
                  }
                />
              </div>
              <div className="modal-footer">
                <button className="save-btn" onClick={handleSaveChanges}>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProfile;
