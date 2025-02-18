import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import pdp from '../assets/images/pdp1.png';
import './EditProfile.css';
import upload from '../assets/images/upload.png';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';


const EditProfile = () => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    sexe: '',
    photo: '',
    phone: '',
    vehiculeType: '',
    image_carte_etudiant: null, // File or null to handle the file object
    email: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : ''
    });
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
          <span className="editprofile-font-weight-bold">{formData.name || 'MOUNA'}</span><br/>
          <span className="editprofile-text-black-50">{formData.email || 'mbr@mail.com.my'}</span>
        </div>

        <div className="p-3 py-5">
          <h2 className="editprofile-text-right">Profile Settings</h2>

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
              </select>
              <label className="login-label">Sexe</label>
            </div>
            <div className="col-md-6 login-input-block" style={{ marginLeft: '-22px' }}>
              <input
                type="text"
                className="login-input"
                name="vehiculeType"
                value={formData.vehiculeType}
                onChange={handleChange}
                placeholder=" "
                required
              />
              <label className="login-label">Vehicle Type</label>
            </div>
          </div>

          <div className="row mt-3" style={{ marginLeft: "15px" }}>
            <div className="col-md-6 login-input-block">
              <label htmlFor="file-upload" className="custom-file-upload">
                <img src={upload} style={{ width: "20px", height: "10px", color: "gray" }} /> Choose the image of the student card
              </label>
              <input
                id="file-upload"
                type="file"
                className="login-input"
                name="image_carte_etudiant"
                onChange={handleFileChange}
                style={{ display: "none" }} // Hide the original upload button
              />
              {formData.image_carte_etudiant && (
                <div className="file-name">
                  <p>{formData.image_carte_etudiant.name}</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-5 text-center">
          <Link to="/profile">
            <button className="btn login-button" type="button">
              Save Profile
            </button></Link>
          </div>
        </div>
      </div>
      <br/><br/>
      <Footer />

    </>
  );
};

export default EditProfile;
