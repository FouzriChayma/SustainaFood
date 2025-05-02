import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import donation1 from '../assets/images/donation1.jpg';
import donation2 from '../assets/images/donation2.jpg';
import donation3 from '../assets/images/donation3.jpg';
import donation4 from '../assets/images/donation4.png';
import donation5 from '../assets/images/fooddonation.png';
import donation from '../assets/images/fooddonation1.png';
import patternBg from '../assets/images/bg.png';
import { FaSearch, FaFilter } from "react-icons/fa";
import { getUserById } from "../api/userService";
import { getDeliveriesByDonorId, getDeliveriesByRecipientId, getDeliveriesByTransporter } from "../api/deliveryService";
import { createFeedback } from '../api/feedbackService';
import imgmouna from '../assets/images/imgmouna.png';
import StarRating from '../components/StarRating';

// Global styles
const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    font-family: 'Poppins', sans-serif;
    background: #f0f8f0;
    box-sizing: border-box;
  }
`;

// Animation for slider
const fade = keyframes`
  0% { opacity: 0; }
  8% { opacity: 1; }
  33% { opacity: 1; }
  41% { opacity: 0; }
  100% { opacity: 0; }
`;

// Layout components
const HomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`;

const HeroSection = styled.section`
  position: relative;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  padding: 60px 80px;
  gap: 30px;
  background: 
    linear-gradient(rgba(230, 242, 230, 0.85), rgba(230, 242, 230, 0.85)),
    url(${patternBg}) repeat center center;
  background-size: 200px 200px;
  overflow: hidden;
`;

const HeroText = styled.div`
  flex: 1 1 500px;
  z-index: 2;
  text-align: left;
  h1 {
    font-size: 48px;
    color: #228b22;
    margin-bottom: 20px;
  }
  p {
    font-size: 20px;
    color: #555;
    margin-bottom: 30px;
    line-height: 1.5;
  }
`;

const SliderContainer = styled.div`
  position: relative;
  flex: 1 1 300px;
  width: 400px;
  height: 300px;
  border-radius: 20px;
  overflow: hidden;
  z-index: 2;
`;

const SlideImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 20px;
  box-shadow: rgba(133, 189, 150, 0.3) 0px 15px 25px -5px;
  opacity: 0;
  animation: ${fade} 12s infinite;
  animation-fill-mode: forwards;
`;

const Slide1 = styled(SlideImage)`animation-delay: 0s;`;
const Slide2 = styled(SlideImage)`animation-delay: 2.4s;`;
const Slide3 = styled(SlideImage)`animation-delay: 4.8s;`;
const Slide4 = styled(SlideImage)`animation-delay: 7.2s;`;
const Slide5 = styled(SlideImage)`animation-delay: 9.6s;`;
const Slide = styled(SlideImage)`animation-delay: 12s;`;

const Wave = styled.svg`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: auto;
  z-index: 1;
`;

const SectionWrapper = styled.section`
  padding: 60px 80px;
  background: #fff;
  text-align: left;
`;

const Container = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  text-align: left;
`;

const Title = styled.h1`
  color: #228b22;
  font-size: 40px;
  margin-bottom: 20px;
  text-align: center;
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
  margin: 0 auto 20px auto;
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
  text-align: left;
`;

const Controls = styled.div`
  display: flex;
  justify-content: center;
  gap: 15px;
  margin: 20px 0;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
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
  text-align: left;
  
  &:hover {
    border-color: #228b22;
    transform: scale(1.05);
  }
`;

const ContentList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  text-align: left;
`;

const LoadingMessage = styled.div`
  font-size: 18px;
  color: #555;
  text-align: left;
  padding: 40px;
`;

const NoDeliveries = styled.p`
  font-size: 18px;
  color: #888;
  text-align: left;
  padding: 20px;
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

// Delivery Card
const DeliveryCard = styled.div`
  background: #f8f9fa;
  border-left: 4px solid #228b22;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease-in-out;
  text-align: left;

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
  text-align: left;

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
  cursor: pointer;
`;

const ProfileText = styled.p`
  margin: 0;
  font-size: 16px;
  font-weight: bold;
  color: #495057;
  cursor: pointer;
  text-align: left;

  &:hover {
    color: #228b22;
    text-decoration: underline;
  }
`;

const DeliveryDetails = styled.div`
  margin-bottom: 15px;
  text-align: left;
`;

