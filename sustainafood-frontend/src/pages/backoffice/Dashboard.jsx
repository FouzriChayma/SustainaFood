import Sidebar from "../../components/backoffcom/Sidebar";
import Navbar from "../../components/backoffcom/Navbar";
import CardStats from "../../components/backoffcom/CardStats";
import Charts from "../../components/backoffcom/Chart";
import DonationStatus from "../../components/backoffcom/DonationStatus";


import "/src/assets/styles/backoffcss/dashboard.css";

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-content">
        <Navbar />

<div className="card-container">
  <CardStats title="Food Donations" value="45/76" percentage="56" icon="utensils" color="blue" progress={56} />
  <CardStats title="Recipients Served" value="48/86" percentage="63" icon="users" color="orange" progress={63} />
  <CardStats title="NGOs Supported" value="16/20" percentage="78" icon="handHoldingHeart" color="green" progress={78} />
<CardStats title="Monthly Growth" value="46.59%" percentage="46" icon="chart" color="red" progress={46} />

</div>



        {/* Conteneur pour aligner le graphique et le statut des dons */}
        <div className="charts-status-container">
          <Charts />
          <DonationStatus />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

