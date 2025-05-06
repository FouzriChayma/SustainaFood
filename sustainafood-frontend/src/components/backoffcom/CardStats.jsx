import { 
  FaDollarSign, 
  FaUserCheck, 
  FaUser, 
  FaUsers, 
  FaUtensils, 
  FaBriefcase, 
  FaChartLine, 
  FaHandHoldingHeart,
  FaTrash,
  FaBoxOpen,
  FaClock
} from "react-icons/fa";
import "/src/assets/styles/backoffcss/card.css";

const CardStats = ({ title, value, percentage, icon, color, progress }) => {
  const icons = {
    dollar: <FaDollarSign />,
    userCheck: <FaUserCheck />, 
    user: <FaUser />,
    users: <FaUsers />,
    utensils: <FaUtensils />,
    briefcase: <FaBriefcase />,
    chart: <FaChartLine />,
    handHoldingHeart: <FaHandHoldingHeart />,
    trash: <FaTrash />, // For Food Waste Prevented
    clock: <FaClock />, // For Expiring Donations
    box: <FaBoxOpen />, // For Total Products
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="icon">{icons[icon]}</div>
        <div className="card-info">
          <h3>{title}</h3>
          <p className="value">{value}</p>
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