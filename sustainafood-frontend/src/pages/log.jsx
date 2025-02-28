import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext"; 
import { loginUser } from "../api/userService";
import { useGoogleLogin } from "@react-oauth/google";
// import jwt_decode from "jwt-decode";
import "../assets/styles/log.css"; 
import logo from "../assets/images/LogoCh.png";
import loginImg from "../assets/images/Login-PNG-HD-Image.png";
import fbimg from "../assets/images/fb.png";
import gglimg from "../assets/images/ggl.jpg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Import icons for password visibility




const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext); 
  const { sendTwoFactorCode } = useContext(AuthContext);


  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isRightPanelActive, setIsRightPanelActive] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // Define state for password visibility

  // Fonction de login classique
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
  
        const userData = {
          id: response.data.id,
          role: response.data.role,
          email, // Optionally include the email used for login
        };
  
        login(userData, response.data.token);
        console.log("✅ Utilisateur connecté :", userData);
        await sendTwoFactorCode(email);  // Envoyer un code 2FA (côté backend)

        if (userData.role === "admin") {
          navigate("/dashboard");
        } else {
          navigate(`/home?email=${email}`);
        }
      } else {
        setError("Authentification échouée. Vérifiez vos identifiants.");
      }
    } catch (err) {
      console.error("Erreur backend :", err.response?.data || err.message);
      setError(err.response?.data?.error || "Erreur de connexion.");
    }
  };
  
  // 🔥 Connexion avec Google (via bouton personnalisé)
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      console.log("✅ Token Google reçu :", tokenResponse);

      try {
        if (!tokenResponse || !tokenResponse.access_token) {
          console.error("❌ Aucun token reçu.");
          setError("Erreur de connexion Google.");
          return;
        }
        
        const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const userInfo = await userInfoResponse.json();
        console.log("Utilisateur connecté via Google :", userInfo);
        
        const userData = {
          id: userInfo.sub,
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture,
          role: "user",
        };
        
        login(userData, tokenResponse.access_token);
        navigate("/");
        
      } catch (error) {
        console.error("Erreur lors du décodage du token :", error);
        setError("Erreur de connexion Google.");
      }
    },
    onError: () => {
      console.log("❌ Échec de la connexion Google");
      setError("Connexion Google échouée.");
    },
  });
  const handleForgotPassword = () => {
    navigate("/forget-password"); // Navigate to the ForgetPass page
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
              {/* Bouton Google personnalisé */}
              <a href="#" className="signup-social" onClick={handleGoogleLogin}>
                <img src={gglimg} alt="Google" />
              </a>
            </div>
            <span>or use your account</span>

            {/* Inputs contrôlés */}
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
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span className="auth-eye-icon" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            {/* Affichage des erreurs */}
            {error && <p className="error-message">{error}</p>}

            {/* Checkbox and Forgot Password */}
            <div style={{ display: "flex", alignItems: "center",marginTop:"10px" }}>
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
              <a href="#" className="signup-a" onClick={handleForgotPassword} style={{ marginLeft: "190px" }}>
                Forgot your password?
              </a>
            </div>

            <button type="submit" className="signup-button">
              Sign In
            </button>
            <div>
              <span style={{ fontSize: "14px" }}>
                Don't have an account? <a href="/signup"> Sign Up</a>
              </span>
            </div>
          </form>
        </div>

        {/* Section d'inscription et autres éléments */}
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
              <button className="signbtn" onClick={togglePanel}>
                <FontAwesomeIcon icon={faArrowLeft} />
              </button>
            </div>
            <div className="signup-overlay-panel signup-overlay-right">
              <h1>Welcome Back!</h1>
              <p>To keep connected with us please login with your personal info</p>
              <button className="signbtn" onClick={togglePanel}>
                Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
