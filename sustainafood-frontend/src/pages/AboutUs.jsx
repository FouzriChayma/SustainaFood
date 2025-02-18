import React from "react";

const AboutUs = () => {
  return (
    <div>
      <style>
        {`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        .about-container {
          background-color: #f9f6ef;
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 40px;
          width: 100vw;
        }
        .about-content {
          max-width: 800px;
          text-align: center;
        }
        .about-subtitle {
          font-size: 14px;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 2px;
        }
        .about-title {
          font-size: 32px;
          font-weight: bold;
          color: #222;
          margin-top: 10px;
          line-height: 1.4;
        }
        .about-description {
          color: #555;
          font-size: 16px;
          margin-top: 20px;
          line-height: 1.6;
        }
        .about-values {
          background-color: #0d4729;
          color: white;
          border-radius: 10px;
          padding: 20px;
          margin-top: 30px;
          display: flex;
          justify-content: space-around;
          align-items: center;
          gap: 40px;
          text-align: center;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          width: 100%;
        }
        .value-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          font-size: 18px;
          width: 20%;
        }
        .value-icon {
          font-size: 30px;
          margin-bottom: 10px;
        }
        .about-section {
          background-color: white;
          border-radius: 10px;
          padding: 30px;
          margin-top: 30px;
          display: flex;
          justify-content: space-between;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          width: 100%;
        }
        .about-card {
          width: 45%;
          text-align: left;
        }
        .about-card-title {
          font-size: 20px;
          font-weight: bold;
          color: #0d4729;
          display: flex;
          align-items: center;
        }
        .about-card-text {
          color: #555;
          font-size: 16px;
          margin-top: 10px;
          line-height: 1.6;
        }
        .about-button {
          margin-top: 30px;
          background-color: #0d4729;
          color: white;
          padding: 12px 24px;
          border: none;
          border-radius: 5px;
          font-size: 18px;
          cursor: pointer;
          transition: background 0.3s ease-in-out;
        }
        .about-button:hover {
          background-color: #0b3a1e;
        }
        `}
      </style>
      <div className="about-container">
        <div className="about-content">
          <h3 className="about-subtitle">ABOUT US</h3>
          <h2 className="about-title">
            Empowering Sustainability, <br /> Less Waste
          </h2>
          <p className="about-description">
            We are committed to reducing food waste by redistributing surplus food . Our platform connects businesses and communities to create a sustainable food ecosystem.
          </p>

          <div className="about-values">
            <div className="value-item">
              <span className="value-icon">🍽️</span> <p>Less Waste</p>
            </div>
            <div className="value-item">
              <span className="value-icon">🔗</span> <p>Stronger Links</p>
            </div>
            <div className="value-item">
              <span className="value-icon">📦</span> <p>Smart Sharing</p>
            </div>
            <div className="value-item">
              <span className="value-icon">🌍</span> <p>Green Future</p>
            </div>
          </div>

          <div className="about-section">
            <div className="about-card">
              <h3 className="about-card-title">🌍 Our Vision</h3>
              <p className="about-card-text">
                To build a world where food surplus is efficiently redistributed, minimizing waste .
              </p>
            </div>
            <div className="about-card">
              <h3 className="about-card-title">🚀 Our Mission</h3>
              <p className="about-card-text">
                To provide an intelligent platform that optimizes food distribution, fosters community engagement, and promotes environmental sustainability.
              </p>
            </div>
          </div>

          <button className="about-button">Know More About Us</button>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
