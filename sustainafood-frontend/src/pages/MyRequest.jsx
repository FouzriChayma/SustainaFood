import React, { useEffect, useState } from 'react';
import { getRequestsByRecipientId } from "../api/requestNeedsService";
import { useAuth } from "../contexts/AuthContext";
import Composantrequest from "../components/Composantrequest";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function MyRequest() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true); // État de chargement
  const { user: authUser } = useAuth();

  useEffect(() => {
    const fetchDonations = async () => {
      if (!authUser || !authUser._id) {
        setLoading(false);
        return;
      }

      try {
        const response = await getRequestsByRecipientId(authUser._id);
        setDonations(response.data);
        setLoading(false); // Les données sont prêtes
      } catch (error) {
        console.error("Erreur backend :", error);
        setLoading(false); // Arrêter le chargement même en cas d'erreur
      }
    };

    fetchDonations();
  }, [authUser]);

  // Afficher un indicateur de chargement pendant que les données sont récupérées
  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <>
      <Navbar />
      <div className="container-listdonation">
        <header>
          <h1 style={{ color: '#228b22', fontSize: '40px' }}>Liste de mes demandes</h1>
        </header>
        <div className="contentlist">
          <div className="projects">
            {donations.length > 0 ? (
              donations.map((donationItem) => (
                <Composantrequest key={donationItem._id} request={donationItem} />
              ))
            ) : (
              <p>Aucune demande trouvée.</p>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}