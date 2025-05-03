"use client"

import { useEffect, useState } from "react";
import Sidebar from "../../components/backoffcom/Sidebar";
import Navbar from "../../components/backoffcom/Navbar";
import "../../assets/styles/Backoffice.css";

const Ad = () => {
  const [advertisements, setAdvertisements] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchAdvertisements = async () => {
      try {
        const response = await fetch("http://localhost:3000/users/advertisements", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setAdvertisements(data);
          setError("");
        } else {
          setError(data.error || "Failed to fetch advertisements");
        }
      } catch (err) {
        console.error("Error fetching advertisements:", err);
        setError("Server error while fetching advertisements");
      }
    };

    fetchAdvertisements();
  }, []);

  const handleStatusUpdate = async (adId, status) => {
    try {
      const response = await fetch(`http://localhost:3000/users/advertisements/${adId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      if (response.ok) {
        setAdvertisements((prev) =>
          prev.map((ad) => (ad._id === adId ? { ...ad, status } : ad))
        );
        setSuccess(`Advertisement ${status} successfully`);
        setTimeout(() => setSuccess(""), 5000);
        setError("");
      } else {
        setError(data.error || `Failed to update advertisement status`);
      }
    } catch (err) {
      console.error("Error updating advertisement status:", err);
      setError("Server error while updating advertisement status");
    }
  };

  return (
    <div className="admin-dashboard">
      <Sidebar />
      <div className="profile-container">
        <Navbar />
        <div className="profile-header">
          <h2>Advertisement Management</h2>
          <div className="profile-line"></div>
        </div>
        {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
        {success && <p style={{ color: "green", textAlign: "center" }}>{success}</p>}
        <div className="ad-table-container" style={{ padding: "20px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f2f2f2" }}>
                <th style={{ padding: "12px", border: "1px solid #ddd" }}>User Name</th>
                <th style={{ padding: "12px", border: "1px solid #ddd" }}>Email</th>
                <th style={{ padding: "12px", border: "1px solid #ddd" }}>Role</th>
                <th style={{ padding: "12px", border: "1px solid #ddd" }}>Image</th>
                <th style={{ padding: "12px", border: "1px solid #ddd" }}>Status</th>
                <th style={{ padding: "12px", border: "1px solid #ddd" }}>Created At</th>
                <th style={{ padding: "12px", border: "1px solid #ddd" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {advertisements.length > 0 ? (
                advertisements.map((ad) => (
                  <tr key={ad._id}>
                    <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                      {ad.user?.name || "N/A"}
                    </td>
                    <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                      {ad.user?.email || "N/A"}
                    </td>
                    <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                      {ad.user?.role || "N/A"}
                    </td>
                    <td style={{ padding: "12px", border: "1px solid #ddd", textAlign: "center" }}>
                      <img
                        src={`http://localhost:3000/${ad.imagePath}`}
                        alt="Advertisement"
                        style={{ maxWidth: "100px", maxHeight: "100px" }}
                        onError={(e) => (e.target.src = "/placeholder.svg")} // Fallback image
                      />
                    </td>
                    <td style={{ padding: "12px", border: "1px solid #ddd", textTransform: "capitalize" }}>
                      {ad.status}
                    </td>
                    <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                      {new Date(ad.createdAt).toLocaleString()}
                    </td>
                    <td style={{ padding: "12px", border: "1px solid #ddd", textAlign: "center" }}>
                      {ad.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(ad._id, "approved")}
                            style={{
                              padding: "8px 12px",
                              background: "#28a745",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              marginRight: "5px",
                              cursor: "pointer",
                            }}
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(ad._id, "rejected")}
                            style={{
                              padding: "8px 12px",
                              background: "#dc3545",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                            }}
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ padding: "12px", textAlign: "center" }}>
                    No advertisements found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Ad;