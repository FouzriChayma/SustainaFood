import { 
    FaDollarSign, 
    FaUserCheck, 
    FaUser, 
    FaUsers, 
    FaUtensils, 
    FaBriefcase, 
    FaChartLine, 
    FaHandHoldingHeart 
  } from "react-icons/fa";
  import "../assets/styles/card.css";
  
  const CardStats = ({ title, value, percentage, icon, color, progress }) => {
    const icons = {
      dollar: <FaDollarSign />,
      userCheck: <FaUserCheck />, // Correction ici
      user: <FaUser />,
      users: <FaUsers />,
      utensils: <FaUtensils />,
      briefcase: <FaBriefcase />,
      chart: <FaChartLine />,
      handHoldingHeart: <FaHandHoldingHeart />
    };
  
    return (
      <div className="card">
        <div className="card-header">
          <div className="icon">{icons[icon]}</div>
          <div className="card-info">
            <h3>{title}</h3>
            <p className="value">{value}</p>
            <p className="percentage" style={{ color: color }}>{percentage}%</p>
          </div>
        </div>
        <div className="progress-bar">
  <div className="progress" 
       style={{ width: `${progress}%`, maxWidth: "100%", minWidth: "30%", backgroundColor: color }}>
  </div>
</div>

      </div>
    );
  };
  
  export default CardStats;
  