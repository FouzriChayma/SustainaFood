import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext"; // Import AuthContext
import { loginUser } from "../api/userService";
import "../assets/styles/log.css"; // Import CSS
import logo from "../assets/images/LogoCh.png"; // Import logo
import loginImg from "../assets/images/Login-PNG-HD-Image.png"; 
import fbimg from "../assets/images/fb.png";
import gglimg from "../assets/images/ggl.jpg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext); // Use AuthContext

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isRightPanelActive, setIsRightPanelActive] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    try {
      const response = await loginUser({ email, password });

      if (response?.data?.token) {
        console.log("Connexion réussie :", response.data);

        // Construct a user object from response data
        const userData = {
          id: response.data.id,
          role: response.data.role,
          email, // Optionally include the email used for login
          // add any other properties returned by your API if needed
        };

        // Call AuthContext login function with the constructed user object and token
        login(userData, response.data.token);

        console.log("✅ Utilisateur connecté :", userData);
        console.log("✅ Token stocké :", response.data.token);

        navigate("/profile"); // Redirect after login
      } else {
        setError("Authentification échouée. Vérifiez vos identifiants.");
      }
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
      <div className={`signup-container ${isRightPanelActive ? "right-panel-active" : ""}`} id="container">
        {/* Section Connexion */}
        <div className="signup-form-container signup-sign-up-container">
          <form className="signup-form" onSubmit={handleLogin}>
            <h1 className="signup-h1">Sign in</h1>
            <div className="signup-social-container">
              <a href="#" className="signup-social">
                <img src={fbimg} alt="Facebook" />
              </a>
              <a href="#" className="signup-social">
                <img src={gglimg} alt="Google" />
              </a>
            </div>
            <span>or use your account</span>

            {/* Controlled Inputs */}
            <input
              className="signup-input"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              className="signup-input"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {/* Error Handling */}
            {error && <p className="error-message">{error}</p>}

            {/* Checkbox and Forgot Password */}
            <div style={{ display: "flex", alignItems: "center" }}>
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
              <span style={{ fontSize: "14px", marginLeft: "5px" }}>Remember me</span>
              <a className="signup-a" href="#" style={{ marginLeft: "auto" }}>
                Forgot your password?
              </a>
            </div>

            <button type="submit" className="signup-button">Sign In</button>
            <div>
              <span style={{ fontSize: "14px" }}>
                Don't have an account? <a href="/signup"> Sign Up</a>
              </span>
            </div>
          </form>
        </div>

        {/* Welcome Section */}
        <div className="signup-form-container signup-sign-in-container">
          <form className="signup-form">
            <img src={logo} alt="Logo" className="signup-logo" />
            <p className="signup-p">
              Thank you for joining us on a mission to reduce food waste and make a positive impact.
            </p>
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
