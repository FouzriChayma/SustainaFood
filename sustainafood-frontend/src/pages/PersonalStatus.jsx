import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../assets/styles/AddDonation.css";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import logo from '../assets/images/logooo.png';  // Import the logo

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const PersonalStatus = () => {
  const { authUser } = useAuth();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [userId, setUserId] = useState("");
  const isDonor = user?.role === "restaurant" || user?.role === "supermarket";
  const isRecipient = user?.role === "ong" || user?.role === "student";

  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (authUser && (authUser._id || authUser.id)) {
      setUserId(authUser._id || authUser.id);
      console.log("userId depuis authUser:", authUser._id || authUser.id);
    } else if (user) {
      setUserId(user._id || user.id || "");
      console.log("userId depuis localStorage:", user._id || user.id);
    }
  }, [authUser]);

  useEffect(() => {
    const fetchPersonalStats = async () => {
      if (!userId) {
        setError("User ID is not available.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const endpoint = isDonor
          ? `http://localhost:3000/donation/api/personal-stats/donor/${userId}`
          : `http://localhost:3000/donation/api/personal-stats/recipient/${userId}`;
        console.log("Fetching from:", endpoint);
        const response = await fetch(endpoint);
        if (!response.ok) {
          const text = await response.text();
          console.error("Response Error:", response.status, text);
          throw new Error(`Failed to fetch personal stats: ${response.status}`);
        }
        const data = await response.json();
        console.log("Données de l'API:", data);
        setStatsData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (userId && (isDonor || isRecipient)) fetchPersonalStats();
  }, [userId, isDonor, isRecipient]);

  const chartData = statsData && 
    (isDonor ? statsData.weeklyAcceptedTrends?.length > 0 : statsData.weeklyRequestTrends?.length > 0)
    ? {
        labels: isDonor
          ? statsData.weeklyAcceptedTrends.map((t) => `Week ${t._id}`)
          : statsData.weeklyRequestTrends.map((t) => `Week ${t._id}`),
        datasets: [
          {
            label: isDonor ? "Accepted Donations per Week" : "Requests per Week",
            data: isDonor
              ? statsData.weeklyAcceptedTrends.map((t) => t.count)
              : statsData.weeklyRequestTrends.map((t) => t.count),
            backgroundColor: "#8dc73f",
            borderColor: "#6b9e2f",
            borderWidth: 1,
          },
        ],
      }
    : null;

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: isDonor ? "Weekly Accepted Donations" : "Weekly Requests" },
    },
  };

  const downloadStatusReport = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const addHeader = () => {
      doc.setFillColor(245, 245, 245);
      doc.rect(0, 0, doc.internal.pageSize.width, 30, "F");
      const imgWidth = 25, imgHeight = 25;
      doc.addImage(logo, "PNG", 5, 5, imgWidth, imgHeight);
      doc.setDrawColor(144, 196, 60);
      doc.setLineWidth(1.5);
      doc.line(0, 30, doc.internal.pageSize.width, 30);
      doc.setFontSize(20);
      doc.setTextColor(50, 62, 72);
      doc.setFont("helvetica", "bold");
      doc.text("Personal Status Report", doc.internal.pageSize.width / 2, 15, { align: "center" });
      const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.text(`Generated: ${today}`, doc.internal.pageSize.width - 50, 25);
    };

    const addFooter = (page, pageCount) => {
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.line(15, doc.internal.pageSize.height - 20, doc.internal.pageSize.width - 15, doc.internal.pageSize.height - 20);
      doc.setTextColor(120, 120, 120);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text(`Page ${page} of ${pageCount}`, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: "center" });
      doc.text("© SustainaFood", doc.internal.pageSize.width - 45, doc.internal.pageSize.height - 10);
    };

    addHeader();

    let position = 40;
    doc.setFontSize(12);
    doc.setTextColor(50, 62, 72);
    doc.setFont("helvetica", "bold");
    doc.text("Your Personal Statistics", 10, position);
    position += 10;

    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.setFont("helvetica", "normal");
    if (isDonor && statsData) {
      doc.text(`Role: Donor (${user?.role})`, 10, position);
      position += 5;
      doc.text(`Accepted Donations: ${statsData.acceptedDonations || 0}`, 10, position);
      position += 5;
      doc.text(`Requests for Your Donations: ${statsData.requestsForDonations || 0}`, 10, position);
    } else if (isRecipient && statsData) {
      doc.text(`Role: Recipient (${user?.role})`, 10, position);
      position += 5;
      doc.text(`Total Requests Made: ${statsData.totalRequests || 0}`, 10, position);
      position += 5;
      doc.text(`Accepted Donations: ${statsData.acceptedDonations || 0}`, 10, position);
    }
    position += 10;

    if (chartData) {
      const chartCanvas = chartRef.current?.querySelector("canvas");
      if (chartCanvas) {
        html2canvas(chartCanvas, { scale: 2 }).then((canvas) => {
          const imgData = canvas.toDataURL("image/png");
          const imgWidth = 190;
          const chartImgHeight = (canvas.height * imgWidth) / canvas.width;

          if (position + chartImgHeight > 250) {
            doc.addPage();
            addHeader();
            position = 40;
          }

          doc.setFontSize(12);
          doc.setTextColor(50, 62, 72);
          doc.setFont("helvetica", "bold");
          doc.text("Weekly Activity", 10, position);
          position += 5;
          doc.addImage(imgData, "PNG", 10, position, imgWidth, chartImgHeight);
          position += chartImgHeight + 10;

          const pageCount = doc.internal.getNumberOfPages();
          for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            addFooter(i, pageCount);
          }

          const today = new Date();
          doc.save(`Personal_Status_Report_${today.toISOString().split("T")[0]}.pdf`);
        });
      }
    } else {
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        addFooter(i, pageCount);
      }
      const today = new Date();
      doc.save(`Personal_Status_Report_${today.toISOString().split("T")[0]}.pdf`);
    }
  };

  if (loading) return <div className="add-donation"><p>Loading personal status...</p></div>;
  if (error) return <div className="add-donation"><p className="error-message">{error}</p></div>;
  if (!isDonor && !isRecipient) return <div className="add-donation"><p>Access denied.</p></div>;

  console.log("chartData avant rendu:", chartData);

  return (
    <>
      <Navbar />
      <div className="add-donation">
        <div className="signup-form">
          <h1 className="signup-h1">{isDonor ? "Donor Personal Status" : "Recipient Personal Status"}</h1>
          {isDonor ? (
            <>
              <p><strong>Role:</strong> Donor ({user?.role})</p>
              <p><strong>Accepted Donations:</strong> {statsData?.acceptedDonations || 0}</p>
              <p><strong>Requests for Your Donations:</strong> {statsData?.requestsForDonations || 0}</p>
            </>
          ) : (
            <>
              <p><strong>Role:</strong> Recipient ({user?.role})</p>
              <p><strong>Total Requests Made:</strong> {statsData?.totalRequests || 0}</p>
              <p><strong>Accepted Donations:</strong> {statsData?.acceptedDonations || 0}</p>
            </>
          )}
          {chartData && (
            <div ref={chartRef} style={{ maxWidth: "600px", margin: "20px auto" }}>
              <Bar data={chartData} options={chartOptions} />
            </div>
          )}
          <button className="signup-button" onClick={downloadStatusReport}>
            Download Status Report as PDF
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PersonalStatus;