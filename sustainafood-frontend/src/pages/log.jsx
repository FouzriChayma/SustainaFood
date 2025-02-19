import React, { useState } from 'react';
import '../assets/styles/log.css'; // Assuming you put the CSS in a separate file called log.css
import logo from "../assets/images/LogoCh.png"; // Import your logo
import loginImg from "../assets/images/Login-PNG-HD-Image.png"; 
import fbimg from "../assets/images/fb.png";
import gglimg from "../assets/images/ggl.jpg";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const Log = () => {
  const [isRightPanelActive, setIsRightPanelActive] = useState(false);

  const togglePanel = () => {
    setIsRightPanelActive(!isRightPanelActive);
  };

  return (
    <div className="aa">
      <div className={`signup-container ${isRightPanelActive ? 'right-panel-active' : ''}`} id="container">
        <div className="signup-form-container signup-sign-up-container">
          <form className='signup-form' action="#">
          <h1 className='signup-h1'>Sign in</h1>
          <div className="signup-social-container">
            <a href="#" className="signup-social">
                <img src={fbimg}  alt="Facebook" /> 
            </a>
            <a href="#" className="signup-social">
                <img src={gglimg} alt="Google" /> 
            </a>
           </div>
            <span>or use your account</span>
            <input className='signup-input' type="email" placeholder="Email" />
            <input className='signup-input' type="password" placeholder="Password" />
            <label className="ios-checkbox green">
              <div style={{display: 'flex'}}>
    <input type="checkbox" />
    <div className="checkbox-wrapper">
      <div className="checkbox-bg"></div>
      <svg fill="none" viewBox="0 0 24 24" className="checkbox-icon">
        <path
          stroke-linejoin="round"
          stroke-linecap="round"
          stroke-width="3"
          stroke="currentColor"
          d="M4 12L10 18L20 6"
          className="check-path"
        ></path>
      </svg>
    </div>
    <div><span style={{fontSize: '14px',marginLeft: '5px'}}>Remember me</span></div>
    <a className='signup-a' href="#">Forgot your password?</a>
    </div>
  </label>
            
            <button className='signup-button'>Sign In</button>
            <div><span style={{fontSize: '14px',marginLeft: '-230px'}}>Don't have an account?<a href="/signup"> Sign Up</a></span></div>

          </form>
          
        </div>
        <div className="signup-form-container signup-sign-in-container">
          <form className='signup-form' action="#">
            <img src={logo} alt="Logo" className="signup-logo" /> 
            <p className='signup-p' >Thank you for joining us on a mission to reduce food waste and make a positive impact.</p>
          </form>
        </div>
        <div className="signup-overlay-container">
          <div className="signup-overlay">
            <div className="signup-overlay-panel signup-overlay-left">
            <img src={loginImg} alt="Logo" className="signup-logo" /> 
            
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

export default Log;
