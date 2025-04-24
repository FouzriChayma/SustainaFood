import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Line } from "react-chartjs-2";
import jsPDF from "jspdf";
import logo from '../assets/images/logooo.png'; // Import the logo
import axios from 'axios';
import { Chart as ChartJS, CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';

// Register Chart.js components for Line chart
ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend);

const PreductionForDonor = () => {
  const { authUser, user } = useAuth();
  const [userId, setuserId] = useState("");
  const [donationForecast, setDonationForecast] = useState([]);
  const [requestForecast, setRequestForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const chartRef = useRef(null); // Ref for capturing the chart for PDF
  const isDonor = user?.role === "restaurant" || user?.role === "supermarket" || user?.role === "personaldonor";
  const isRecipient = user?.role === "ong" || user?.role === "student";

  // Fetch user ID
  useEffect(() => {
    if (authUser && (authUser._id || authUser.id)) {
      setuserId(authUser._id || authUser.id);
      console.log("userId from authUser:", authUser._id || authUser.id);
    } else if (user) {
      setuserId(user._id || user.id || "");
      console.log("userId from localStorage:", user._id || user.id);
    }
  }, [authUser]);

  // Fetch forecast data
  useEffect(() => {
    const fetchForecasts = async () => {
      try {
        setLoading(true);
        const donationResponse = await axios.get('http://localhost:3000/api/api/forecast/donations?days=7');
        const requestResponse = await axios.get('http://localhost:3000/api/api/forecast/requests?days=7');
        setDonationForecast(donationResponse.data);
        setRequestForecast(requestResponse.data);
        setError(null);
      } catch (err) {
        setError('Error fetching forecasts: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchForecasts();
  }, []);

  // Prepare chart data based on user role
  const chartData = isDonor ? {
    labels: requestForecast.map(entry => entry.ds), // Dates for requests
    datasets: [
      {
        label: 'Request Forecast',
        data: requestForecast.map(entry => entry.yhat),
        borderColor: 'rgba(0, 128, 0, 1)', // Green line
        backgroundColor: 'rgba(0, 128, 0, 0.2)', // Light green fill under the line
        fill: true,
        tension: 0.4, // Smooth the line
        pointBackgroundColor: 'rgba(0, 128, 0, 1)',
        pointBorderColor: 'rgba(0, 128, 0, 1)',
        pointRadius: 5,
      },
    ],
  } : {
    labels: donationForecast.map(entry => entry.ds), // Dates for donations
    datasets: [
      {
        label: 'Donation Forecast',
        data: donationForecast.map(entry => entry.yhat),
        borderColor: 'rgba(0, 128, 0, 1)', // Green line
        backgroundColor: 'rgba(0, 128, 0, 0.2)', // Light green fill under the line
        fill: true,
        tension: 0.4, // Smooth the line
        pointBackgroundColor: 'rgba(0, 128, 0, 1)',
        pointBorderColor: 'rgba(0, 128, 0, 1)',
        pointRadius: 5,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false, // Allow custom dimensions
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 14,
            family: "'Poppins', sans-serif",
          },
          color: '#333',
        },
      },
      title: {
        display: true,
        text: isDonor ? 'Request Forecast (Next 7 Days)' : 'Donation Forecast (Next 7 Days)',
        font: {
          size: 20,
          family: "'Poppins', sans-serif",
          weight: '600',
        },
        color: '#333',
        padding: {
          top: 20,
          bottom: 20,
        },
      },
      tooltip: {
        backgroundColor: '#fff',
        titleColor: '#333',
        bodyColor: '#666',
        borderColor: '#ddd',
        borderWidth: 1,
        titleFont: {
          family: "'Poppins', sans-serif",
          size: 14,
        },
        bodyFont: {
          family: "'Poppins', sans-serif",
          size: 12,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Predicted Count',
          font: {
            size: 16,
            family: "'Poppins', sans-serif",
            weight: '500',
          },
          color: '#666',
        },
        ticks: {
          font: {
            size: 12,
            family: "'Poppins', sans-serif",
          },
          color: '#666',
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Date',
          font: {
            size: 16,
            family: "'Poppins', sans-serif",
            weight: '500',
          },
          color: '#666',
        },
        ticks: {
          font: {
            size: 12,
            family: "'Poppins', sans-serif",
          },
          color: '#666',
        },
        grid: {
          display: false,
        },
      },
    },
  };

  // Generate PDF
  const downloadPDF = () => {
    const doc = new jsPDF();
    
    // Add logo
    const img = new Image();
    img.src = logo;
    doc.addImage(img, 'PNG', 10, 10, 50, 20); // Adjust dimensions as needed

    // Add title in pistachio color
    doc.setFontSize(18);
    doc.setTextColor(147, 197, 114); // Pistachio color (#93C572)
    doc.text(isDonor ? "Request Forecast Report" : "Donation Forecast Report", 70, 20);

    // Add chart
    const chartCanvas = chartRef.current.canvas;
    const chartImage = chartCanvas.toDataURL('image/png');
    doc.addImage(chartImage, 'PNG', 10, 40, 190, 120); // Increased height for larger chart in PDF

    // Add forecast details based on role
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0); // Reset to black for details
    let yPosition = 170; // Adjusted for larger chart
    
    if (isDonor) {
      doc.setTextColor(147, 197, 114); // Pistachio color for section header
      doc.text("Request Forecast Details:", 10, yPosition);
      doc.setTextColor(0, 0, 0); // Back to black for details
      yPosition += 10;
      requestForecast.forEach((entry) => {
        doc.text(`${entry.ds}: ${entry.yhat.toFixed(2)} (Range: ${entry.yhat_lower.toFixed(2)} - ${entry.yhat_upper.toFixed(2)})`, 10, yPosition);
        yPosition += 10;
      });
    } else {
      doc.setTextColor(147, 197, 114); // Pistachio color for section header
      doc.text("Donation Forecast Details:", 10, yPosition);
      doc.setTextColor(0, 0, 0); // Back to black for details
      yPosition += 10;
      donationForecast.forEach((entry) => {
        doc.text(`${entry.ds}: ${entry.yhat.toFixed(2)} (Range: ${entry.yhat_lower.toFixed(2)} - ${entry.yhat_upper.toFixed(2)})`, 10, yPosition);
        yPosition += 10;
      });
    }

    // Save the PDF
    doc.save(isDonor ? "request_forecast.pdf" : "donation_forecast.pdf");
  };

  // Loading, error, and access control
  if (loading) return <div style={styles.forecastContainer}><p style={styles.forecastLoading}>Loading analytics...</p></div>;
  if (error) return <div style={styles.forecastContainer}><p style={styles.forecastError}>{error}</p></div>;
  if (!isDonor && !isRecipient) return <div style={styles.forecastContainer}><p style={styles.forecastError}>Access denied.</p></div>;

  return (
    <>
      <style>
        {`
          .forecast-list {
          
            list-style: none;
            padding: 0;
            margin: 0;
          }

          .forecast-list-item {
              border-left: 3px solid #228b22;

            background: #f9f9f9;
            border-radius: 10px;
            padding: 15px 20px;
            margin-bottom: 10px;
            font-family: 'Poppins', sans-serif;
            font-size: 1rem;
            color: #636e72;
            display: flex;
            align-items: center;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            transition: transform 0.2s ease;
          }

          .forecast-list-item:hover {
            transform: translateX(5px);
          }

          .forecast-date {
            font-weight: 600;
            color: #2d3436;
            margin-right: 10px;
          }

          .forecast-value {
            font-weight: 600;
            color: #93C572;
            margin: 0 5px;
          }

          .download-pdf-button {
            display: block;
            margin: 30px auto;
            padding: 12px 30px;
            background-color: #93C572;
            color: #ffffff;
            border: none;
            border-radius: 50px;
            font-family: 'Poppins', sans-serif;
            font-size: 1.1rem;
            font-weight: 500;
            cursor: pointer;
            transition: background-color 0.3s ease, transform 0.2s ease;
          }

          .download-pdf-button:hover {
            background-color: #82b460;
            transform: translateY(-2px);
          }
        `}
      </style>
      <Navbar />
      <div style={styles.forecastContainer}>
        <div style={styles.forecastCard}>
          <h1 style={styles.forecastTitle}>{isDonor ? "Donor Analytics" : "Recipient Analytics"}</h1>
          {isDonor ? (
            <>
              <div>
                <h2 style={styles.forecastSubtitle}>Request Forecast</h2>
                <div style={styles.chartWrapper}>
                  <Line ref={chartRef} data={chartData} options={chartOptions} />
                </div>
                <button onClick={downloadPDF} className="download-pdf-button">
                  Download PDF Report
                </button>
                <h3 style={styles.forecastDetailsTitle}>Request Forecast Details</h3>
                <ul className="forecast-list">
                  {requestForecast.map((entry, index) => (
                    <li key={index} className="forecast-list-item">
                      <span className="forecast-date">{entry.ds}</span>: Predicted Requests: <span className="forecast-value">{entry.yhat.toFixed(2)}</span> (Range: {entry.yhat_lower.toFixed(2)} - {entry.yhat_upper.toFixed(2)})
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <>
              <div>
                <h2 style={styles.forecastSubtitle}>Donation Forecast</h2>
                <div style={styles.chartWrapper}>
                  <Line ref={chartRef} data={chartData} options={chartOptions} />
                </div>
                <button onClick={downloadPDF} className="download-pdf-button">
                  Download PDF Report
                </button>
                <h3 style={styles.forecastDetailsTitle}>Donation Forecast Details</h3>
                <ul className="forecast-list">
                  {donationForecast.map((entry, index) => (
                    <li key={index} className="forecast-list-item">
                      <span className="forecast-date">{entry.ds}</span>: Predicted Donations: <span className="forecast-value">{entry.yhat.toFixed(2)}</span> (Range: {entry.yhat_lower.toFixed(2)} - {entry.yhat_upper.toFixed(2)})
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

// Inline styles
const styles = {
  forecastContainer: {

    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    padding: '40px 20px',
  },
  forecastCard: {
    borderLeft:' 3px solid #228b22',

    background: '#ffffff',
    borderRadius: '20px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
    padding: '40px',
    maxWidth: '1300px',
    width: '100%',
    margin: '20px',
  },
  forecastTitle: {
    fontFamily: "'Poppins', sans-serif",
    fontSize: '2.5rem',
    fontWeight: '700',
    color: '#2d3436',
    textAlign: 'center',
    marginBottom: '30px',
  },
  forecastSubtitle: {
    fontFamily: "'Poppins', sans-serif",
    fontSize: '1.8rem',
    fontWeight: '600',
    color: '#636e72',
    marginBottom: '20px',
    textAlign: 'center',
  },
  chartWrapper: {
    width: '100%',
    maxWidth: '1200px', // Increased width
    height: '500px', // Kept height
    margin: '0 auto 30px',
    padding: '20px',
    background: '#f9f9f9',
    borderRadius: '15px',
    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.05)',
  },
  forecastDetailsTitle: {
    fontFamily: "'Poppins', sans-serif",
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#2d3436',
    marginTop: '40px',
    marginBottom: '20px',
    textAlign: 'center',
  },
  forecastLoading: {
    fontFamily: "'Poppins', sans-serif",
    fontSize: '1.2rem',
    color: '#636e72',
    textAlign: 'center',
  },
  forecastError: {
    fontFamily: "'Poppins', sans-serif",
    fontSize: '1.2rem',
    color: '#e63946',
    textAlign: 'center',
  },
};

export default PreductionForDonor;