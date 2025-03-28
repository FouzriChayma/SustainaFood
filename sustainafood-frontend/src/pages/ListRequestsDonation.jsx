// src/pages/ListRequestsDonation.jsx
import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getDonationById } from '../api/donationService';
import { getRequestsByDonationId, updateRequestStatus } from '../api/requestNeedsService';
import imgmouna from '../assets/images/imgmouna.png';
import styled, { createGlobalStyle } from 'styled-components';
import { FaSearch } from 'react-icons/fa';
import { useAlert } from '../contexts/AlertContext';
import { useParams, useNavigate } from 'react-router-dom';

// Global Styles
const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    font-family: 'Poppins', sans-serif;
    background: #f0f8f0;
    box-sizing: border-box;
  }
`;

// Styled Components
const RequestContainer = styled.div`
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

const RequestCard = styled.div`
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

const RequestDetails = styled.div`
  margin-bottom: 15px;
`;

const RequestDetail = styled.p`
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
  font-size: 16px;
  font-weight: bold;
  color: #d9534f;
  padding: 4px 8px;
  border-radius: 4px;

  @media (max-width: 768px) {
    font-size: 14px;
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

  &.accept-btn {
    background-color: #28a745;
    color: white;

    &:hover {
      background-color: #218838;
    }
  }

  &.reject-btn {
    background-color: #dc3545;
    color: white;

    &:hover {
      background-color: #c82333;
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

const NoRequests = styled.p`
  font-size: 18px;
  color: #888;
  text-align: center;
  padding: 20px;
`;

const ErrorContainer = styled.div`
  text-align: center;
  padding: 40px;
`;

const RequestTitle = styled.h1`
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
  
  &.pending {
    background-color: #fff3cd;
    color: #856404;
  }
  
  &.approved {
    background-color: #d4edda;
    color: #155724;
  }
  
  &.rejected {
    background-color: #f8d7da;
    color: #721c24;
  }
`;

const ListRequestsDonation = () => {
  const { showAlert } = useAlert();
  const { donationId } = useParams();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(3);
  const [filterOption, setFilterOption] = useState('all');
  const [sortOption, setSortOption] = useState('date');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        showAlert('error', 'Please log in to view requests');
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        const donationResponse = await getDonationById(donationId);
        setDonation(donationResponse.data);

        const requestResponse = await getRequestsByDonationId(donationId);
        console.log('Requests response:', requestResponse.data);
        const requestsArray = Array.isArray(requestResponse.data) ? requestResponse.data : [];
        setRequests(requestsArray);
      } catch (err) {
        console.error('Fetch error:', err.response?.data || err.message);
        setError(
          err.response?.data?.message || 
          err.response?.data?.error || 
          err.message || 
          'Failed to fetch data'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [donationId, navigate, showAlert]);

  useEffect(() => {
    if (!donation || requests.length === 0) return;

    let updatedRequests = [...requests];

    // Apply filters
    if (filterOption === 'pending' || filterOption === 'approved' || filterOption === 'rejected') {
      updatedRequests = updatedRequests.filter(r => r.status === filterOption);
    }

    // Apply search
    if (searchQuery) {
      updatedRequests = updatedRequests.filter(request => {
        const productMatch = request.requestedProducts?.some(product => 
          product.product?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.product?.productType?.toLowerCase().includes(searchQuery.toLowerCase())
        );
        const mealMatch = request.requestedMeals?.some(meal => 
          meal.meal?.mealName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          meal.meal?.mealType?.toLowerCase().includes(searchQuery.toLowerCase())
        );
        const recipientMatch = request.recipient?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              request.recipient?.lastName?.toLowerCase().includes(searchQuery.toLowerCase());
        return productMatch || mealMatch || recipientMatch;
      });
    }

    // Apply sorting
    updatedRequests.sort((a, b) => {
      if (sortOption === 'title') {
        return a.title.localeCompare(b.title);
      } else if (sortOption === 'recipient') {
        const aName = `${a.recipient?.firstName || ''} ${a.recipient?.lastName || ''}`.trim();
        const bName = `${b.recipient?.firstName || ''} ${b.recipient?.lastName || ''}`.trim();
        return aName.localeCompare(bName);
      } else if (sortOption === 'status') {
        return a.status.localeCompare(b.status);
      } else {
        return new Date(a.createdAt) - new Date(b.createdAt); // Assuming requests have a createdAt field
      }
    });

    setFilteredRequests(updatedRequests);
    setCurrentPage(1);
  }, [requests, donation, filterOption, sortOption, searchQuery]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRequests = filteredRequests.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleStatusUpdate = async (requestId, status) => {
    try {
      await updateRequestStatus(requestId, status);
      showAlert('success', `Request ${status} successfully`);
      setRequests(requests.map(request =>
        request._id === requestId ? { ...request, status } : request
      ));
    } catch (error) {
      console.error(`Error updating request status to ${status}:`, error.response?.data || error.message);
      showAlert('error', `Failed to ${status} request: ${error.response?.data?.message || error.message}`);
    }
  };

  if (loading) return <LoadingMessage>Loading...</LoadingMessage>;

  if (error) return (
    <>
      <Navbar />
      <ErrorContainer>Error: {error}</ErrorContainer>
      <Footer />
    </>
  );

  if (!donation || requests.length === 0) return (
    <>
      <Navbar />
      <ErrorContainer>
        {donation ? `No requests found for donation: ${donation.title}` : 'Donation not found'}
      </ErrorContainer>
      <Footer />
    </>
  );

  return (
    <>
      <GlobalStyle />
      <Navbar />
      <RequestContainer>
        <RequestTitle>
          🤝 Requests for Donation: <p>{donation.title}</p>
        </RequestTitle>

        <Controls>
          <SearchContainer>
            <SearchIcon />
            <SearchInput
              type="text"
              placeholder="Search by product, meal, or recipient..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </SearchContainer>

          <Select value={filterOption} onChange={(e) => setFilterOption(e.target.value)}>
            <option value="all">🟢 All Requests</option>
            <option value="pending">🟠 Pending</option>
            <option value="approved">🟢 Approved</option>
            <option value="rejected">🔴 Rejected</option>
          </Select>

          <Select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
            <option value="date">📆 Sort by Date</option>
            <option value="title">📝 Sort by Title</option>
            <option value="recipient">👤 Sort by Recipient</option>
            <option value="status">🔄 Sort by Status</option>
          </Select>
        </Controls>

        {currentRequests.length > 0 ? (
          currentRequests.map((request) => {
            const userPhoto = request.recipient?.photo
              ? `http://localhost:3000/${request.recipient.photo}`
              : imgmouna;
            return (
              <RequestCard key={request._id}>
                <ProfileInfo>
                  <ProfileImg
                    src={userPhoto}
                    alt="Profile"
                    onError={(e) => {
                      e.target.src = imgmouna;
                      console.error(`Failed to load image: ${userPhoto}`);
                    }}
                  />
                  <ProfileText>
                    {request.recipient
                      ? `${request.recipient.firstName || 'Unknown'} ${request.recipient.lastName || ''}`.trim() || 'Unknown User'
                      : 'Unknown User'}
                  </ProfileText>
                  <ProfileText>{request.recipient?.role || 'Role Not Specified'}</ProfileText>
                </ProfileInfo>
                <RequestDetails>
                  <RequestDetail><strong>Title:</strong> {request.title || 'Untitled'}</RequestDetail>
                  <RequestDetail><strong>Location:</strong> {request.location || 'Not specified'}</RequestDetail>
                  <RequestDetail><strong>Description:</strong> {request.description || 'No description'}</RequestDetail>
                  <RequestDetail>
                    <strong>Status:</strong>
                    <StatusBadge className={request.status || 'pending'}>
                      {request.status || 'pending'}
                    </StatusBadge>
                  </RequestDetail>
                  {donation.category === 'prepared_meals' && (
                    <RequestDetail>
                      <strong>Number of Meals Requested:</strong> {request.numberOfMeals || 'Not specified'}
                    </RequestDetail>
                  )}
                </RequestDetails>
                <ItemSection>
                  {donation.category === 'prepared_meals' ? (
                    <>
                      <ItemsTitle>Requested Meals:</ItemsTitle>
                      <ItemList>
                        {request.requestedMeals && request.requestedMeals.length > 0 ? (
                          request.requestedMeals.map((item, itemIndex) => (
                            < Item key={item._id || itemIndex}>
                              <ItemDetails>
                                <span><strong>Name:</strong> {item.meal?.mealName || 'Meal Not Specified'}</span>
                                <span><strong>Type:</strong> {item.meal?.mealType || 'Type Not Specified'}</span>
                                <span><strong>Description:</strong> {item.meal?.mealDescription || 'No Description'}</span>
                              </ItemDetails>
                              <ItemQuantity>
                                <strong>Quantity:</strong> {item.quantity !== undefined ? item.quantity : 'Not specified'}
                              </ItemQuantity>
                            </Item>
                          ))
                        ) : (
                          <Item>No meals requested</Item>
                        )}
                      </ItemList>
                    </>
                  ) : (
                    <>
                      <ItemsTitle>Requested Products:</ItemsTitle>
                      <ItemList>
                        {request.requestedProducts && request.requestedProducts.length > 0 ? (
                          request.requestedProducts.map((item, itemIndex) => (
                            <Item key={item._id || itemIndex}>
                              <ItemDetails>
                                <span><strong>Name:</strong> {item.product?.name || 'Product Not Specified'}</span>
                                <span><strong>Type:</strong> {item.product?.productType || 'Type Not Specified'}</span>
                                <span><strong>Weight:</strong> {item.product?.weightPerUnit ? `${item.product.weightPerUnit} ${item.product.weightUnit || ''}` : 'Weight Not Specified'}</span>
                              </ItemDetails>
                              <ItemQuantity>
                                <strong>Quantity:</strong> {item.quantity !== undefined ? item.quantity : 'Not specified'}
                              </ItemQuantity>
                            </Item>
                          ))
                        ) : (
                          <Item>No products requested</Item>
                        )}
                      </ItemList>
                    </>
                  )}
                </ItemSection>
                {request.status === 'pending' && (
                  <ButtonContainer>
                    <ActionButton
                      className="accept-btn"
                      onClick={() => handleStatusUpdate(request._id, 'approved')}
                    >
                      ✔ Accept
                    </ActionButton>
                    <ActionButton
                      className="reject-btn"
                      onClick={() => handleStatusUpdate(request._id, 'rejected')}
                    >
                      ✖ Reject
                    </ActionButton>
                  </ButtonContainer>
                )}
              </RequestCard>
            );
          })
        ) : (
          <NoRequests>No matching requests found.</NoRequests>
        )}

        {totalPages > 1 && (
          <PaginationControls>
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span>Page {currentPage} of {totalPages}</span>
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </PaginationControls>
        )}
      </RequestContainer>
      <Footer />
    </>
  );
};

export default ListRequestsDonation;