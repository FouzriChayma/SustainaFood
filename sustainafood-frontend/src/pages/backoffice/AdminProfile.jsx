import React, { useState } from "react";
import Sidebar from "../../components/backoffcom/Sidebar";
import Navbar from "../../components/backoffcom/Navbar";
import { FaCamera, FaEdit, FaTimes } from "react-icons/fa";
import "/src/assets/styles/backoffcss/adminProfile.css";

const AdminProfile = () => {
    const [admin, setAdmin] = useState({
        firstName: "Mariem",
        lastName: "Touzri",
        email: "mariem.touzri@example.com",
        phone: "+216 98 765 432",
        dateOfBirth: "1995-10-12",
        role: "Admin",
        country: "Tunisia",
        city: "Tunis",
        postalCode: "1002",
        photo: "/src/assets/admin.jpg",
    });

    // ✅ États pour gérer les modales
    const [isPersonalModalOpen, setIsPersonalModalOpen] = useState(false);
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [editedData, setEditedData] = useState({ ...admin });

    // ✅ Fonction pour uploader une image
    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAdmin({ ...admin, photo: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    // ✅ Fonctions pour ouvrir/fermer les modales
    const openPersonalModal = () => {
        setEditedData({ ...admin });
        setIsPersonalModalOpen(true);
    };

    const openAddressModal = () => {
        setEditedData({ ...admin });
        setIsAddressModalOpen(true);
    };

    const closeModals = () => {
        setIsPersonalModalOpen(false);
        setIsAddressModalOpen(false);
    };

    const handleSaveChanges = () => {
        setAdmin(editedData);
        closeModals();
    };

    return (
        <div className="admin-dashboard">
            <Sidebar />
            <div className="profile-container">
                <Navbar />

                {/* ✅ "My Profile" avec ligne */}
                <div className="profile-header">
                    <h2>My Profile</h2>
                    <div className="profile-line"></div>
                </div>

                {/* ✅ Carte de profil */}
                <div className="profile-card">
                    <div className="profile-pic">
                        <img src={admin.photo} alt="Profile" />
                        <label className="upload-icon">
                            <FaCamera />
                            <input type="file" accept="image/*" onChange={handleImageUpload} className="file-input" />
                        </label>
                    </div>
                    <div className="profile-info">
                        <h2>{admin.firstName} {admin.lastName}</h2>
                        <p>{admin.role}</p>
                        <p>{admin.city}, {admin.country}</p>
                    </div>
                </div>

                {/* ✅ Section d'information personnelle */}
                <div className="info-section">
                    <div className="section-header">
                        <h3>Personal Information</h3>
                        <button className="edit-btn" onClick={openPersonalModal}><FaEdit /> Edit</button>
                    </div>
                    <div className="profile-line"></div>
                    <div className="info-grid">
                        <div><p className="label">First Name</p><p>{admin.firstName}</p></div>
                        <div><p className="label">Last Name</p><p>{admin.lastName}</p></div>
                        <div><p className="label">Email Address</p><p>{admin.email}</p></div>
                        <div><p className="label">Phone Number</p><p>{admin.phone}</p></div>
                        <div><p className="label">Date of Birth</p><p>{admin.dateOfBirth}</p></div>
                        <div><p className="label">User Role</p><p className="readonly-field">{admin.role}</p></div>
                    </div>
                </div>

                {/* ✅ Section Adresse */}
                <div className="info-section">
                    <div className="section-header">
                        <h3>Address</h3>
                        <button className="edit-btn" onClick={openAddressModal}><FaEdit /> Edit</button>
                    </div>
                    <div className="profile-line"></div>
                    <div className="info-grid">
                        <div><p className="label">Country</p><p>{admin.country}</p></div>
                        <div><p className="label">City</p><p>{admin.city}</p></div>
                        <div><p className="label">Postal Code</p><p>{admin.postalCode}</p></div>
                    </div>
                </div>

                {/* ✅ Modale d'édition des informations personnelles */}
                {isPersonalModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h3>Edit Personal Information</h3>
                                <button className="close-btn" onClick={closeModals}><FaTimes /></button>
                            </div>
                            <div className="modal-body">
                                <label>First Name</label>
                                <input type="text" value={editedData.firstName} onChange={(e) => setEditedData({ ...editedData, firstName: e.target.value })} />

                                <label>Last Name</label>
                                <input type="text" value={editedData.lastName} onChange={(e) => setEditedData({ ...editedData, lastName: e.target.value })} />

                                <label>Email Address</label>
                                <input type="email" value={editedData.email} onChange={(e) => setEditedData({ ...editedData, email: e.target.value })} />

                                <label>Phone Number</label>
                                <input type="text" value={editedData.phone} onChange={(e) => setEditedData({ ...editedData, phone: e.target.value })} />

                                <label>Date of Birth</label>
                                <input type="date" value={editedData.dateOfBirth} onChange={(e) => setEditedData({ ...editedData, dateOfBirth: e.target.value })} />

                                <label>User Role</label>
                                <input type="text" value={admin.role} disabled />
                            </div>
                            <div className="modal-footer">
                                <button className="save-btn" onClick={handleSaveChanges}>Save Changes</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ✅ Modale d'édition de l'adresse */}
                {isAddressModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h3>Edit Address</h3>
                                <button className="close-btn" onClick={closeModals}><FaTimes /></button>
                            </div>
                            <div className="modal-body">
                                <label>Country</label>
                                <input type="text" value={editedData.country} onChange={(e) => setEditedData({ ...editedData, country: e.target.value })} />

                                <label>City</label>
                                <input type="text" value={editedData.city} onChange={(e) => setEditedData({ ...editedData, city: e.target.value })} />

                                <label>Postal Code</label>
                                <input type="text" value={editedData.postalCode} onChange={(e) => setEditedData({ ...editedData, postalCode: e.target.value })} />
                            </div>
                            <div className="modal-footer">
                                <button className="save-btn" onClick={handleSaveChanges}>Save Changes</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminProfile;
