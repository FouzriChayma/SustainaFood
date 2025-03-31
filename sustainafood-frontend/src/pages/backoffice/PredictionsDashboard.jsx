import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import Sidebar from "../../components/backoffcom/Sidebar";
import Navbar from "../../components/backoffcom/Navbar";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const PredictionsDashboard = () => {
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const response = await axios.get('http://localhost:3000/donation/donations/predict-supply-demand?period=week'); // Changed to 'week'
        console.log('API Response:', response.data);
        setPredictions(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Prediction Fetch Error:', err.response || err.message);
        setError('Failed to load predictions: ' + (err.response?.data?.message || err.message));
        setLoading(false);
      }
    };

    fetchPredictions();
  }, []);

  if (loading) {
    return (
      <div className="admin-dashboard">
        <Sidebar />
        <div className="profile-container">
          <Navbar />
          <div>Loading predictions...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <Sidebar />
        <div className="profile-container">
          <Navbar />
          <div>{error}</div>
        </div>
      </div>
    );
  }

  const hasValidData = predictions && predictions.supply && predictions.demand && 
    Object.keys(predictions.supply).length > 0 && Object.keys(predictions.demand).length > 0;

  if (!hasValidData) {
    console.log('Predictions State:', predictions);
    return (
      <div className="admin-dashboard">
        <Sidebar />
        <div className="profile-container">
          <Navbar />
          <div>No prediction data available</div>
        </div>
      </div>
    );
  }

  const chartData = {
    labels: Object.keys(predictions.supply), // Will now be in 'YYYY-W#' format
    datasets: [
      {
        label: 'Supply (Products)',
        data: Object.values(predictions.supply).map(v => v.products || 0),
        borderColor: 'blue',
        fill: false,
      },
      {
        label: 'Supply (Meals)',
        data: Object.values(predictions.supply).map(v => v.meals || 0),
        borderColor: 'green',
        fill: false,
      },
      {
        label: 'Demand (Products)',
        data: Object.values(predictions.demand).map(v => v.products || 0),
        borderColor: 'red',
        fill: false,
      },
      {
        label: 'Demand (Meals)',
        data: Object.values(predictions.demand).map(v => v.meals || 0),
        borderColor: 'orange',
        fill: false,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Weekly Supply and Demand Predictions' }, // Updated title
    },
  };

  return (
    <div className="admin-dashboard">
      <Sidebar />
      <div className="profile-container">
        <Navbar />
        <h1>Weekly Supply and Demand Predictions</h1> {/* Updated heading */}
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default PredictionsDashboard;