import React from "react";
import { FaUtensils, FaLink, FaBox, FaGlobe } from "react-icons/fa";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const About = () => {
  return (
    <>
    <Navbar/>
    <div>
      <style>
        {`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: 'Arial', sans-serif;
        }
        .about-container {
          background-color: #f1f9f1;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          text-align: center;
        }
        .about-title {
          font-size: 36px;
          font-weight: bold;
          color: #4CAF50;
          margin-bottom: 15px;
        }
        .about-description {
          color: #333;
          font-size: 18px;
          max-width: 800px;
          margin-bottom: 30px;
          line-height: 1.6;
        }
        .about-values {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 20px;
          width: 100%;
          max-width: 900px;
          margin-bottom: 40px;
        }
        .value-item {
          background-color: #fff;
          border-radius: 10px;
          padding: 20px;
          width: 200px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          text-align: center;
          transition: transform 0.3s;
        }
        .value-item:hover {
          transform: translateY(-5px);
        }
        .about-section {
          background-color: white;
          border-radius: 10px;
          padding: 30px;
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          max-width: 900px;
          width: 100%;
          margin-bottom: 40px;
        }
        .about-card {
          width: 45%;
          text-align: left;
        }
        .about-card-title {
          font-size: 22px;
          font-weight: bold;
          color: #4CAF50;
          margin-bottom: 10px;
        }
        .about-card-text {
          color: #555;
          font-size: 16px;
          line-height: 1.6;
        }
        .about-button {
          display: inline-block;
          margin: 10px auto;
          background-color: #4CAF50;
          color: white;
          padding: 12px 30px;
          border: none;
          border-radius: 50px;
          font-size: 18px;
          cursor: pointer;
          transition: background 0.3s;
          text-align: center;
          white-space: nowrap;
        }
        .about-button:hover {
          background-color: #388E3C;
        }
        `}
      </style>
      <div className="about-container">
        <h2 className="about-title">Welcome to SustainaFood</h2>
        <p className="about-description">
        Connecting donors, recipients, and transporters to minimize food waste and optimize distribution.        </p>

        <div className="about-values">
          <div className="value-item">
            <FaUtensils size={40} color="#4CAF50" />
            <p>Less Waste</p>
          </div>
          <div className="value-item">
            <FaLink size={40} color="#4CAF50" />
            <p>Stronger Links</p>
          </div>
          <div className="value-item">
            <FaBox size={40} color="#4CAF50" />
            <p>Smart Sharing</p>
          </div>
          <div className="value-item">
            <FaGlobe size={40} color="#4CAF50" />
            <p>Green Future</p>
          </div>
        </div>

        <div className="about-section">
          <div className="about-card">
            <h3 className="about-card-title">🌍 Our Vision</h3>
            <p className="about-card-text">
              To build a world where food surplus is efficiently redistributed, minimizing waste.
            </p>
          </div>
          <div className="about-card">
            <h3 className="about-card-title">🚀 Our Mission</h3>
            <p className="about-card-text">
              To provide an intelligent platform that optimizes food distribution, fosters community engagement, and promotes environmental sustainability.
            </p>
          </div>
        </div>

      </div>
    </div>
    <Footer/>
    </>
  );
};

export default About;