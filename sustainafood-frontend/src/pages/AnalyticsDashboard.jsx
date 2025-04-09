import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../assets/styles/AddDonation.css";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AnalyticsDashboard = () => {
  const { authUser } = useAuth();
  const user = JSON.parse(localStorage.getItem("user"));
  const [userId, setuserId] = useState("");
  const isDonor = user?.role === "restaurant" || user?.role === "supermarket";
  const isRecipient = user?.role === "ong" || user?.role === "student";

  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (authUser && (authUser._id || authUser.id)) {
      setuserId(authUser._id || authUser.id);
      console.log("userId depuis authUser :", authUser._id || authUser.id);
    } else if (user) {
      setuserId(user._id || user.id || "");
      console.log("userId depuis localStorage :", user._id || user.id);
    }
  }, [authUser]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!userId) {
        setError("User ID is not available.");
        setLoading(false);
        return;
      }
  
      try {
        setLoading(true);
        const endpoint = isDonor
          ? `http://localhost:3000/donation/api/analytics/donor/${userId}`
          : `http://localhost:3000/donation/api/analytics/recipient/${userId}`;
        console.log("Fetching from:", endpoint);
        const response = await fetch(endpoint);
        if (!response.ok) {
          const text = await response.text();
          throw new Error(`Failed to fetch analytics: ${response.status} - ${text}`);
        }
        const data = await response.json();
        console.log("Données de l'API :", data);
        setAnalyticsData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
  
    if (userId && (isDonor || isRecipient)) fetchAnalytics();
  }, [userId, isDonor, isRecipient]);

  const chartData = analyticsData?.weeklyTrends && analyticsData.weeklyTrends.length > 0
    ? {
        labels: analyticsData.weeklyTrends.map((t) => `Week ${t._id}`),
        datasets: [
          {
            label: isDonor ? "Donations per Week" : "Requests per Week",
            data: analyticsData.weeklyTrends.map((t) => t.count),
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
      title: { display: true, text: "Weekly Activity" },
    },
  };

  const downloadReport = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const addHeader = () => {
      doc.setFillColor(245, 245, 245);
      doc.rect(0, 0, doc.internal.pageSize.width, 30, "F");
      doc.setDrawColor(144, 196, 60);
      doc.setLineWidth(1.5);
      doc.line(0, 30, doc.internal.pageSize.width, 30);
      doc.setFontSize(20);
      doc.setTextColor(50, 62, 72);
      doc.setFont("helvetica", "bold");
      doc.text(isDonor ? "Donor Analytics Report" : "Recipient Analytics Report", doc.internal.pageSize.width / 2, 15, { align: "center" });
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
    doc.text("Analytics Summary", 10, position);
    position += 10;

    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.setFont("helvetica", "normal");
    if (isDonor) {
      doc.text(`Total Donations: ${analyticsData.totalDonations}`, 10, position);
      position += 5;
      doc.text(`Total Items Donated: ${analyticsData.totalItems}`, 10, position);
      position += 5;
      doc.text(`Categories Donated: ${analyticsData.categories.join(", ")}`, 10, position);
    } else {
      doc.text(`Total Requests: ${analyticsData.totalRequests}`, 10, position);
      position += 5;
      doc.text(`Fulfilled Requests: ${analyticsData.fulfilledRequests}`, 10, position);
      position += 5;
      doc.text(`Total Fulfilled Items: ${analyticsData.totalFulfilledItems}`, 10, position);
      position += 5;
      doc.text(`Categories Requested: ${analyticsData.categories.join(", ")}`, 10, position);
    }
    position += 10;

    if (chartData) {
      const chartCanvas = chartRef.current.querySelector("canvas");
      html2canvas(chartCanvas, { scale: 2 }).then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const imgWidth = 190;
        const chartImgHeight = (canvas.height * imgWidth) / canvas.width;

        if (position + chartImgHeight > 250) {
          doc.addPage();
          addHeader();
          position = 40;
        }

        doc.addImage(imgData, "PNG", 10, position, imgWidth, chartImgHeight);
        position += chartImgHeight + 10;

        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          addFooter(i, pageCount);
        }

        const today = new Date();
        doc.save(`${isDonor ? "Donor" : "Recipient"}_Analytics_Report_${today.toISOString().split("T")[0]}.pdf`);
      });
    } else {
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        addFooter(i, pageCount);
      }
      const today = new Date();
      doc.save(`${isDonor ? "Donor" : "Recipient"}_Analytics_Report_${today.toISOString().split("T")[0]}.pdf`);
    }
  };

  if (loading) return <div className="add-donation"><p>Loading analytics...</p></div>;
  if (error) return <div className="add-donation"><p className="error-message">{error}</p></div>;
  if (!isDonor && !isRecipient) return <div className="add-donation"><p>Access denied.</p></div>;

  console.log("chartData avant rendu :", chartData);

  return (
    <>
      <Navbar />
      <div className="add-donation">
        <div className="signup-form">
          <h1 className="signup-h1">{isDonor ? "Donor Analytics" : "Recipient Analytics"}</h1>
          {isDonor ? (
            <>
              <p><strong>Total Donations:</strong> {analyticsData?.totalDonations}</p>
              <p><strong>Total Items Donated:</strong> {analyticsData?.totalItems}</p>
              <p><strong>Categories Donated:</strong> {analyticsData?.categories?.join(", ")}</p>
            </>
          ) : (
            <>
              <p><strong>Total Requests:</strong> {analyticsData?.totalRequests}</p>
              <p><strong>Fulfilled Requests:</strong> {analyticsData?.fulfilledRequests}</p>
              <p><strong>Total Fulfilled Items:</strong> {analyticsData?.totalFulfilledItems}</p>
              <p><strong>Categories Requested:</strong> {analyticsData?.categories?.join(", ")}</p>
            </>
          )}
          {chartData && (
            <div ref={chartRef} style={{ maxWidth: "600px", margin: "20px auto" }}>
              <Bar data={chartData} options={chartOptions} />
            </div>
          )}
          <button className="signup-button" onClick={downloadReport}>
            Download Report as PDF
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AnalyticsDashboard;