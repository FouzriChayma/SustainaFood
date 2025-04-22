import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getDeliveriesByTransporter, updateDeliveryStatus } from '../api/deliveryService';
import { getUserById, updateTransporterLocation } from '../api/userService';
import { getRequestById } from '../api/requestNeedsService';
import DeleveryMap from '../components/DeleveryMap';
import imgmouna from '../assets/images/imgmouna.png';
import styled, { createGlobalStyle } from 'styled-components';
import { FaSearch } from 'react-icons/fa';
import { useAlert } from '../contexts/AlertContext';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

// Global Styles and Styled Components (unchanged, with additions)
const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    font-family: 'Poppins', sans-serif;
    background: #f0f8f0;
    box-sizing: border-box;
  }
`;

const DeliveryContainer = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const Controls = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin: 20px 0;
`;

const Select = styled.select`
  font-size: 16px;
  border-radius: 25px;
  border: 1px solid #ccc;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: 0.3s;
  cursor: pointer;
  background: white;
  color: #333;
  font-weight: bold;
  padding: 10px 10px 10px 3px;
  
  &:hover {
    border-color: #228b22;
    transform: scale(1.05);
  }
`;

const DeliveryCard = styled.div`
  background: #f8f9fa;
  border-left: 4px solid #228b22;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease-in-out;

  &:hover {
    transform: scale(1.02);
  }

  @media (max-width: 768px) {
    padding: 15px;
  }
`;

const ProfileInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const ProfileImg = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #228b22;
`;

const ProfileText = styled.p`
  margin: 0;
  font-size: 16px;
  font-weight: bold;
  color: #495057;
`;

const DeliveryDetails = styled.div`
  margin-bottom: 15px;
`;

const DeliveryDetail = styled.p`
  font-size: 14px;
  color: #495057;
  margin: 5px 0;

  strong {
    color: #222;
    font-weight: 600;
  }
`;

const ItemSection = styled.div`
  margin-bottom: 15px;
`;

const ItemsTitle = styled.h4`
  font-size: 16px;
  color: #222;
  margin: 0 0 10px;
`;

const ItemList = styled.ul`
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 10px;
`;

const Item = styled.li`
  background: #ffffff;
  padding: 10px;
  border-left: 3px solid #228b22;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  font-size: 14px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const ItemDetails = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;

  span {
    display: block;
    font-size: 13px;
    color: #333;
  }
