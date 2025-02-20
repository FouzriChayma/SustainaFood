import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import '../assets/styles/log.css'; // Import du CSS
import logo from "../assets/images/LogoCh.png"; // Import du logo
import loginImg from "../assets/images/Login-PNG-HD-Image.png"; 
import fbimg from "../assets/images/fb.png";
import gglimg from "../assets/images/ggl.jpg";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { loginUser } from "../api/userService";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isRightPanelActive, setIsRightPanelActive] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
  
    console.log("Tentative de connexion avec :", { email, password });
  
    if (!email || !password) {
      setError("Veuillez remplir tous les champs.");
      return;
    }
  
    try {
      const response = await loginUser({ email, password });
      console.log("Connexion réussie :", response.data);
      localStorage.setItem('iduser', response.data.id);
      const id = response.data.id; // Stocker l'ID dans une variable si besoin
      console.log("ID de l'utilisateur :", id);      
      console.log("✅ ID utilisateur stocké dans localStorage :", localStorage.getItem('iduser'));


      const token = localStorage.setItem('token', response.data.token);
      
      // ✅ Rediriger vers la page Home après connexion
      navigate("/profile"); 
    } catch (err) {
      console.error("Erreur backend :", err.response?.data || err.message);
      setError(err.response?.data?.error || "Erreur de connexion.");
    }
  };
  

  const togglePanel = () => {
    setIsRightPanelActive(!isRightPanelActive);
  };

  return (
    <div className="aa">
      <div className={`signup-container ${isRightPanelActive ? 'right-panel-active' : ''}`} id="container">
        
        {/* Section Connexion */}
        <div className="signup-form-container signup-sign-up-container">
          <form className='signup-form' onSubmit={handleLogin}>
            <h1 className='signup-h1'>Sign in</h1>
            <div className="signup-social-container">
              <a href="#" className="signup-social">
                <img src={fbimg} alt="Facebook" /> 
              </a>
              <a href="#" className="signup-social">
                <img src={gglimg} alt="Google" /> 
              </a>
            </div>
            <span>or use your account</span>

            {/* Inputs contrôlés */}
            <input
              className='signup-input'
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              className='signup-input'
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {/* Gestion des erreurs */}
            {error && <p className="error-message">{error}</p>}

            {/* Checkbox + Mot de passe oublié */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <label className="ios-checkbox green">
                <input type="checkbox" />
                <div className="checkbox-wrapper">
                  <div className="checkbox-bg"></div>
                  <svg fill="none" viewBox="0 0 24 24" className="checkbox-icon">
                    <path
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      strokeWidth="3"
                      stroke="currentColor"
                      d="M4 12L10 18L20 6"
                      className="check-path"
                    ></path>
                  </svg>
                </div>
              </label>
              <span style={{ fontSize: '14px', marginLeft: '5px' }}>Remember me</span>
              <a className='signup-a' href="#" style={{ marginLeft: 'auto' }}>Forgot your password?</a>
            </div>

            <button type="submit" className='signup-button'>Sign In</button>
            <div>
              <span style={{ fontSize: '14px' }}>Don't have an account?
                <a href="/signup"> Sign Up</a>
              </span>
            </div>
          </form>
        </div>

        {/* Section de bienvenue */}
        <div className="signup-form-container signup-sign-in-container">
          <form className='signup-form'>
            <img src={logo} alt="Logo" className="signup-logo" /> 
            <p className='signup-p'>Thank you for joining us on a mission to reduce food waste and make a positive impact.</p>
          </form>
        </div>

        {/* Overlay */}
        <div className="signup-overlay-container">
          <div className="signup-overlay">
            <div className="signup-overlay-panel signup-overlay-left">
              <img src={loginImg} alt="Login" className="signup-logo" /> 
              <button className="ghost" onClick={togglePanel}>
                <FontAwesomeIcon icon={faArrowLeft} />
              </button>           
            </div>
            <div className="signup-overlay-panel signup-overlay-right">
              <h1>Welcome Back!</h1>
              <p>To keep connected with us please login with your personal info</p>
              <button className="ghost" onClick={togglePanel}>Sign In</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
