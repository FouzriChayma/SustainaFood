// DonationDetails.js
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getDonationById } from "../../api/donationService";
import Sidebar from "../../components/backoffcom/Sidebar";
import Navbar from "../../components/backoffcom/Navbar";
import '../../assets/styles/backoffcss/donationDetails.css';

const DonationDetails = () => {
    const { id } = useParams();
    const [donation, setDonation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDonation = async () => {
            try {
                const response = await getDonationById(id);
                setDonation(response.data);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchDonation();
    }, [id]);

    if (loading) {
        return <div className="loading">Loading donation details...</div>;
    }

    if (error) {
        return <p>Error loading donation details: {error.message}</p>;
    }

    if (!donation) {
        return <p>Donation not found.</p>;
    }

    return (
        <div className="product-detail-container"> {/* Utilisez la classe conteneur générale */}
            <Sidebar />
            <div className="product-detail-content"> {/* Utilisez la classe de contenu générale */}
            <Navbar /> {/* Ajout du Navbar ici */}
                <div className="donation-card"> {/* Utilisez la classe de carte pour les dons */}
                    <h2 className="donation-header">Donation Details</h2> {/* Utilisez la classe d'en-tête pour les dons */}
                    <table className="donation-details-table"> {/* Utilisez la classe de tableau pour les dons */}
                        <tbody>
                            <tr>
                                <td>Title:</td>
                                <td>{donation.title || "N/A"}</td>
                            </tr>
                            <tr>
                                <td>Category:</td>
                                <td>{donation.category || "N/A"}</td>
                            </tr>
                            <tr>
                                <td>Status:</td>
                                <td>{donation.status || "N/A"}</td>
                            </tr>
                            <tr>
                                <td>Location:</td>
                                <td>{donation.location || "N/A"}</td>
                            </tr>
                            <tr>
                                <td>Expiration Date:</td>
                                <td>{donation.expirationDate ? new Date(donation.expirationDate).toLocaleDateString() : "N/A"}</td>
                            </tr>
                            <tr>
                                <td>Created At:</td>
                                <td>{donation.createdAt ? new Date(donation.createdAt).toLocaleDateString() : "N/A"}</td>
                            </tr>
                            <tr>
                                <td>Updated At:</td>
                                <td>{donation.updatedAt ? new Date(donation.updatedAt).toLocaleDateString() : "N/A"}</td>
                            </tr>
                            {/* Ajoutez ici les autres attributs du don que vous souhaitez afficher */}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DonationDetails;