`;

const ItemQuantity = styled.span`
  font-size: 14px;
  font-weight: bold;
  color: #d9534f;
  padding: 4px 8px;
  border-radius: 4px;

  @media (max-width: 768px) {
    font-size: 13px;
    padding: 6px;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-evenly;
  margin-top: 15px;
`;

const ActionButton = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  transition: background 0.3s ease-in-out;

  &.update-btn {
    background-color: #007bff;
    color: white;

    &:hover {
      background-color: #0056b3;
    }
  }

  &.map-btn {
    background-color: #28a745;
    color: white;

    &:hover {
      background-color: #218838;
    }
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const PaginationControls = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  gap: 10px;

  button {
    padding: 10px 20px;
    font-size: 14px;
    background: #228b22;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background 0.3s;

    &:hover:not(:disabled) {
      background: #56ab2f;
    }

    &:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
  }

  span {
    font-size: 14px;
    color: #333;
  }
`;

const LoadingMessage = styled.div`
  font-size: 18px;
  color: #555;
  text-align: center;
  padding: 40px;
`;

const NoDeliveries = styled.p`
  font-size: 18px;
  color: #888;
  text-align: center;
  padding: 20px;
`;

const ErrorContainer = styled.div`
  text-align: center;
  padding: 40px;
`;

const DeliveryTitle = styled.h1`
  color: #228b22;
  font-size: 40px;
  margin-bottom: 20px;
  text-align: center;

  p {
    font-size: 24px;
    color: #495057;
    margin: 5px 0 0;
  }
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  padding: 8px;
  border-radius: 25px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 320px;
  margin: 0 auto 20px;
  transition: all 0.3s ease-in-out;

  &:hover {
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  }
`;

const SearchIcon = styled(FaSearch)`
  color: #555;
  margin-right: 8px;
`;

const SearchInput = styled.input`
  border: none;
  outline: none;
  font-size: 16px;
  width: 100%;
  padding: 8px;
  background: transparent;
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  margin-left: 5px;
  
  &.no-status {
    background-color: #e9ecef;
    color: #495057;
  }
  
  &.pending {
    background-color: #fff3cd;
    color: #856404;
  }
  
  &.picked_up {
    background-color: #e2e3e5;
    color: #383d41;
  }
  
  &.in_progress {
    background-color: #d4edda;
    color: #155724;
  }
  
  &.delivered {
    background-color: #cce5ff;
    color: #004085;
  }
  
  &.failed {
    background-color: #f8d7da;
    color: #721c24;
  }
`;

const Spinner = styled.div`
  display: inline-block;
  width: ${props => props.size === 'sm' ? '12px' : '16px'};
  height: ${props => props.size === 'sm' ? '12px' : '16px'};
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
  margin-right: 5px;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const RouteInfo = styled.div`
  margin-top: 10px;
  padding: 10px;
  background: #e9ecef;
  border-radius: 5px;
  font-size: 14px;
  color: #333;
`;

const AssignedDeliveries = () => {
  const { showAlert } = useAlert();
  const { transporterId } = useParams();
  const navigate = useNavigate();
  const [deliveries, setDeliveries] = useState([]);
  const [filteredDeliveries, setFilteredDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(3);
  const [filterOption, setFilterOption] = useState('all');
  const [sortOption, setSortOption] = useState('date');
  const [searchQuery, setSearchQuery] = useState('');
  const [processing, setProcessing] = useState({});
  const [isMapOpen, setIsMapOpen] = useState(null); // Track which delivery's map is open
  const [routeInfo, setRouteInfo] = useState({});
  const [transporterLocation, setTransporterLocation] = useState({ type: 'Point', coordinates: [0, 0] });

  // Fetch transporter's initial location
  useEffect(() => {
    const fetchTransporterLocation = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user?.location) {
          setTransporterLocation(user.location);
        } else if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            ({ coords }) => {
              const newLocation = { type: 'Point', coordinates: [coords.longitude, coords.latitude] };
              setTransporterLocation(newLocation);
              updateTransporterLocation(transporterId, { location: newLocation, address: 'Current Location' });
            },
            () => console.error('Failed to get initial geolocation')
          );
        }
      } catch (err) {
        console.error('Error fetching transporter location:', err);
      }
    };
    fetchTransporterLocation();
  }, [transporterId]);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        showAlert('error', 'Please log in to view deliveries');
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        const response = await getDeliveriesByTransporter(transporterId, filterOption !== 'all' ? filterOption : '');
        const deliveriesArray = Array.isArray(response.data.data) ? response.data.data : [];

        // Geocode addresses if coordinates are missing
        const enrichedDeliveries = await Promise.all(
          deliveriesArray.map(async delivery => {
            let pickupCoordinates = delivery.pickupCoordinates;
            let deliveryCoordinates = delivery.deliveryCoordinates;

            if (!pickupCoordinates) {
              pickupCoordinates = await geocodeAddress(delivery.pickupAddress);
            }
            if (!deliveryCoordinates) {
              deliveryCoordinates = await geocodeAddress(delivery.deliveryAddress);
            }

            return {
              ...delivery,
              pickupCoordinates: pickupCoordinates || { type: 'Point', coordinates: [0, 0] },
              deliveryCoordinates: deliveryCoordinates || { type: 'Point', coordinates: [0, 0] },
            };
          })
        );

        // Collect unique donor and requestNeed IDs
        const userIds = new Set();
        const requestNeedIds = new Set();
        enrichedDeliveries.forEach(delivery => {
          const donation = delivery.donationTransaction?.donation || {};
          const requestNeed = delivery.donationTransaction?.requestNeed;
          if (donation.donor) userIds.add(donation.donor);
          if (requestNeed) requestNeedIds.add(requestNeed);
        });

        // Fetch requestNeed details to get recipient IDs
        const requestNeedPromises = Array.from(requestNeedIds).map(id =>
          getRequestById(id).catch(err => {
            console.error(`Failed to fetch requestNeed ${id}:`, err);
            return { _id: id, recipient: null };
          })
        );
        const requestNeeds = await Promise.all(requestNeedPromises);
        const requestNeedMap = requestNeeds.reduce((map, rn) => {
          const requestNeedData = rn.data ? rn.data : rn;
          map[requestNeedData._id] = requestNeedData;
          return map;
        }, {});

        // Collect recipient IDs
        requestNeeds.forEach(rn => {
          const recipient = rn.data ? rn.data.recipient : rn.recipient;
          if (recipient && recipient._id) userIds.add(recipient._id);
        });

        // Fetch user details
        const userPromises = Array.from(userIds).map(id =>
          getUserById(id).catch(err => {
            console.error(`Failed to fetch user ${id}:`, err);
            return { _id: id, name: 'Unknown', phone: 'Not provided', photo: null };
          })
        );
        const users = await Promise.all(userPromises);
        const userMap = users.reduce((map, user) => {
          const userData = user.data ? user.data : user;
          map[userData._id] = userData;
          return map;
        }, {});

        // Enrich deliveries with user data
        const finalDeliveries = enrichedDeliveries.map(delivery => {
          const donation = delivery.donationTransaction?.donation || {};
          const requestNeedId = delivery.donationTransaction?.requestNeed;
          const requestNeed = requestNeedMap[requestNeedId] || { recipient: null };
          const recipient = requestNeed.recipient || null;
          return {
            ...delivery,
            donationTransaction: {
              ...delivery.donationTransaction,
              donation: {
                ...donation,
                donor: userMap[donation.donor] || { name: 'Unknown Donor', phone: 'Not provided', photo: null },
              },
              requestNeed: {
                recipient: userMap[recipient?._id] || { name: 'Unknown Recipient', phone: 'Not provided', photo: null },
              },
            },
          };
        });

        setDeliveries(finalDeliveries);
        setFilteredDeliveries(finalDeliveries);
      } catch (err) {
        console.error('Fetch error:', err);
        let errorMessage = 'Failed to fetch deliveries';
        if (err.response) {
          if (err.response.status === 404) {
            errorMessage = 'No deliveries found for this transporter';
          } else if (err.response.status === 400) {
            errorMessage = 'Invalid transporter ID';
          } else {
            errorMessage = err.message || 'An unexpected error occurred';
          }
        }
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [transporterId, navigate, showAlert, filterOption]);

  // Geocode address using Nominatim
  const geocodeAddress = async (address) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
      const data = await res.json();
      if (data.length > 0) {
        return { type: 'Point', coordinates: [parseFloat(data[0].lon), parseFloat(data[0].lat)] };
      }
      return null;
    } catch (err) {
      console.error(`Failed to geocode address ${address}:`, err);
      return null;
    }
  };

  // Calculate route using OSRM
  const calculateRoute = async (deliveryId, pickupCoords, deliveryCoords) => {
    try {
      // Skip if coordinates are invalid
      if (
        transporterLocation.coordinates[0] === 0 ||
        pickupCoords.coordinates[0] === 0 ||
        deliveryCoords.coordinates[0] === 0
      ) {
        return { error: 'Invalid coordinates' };
      }

      // Route from transporter to pickup
      const toPickupUrl = `http://router.project-osrm.org/route/v1/driving/${transporterLocation.coordinates[0]},${transporterLocation.coordinates[1]};${pickupCoords.coordinates[0]},${pickupCoords.coordinates[1]}?overview=full&geometries=geojson`;
      const toPickupRes = await axios.get(toPickupUrl);
      const toPickupRoute = toPickupRes.data.routes[0];
      const toPickupDuration = toPickupRoute.duration / 60; // Convert seconds to minutes
      const toPickupDistance = toPickupRoute.distance / 1000; // Convert meters to kilometers

      // Route from pickup to delivery
      const toDeliveryUrl = `http://router.project-osrm.org/route/v1/driving/${pickupCoords.coordinates[0]},${pickupCoords.coordinates[1]};${deliveryCoords.coordinates[0]},${deliveryCoords.coordinates[1]}?overview=full&geometries=geojson`;
      const toDeliveryRes = await axios.get(toDeliveryUrl);
      const toDeliveryRoute = toDeliveryRes.data.routes[0];
      const toDeliveryDuration = toDeliveryRoute.duration / 60; // Convert seconds to minutes
      const toDeliveryDistance = toDeliveryRoute.distance / 1000; // Convert meters to kilometers

      setRouteInfo(prev => ({
        ...prev,
        [deliveryId]: {
          toPickup: { duration: toPickupDuration, distance: toPickupDistance, geometry: toPickupRoute.geometry },
          toDelivery: { duration: toDeliveryDuration, distance: toDeliveryDistance, geometry: toDeliveryRoute.geometry },
        },
      }));
    } catch (err) {
      console.error(`Failed to calculate route for delivery ${deliveryId}:`, err);
      setRouteInfo(prev => ({
        ...prev,
        [deliveryId]: { error: 'Failed to calculate route' },
      }));
    }
  };

  // Handle status update with location tracking
  const handleUpdateStatus = async (deliveryId, newStatus) => {
    if (!window.confirm(`Are you sure you want to update the status to ${newStatus}?`)) return;

    try {
      setProcessing(prev => ({ ...prev, [deliveryId]: true }));

      // Update location if moving from pending
      if (newStatus !== 'pending' && deliveries.find(d => d._id === deliveryId).status === 'pending') {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async ({ coords }) => {
              const newLocation = { type: 'Point', coordinates: [coords.longitude, coords.latitude] };
              await updateTransporterLocation(transporterId, {
                location: newLocation,
                address: await reverseGeocode(coords.longitude, coords.latitude),
              });
              setTransporterLocation(newLocation);
            },
            () => showAlert('error', 'Failed to get current location')
          );
        }
      }

      await updateDeliveryStatus(deliveryId, { status: newStatus });
      setDeliveries(prev =>
        prev.map(d => (d._id === deliveryId ? { ...d, status: newStatus } : d))
      );
      showAlert('success', 'Delivery status updated successfully!');
    } catch (error) {
      console.error('Error updating status:', error);
      showAlert('error', error.message || 'Failed to update delivery status');
    } finally {
      setProcessing(prev => ({ ...prev, [deliveryId]: false }));
    }
  };

  // Reverse geocode for address
  const reverseGeocode = async (lng, lat) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lon=${lng}&lat=${lat}`);
      const data = await res.json();
      return data.display_name || 'Unknown Location';
    } catch {
      return 'Unknown Location';
    }
  };

  // Handle map open/close
  const handleOpenMap = (delivery) => {
    setIsMapOpen(delivery._id);
    calculateRoute(delivery._id, delivery.pickupCoordinates, delivery.deliveryCoordinates);
  };

  // Handle location select (not used for route display)
  const handleLocationSelect = (deliveryId, selectedLocation, selectedAddress) => {
    setIsMapOpen(null);
  };

  useEffect(() => {
    if (!deliveries.length) return;

    let updatedDeliveries = [...deliveries];

    // Apply search
    if (searchQuery) {
      updatedDeliveries = updatedDeliveries.filter(delivery => {
        const donation = delivery.donationTransaction?.donation || {};
        const recipient = delivery.donationTransaction?.requestNeed?.recipient || {};
        const donor = donation.donor || {};
        const titleMatch = donation.title?.toLowerCase().includes(searchQuery.toLowerCase());
        const categoryMatch = donation.category?.toLowerCase().includes(searchQuery.toLowerCase());
        const recipientMatch = recipient.name?.toLowerCase().includes(searchQuery.toLowerCase());
        const donorMatch = donor.name?.toLowerCase().includes(searchQuery.toLowerCase());
        const addressMatch =
          delivery.pickupAddress?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          delivery.deliveryAddress?.toLowerCase().includes(searchQuery.toLowerCase());
        return titleMatch || categoryMatch || recipientMatch || donorMatch || addressMatch;
      });
    }

    // Apply sorting
    updatedDeliveries.sort((a, b) => {
      const donationA = a.donationTransaction?.donation || {};
      const donationB = b.donationTransaction?.donation || {};
      const recipientA = a.donationTransaction?.requestNeed?.recipient || {};
      const recipientB = a.donationTransaction?.requestNeed?.recipient || {};
      if (sortOption === 'title') {
        return (donationA.title || '').localeCompare(donationB.title || '');
      } else if (sortOption === 'recipient') {
        return (recipientA.name || '').localeCompare(recipientB.name || '');
      } else if (sortOption === 'status') {
        return (a.status || 'no-status').localeCompare(b.status || 'no-status');
      } else {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
    });

    setFilteredDeliveries(updatedDeliveries);
    setCurrentPage(1);
  }, [deliveries, sortOption, searchQuery]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDeliveries = filteredDeliveries.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDeliveries.length / itemsPerPage);

  const paginate = pageNumber => setCurrentPage(pageNumber);

  if (loading) return <LoadingMessage>Loading...</LoadingMessage>;

  if (error) return (
    <>
      <Navbar />
      <ErrorContainer>Error: {error}</ErrorContainer>
      <Footer />
    </>
  );

  if (!deliveries.length) return (
    <>
      <Navbar />
      <ErrorContainer>No deliveries found for this transporter</ErrorContainer>
      <Footer />
    </>
  );

  return (
    <>
      <GlobalStyle />
      <Navbar />
      <DeliveryContainer>
        <DeliveryTitle>🚚 Assigned Deliveries</DeliveryTitle>

        <Controls>
          <SearchContainer>
            <SearchIcon />
            <SearchInput
              type="text"
              placeholder="Search by title, category, recipient, donor, or address..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              aria-label="Search deliveries"
            />
          </SearchContainer>

          <Select
            value={filterOption}
            onChange={e => setFilterOption(e.target.value)}
            aria-label="Filter by status"
          >
            <option value="all">🟢 All Deliveries</option>
            <option value="no-status">⚪ No Status</option>
            <option value="pending">🟠 Pending</option>
            <option value="picked_up">🔄 Picked Up</option>
            <option value="in_progress">🚚 In Progress</option>
            <option value="delivered">✅ Delivered</option>
            <option value="failed">❌ Failed</option>
          </Select>

          <Select
            value={sortOption}
            onChange={e => setSortOption(e.target.value)}
            aria-label="Sort deliveries"
          >
            <option value="date">📆 Sort by Date</option>
            <option value="title">📝 Sort by Donation Title</option>
            <option value="recipient">👤 Sort by Recipient</option>
            <option value="status">🔄 Sort by Status</option>
          </Select>
        </Controls>

        {currentDeliveries.length > 0 ? (
          currentDeliveries.map(delivery => {
            const donation = delivery.donationTransaction?.donation || {};
            const recipient = delivery.donationTransaction?.requestNeed?.recipient || {};
            const donor = donation.donor || {};

            // Debug logging
            if (!recipient.name || !donor.name || !recipient.phone || !donor.phone) {
              console.warn('Missing fields for delivery:', {
                deliveryId: delivery._id,
                recipient,
                donor,
                donationTransaction: delivery.donationTransaction,
              });
            }

            const userPhoto = recipient.photo
              ? `http://localhost:3000/${recipient.photo}`
              : imgmouna;

            return (
              <DeliveryCard key={delivery._id}>
                <ProfileInfo>
                  <ProfileImg
                    src={userPhoto}
                    alt="Recipient Profile"
                    onError={e => {
                      e.target.src = imgmouna;
                      console.error(`Failed to load image: ${userPhoto}`);
                    }}
                  />
                  <ProfileText>Recipient: {recipient.name || 'Unknown Recipient'}</ProfileText>
                </ProfileInfo>
                <DeliveryDetails>
                  <DeliveryDetail><strong>Delivery ID:</strong> {delivery._id}</DeliveryDetail>
                  <DeliveryDetail><strong>Donation Title:</strong> {donation.title || 'Untitled'}</DeliveryDetail>
                  <DeliveryDetail><strong>Pickup Address:</strong> {delivery.pickupAddress || 'Not specified'}</DeliveryDetail>
                  <DeliveryDetail><strong>Delivery Address:</strong> {delivery.deliveryAddress || 'Not specified'}</DeliveryDetail>
                  <DeliveryDetail><strong>Donor Name:</strong> {donor.name || 'Unknown Donor'}</DeliveryDetail>
                  <DeliveryDetail><strong>Donor Phone:</strong> {donor.phone || 'Not provided'}</DeliveryDetail>
                  <DeliveryDetail><strong>Recipient Phone:</strong> {recipient.phone || 'Not provided'}</DeliveryDetail>
                  <DeliveryDetail>
                    <strong>Status:</strong>
                    <StatusBadge className={delivery.status || 'no-status'}>
                      {delivery.status || 'No Status'}
                    </StatusBadge>
                  </DeliveryDetail>
                </DeliveryDetails>
                <ItemSection>
                  <ItemsTitle>Allocated Items:</ItemsTitle>
                  <ItemList>
                    <Item>
                      <ItemDetails>
                        <span><strong>Title:</strong> {donation.title || 'Untitled'}</span>
                        <span><strong>Category:</strong> {donation.category || 'Not specified'}</span>
                      </ItemDetails>
                      <ItemQuantity>1 item</ItemQuantity>
                    </Item>
                  </ItemList>
                </ItemSection>
                {routeInfo[delivery._id] && (
                  <RouteInfo>
                    {routeInfo[delivery._id].error ? (
                      <p>Error: {routeInfo[delivery._id].error}</p>
                    ) : (
                      <>
                        <p><strong>To Pickup:</strong> {routeInfo[delivery._id].toPickup.distance.toFixed(2)} km, {routeInfo[delivery._id].toPickup.duration.toFixed(2)} mins</p>
                        <p><strong>To Delivery:</strong> {routeInfo[delivery._id].toDelivery.distance.toFixed(2)} km, {routeInfo[delivery._id].toDelivery.duration.toFixed(2)} mins</p>
                      </>
                    )}
                  </RouteInfo>
                )}
                <ButtonContainer>
                  {delivery.status !== 'delivered' && delivery.status !== 'failed' && (
                    <>
                      <Select
                        onChange={e => handleUpdateStatus(delivery._id, e.target.value)}
                        value={delivery.status || 'no-status'}
                        disabled={processing[delivery._id]}
                        aria-label="Update delivery status"
                      >
                        <option value="no-status">No Status</option>
                        <option value="pending">Pending</option>
                        <option value="picked_up">Picked Up</option>
                        <option value="in_progress">In Progress</option>
                        <option value="delivered">Delivered</option>
                        <option value="failed">Failed</option>
                      </Select>
                      <ActionButton
                        className="update-btn"
                        onClick={() => handleUpdateStatus(delivery._id, delivery.status || 'no-status')}
                        disabled={processing[delivery._id]}
                        aria-label="Update status"
                      >
                        {processing[delivery._id] ? (
                          <>
                            <Spinner size="sm" /> Updating...
                          </>
                        ) : (
                          'Update Status'
                        )}
                      </ActionButton>
                    </>
                  )}
                  <ActionButton
                    className="map-btn"
                    onClick={() => handleOpenMap(delivery)}
                    aria-label="View map"
                  >
                    Get Map
                  </ActionButton>
                </ButtonContainer>
                {isMapOpen === delivery._id && (
                  <DeleveryMap
                    isOpen={isMapOpen === delivery._id}
                    onClose={() => setIsMapOpen(null)}
                    onLocationChange={() => {}} // Not used for route display
                    onAddressChange={() => {}} // Not used for route display
                    onSelect={(loc, addr) => handleLocationSelect(delivery._id, loc, addr)}
                    initialAddress={delivery.pickupAddress}
                    routeInfo={routeInfo[delivery._id]}
                    pickupCoordinates={delivery.pickupCoordinates}
                    deliveryCoordinates={delivery.deliveryCoordinates}
                    transporterCoordinates={transporterLocation}
                  />
                )}
              </DeliveryCard>
            );
          })
        ) : (
          <NoDeliveries>No matching deliveries found.</NoDeliveries>
        )}

        {totalPages > 1 && (
          <PaginationControls>
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label="Previous page"
            >
              Previous
            </button>
            <span>Page {currentPage} of {totalPages}</span>
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              aria-label="Next page"
            >
              Next
            </button>
          </PaginationControls>
        )}
      </DeliveryContainer>
      <Footer />
    </>
  );
};

export default AssignedDeliveries;