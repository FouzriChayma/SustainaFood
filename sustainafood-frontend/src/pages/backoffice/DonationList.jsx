import React, { useEffect, useState } from "react";
// Removed axios import since it's no longer used
import Sidebar from "../../components/backoffcom/Sidebar";
import Navbar from "../../components/backoffcom/Navbar";
import "../../assets/styles/backoffcss/studentList.css"; // Using existing CSS
import { FaEye, FaFilePdf, FaSort } from "react-icons/fa"; // Removed FaTrash
import ReactPaginate from "react-paginate";
import { Link } from "react-router-dom";
import logo from '../../assets/images/logooo.png'; // Import the logo
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { getDonations } from "../../api/donationService";

const DonationList = () => {
    const [donations, setDonations] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortField, setSortField] = useState("title");
    const [sortOrder, setSortOrder] = useState("asc");
    const donationsPerPage = 3;

    const pagesVisited = currentPage * donationsPerPage;

    useEffect(() => {
        const fetchDonations = async () => {
            try {
                const response = await getDonations();
                setDonations(response.data || []); // Default to empty array if no data
                console.log("Fetched donations:", response.data); // Debug log
            } catch (error) {
                console.error("Error fetching donations:", error);
                setDonations([]); // Set empty array on error to avoid undefined
            }
        };
        fetchDonations();
    }, []);

    const exportToPDF = () => {
        const doc = new jsPDF({
            orientation: "landscape",
            unit: "mm",
            format: "a4",
        });

        // Header background - light gray
        doc.setFillColor(245, 245, 245);
        doc.rect(0, 0, doc.internal.pageSize.width, 40, "F");

        // Decorative bottom line - main color #90C43C
        doc.setDrawColor(144, 196, 60);
        doc.setLineWidth(1.5);
        doc.line(0, 40, doc.internal.pageSize.width, 40);

        // Logo
        const imgWidth = 30, imgHeight = 30;
        doc.addImage(logo, "PNG", 5, 5, imgWidth, imgHeight);

        // Title - dark slate blue
        const title = "DONATIONS LIST";
        doc.setFontSize(28);
        doc.setTextColor(50, 62, 72);
        doc.setFont("helvetica", "bold");
        doc.text(title, doc.internal.pageSize.width / 2, 20, { align: "center" });

        // Date
        const today = new Date();
        const dateStr = today.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
        doc.setFontSize(10);
        doc.setTextColor(80, 80, 80);
        doc.text(`Generated: ${dateStr}`, doc.internal.pageSize.width - 50, 38);

        // Table
        autoTable(doc, {
            head: [["ID", "Title", "Category", "Status", "Location", "Expiration Date", "Added At", "Updated At"]],
            body: donations.map((donation, index) => [
                (index + 1).toString(),
                donation.title || "N/A",
                donation.category || "N/A",
                donation.status || "N/A",
                donation.location || "N/A",
                donation.expirationDate ? new Date(donation.expirationDate).toLocaleDateString() : "N/A",
                donation.createdAt ? new Date(donation.createdAt).toLocaleDateString() : "N/A",
                donation.updatedAt ? new Date(donation.updatedAt).toLocaleDateString() : "N/A",
            ]),
            startY: 50,
            theme: "grid",
            styles: {
                fontSize: 9,
                cellPadding: 6,
                lineColor: [200, 200, 200],
                lineWidth: 0.2,
                valign: "middle",
                textColor: [45, 45, 45],
            },
            headStyles: {
                fillColor: [70, 80, 95], // Dark blue-gray
                textColor: [255, 255, 255],
                fontStyle: "bold",
                halign: "center",
                fontSize: 10,
            },
            alternateRowStyles: {
                fillColor: [250, 250, 250], // Very light gray
            },
            didDrawCell: (data) => {
                if (data.section === "body" && data.column.index === 3) { // Status column
                    const status = data.cell.text[0];
                    if (status === "fulfilled") {
                        doc.setFillColor(144, 196, 60); // Green for fulfilled
                        doc.roundedRect(data.cell.x + 2, data.cell.y + 2, data.cell.width - 4, data.cell.height - 4, 2, 2, "F");
                        doc.setTextColor(255, 255, 255);
                    } else if (status === "cancelled") {
                        doc.setFillColor(220, 220, 220); // Light gray for cancelled
                        doc.roundedRect(data.cell.x + 2, data.cell.y + 2, data.cell.width - 4, data.cell.height - 4, 2, 2, "F");
                        doc.setTextColor(100, 100, 100);
                    }
                }
            },
            didDrawPage: (data) => {
                // Footer line
                doc.setDrawColor(200, 200, 200);
                doc.setLineWidth(0.5);
                doc.line(15, doc.internal.pageSize.height - 20, doc.internal.pageSize.width - 15, doc.internal.pageSize.height - 20);

                // Page numbers
                doc.setFillColor(144, 196, 60);
                doc.roundedRect(doc.internal.pageSize.width / 2 - 15, doc.internal.pageSize.height - 18, 30, 12, 3, 3, "F");
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(9);
                doc.text(`Page ${data.pageNumber} of ${doc.internal.getNumberOfPages()}`, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: "center" });

                // Confidentiality notice
                doc.setTextColor(120, 120, 120);
                doc.setFontSize(8);
                doc.setFont("helvetica", "italic");
                doc.text("Confidential - For internal use only", 15, doc.internal.pageSize.height - 10);

                // Institution info
                doc.text("©SustainaFood", doc.internal.pageSize.width - 45, doc.internal.pageSize.height - 10);
            },
        });

        doc.save(`Donation_Directory_${today.toISOString().split("T")[0]}.pdf`);
    };

    const filteredDonations = donations.filter(donation => {
        const expirationDateString = donation.expirationDate ? new Date(donation.expirationDate).toLocaleDateString() : "";
        const createdAtString = donation.createdAt ? new Date(donation.createdAt).toLocaleDateString() : "";
        const updatedAtString = donation.updatedAt ? new Date(donation.updatedAt).toLocaleDateString() : "";
        return (
            (donation.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (donation.category || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (donation.status || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (donation.location || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            expirationDateString.includes(searchQuery) ||
            createdAtString.includes(searchQuery) ||
            updatedAtString.includes(searchQuery)
        );
    });

    const sortedDonations = filteredDonations.sort((a, b) => {
        if (sortField === "title") {
            return sortOrder === "asc" ? (a.title || "").localeCompare(b.title || "") : (b.title || "").localeCompare(a.title || "");
        } else if (sortField === "category") {
            return sortOrder === "asc" ? (a.category || "").localeCompare(b.category || "") : (b.category || "").localeCompare(a.category || "");
        } else if (sortField === "status") {
            return sortOrder === "asc" ? (a.status || "").localeCompare(b.status || "") : (b.status || "").localeCompare(a.status || "");
        } else if (sortField === "location") {
            return sortOrder === "asc" ? (a.location || "").localeCompare(b.location || "") : (b.location || "").localeCompare(a.location || "");
        } else if (sortField === "expirationDate") {
            return sortOrder === "asc" 
                ? (new Date(a.expirationDate) || 0) - (new Date(b.expirationDate) || 0)
                : (new Date(b.expirationDate) || 0) - (new Date(a.expirationDate) || 0);
        } else if (sortField === "createdAt") {
            return sortOrder === "asc" 
                ? (new Date(a.createdAt) || 0) - (new Date(b.createdAt) || 0)
                : (new Date(b.createdAt) || 0) - (new Date(a.createdAt) || 0);
        } else if (sortField === "updatedAt") {
            return sortOrder === "asc" 
                ? (new Date(a.updatedAt) || 0) - (new Date(b.updatedAt) || 0)
                : (new Date(b.updatedAt) || 0) - (new Date(a.updatedAt) || 0);
        }
        return 0;
    });

    const displayDonations = sortedDonations.slice(pagesVisited, pagesVisited + donationsPerPage);
    const pageCount = Math.ceil(filteredDonations.length / donationsPerPage);

    const changePage = ({ selected }) => {
        setCurrentPage(selected);
    };

    
    return (
        <div className="dashboard-container">
            <Sidebar />
            <div className="student-dashboardcontent">
                <Navbar setSearchQuery={setSearchQuery} />
                <div className="student-list">
                    <div className="header-container">
                        <h2>Donation Management</h2>
                        <button className="export-pdf-btn" onClick={exportToPDF}>
                            <FaFilePdf /> Export to PDF
                        </button>
                    </div>
                    <div className="sort-container">
                        <label>Sort by:</label>
                        <select value={sortField} onChange={(e) => setSortField(e.target.value)}>
                            <option value="title">Title</option>
                            <option value="category">Category</option>
                            <option value="status">Status</option>
                            <option value="location">Location</option>
                            <option value="expirationDate">Expiration Date</option>
                            <option value="createdAt">Added At</option>
                            <option value="updatedAt">Updated At</option>
                        </select>
                        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                            <option value="asc">Ascending</option>
                            <option value="desc">Descending</option>
                        </select>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Title</th>
                                <th>Category</th>
                                <th>Status</th>
                                <th>Location</th>
                                <th>Expiration Date</th>
                                <th>Added At</th>
                                <th>Updated At</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayDonations.length > 0 ? (
                                displayDonations.map((donation, index) => (
                                    <tr key={donation._id}>
                                        <td>{pagesVisited + index + 1}</td>
                                        <td>{donation.title || "N/A"}</td>
                                        <td>{donation.category || "N/A"}</td>
                                        <td>{donation.status || "N/A"}</td>
                                        <td>{donation.location || "N/A"}</td>
                                        <td>{donation.expirationDate ? new Date(donation.expirationDate).toLocaleDateString() : "N/A"}</td>
                                        <td>{donation.createdAt ? new Date(donation.createdAt).toLocaleDateString() : "N/A"}</td>
                                        <td>{donation.updatedAt ? new Date(donation.updatedAt).toLocaleDateString() : "N/A"}</td>
                                        <td className="action-buttons">
                                            <button className="view-btn">
                                                <Link to={`/donations/view/${donation._id}`}>
                                                    <FaEye />
                                                </Link>
                                            </button>
                                            {/* Removed delete button */}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="9" style={{ textAlign: "center" }}>
                                        No donations available
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    <ReactPaginate
                        previousLabel={"Previous"}
                        nextLabel={"Next"}
                        pageCount={pageCount}
                        onPageChange={changePage}
                        containerClassName={"pagination"}
                        previousLinkClassName={"previousBttn"}
                        nextLinkClassName={"nextBttn"}
                        disabledClassName={"paginationDisabled"}
                        activeClassName={"paginationActive"}
                    />
                </div>
            </div>
        </div>
    );
};

export default DonationList;