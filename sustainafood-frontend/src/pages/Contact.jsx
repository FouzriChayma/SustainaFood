import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './Contact.css';
import { BsFillTelephoneFill } from "react-icons/bs";
import { GiPositionMarker } from "react-icons/gi";
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock } from 'react-icons/fa';  // Importation des icônes



const Contact = () => {
  const [feedback, setFeedback] = useState({
    name: '',
    email: '',
    rating: '',
    comment: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFeedback({ ...feedback, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!feedback.name || !feedback.email || !feedback.rating || !feedback.comment) {
      alert('Please fill in all fields before submitting!');
      return;
    }
    setSubmitted(true);
  };

  return (
    <>
      <Navbar />
      <div className="contact-page">
        <h2 className="contact-title">Contact Us</h2>
        <div className="contact-container">
          <div className="contact-info">
            <div className="contact-box">
              {/* <div className="icon">📍</div> */}
              <FaMapMarkerAlt size={30} color="#4CAF50" />  {/* Icône localisation */}

              <div className="content">
                <h4>Address</h4>
                <p>123 Main Street, City, Country</p>
              </div>
            </div>
            <div className="contact-box">
              <FaPhone size={30} color="#4CAF50" />  {/* Icône téléphone */}

              <div className="content">
                <h4>Phone</h4>
                <p>+123 456 789</p>
              </div>
            </div>
            <div className="contact-box">
            <FaEnvelope size={30} color="#4CAF50" />  {/* Icône e-mail */}
            <div className="content">
                <h4>Email</h4>
                <p>contact@company.com</p>
              </div>
            </div>
            <div className="contact-box">
            <FaClock size={30} color="#4CAF50" />  {/* Icône heure */}
            <div className="content">
                <h4>Working Hours</h4>
                <p>Mon - Fri: 9 AM - 6 PM</p>
              </div>
            </div>
          </div>
          <div className="feedback-form-container">
            <h3>Leave Feedback</h3>
            <form onSubmit={handleSubmit} className="feedback-form">
              <input type="text" name="name" placeholder="Your Name" value={feedback.name} onChange={handleChange} required />
              <input type="email" name="email" placeholder="Your Email" value={feedback.email} onChange={handleChange} required />
              <select name="rating" value={feedback.rating} onChange={handleChange} required>
                <option value="">Select Rating</option>
                <option value="1">1 - Poor</option>
                <option value="2">2 - Fair</option>
                <option value="3">3 - Good</option>
                <option value="4">4 - Very Good</option>
                <option value="5">5 - Excellent</option>
              </select>
              <textarea name="comment" placeholder="Your Feedback" value={feedback.comment} onChange={handleChange} required />
              <button type="submit">Submit Feedback</button>
            </form>
            {submitted && (
              <div className="feedback-success">
                <p>Thank you for your feedback, {feedback.name}!</p>
                <button onClick={() => setSubmitted(false)}>Edit Feedback</button>
              </div>
            )}
          </div>
        </div>
        <div className="contact-map">
          <iframe 
            src="https://www.google.com/maps/embed?..." 
            width="100%" 
            height="400" 
            style={{ border: 0 }} 
            allowFullScreen="" 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Contact;
