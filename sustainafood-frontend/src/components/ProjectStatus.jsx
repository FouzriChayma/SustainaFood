import "../assets/styles/projectStatus.css";
import { FaApple, FaFacebook, FaPaypal, FaGithub } from "react-icons/fa";
import { SiFigma } from "react-icons/si";

import { FaStore, FaCarrot, FaHandsHelping, FaUtensils, FaTruck } from "react-icons/fa";

const projects = [
  { name: "Monoprix", category: "Supermarket Donations", progress: 54, icon: <FaStore size={16} color="red" /> },
  { name: "Supermarket", category: "Fresh Produce", progress: 86, icon: <FaCarrot size={16} color="orange" /> },
  { name: "Ha Food", category: "Charity Support", progress: 90, icon: <FaHandsHelping size={16} color="green" /> },
  { name: "Pasta Cosi", category: "Restaurant Donations", progress: 37, icon: <FaUtensils size={16} color="brown" /> },
  { name: "First Delivery", category: "Transport & Logistics", progress: 29, icon: <FaTruck size={16} color="blue" /> },
];


const ProjectStatus = () => {
  return (
    <div className="project-status">
      <h3>Donation Status</h3>
      {projects.map((project, index) => (
        <div key={index} className="project-item">
          <div className="project-info">
            {project.icon}
            <div>
              <p className="project-name">{project.name}</p>
              <p className="project-category">{project.category}</p>
            </div>
          </div>
          <div className="progress-container">
            <div className="progress-bar" style={{ width: `${project.progress}%`, backgroundColor: project.icon.props.color }}></div>
          </div>
          <p className="progress-text">{project.progress}%</p>
        </div>
      ))}
    </div>
  );
};


export default ProjectStatus;
