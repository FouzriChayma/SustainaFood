import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import CardStats from "../components/CardStats";
import Charts from "../components/Chart";
import ProjectStatus from "../components/ProjectStatus";


import "../assets/styles/dashboard.css";

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="content">
        <Navbar />

<div className="card-container">
  <CardStats title="Food Donations" value="45/76" percentage="56" icon="utensils" color="blue" progress={56} />
  <CardStats title="Recipients Served" value="48/86" percentage="63" icon="users" color="orange" progress={63} />
  <CardStats title="NGOs Supported" value="16/20" percentage="78" icon="hand-holding-heart" color="green" progress={78} />
  <CardStats title="Monthly Growth" value="46.59%" percentage="46" icon="chart-line" color="red" progress={46} />
</div>



        {/* Conteneur pour aligner le graphique et le statut des projets */}
        <div className="charts-status-container">
          <Charts />
          <ProjectStatus />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

