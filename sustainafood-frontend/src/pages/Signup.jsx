import React, { useState } from 'react';
import '../assets/styles/log.css'; // Assuming you put the CSS in a separate file called log.css
import logo from "../assets/images/LogoCh.png"; // Import your logo
import loginImg from "../assets/images/signupCh.png"; 
import fbimg from "../assets/images/fb.png";
import gglimg from "../assets/images/ggl.jpg";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const signup = () => {
  const [isRightPanelActive, setIsRightPanelActive] = useState(false);

  const togglePanel = () => {
    console.log('togglePanel');
    setIsRightPanelActive(!isRightPanelActive);
  };

  return (
    <div className="aa">
<div className={`signup-container ${isRightPanelActive ? 'right-panel-active' : ''}`} id="container">
<div className="signup-form-container signup-sign-up-container">
          <form className='signup-form' action="#">
          <h1 className='signup-h1'>Sign Up</h1>
          <div className="signup-social-container">
            <a  href="#" className="signup-social">
                <img src={fbimg}  alt="Facebook" /> 
            </a>
            <a href="#" className="signup-social">
                <img src={gglimg} alt="Google" /> 
            </a>
           </div>
            <span>or use your account</span>
            <input className='signup-input' type="email" placeholder="Email" />
            <input className='signup-input' type="password" placeholder="Password" />
            <input className='signup-input' type="password" placeholder="Confirm Password" />
            <input className='signup-input' type="number" placeholder="Phone Number" />
            <button className='signup-button'>Sign Up</button>
            <div><span style={{fontSize: '14px',marginLeft: '-230px'}}>Already have an account ?<a href="/login"> Sign In</a></span></div>

          </form>
        </div>
        <div className="signup-form-container signup-sign-in-container">
          <form className='signup-form' action="#">
            <img src={logo} alt="Logo" className="signup-logo" /> 
            <p className='signup-p'>Be a part of a movement to make the world a better place by redistributing surplus food to those who need it. </p>
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
            <h1 className='signup-h1'>Join Us Today!</h1>
            <p className='signup-p'>Sign up to help us reduce food waste and support your community!</p>
            <button className="ghost" onClick={togglePanel}>Sign Up</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default signup;
