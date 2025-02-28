import { useState, useContext } from "react";
import { AuthContext } from "../contexts/AuthContext"; 
import { useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha"; // ✅ Import ReCAPTCHA
import "../assets/styles/log.css";
import logo from "../assets/images/LogoCh.png";
import loginImg from "../assets/images/signupCh.png";
import fbimg from "../assets/images/fb.png";
import gglimg from "../assets/images/ggl.jpg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { getUserById, updateUserwithemail } from "../api/userService";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Icons for password visibility
import { FaCamera } from "react-icons/fa"; // For the profile photo icon
import styled from "styled-components";
import { useAuth } from "../contexts/AuthContext";

const All = styled.div`
  background-color: #eee;
  border: none;
  color: black;
  padding: 3px 15px;
  margin: 4px 0;
  width: 100%;
`;

const StyledWrapper = styled.div`
  /* Button styling for the plus button */
  .plusButton {
    --plus_sideLength: 2.5rem;
    --plus_topRightTriangleSideLength: 0.9rem;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 1px solid white;
    width: var(--plus_sideLength);
    height: var(--plus_sideLength);
    background-color: #8dc73f;
    overflow: hidden;
  }
  .plusButton::before {
    position: absolute;
    content: "";
    top: 0;
    right: 0;
    width: 0;
    height: 0;
    border-width: 0 var(--plus_topRightTriangleSideLength) var(--plus_topRightTriangleSideLength) 0;
    border-style: solid;
    border-color: transparent white transparent transparent;
    transition-timing-function: ease-in-out;
    transition-duration: 0.2s;
  }
  .plusButton:hover {
    cursor: pointer;
  }
  .plusButton:hover::before {
    --plus_topRightTriangleSideLength: calc(var(--plus_sideLength) * 2);
  }
  .plusButton:focus-visible::before {
    --plus_topRightTriangleSideLength: calc(var(--plus_sideLength) * 2);
  }
  .plusButton > .plusIcon {
    fill: white;
    width: calc(var(--plus_sideLength) * 0.5);
    height: calc(var(--plus_sideLength) * 0.5);
    z-index: 1;
    transition-timing-function: ease-in-out;
    transition-duration: 0.2s;
  }
  .plusButton:hover > .plusIcon {
    fill: black;
    transform: rotate(180deg);
  }
  .plusButton:focus-visible > .plusIcon {
    fill: black;
    transform: rotate(180deg);
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const ImagePreview = styled.img`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  object-fit: cover;
  margin-left: 10px;
`;

const Continueinfo = () => {
  const { user, token } = useAuth();

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  // NEW: State to store the actual profile photo file
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [isRightPanelActive, setIsRightPanelActive] = useState(false);
  // Input fields state
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [role, setRole] = useState("admin");
  const [id_fiscale, setId_fiscale] = useState("");
  const [num_cin, setNum_cin] = useState("");
  const [sexe, setSexe] = useState("male");
  const [age, setAge] = useState("");
  const [taxReference, setTaxReference] = useState("");
  const [vehiculeType, setVehiculeType] = useState("car");
  const [type, setType] = useState("charitable");
  // State for CAPTCHA
  const [captchaValue, setCaptchaValue] = useState(null);

  const isOng = role === "ong";
  const isstudent = role === "student";
  const istransporter = role === "transporter";
  const isDonor = role === "supermarket" || role === "restaurant";


  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileName(file.name);
      setProfilePhotoFile(file); // Save the actual file for uploading
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };
  const togglePanel = () => {
    setIsRightPanelActive(!isRightPanelActive);
  };
  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
  
    // Vérification du reCAPTCHA
    if (!captchaValue) {
      setError("Veuillez valider le reCAPTCHA.");
      return;
    }
  
    // Vérification des champs obligatoires
    if (!phone || !role || !address) {
      setError("Veuillez remplir tous les champs.");
      return;
    }
  
    // Récupération des infos de localStorage
    const email = localStorage.getItem("email from google");
    const id = localStorage.getItem("user_id");
  
    if (!id || !email) {
      setError("Erreur : utilisateur non trouvé.");
      return;
    }
  
  
    // Création de FormData
    const data = new FormData();
    data.append("email", email);
    data.append("phone", phone);
    data.append("address", address);
    data.append("role", role);
  
    if (isOng) {
      data.append("id_fiscale", id_fiscale);
      data.append("type", type);
    }
    if (isstudent) {
      data.append("sexe", sexe);
      data.append("age", age);
      data.append("num_cin", num_cin);
    }
    if (istransporter) {
      data.append("vehiculeType", vehiculeType);
    }
    if (isDonor) {
      data.append("taxReference", taxReference);
    }
    if (profilePhotoFile) {
      data.append("photo", profilePhotoFile);
    }
  
    try {
      console.log("🔄 Envoi des données...");
      
      // Mise à jour de l'utilisateur
      const response = await updateUserwithemail(id, data);
  
      // Récupération de l'utilisateur mis à jour
      const userResponse = await getUserById(id);
      const user = userResponse.data;
  
      if (!user) {
        setError("Erreur : Données utilisateur non récupérées.");
        return;
      }
      const token= localStorage.getItem("token");
  
      login(user,token);
  
      // Stocker les nouvelles informations utilisateur
      const authData = JSON.parse(localStorage.getItem("authData") || "{}");
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("authData", JSON.stringify({ ...authData, email: user.email }));
  
  
      // Redirection après mise à jour
      if (user.role === "admin") {
        navigate("/dashboard");
      } else {
        navigate("/profile");
      }
    } catch (err) {
      console.error("❌ Erreur lors de l'inscription :", err);
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
            
           

            <select className="signup-input" value={role} onChange={(e) => setRole(e.target.value)} required>
              <option value="admin">Admin</option>
              <option value="ong">ONG</option>
              <option value="restaurant">Restaurant</option>
              <option value="supermarket">Supermarket</option>
              <option value="student">Student</option>
              <option value="transporter">Transporter</option>
            </select>

            {/* Profil Photo Upload Section */}
            <All>
              <div style={{ display: "flex", alignItems: "center" }}>
                <HiddenFileInput
                  id="file"
                  type="file"
                  onChange={handleFileChange}
                />
                <div style={{ marginBottom: "9px" }}>
                  <span>Profil photo</span>
                </div>
                <br />
                {imagePreview && <ImagePreview src={imagePreview} alt="Profil" />}
                {fileName && <p>📂 {fileName}</p>}
              </div>
              <StyledWrapper>
                <div
                  tabIndex={0}
                  className="plusButton"
                  style={{ marginLeft: "380px", marginTop: "-21px" }}
                  onClick={() => document.getElementById("file").click()}
                >
                  <svg className="plusIcon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30">
                    <g mask="url(#mask0_21_345)">
                      <path d="M13.75 23.75V16.25H6.25V13.75H13.75V6.25H16.25V13.75H23.75V16.25H16.25V23.75H13.75Z" />
                    </g>
                  </svg>
                </div>
              </StyledWrapper>
            </All>

            {isstudent && (
              <>
                <select className="signup-input" value={sexe} onChange={(e) => setSexe(e.target.value)} required>
                  <option value="male">Men</option>
                  <option value="female">Women</option>
                  <option value="other">OTHER</option>
                </select>
                <input className="signup-input" type="number" placeholder="Age" value={age} onChange={(e) => setAge(e.target.value)} required />
                <input className="signup-input" type="text" placeholder="Cin number" value={num_cin} onChange={(e) => setNum_cin(e.target.value)} required />
              </>
            )}
            {isOng && (
              <>
                <input className="signup-input" type="text" placeholder="Fiscale id" value={id_fiscale} onChange={(e) => setId_fiscale(e.target.value)} required />
                <select className="signup-input" value={type} onChange={(e) => setType(e.target.value)} required>
                  <option value="advocacy">Advocacy</option>
                  <option value="operational">Operational</option>
                  <option value="charitable">Charitable</option>
                  <option value="development">Development</option>
                  <option value="environmental">Environmental</option>
                  <option value="human-rights">Human-rights</option>
                  <option value="relief">Relief</option>
                  <option value="research">Research</option>
                  <option value="philanthropic">Philanthropic</option>
                  <option value="social_welfare">Social_welfare</option>
                  <option value="cultural">Cultural</option>
                  <option value="faith_based">Faith_based</option>
                </select>
              </>
            )}
            {istransporter && (
              <>
                <select className="signup-input" value={vehiculeType} onChange={(e) => setVehiculeType(e.target.value)} required>
                  <option value="car">CAR</option>
                  <option value="motorbike">MOTORBIKE</option>
                  <option value="bicycle">BICYCLE</option>
                  <option value="van">VAN</option>
                  <option value="truck">TRUCK</option>
                  <option value="scooter">SCOOTER</option>
                </select>
              </>
            )}
            {isDonor && (
              <>
                <input className="signup-input" type="text" placeholder="Tax reference" value={taxReference} onChange={(e) => setTaxReference(e.target.value)} required />
              </>
            )}
            <input className="signup-input" type="text" placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} required />
            <input className="signup-input" type="number" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} required />

            {/* ✅ Google reCAPTCHA */}
            <ReCAPTCHA 
              sitekey="6LeXoN8qAAAAAHnZcOwetBZ9TfyOl8K_wg7j97hq"
              onChange={(value) => setCaptchaValue(value)}
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
              <button className="signbtn" onClick={togglePanel}>
                <FontAwesomeIcon icon={faArrowLeft} />
              </button>
            </div>
            <div className="signup-overlay-panel signup-overlay-right">
              <h1 className="signup-h1">Join Us Today!</h1>
              <p className="signup-p">Sign up to help us reduce food waste and support your community!</p>
              <button className="signbtn" onClick={togglePanel}>Sign Up</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Continueinfo;
