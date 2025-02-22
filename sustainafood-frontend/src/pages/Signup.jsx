import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha"; // ✅ Import ReCAPTCHA
import "../assets/styles/log.css";
import logo from "../assets/images/LogoCh.png";
import loginImg from "../assets/images/signupCh.png";
import fbimg from "../assets/images/fb.png";
import gglimg from "../assets/images/ggl.jpg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { signupUser } from "../api/userService";

const Signup = () => {
  const navigate = useNavigate();
  const [isRightPanelActive, setIsRightPanelActive] = useState(false);

  // State for input fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [role, setRole] = useState("ADMIN");
  const [error, setError] = useState("");
  
  // ✅ State for CAPTCHA
  const [captchaValue, setCaptchaValue] = useState(null);

  const togglePanel = () => {
    setIsRightPanelActive(!isRightPanelActive);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (!captchaValue) {
        setError("Veuillez valider le reCAPTCHA.");
        return;
    }

    if (!email || !password || !confirmPassword || !phone || !name || !address) {
        setError("Veuillez remplir tous les champs.");
        return;
    }

    if (password !== confirmPassword) {
        setError("Les mots de passe ne correspondent pas.");
        return;
    }

    try {
        const userData = { email, password, confirmPassword, phone, name, address, role }; // ✅ Fix here
        console.log("Sending user data:", userData); // Debugging log
        const response = await signupUser(userData);
        console.log("Inscription réussie :", response.data);
        navigate("/profile");
    } catch (err) {
        setError(err.response?.data?.error || "Erreur d'inscription.");
    }
};


  return (
    <div className="aa">
      <div className={`signup-container ${isRightPanelActive ? "right-panel-active" : ""}`} id="container">
        <div className="signup-form-container signup-sign-up-container">
          <form className="signup-form" onSubmit={handleSignup}>
            <h1 className="signup-h1">Sign Up</h1>
            <div className="signup-social-container">
              <a href="#" className="signup-social">
                <img src={fbimg} alt="Facebook" />
              </a>
              <a href="#" className="signup-social">
                <img src={gglimg} alt="Google" />
              </a>
            </div>
            <span>or use your email</span>

            {/* Input Fields */}
            <input className="signup-input" type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
            <input className="signup-input" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input className="signup-input" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <input className="signup-input" type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            
            <select className="signup-input" value={role} onChange={(e) => setRole(e.target.value)} required>
              <option value="admin">Admin</option>
              <option value="ong">ONG</option>
              <option value="restaurant">Restaurant</option>
              <option value="supermarket">Supermarket</option>
              <option value="student">Student</option>
            </select>

            <input className="signup-input" type="text" placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} required />
            <input className="signup-input" type="number" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} required />

            {/* ✅ Google reCAPTCHA */}
            <ReCAPTCHA
              sitekey="6LeXoN8qAAAAAHnZcOwetBZ9TfyOl8K_wg7j97hq" // Your reCAPTCHA key
              onChange={(value) => setCaptchaValue(value)} // Save CAPTCHA response
            />

            {/* Display Errors */}
            {error && <p className="error-message">{error}</p>}
            
            <button type="submit" className="signup-button">Sign Up</button>

            <div>
              <span style={{ fontSize: "14px", marginLeft: "-230px" }}>
                Already have an account? <a href="/login">Sign In</a>
              </span>
            </div>
          </form>
        </div>

        <div className="signup-form-container signup-sign-in-container">
          <form className="signup-form" action="#">
            <img src={logo} alt="Logo" className="signup-logo" />
            <p className="signup-p">Be a part of a movement to make the world a better place by redistributing surplus food to those who need it.</p>
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
              <h1 className="signup-h1">Join Us Today!</h1>
              <p className="signup-p">Sign up to help us reduce food waste and support your community!</p>
              <button className="ghost" onClick={togglePanel}>Sign Up</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
