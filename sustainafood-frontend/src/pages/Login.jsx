import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import logo from "../assets/images/welcomee.png"; 

const Login = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [check, setCheck] = useState(0);

  const handleCtaClick = () => {
    setIsExpanded(!isExpanded);
    setCheck(check === 0 ? 1 : 0);
  };

  return (
    <div className="wrapper">
      <div className={`login-text ${isExpanded ? "expand" : ""}`}>
        <button className="cta" onClick={handleCtaClick}>
          <FontAwesomeIcon icon={check === 0 ? faChevronDown : faChevronUp} />
        </button>
        <div className={`text ${isExpanded ? "show-hide" : ""}`}>
          <a href="">Login</a>
          <hr />
          <br />
          <input type="text" placeholder="Username" />
          <br />
          <input type="password" placeholder="Password" />
          <br />
          <button className="login-btn">Log In</button>
          <button className="signup-btn">Sign Up</button>
        </div>
      </div>
      <div className="call-text">
        <img src={logo} alt="Logo" className="logo" />
      </div>
      <style>{`
        body {
          font-family: 'Raleway', sans-serif;
          background-color: #e7e7e7;
        }

        .wrapper {
          width: 1100px;
          height: 620px;
          position: relative;
          box-shadow: 2px 18px 70px 0px #9D9D9D;
          overflow: hidden;
        }

        .login-text {
          width: 1100px;
          height: 450px;
          background: #8dc73f;
          position: absolute;
          top: -300px;
          box-sizing: border-box;
          padding: 6%;
          transition: all 0.5s ease-in-out;
          z-index: 11;
        }

        .text {
          margin-left: 20px;
          color: #fff;
          display: none;
          transition: all 0.5s ease-in-out;
          transition-delay: 0.3s;
        }

        .text a,
        .text a:visited {
          font-size: 36px;
          color: #fff;
          text-decoration: none;
          font-weight: bold;
          display: block;
        }

        .text hr {
          width: 10%;
          float: left;
          background-color: #fff;
          font-size: 16px;
        }

        .text input {
          margin-top: 30px;
          height: 40px;
          width: 300px;
          border-radius: 2px;
          border: none;
          background-color: #444;
          opacity: 0.6;
          outline: none;
          color: #fff;
          padding-left: 10px;
        }

        .text input[type="text"] {
          margin-top: 60px;
        }

        .text button {
          margin-top: 60px;
          height: 40px;
          width: 140px;
          outline: none;
        }

        .login-btn {
          background: #fff;
          border: none;
          border-radius: 2px;
          color: #696a86;
        }

        .signup-btn {
          background: transparent;
          border: 2px solid #fff;
          border-radius: 2px;
          color: #fff;
          margin-left: 30px;
        }

        .cta {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: #000000;
          border: 2px solid #fff;
          position: absolute;
          bottom: -30px;
          left: 530px;
          color: #fff;
          outline: none;
          cursor: pointer;
          z-index: 11;
        }

        .call-text {
          background-color: #fff;
          width: 1100px;
          height: 500px;
          position: absolute;
          bottom: 0;
          padding: 0;
          box-sizing: border-box;
          text-align: center;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .logo {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .show-hide {
          display: block;
        }

        .expand {
          transform: translateY(300px);
        }
      `}</style>
    </div>
  );
};

export default Login;