const DeliveryDetail = styled.p`
  font-size: 14px;
  color: #495057;
  margin: 5px 0;
  text-align: left;

  strong {
    color: #222;
    font-weight: 600;
  }
`;

const ItemSection = styled.div`
  margin-bottom: 15px;
  text-align: left;
`;

const ItemsTitle = styled.h4`
  font-size: 16px;
  color: #222;
  margin: 0 0 10px;
  text-align: left;
`;

const ItemList = styled.ul`
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 10px;
  text-align: left;
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
  text-align: left;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const ItemDetails = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  text-align: left;

  span {
    display: block;
    font-size: 13px;
    color: #333;
    text-align: left;
  }
`;

const ItemQuantity = styled.span`
  font-size: 14px;
  font-weight: bold;
  color: #d9534f;
  padding: 4px 8px;
  border-radius: 4px;
  text-align: left;

  @media (max-width: 768px) {
    font-size: 13px;
    padding: 6px;
  }
`;

const DeliveryStatus = styled.span`
  display: inline-block;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  margin-left: 5px;
  text-align: left;
  
  &.pending {
    background-color: #fff3cd;
    color: #856404;
  }
  
  &.accepted {
    background-color: #d4edda;
    color: #155724;
  }
  
  &.in_progress {
    background-color: #cce5ff;
    color: #004085;
  }
  
  &.delivered {
    background-color: #d4edda;
    color: #155724;
  }
  
  &.failed {
    background-color: #f8d7da;
    color: #721c24;
  }

  &.picked_up {
    background-color: #e6f3ff;
    color: #003087;
  }
`;

