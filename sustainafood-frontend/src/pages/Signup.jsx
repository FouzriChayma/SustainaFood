import React, { useState } from 'react';
import '../assets/styles/log.css'; // Assuming you put the CSS in a separate file called log.css
import logo from "../assets/images/LogoCh.png"; // Import your logo
import loginImg from "../assets/images/signupCh.png"; 
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
      <div className={`container ${isRightPanelActive ? 'right-panel-active' : ''}`} id="container">
        <div className="form-container sign-up-container">
          <form action="#">
          <h1>Sign Up</h1>
          <div className="social-container">
            <a href="#" className="social">
                <img src={fbimg}  alt="Facebook" /> 
            </a>
            <a href="#" className="social">
                <img src={gglimg} alt="Google" /> 
            </a>
           </div>
            <span>or use your account</span>
            <input type="email" placeholder="Email" />
            <input type="password" placeholder="Password" />
            <input type="password" placeholder="Confirm Password" />
            <input type="number" placeholder="Phone Number" />
            <a href="#">Forgot your password?</a>
            <button>Sign Up</button>
          </form>
        </div>
        <div className="form-container sign-in-container">
          <form action="#">
            <img src={logo} alt="Logo" className="logo" /> 
            <p>Be a part of a movement to make the world a better place by redistributing surplus food to those who need it. </p>
          </form>
        </div>
        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
            <img src={loginImg} alt="Logo" className="logo" /> 
            
            <button className="ghost" onClick={togglePanel}>
            <FontAwesomeIcon icon={faArrowLeft} />
            </button>           
            </div>
            <div className="overlay-panel overlay-right">
            <h1>Join Us Today!</h1>
            <p>Sign up to help us reduce food waste and support your community!</p>
            <button className="ghost" onClick={togglePanel}>Sign Up</button>
            </div>
          </div>
        </div>
      </div>

      
    </div>
  );
};

export default Log;
