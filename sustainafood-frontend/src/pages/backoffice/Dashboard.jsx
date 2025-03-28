// src/pages/backoffice/Dashboard.jsx
import React, { useState, useEffect } from "react";
import Sidebar from "../../components/backoffcom/Sidebar";
import Navbar from "../../components/backoffcom/Navbar";
import CardStats from "../../components/backoffcom/CardStats";
import { Bar, Line, Pie } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend } from "chart.js";
import "/src/assets/styles/backoffcss/dashboard.css";
import axios from "axios";
import { CSVLink } from "react-csv"; // For exporting data to CSV

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend);

const Dashboard = () => {
  // State for statistics data
  const [stats, setStats] = useState({
    totalUsers: 0,
    userRoles: {},
    totalDonations: 0,
    donationStatus: {},
    totalRequests: 0,
    requestStatus: {},
    totalTransactions: 0,
    transactionStatus: {},
    totalProducts: 0,
    totalMeals: 0,
    expiringDonations: 0,
    foodDistributed: 0,
    foodWastePrevented: 0,
    topDonors: [],
    topRecipients: [],
    donationTrends: [],
    requestTrends: [],
    userGrowth: [],
    productBreakdown: {},
    mealBreakdown: {},
  });

  // State for filters
  const [filters, setFilters] = useState({
    dateRange: "30d", // Options: 7d, 30d, 90d, all
    category: "all", // Options: all, packaged_products, prepared_meals
  });

  // State for loading and error handling
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch statistics from the backend
  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get("http://localhost:3000/stats", {
          params: filters,
        });
        setStats(response.data);
      } catch (err) {
        console.error("Error fetching stats:", err);
        setError("Failed to load statistics. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Prepare data for CSV export
  const csvData = [
    { label: "Total Users", value: stats.totalUsers },
    { label: "Total Donations", value: stats.totalDonations },
    { label: "Total Requests", value: stats.totalRequests },
    { label: "Total Transactions", value: stats.totalTransactions },
    { label: "Total Products", value: stats.totalProducts },
    { label: "Total Meals", value: stats.totalMeals },
    { label: "Expiring Donations", value: stats.expiringDonations },
    { label: "Food Distributed (units)", value: stats.foodDistributed },
    { label: "Food Waste Prevented (kg)", value: stats.foodWastePrevented },
    ...Object.entries(stats.userRoles).map(([role, count]) => ({
      label: `Users - ${role}`,
      value: count,
    })),
    ...Object.entries(stats.donationStatus).map(([status, count]) => ({
      label: `Donations - ${status}`,
      value: count,
    })),
    ...Object.entries(stats.requestStatus).map(([status, count]) => ({
      label: `Requests - ${status}`,
      value: count,
    })),
    ...Object.entries(stats.transactionStatus).map(([status, count]) => ({
      label: `Transactions - ${status}`,
      value: count,
    })),
    ...Object.entries(stats.productBreakdown).map(([type, count]) => ({
      label: `Products - ${type}`,
      value: count,
    })),
    ...Object.entries(stats.mealBreakdown).map(([type, count]) => ({
      label: `Meals - ${type}`,
      value: count,
    })),
  ];

  // Chart data for donation trends
  const donationTrendsData = {
    labels: stats.donationTrends.map((trend) => trend.date),
    datasets: [
      {
        label: "Donations Over Time",
        data: stats.donationTrends.map((trend) => trend.count),
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        fill: true,
      },
    ],
  };

  // Chart data for request trends
  const requestTrendsData = {
    labels: stats.requestTrends.map((trend) => trend.date),
    datasets: [
      {
        label: "Requests Over Time",
        data: stats.requestTrends.map((trend) => trend.count),
        borderColor: "rgba(255, 159, 64, 1)",
        backgroundColor: "rgba(255, 159, 64, 0.2)",
        fill: true,
      },
    ],
  };

  // Chart data for user growth
  const userGrowthData = {
    labels: stats.userGrowth.map((growth) => growth.date),
    datasets: [
      {
        label: "New Users Over Time",
        data: stats.userGrowth.map((growth) => growth.count),
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        fill: true,
      },
    ],
  };

  // Chart data for product breakdown


  // Chart data for meal breakdown


  // Chart data for donation status breakdown
  const donationStatusData = {
    labels: Object.keys(stats.donationStatus),
    datasets: [
      {
        label: "Donation Status",
        data: Object.values(stats.donationStatus),
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
        ],
      },
    ],
  };

  // Chart data for request status breakdown
  const requestStatusData = {
    labels: Object.keys(stats.requestStatus),
    datasets: [
      {
        label: "Request Status",
        data: Object.values(stats.requestStatus),
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
        ],
      },
    ],
  };

  // Chart data for transaction status breakdown
  const transactionStatusData = {
    labels: Object.keys(stats.transactionStatus),
    datasets: [
      {
        label: "Transaction Status",
        data: Object.values(stats.transactionStatus),
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
        ],
      },
    ],
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-content">
        <Navbar />

        {/* Filter Bar and Export Button */}
        <div className="filter-bar">
          <div className="filter-group">
            <label>
              Date Range:
              <select name="dateRange" value={filters.dateRange} onChange={handleFilterChange}>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="all">All Time</option>
              </select>
            </label>
            <label>
              Category:
              <select name="category" value={filters.category} onChange={handleFilterChange}>
                <option value="all">All</option>
                <option value="packaged_products">Packaged Products</option>
                <option value="prepared_meals">Prepared Meals</option>
              </select>
            </label>
          </div>
          <CSVLink
            data={csvData}
            filename={`sustainafood-stats-${new Date().toISOString()}.csv`}
            className="export-button"
          >
            Export to CSV
          </CSVLink>
        </div>

        {/* Loading and Error States */}
        {loading && <div className="loading">Loading statistics...</div>}
        {error && <div className="error">{error}</div>}

        {!loading && !error && (
          <>
            {/* Key Metrics Cards */}
            <div className="card-container">
              <CardStats
                title="Total Users"
                value={stats.totalUsers}
                percentage={0}
                icon="users"
                color="blue"
                progress={0}
              />
              <CardStats
                title="Total Donations"
                value={stats.totalDonations}
                percentage={0}
                icon="utensils"
                color="green"
                progress={0}
              />
              <CardStats
                title="Total Requests"
                value={stats.totalRequests}
                percentage={0}
                icon="handHoldingHeart"
                color="orange"
                progress={0}
              />
              <CardStats
                title="Total Transactions"
                value={stats.totalTransactions}
                percentage={0}
                icon="exchange"
                color="purple"
                progress={0}
              />
              <CardStats
                title="Food Distributed"
                value={`${stats.foodDistributed} units`}
                percentage={0}
                icon="chart"
                color="red"
                progress={0}
              />
              <CardStats
                title="Food Waste Prevented"
                value={`${stats.foodWastePrevented} kg`}
                percentage={0}
                icon="leaf"
                color="teal"
                progress={0}
              />
              <CardStats
                title="Expiring Donations"
                value={stats.expiringDonations}
                percentage={0}
                icon="clock"
                color="yellow"
                progress={0}
              />
              <CardStats
                title="Total Products"
                value={stats.totalProducts}
                percentage={0}
                icon="box"
                color="pink"
                progress={0}
              />
              <CardStats
                title="Total Meals"
                value={stats.totalMeals}
                percentage={0}
                icon="utensils"
                color="cyan"
                progress={0}
              />
            </div>

            {/* Charts Section */}
            <div className="charts-status-container">
              <div className="chart-section">
                <h3>Donation Trends</h3>
                <Line data={donationTrendsData} options={{ responsive: true }} />
              </div>
              <div className="chart-section">
                <h3>Request Trends</h3>
                <Line data={requestTrendsData} options={{ responsive: true }} />
              </div>
              <div className="chart-section">
                <h3>User Growth</h3>
                <Line data={userGrowthData} options={{ responsive: true }} />
              </div>
              
              <div className="chart-section">
                <h3>Donation Status</h3>
                <Pie data={donationStatusData} options={{ responsive: true }} />
              </div>
              <div className="chart-section">
                <h3>Request Status</h3>
                <Pie data={requestStatusData} options={{ responsive: true }} />
              </div>
              <div className="chart-section">
                <h3>Transaction Status</h3>
                <Pie data={transactionStatusData} options={{ responsive: true }} />
              </div>
            </div>

            {/* Detailed Statistics Section */}
            <div className="detailed-stats">
              <div className="stats-section">
                <h3>User Role Breakdown</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Role</th>
                      <th>Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(stats.userRoles).map(([role, count]) => (
                      <tr key={role}>
                        <td>{role}</td>
                        <td>{count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="stats-section">
                <h3>Top Donors</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Donations</th>
                      <th>Total Items</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.topDonors.map((donor) => (
                      <tr key={donor._id}>
                        <td>{donor.name || "Unknown"}</td>
                        <td>{donor.donationCount}</td>
                        <td>{donor.totalItems}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="stats-section">
                <h3>Top Recipients</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Requests</th>
                      <th>Total Items Received</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.topRecipients.map((recipient) => (
                      <tr key={recipient._id}>
                        <td>{recipient.name || "Unknown"}</td>
                        <td>{recipient.requestCount}</td>
                        <td>{recipient.totalItems}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;