// Feedback Buttons and Modal
const FeedbackButtons = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 15px;
`;

const FeedbackButton = styled.button`
  padding: 8px 16px;
  background: #228b22;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s;

  &:hover:not(:disabled) {
    background: #56ab2f;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #333;
`;

const FeedbackForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const FormLabel = styled.label`
  font-size: 14px;
  color: #333;
  font-weight: bold;
`;

const FeedbackTextarea = styled.textarea`
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 5px;
  resize: vertical;
  font-size: 14px;
  font-family: 'Poppins', sans-serif;
  min-height: 80px;
`;

const SubmitButton = styled.button`
  padding: 8px 16px;
  background: #228b22;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  align-self: flex-start;

  &:hover:not(:disabled) {
    background: #56ab2f;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const FeedbackMessage = styled.p`
  font-size: 14px;
  color: ${props => (props.error ? '#721c24' : '#155724')};
  margin: 5px 0;
`;

const Deliveries = () => {
  const [user, setUser] = useState(null);
  const [deliveries, setDeliveries] = useState([]);
  const [filteredDeliveries, setFilteredDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOption, setSortOption] = useState('date');
  const [currentPage, setCurrentPage] = useState(1);
  const [feedbackModal, setFeedbackModal] = useState(null);
  const [feedbackState, setFeedbackState] = useState({});
  const itemsPerPage = 3;

  const initializeFeedbackState = (deliveryId, targetRole) => ({
    rating: 0,
    comment: '',
    submitted: false,
    error: '',
    success: '',
  });

  const handleFeedbackChange = (deliveryId, targetRole, field, value) => {
    setFeedbackState(prev => ({
      ...prev,
      [deliveryId]: {
        ...prev[deliveryId],
        [targetRole]: {
          ...prev[deliveryId][targetRole],
          [field]: value,
        },
      },
    }));
  };

  const handleFeedbackSubmit = async (deliveryId, targetRole, recipientId) => {
    const feedback = feedbackState[deliveryId]?.[targetRole];
    if (!feedback) return;

    if (feedback.rating < 1 || feedback.rating > 5) {
      setFeedbackState(prev => ({
        ...prev,
        [deliveryId]: {
          ...prev[deliveryId],
          [targetRole]: {
            ...prev[deliveryId][targetRole],
            error: 'Please select a rating between 1 and 5 stars',
            success: '',
          },
        },
      }));
      return;
    }

    if (!feedback.comment.trim()) {
      setFeedbackState(prev => ({
        ...prev,
        [deliveryId]: {
          ...prev[deliveryId],
          [targetRole]: {
            ...prev[deliveryId][targetRole],
            error: 'Please enter a comment',
            success: '',
          },
        },
      }));
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await createFeedback(
        recipientId,
        feedback.rating,
        feedback.comment,
        user._id,
        token
      );
      setFeedbackState(prev => ({
        ...prev,
        [deliveryId]: {
          ...prev[deliveryId],
          [targetRole]: {
            ...prev[deliveryId][targetRole],
            submitted: true,
            error: '',
            success: 'Feedback submitted successfully!',
          },
        },
      }));
    } catch (error) {
      setFeedbackState(prev => ({
        ...prev,
        [deliveryId]: {
          ...prev[deliveryId],
          [targetRole]: {
            ...prev[deliveryId][targetRole],
            error: error.message || 'Failed to submit feedback',
            success: '',
          },
        },
      }));
    }
  };

  const openFeedbackModal = (deliveryId, targetRole, targetId, targetName) => {
    setFeedbackModal({ deliveryId, targetRole, targetId, targetName });
  };

  const closeFeedbackModal = () => {
    setFeedbackModal(null);
  };

  useEffect(() => {
    const fetchUserAndDeliveries = async () => {
      try {
        setLoading(true);
        const storedUser = JSON.parse(localStorage.getItem('user'));
        const token = localStorage.getItem('token');

       

        const userResponse = await getUserById(storedUser._id || storedUser.id, token);
        setUser(userResponse.data);

        let deliveryResponse;
        if (userResponse.data.role === 'transporter') {
          deliveryResponse = await getDeliveriesByTransporter(userResponse.data._id|| userResponse.data.id, token);
        } else if (['restaurant', 'supermarket', 'personaldonor'].includes(userResponse.data.role)) {
          deliveryResponse = await getDeliveriesByDonorId(userResponse.data._id|| userResponse.data.id, token);
        } else if (['student', 'ong'].includes(userResponse.data.role)) {
          deliveryResponse = await getDeliveriesByRecipientId(userResponse.data._id, token);
        } else {
          throw new Error('Role not supported for viewing deliveries');
        }

        const fetchedDeliveries = deliveryResponse.data.data || [];
        setDeliveries(fetchedDeliveries);
        setFilteredDeliveries(fetchedDeliveries);

        const initialFeedbackState = {};
        fetchedDeliveries.forEach(delivery => {
          if (delivery.status === 'delivered') {
            initialFeedbackState[delivery._id] = {};
            const isDonor = ['restaurant', 'supermarket', 'personaldonor'].includes(userResponse.data.role);
            const isRecipient = ['student', 'ong'].includes(userResponse.data.role);
            if (isDonor) {
              initialFeedbackState[delivery._id].recipient = initializeFeedbackState(delivery._id, 'recipient');
              initialFeedbackState[delivery._id].transporter = initializeFeedbackState(delivery._id, 'transporter');
            } else if (isRecipient) {
              initialFeedbackState[delivery._id].donor = initializeFeedbackState(delivery._id, 'donor');
              initialFeedbackState[delivery._id].transporter = initializeFeedbackState(delivery._id, 'transporter');
            }
          }
        });
        setFeedbackState(initialFeedbackState);
      } catch (error) {
        console.error('Error fetching data:', error);
        setDeliveries([]);
        setFilteredDeliveries([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndDeliveries();
  }, []);

  useEffect(() => {
    let updatedDeliveries = [...deliveries];

    if (searchQuery) {
      updatedDeliveries = updatedDeliveries.filter((delivery) => {
        const donationTitle = delivery.donationTransaction?.donation?.title || '';
        const pickupAddress = delivery.pickupAddress || '';
        const deliveryAddress = delivery.deliveryAddress || '';
        const transporterName = delivery.transporter?.name || '';
        const donorName = delivery.donationTransaction?.donation?.donor?.name || '';
        const recipientName = delivery.donationTransaction?.requestNeed?.recipient?.name || '';
        return (
          donationTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
          pickupAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
          deliveryAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
          transporterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          donorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          recipientName.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
    }

    if (statusFilter !== 'all') {
      updatedDeliveries = updatedDeliveries.filter(
        (delivery) => delivery.status === statusFilter
      );
    }

    updatedDeliveries.sort((a, b) => {
      if (sortOption === 'date') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sortOption === 'title') {
        const titleA = a.donationTransaction?.donation?.title || '';
        const titleB = b.donationTransaction?.donation?.title || '';
        return titleA.localeCompare(titleB);
      } else if (sortOption === 'status') {
        return a.status.localeCompare(b.status);
      }
      return 0;
    });

    setFilteredDeliveries(updatedDeliveries);
    setCurrentPage(1);
  }, [searchQuery, statusFilter, sortOption, deliveries]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDeliveries = filteredDeliveries.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDeliveries.length / itemsPerPage);

  return (
    <>
      <GlobalStyle />
      <Navbar />
      <HomeContainer>
        <HeroSection>
          <HeroText>
            <h1>List of Deliveries in SustainaFood</h1>
            <p>
              Track your deliveries and ensure food reaches those in need—together, we reduce waste and spread hope!
            </p>
          </HeroText>
          <SliderContainer>
            <Slide1 src={donation1} alt="Delivery 1" />
            <Slide2 src={donation2} alt="Delivery 2" />
            <Slide3 src={donation3} alt="Delivery 3" />
            <Slide4 src={donation4} alt="Delivery 4" />
            <Slide5 src={donation5} alt="Delivery 5" />
            <Slide src={donation} alt="Delivery 6" />
          </SliderContainer>
          <Wave viewBox="0 0 1440 320">
            <path
              fill="#f0f8f0"
              fillOpacity="1"
              d="M0,96L30,90C60,85,120,75,180,64C240,53,300,43,360,64C420,85,480,139,540,170.7C600,203,660,213,720,224C780,235,840,245,900,240C960,235,1020,213,1080,181.3C1140,149,1200,107,1260,112C1320,117,1380,171,1410,197.3L1440,224L1440,320L1410,320C1380,320,1320,320,1260,320C1200,320,1140,320,1080,320C1020,320,960,320,900,320C840,320,780,320,720,320C660,320,600,320,540,320C480,320,420,320,360,320C300,320,240,320,180,320C120,320,60,320,30,320L0,320Z"
            />
          </Wave>
        </HeroSection>

        <SectionWrapper>
          <Container>
            <Title>List of your Deliveries</Title>
            <SearchContainer>
              <SearchIcon />
              <SearchInput
                type="text"
                placeholder="Search deliveries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </SearchContainer>
            <Controls>
              <Select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
                <option value="date">📆 Sort by Date</option>
                <option value="title">🔠 Sort by Donation Title</option>
                <option value="status">🔄 Sort by Status</option>
              </Select>
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">🟢 All Statuses</option>
                <option value="pending">🕒 Pending</option>
                <option value="accepted">✅ Accepted</option>
                <option value="picked_up">📍 Picked Up</option>
                <option value="in_progress">🚚 In Progress</option>
                <option value="delivered">📦 Delivered</option>
                <option value="failed">❌ Failed</option>
              </Select>
            </Controls>
            <ContentList>
              {loading ? (
                <LoadingMessage>Loading...</LoadingMessage>
              ) : currentDeliveries.length > 0 ? (
                currentDeliveries.map((delivery) => {
                  const transporterPhoto = delivery.transporter?.photo
                    ? `http://localhost:3000/${delivery.transporter.photo}`
                    : imgmouna;
                  const isDonor = ['restaurant', 'supermarket', 'personaldonor'].includes(user?.role);
                  const isRecipient = ['student', 'ong'].includes(user?.role);
                  const recipient = delivery.donationTransaction?.requestNeed?.recipient;
                  const donor = delivery.donationTransaction?.donation?.donor;
                  const donation = delivery.donationTransaction?.donation || {};
                  const allocatedProducts = delivery.donationTransaction?.allocatedProducts || [];
                  const allocatedMeals = delivery.donationTransaction?.allocatedMeals || [];

                  return (
                    <DeliveryCard key={delivery._id}>
                      {delivery.transporter ? (
                        <ProfileInfo>
                          <Link to={`/ViewProfile/${delivery.transporter?._id}`}>
                            <ProfileImg
                              src={transporterPhoto}
                              alt="Transporter Profile"
                              onError={(e) => {
                                e.target.src = imgmouna;
                                console.error(`Failed to load transporter image: ${transporterPhoto}`);
                              }}
                            />
                          </Link>
                          <Link to={`/ViewProfile/${delivery.transporter?._id}`}>
                            <ProfileText>
                              Transporter: {delivery.transporter?.name || 'Unknown Transporter'}
                            </ProfileText>
                          </Link>
                          <ProfileText>Email: {delivery.transporter?.email || 'Email Not Specified'}</ProfileText>
                          <ProfileText>Phone Number: {delivery.transporter?.phone || 'Phone Not Specified'}</ProfileText>
                        </ProfileInfo>
                      ) : (
                        <ProfileInfo>
                          <ProfileText>No transporter assigned</ProfileText>
                        </ProfileInfo>
                      )}

                      {isDonor && recipient && (
                        <ProfileInfo>
                          <Link to={`/ViewProfile/${recipient?._id}`}>
                            <ProfileText>
                              Recipient: {recipient?.name || 'Unknown Recipient'}
                            </ProfileText>
                          </Link>
                          <ProfileText>Email: {recipient?.email || 'Email Not Specified'}</ProfileText>
                        </ProfileInfo>
                      )}
                      {isRecipient && donor && (
                        <ProfileInfo>
                          <Link to={`/ViewProfile/${donor?._id}`}>
                            <ProfileText>
                              Donor: {donor?.name || 'Unknown Donor'}
                            </ProfileText>
                          </Link>
                          <ProfileText>Email: {donor?.email || 'Email Not Specified'}</ProfileText>
                        </ProfileInfo>
                      )}

                      <DeliveryDetails>
                        <DeliveryDetail>
                          <strong>Donation Title:</strong>{' '}
                          {donation.title || 'Untitled Delivery'}
                        </DeliveryDetail>
                        <DeliveryDetail>
                          <strong>Pickup Address:</strong> {delivery.pickupAddress || 'N/A'}
                        </DeliveryDetail>
                        <DeliveryDetail>
                          <strong>Delivery Address:</strong> {delivery.deliveryAddress || 'N/A'}
                        </DeliveryDetail>
                        <DeliveryDetail>
                          <strong>Status:</strong>{' '}
                          <DeliveryStatus className={delivery.status}>
                            {delivery.status ? delivery.status.charAt(0).toUpperCase() + delivery.status.slice(1).replace('_', ' ') : 'N/A'}
                          </DeliveryStatus>
                        </DeliveryDetail>
                        <DeliveryDetail>
                          <strong>Created:</strong>{' '}
                          {new Date(delivery.createdAt).toLocaleDateString()}
                        </DeliveryDetail>
                      </DeliveryDetails>

                      {allocatedProducts.length > 0 && (
                        <ItemSection>
                          <ItemsTitle>Allocated Products:</ItemsTitle>
                          <ItemList>
                            {allocatedProducts.map((item, index) => (
                              <Item key={index}>
                                <ItemDetails>
                                  <span><strong>Name:</strong> {item.product?.name || 'Unnamed Product'}</span>
                                </ItemDetails>
                                <ItemQuantity>
                                  {item.quantity || 0} item{item.quantity !== 1 ? 's' : ''}
                                </ItemQuantity>
                              </Item>
                            ))}
                          </ItemList>
                        </ItemSection>
                      )}

                      {allocatedMeals.length > 0 && (
                        <ItemSection>
                          <ItemsTitle>Allocated Meals:</ItemsTitle>
                          <ItemList>
                            {allocatedMeals.map((item, index) => (
                              <Item key={index}>
                                <ItemDetails>
                                  <span><strong>Name:</strong> {item.meal?.mealName || 'Unnamed Meal'}</span>
                                </ItemDetails>
                                <ItemQuantity>
                                  {item.quantity || 0} meal{item.quantity !== 1 ? 's' : ''}
                                </ItemQuantity>
                              </Item>
                            ))}
                          </ItemList>
                        </ItemSection>
                      )}

                      {allocatedProducts.length === 0 && allocatedMeals.length === 0 && (
                        <ItemSection>
                          <ItemsTitle>Items:</ItemsTitle>
                          <ItemList>
                            <Item>
                              <ItemDetails>
                                <span>No allocated products or meals</span>
                              </ItemDetails>
                            </Item>
                          </ItemList>
                        </ItemSection>
                      )}

                      {delivery.status === 'delivered' && (isDonor || isRecipient) && (
                        <FeedbackButtons>
                          {(isDonor || isRecipient) && delivery.transporter && (
                            <FeedbackButton
                              onClick={() => openFeedbackModal(
                                delivery._id,
                                'transporter',
                                delivery.transporter._id,
                                delivery.transporter.name || 'Unknown Transporter'
                              )}
                              disabled={feedbackState[delivery._id]?.transporter?.submitted}
                            >
                              {feedbackState[delivery._id]?.transporter?.submitted
                                ? 'Feedback for Transporter Submitted'
                                : 'Add Feedback for Transporter'}
                            </FeedbackButton>
                          )}
                          {isDonor && recipient && (
                            <FeedbackButton
                              onClick={() => openFeedbackModal(
                                delivery._id,
                                'recipient',
                                recipient._id,
                                recipient.name || 'Unknown Recipient'
                              )}
                              disabled={feedbackState[delivery._id]?.recipient?.submitted}
                            >
                              {feedbackState[delivery._id]?.recipient?.submitted
                                ? 'Feedback for Recipient Submitted'
                                : 'Add Feedback for Recipient'}
                            </FeedbackButton>
                          )}
                          {isRecipient && donor && (
                            <FeedbackButton
                              onClick={() => openFeedbackModal(
                                delivery._id,
                                'donor',
                                donor._id,
                                donor.name || 'Unknown Donor'
                              )}
                              disabled={feedbackState[delivery._id]?.donor?.submitted}
                            >
                              {feedbackState[delivery._id]?.donor?.submitted
                                ? 'Feedback for Donor Submitted'
                                : 'Add Feedback for Donor'}
                            </FeedbackButton>
                          )}
                        </FeedbackButtons>
                      )}
                    </DeliveryCard>
                  );
                })
              ) : (
                <NoDeliveries>No matching deliveries found.</NoDeliveries>
              )}
            </ContentList>
            {totalPages > 1 && (
              <PaginationControls>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <span>Page {currentPage} of {totalPages}</span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </PaginationControls>
            )}
          </Container>
        </SectionWrapper>
      </HomeContainer>

      {feedbackModal && (
        <ModalOverlay>
          <ModalContent>
            <CloseButton onClick={closeFeedbackModal}>×</CloseButton>
            <FeedbackForm onSubmit={(e) => {
              e.preventDefault();
              handleFeedbackSubmit(
                feedbackModal.deliveryId,
                feedbackModal.targetRole,
                feedbackModal.targetId
              );
            }}>
              <FormGroup>
                <FormLabel>Feedback for {feedbackModal.targetRole.charAt(0).toUpperCase() + feedbackModal.targetRole.slice(1)} ({feedbackModal.targetName}):</FormLabel>
                <StarRating
                  rating={feedbackState[feedbackModal.deliveryId]?.[feedbackModal.targetRole]?.rating || 0}
                  setRating={(rating) => handleFeedbackChange(feedbackModal.deliveryId, feedbackModal.targetRole, 'rating', rating)}
                  interactive={!feedbackState[feedbackModal.deliveryId]?.[feedbackModal.targetRole]?.submitted}
                />
              </FormGroup>
              <FormGroup>
                <FeedbackTextarea
                  value={feedbackState[feedbackModal.deliveryId]?.[feedbackModal.targetRole]?.comment || ''}
                  onChange={(e) => handleFeedbackChange(feedbackModal.deliveryId, feedbackModal.targetRole, 'comment', e.target.value)}
                  placeholder={`Write your feedback for the ${feedbackModal.targetRole}...`}
                  disabled={feedbackState[feedbackModal.deliveryId]?.[feedbackModal.targetRole]?.submitted}
                />
              </FormGroup>
              {feedbackState[feedbackModal.deliveryId]?.[feedbackModal.targetRole]?.error && (
                <FeedbackMessage error>{feedbackState[feedbackModal.deliveryId][feedbackModal.targetRole].error}</FeedbackMessage>
              )}
              {feedbackState[feedbackModal.deliveryId]?.[feedbackModal.targetRole]?.success && (
                <FeedbackMessage>{feedbackState[feedbackModal.deliveryId][feedbackModal.targetRole].success}</FeedbackMessage>
              )}
              <SubmitButton
                type="submit"
                disabled={feedbackState[feedbackModal.deliveryId]?.[feedbackModal.targetRole]?.submitted}
              >
                {feedbackState[feedbackModal.deliveryId]?.[feedbackModal.targetRole]?.submitted ? 'Feedback Submitted' : 'Submit Feedback'}
              </SubmitButton>
            </FeedbackForm>
          </ModalContent>
        </ModalOverlay>
      )}
      <Footer />
    </>
  );
};

export default Deliveries;