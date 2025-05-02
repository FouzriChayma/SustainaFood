import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../assets/styles/Contact.css';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import { submitContactForm } from '../api/contactService';

const Contact = () => {
  const [feedback, setFeedback] = useState({
    name: '',
    email: '',
    comment: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFeedback({ ...feedback, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!feedback.name || !feedback.email || !feedback.comment) {
      setError('Please fill in all fields before submitting!');
      return;
    }

    try {
      await submitContactForm(feedback);
      setSubmitted(true);
      setError(null);
      setFeedback({ name: '', email: '', comment: '' }); // Reset form
    } catch (err) {
      setError(err.message || 'Failed to submit the form. Please try again.');
    }
  };

  return (
    <>
      <Navbar />
      <div className="contact-page">
        <h2 className="contact-title">Get In Touch</h2>
        <a className='contact-message'> Have a question, a suggestion, or need assistance? We’re here to help! Whether you're looking for support,
          partnership opportunities, or more information about our services, feel free to reach out. Our team will respond as soon as possible.</a>
        <div className="contact-container">
          <div className="contact-info">
            <div className="contact-box">
              <FaMapMarkerAlt size={30} color="#8dc73f" />
              <div className="content">
                <h4>Address</h4>
                <p>Pôle Technologique El Ghazela , Ariana Tunis</p>
              </div>
            </div>
            <div className="contact-box">
              <FaPhone size={30} color="#8dc73f" />
              <div className="content">
                <h4>Phone</h4>
                <p>+216 123 456 789</p>
              </div>
            </div>
            <div className="contact-box">
              <FaEnvelope size={30} color="#8dc73f" />
              <div className="content">
                <h4>Email</h4>
                <p>info@sustainafood.com</p>
              </div>
            </div>
            <div className="contact-box">
              <FaClock size={30} color="#8dc73f" />
              <div className="content">
                <h4>Working Hours</h4>
                <p>Mon - Fri: 9 AM - 6 PM</p>
              </div>
            </div>
          </div>
          <div className="feedback-form-container">
            <h3>Leave a message</h3>
            <form onSubmit={handleSubmit} className="feedback-form">
              <input type="text" name="name" placeholder="Your Name" value={feedback.name} onChange={handleChange} required />
              <input type="email" name="email" placeholder="Your Email" value={feedback.email} onChange={handleChange} required />
              <textarea name="comment" placeholder="Your Message" value={feedback.comment} onChange={handleChange} required />
              <button className="feedback-success" type="submit">Send</button>
            </form>
            {error && <p className="error-message">{error}</p>}
            {submitted && (
              <div className="feedback-success">
                <p>Thank you for your feedback, {feedback.name || 'Visitor'}!</p>
                <button onClick={() => setSubmitted(false)}>Send Another Message</button>
              </div>
            )}
          </div>
        </div>
        <div className="contact-map">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3164.329763530718!2d10.1772!3d36.8760!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12d347f3d5b8d4d5%3A0x3a8d6db8ed2f31b0!2sAriana+Soghra!5e0!3m2!1sen!2stn!4v1622064481553"
            width="100%"
            height="400"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Contact;