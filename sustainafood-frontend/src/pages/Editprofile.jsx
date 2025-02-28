import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import pdp from '../assets/images/pdp1.png'; // Default fallback image
import '../assets/styles/EditProfile.css'; // Import the CSS file
import upload from '../assets/images/upload.png';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../contexts/AuthContext";
import { getUserById, updateUser } from "../api/userService";
import { FaCamera } from 'react-icons/fa';

const EditProfile = () => {
  const [fileName, setFileName] = useState("");
  const [imagePreview, setImagePreview] = useState(null);

  
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const[authUserId, setAuthUserId] = useState(null);
  const role = authUser?.role;
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    photo: '',
    address: '',
    // For student
    sexe: '',
    num_cin: '',
    age: '',
    image_carte_etudiant: null,
    // For ONG
    id_fiscale: '',
    type: '',
    // For restaurant/supermarket
    taxReference: '',
    // For transporter
    vehiculeType: ''
  });

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (typeof authUser.id === "string") {
        setAuthUserId(authUser.id);
        if (authUser && authUser.id) {
        try {
          const response = await getUserById(authUser.id);
          const userData = response.data;
          setFormData({
            name: userData.name || '',
            email: userData.email || '',
            phone: userData.phone || '',
            photo: userData.photo || '',
            address: userData.address || '',
            // Student
            sexe: userData.sexe || '',
            num_cin: userData.num_cin || '',
            age: userData.age || '',
            image_carte_etudiant: userData.image_carte_etudiant || null,
            // ONG
            id_fiscale: userData.id_fiscale || '',
            type: userData.type || '',
            // Restaurant / Supermarket
            taxReference: userData.taxReference || '',
            // Transporter
            vehiculeType: userData.vehiculeType || ''
          });
        } catch (error) {
          console.error("Erreur lors de la récupération des données utilisateur :", error);
        }
      }}
      else if (typeof authUser.id === "number") {
        setAuthUserId(authUser._id);
        if (authUser && authUser._id) {
          try {
            const response = await getUserById(authUser._id);
            const userData = response.data;
            setFormData({
              name: userData.name || '',
              email: userData.email || '',
              phone: userData.phone || '',
              photo: userData.photo || '',
              address: userData.address || '',
              // Student
              sexe: userData.sexe || '',
              num_cin: userData.num_cin || '',
              age: userData.age || '',
              image_carte_etudiant: userData.image_carte_etudiant || null,
              // ONG
              id_fiscale: userData.id_fiscale || '',
              type: userData.type || '',
              // Restaurant / Supermarket 
              taxReference: userData.taxReference || '',  
              // Transporter
              vehiculeType: userData.vehiculeType || ''
              });
          } catch (error) { 
            console.error("Erreur lors de la récupération des données utilisateur :", error);
          }
        }
      }
    };
    fetchUserDetails();
  }, [authUser]);

  // Build the actual URL for the user's photo if it's stored as "uploads/<filename>"
  // Otherwise, use the default "pdp" fallback.
  const profilePhotoUrl = 
    formData.photo && typeof formData.photo === 'string'
      ? `http://localhost:3000/${formData.photo}` 
      : pdp;

  // Update text input values
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Update file input values
  const handleFileChange = (event) => {
    const { name, files } = event.target;
    if (files && files.length > 0) {
      const file = files[0];
      setFormData(prev => ({ ...prev, [name]: file }));
      setFileName(file.name);

      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };


  // Submit the form using FormData
  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append('name', formData.name);
    data.append('email', formData.email);
    data.append('phone', formData.phone);
    data.append('address', formData.address);
    data.append('age', formData.age);
    data.append('sexe', formData.sexe);
    data.append('num_cin', formData.num_cin);
    data.append('id_fiscale', formData.id_fiscale);
    data.append('type', formData.type);
    data.append('taxReference', formData.taxReference);
    data.append('vehiculeType', formData.vehiculeType);

    if (formData.photo instanceof File) {
      data.append('photo', formData.photo);
    } else if (formData.photo) {
      data.append('photo', formData.photo);
    }
    if (role === 'student') {
      if (formData.image_carte_etudiant instanceof File) {
        data.append('image_carte_etudiant', formData.image_carte_etudiant);
      } else if (formData.image_carte_etudiant) {
        data.append('image_carte_etudiant', formData.image_carte_etudiant);
      }
    }

    try {

      await updateUser(authUserId, data);
      console.log(formData.taxReference);
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
        <div className="editprofile-profile-image-container ">
          <img 
            src={imagePreview || profilePhotoUrl} 
            className="editprofile-profile-image" 
            alt="Profile Preview" 
          />
          <label htmlFor="file-upload-photo" className="editprofile-photo-icon" title="Change Photo">
            <FaCamera style={{ fontSize: "18px", color: "#333" }} />
          </label>
          <input
            id="file-upload-photo"
            type="file"
            name="photo"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />

          <br />
          <span className="editprofile-font-weight-bold">
            {formData.name || 'Nom utilisateur'}
          </span>
          <br />
          <span className="editprofile-text-black-50">
            {formData.email || 'email@exemple.com'}
          </span>
        </div>

        <div >
          <h2 className="editprofile-text-right" style={{marginTop:"70px"}}>Profile Settings</h2>
          <form onSubmit={handleSubmit}>
            {/* Common fields: Name and Email */}
            <div className="editprofile-row">
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

            {/* Common fields: Phone and Address */}
            <div className="editprofile-row">
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

            {/* Role-specific fields */}
            {role === 'student' && (
              <>
                <div className="editprofile-row ">
                  <div className="col-md-6 login-input-block" style={{ width: '270px' }}>
                    <select
                      className="login-input"
                      name="sexe"
                      value={formData.sexe}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                    <label className="login-label">Sexe</label>
                  </div>
                  <div className="col-md-6 login-input-block">
                    <input
                      type="number"
                      className="login-input"
                      name="age"
                      value={formData.age}
                      onChange={handleChange}
                      required
                      placeholder=" "
                    />
                    <label className="login-label">Age</label>
                  </div>
                </div>
                <div className="editprofile-row">
                  <div className="col-md-6 login-input-block">
                    <input
                      type="text"
                      className="login-input"
                      name="num_cin"
                      value={formData.num_cin}
                      onChange={handleChange}
                      required
                      placeholder=" "
                    />
                    <label className="login-label">Num CIN</label>
                  </div>
                </div>
                {/* Student Card Image Upload */}
                <div className="row3">
                  <div className="col-md-6 login-input-block">
                    <label htmlFor="file-upload-student" className="custom-file-upload">
                      <img 
                        src={upload} 
                        alt="upload" 
                        style={{ width: "20px", height: "10px", color: "gray" }} 
                      /> 
                      Choose Student Card Image
                    </label>
                    <input
                      id="file-upload-student"
                      type="file"
                      className="login-input"
                      name="image_carte_etudiant"
                      onChange={handleFileChange}
                    />
                    {/* Show file name if a new file is selected */}
                    {formData.image_carte_etudiant && typeof formData.image_carte_etudiant === 'object' && (
                      <div className="file-name">
                        <p>{formData.image_carte_etudiant.name}</p>
                      </div>
                    )}
                    {/* Display existing student card image if it's a string */}
                    {typeof formData.image_carte_etudiant === 'string' && formData.image_carte_etudiant && (
                      <div className="student-card-preview" style={{ marginTop: "10px" }}>
                        <img 
                          src={`http://localhost:3000/${formData.image_carte_etudiant}`} 
                          alt="Existing Student Card" 
                          style={{ width: "200px", height: "auto", border: "1px solid #ccc", borderRadius: "5px" }} 
                        />
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {role === 'ong' && (
              <>
                <div className="editprofile-row">
                  <div className="col-md-6 login-input-block">
                    <input
                      type="text"
                      className="login-input"
                      name="id_fiscale"
                      value={formData.id_fiscale}
                      onChange={handleChange}
                      required
                      placeholder=" "
                    />
                    <label className="login-label">ID Fiscale</label>
                  </div>
                  <div className="col-md-6 login-input-block" style={{ marginLeft: '-22px' }}>
                    <select
                      className="login-input"
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      required
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
                </div>
              </>
            )}

            {(role === 'restaurant' || role === 'supermarket') && (
              <>
                <div className="editprofile-row ">
                  <div className="col-md-6 login-input-block">
                    <input
                      type="text"
                      className="login-input"
                      name="taxReference"
                      value={formData.taxReference}
                      onChange={handleChange}
                      required
                      placeholder=" "
                    />
                    <label className="login-label">Tax Reference</label>
                  </div>
                </div>
              </>
            )}

            {role === 'transporter' && (
              <>
                <div className="editprofile-row ">
                  <div className="col-md-6 login-input-block">
                    <select
                      className="login-input"
                      name="vehiculeType"
                      value={formData.vehiculeType}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Vehicle Type</option>
                      <option value="car">Car</option>
                      <option value="motorbike">Motorbike</option>
                      <option value="bicycle">Bicycle</option>
                      <option value="van">Van</option>
                      <option value="truck">Truck</option>
                      <option value="scooter">Scooter</option>
                    </select>
                    <label className="login-label">Vehicle Type</label>
                  </div>
                </div>
              </>
            )}

            <div className=" text-center">
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
