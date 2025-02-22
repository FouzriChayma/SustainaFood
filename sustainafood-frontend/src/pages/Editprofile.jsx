import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import pdp from '../assets/images/pdp1.png';
import '../assets/styles/EditProfile.css';
import upload from '../assets/images/upload.png';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../contexts/AuthContext";
import { getUserById, updateUser } from "../api/userService";

const EditProfile = () => {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  // Détecte le rôle de l'utilisateur connecté
  const role = authUser?.role;

  // État local pour le formulaire, initialement vide
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    sexe: '',
    photo: '',
    vehiculeType: '',
    image_carte_etudiant: null, // Pour les étudiants
    type: ''                // Pour les ONG (type d'ONG)
  });

  // Utilise un useEffect pour récupérer les données complètes du user via l'API
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (authUser && authUser.id) {
        try {
          const response = await getUserById(authUser.id);
          const userData = response.data;
          setFormData({
            name: userData.name || '',
            email: userData.email || '',
            phone: userData.phone || '',
            address: userData.address || '',
            sexe: userData.sexe || '',
            photo: userData.photo || '',
            vehiculeType: userData.vehiculeType || '',
            image_carte_etudiant: userData.image_carte_etudiant || null,
            type: userData.type || ''
          });
        } catch (error) {
          console.error("Erreur lors de la récupération des données utilisateur :", error);
        }
      }
    };
    fetchUserDetails();
  }, [authUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Empêche le rechargement de la page
    try {
      await updateUser(authUser.id, formData);
      navigate("/profile");
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil :", error);
      alert("Erreur lors de la mise à jour. Veuillez réessayer.");
    }
  };

  return (
    <>
      <Navbar />
      <div className="editprofile-container rounded bg-white mt-5 mb-5">
        <div className="editprofile-profile-image-container text-center">
          <img
            className="editprofile-profile-image"
            width="150px"
            src={pdp}
            alt="Profile"
          />
          <br />
          <span className="editprofile-font-weight-bold">
            {formData.name || 'MOUNA'}
          </span>
          <br />
          <span className="editprofile-text-black-50">
            {formData.email || 'mbr@mail.com.my'}
          </span>
        </div>

        <div className="p-3 py-5">
          <h2 className="editprofile-text-right">Profile Settings</h2>
          <form onSubmit={handleSubmit}>
            <div className="editprofile-row mt-2">
              <div className="col-md-6 login-input-block">
                <input
                  type="text"
                  className="login-input"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder=" "
                />
                <label className="login-label">Name</label>
              </div>
              <div className="col-md-6 login-input-block">
                <input
                  type="email"
                  className="login-input"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder=" "
                />
                <label className="login-label">Email</label>
              </div>
            </div>

            <div className="editprofile-row mt-3">
              <div className="col-md-6 login-input-block">
                <input
                  type="number"
                  className="login-input"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder=" "
                />
                <label className="login-label">Mobile Number</label>
              </div>
              <div className="col-md-6 login-input-block">
                <input
                  type="text"
                  className="login-input"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  placeholder=" "
                />
                <label className="login-label">Address</label>
              </div>
            </div>

            <div className="editprofile-row mt-3">
              <div className="col-md-6 login-input-block" style={{ width: '270px', marginLeft: '-14px' }}>
                <select
                  className="login-input"
                  name="sexe"
                  value={formData.sexe}
                  onChange={handleChange}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                <label className="login-label">Sexe</label>
              </div>
              {role === 'transporter' && (
                <div className="col-md-6 login-input-block" style={{ marginLeft: '-22px' }}>
                  <input
                    type="text"
                    className="login-input"
                    name="vehiculeType"
                    value={formData.vehiculeType}
                    onChange={handleChange}
                    required
                    placeholder=" "
                  />
                  <label className="login-label">Vehicle Type</label>
                </div>
              )}
              {role === 'ong' && (
                <div className="col-md-6 login-input-block" style={{ marginLeft: '-22px' }}>
                  <select
                    className="login-input"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                  >
                    <option value="">Select ONG Type</option>
                    <option value="advocacy">Advocacy</option>
                    <option value="operational">Operational</option>
                    <option value="charitable">Charitable</option>
                    <option value="development">Development</option>
                    <option value="environmental">Environmental</option>
                    <option value="human-rights">Human Rights</option>
                    <option value="relief">Relief</option>
                    <option value="research">Research</option>
                    <option value="philanthropic">Philanthropic</option>
                    <option value="social_welfare">Social Welfare</option>
                    <option value="cultural">Cultural</option>
                    <option value="faith_based">Faith Based</option>
                  </select>
                  <label className="login-label">ONG Type</label>
                </div>
              )}
            </div>

            {role === 'student' && (
              <div className="row mt-3" style={{ marginLeft: "15px" }}>
                <div className="col-md-6 login-input-block">
                  <label htmlFor="file-upload-student" className="custom-file-upload">
                    <img src={upload} style={{ width: "20px", height: "10px", color: "gray" }} /> Choose the image of the student card
                  </label>
                  <input
                    id="file-upload-student"
                    type="file"
                    className="login-input"
                    name="image_carte_etudiant"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                  />
                  {formData.image_carte_etudiant && (
                    <div className="file-name">
                      <p>{formData.image_carte_etudiant.name}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="mt-5 text-center">
              <button className="btn login-button" type="submit">
                Save Profile
              </button>
            </div>
          </form>
        </div>
      </div>
      <br /><br />
      <Footer />
    </>
  );
};

export default EditProfile;
