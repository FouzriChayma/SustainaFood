// src/pages/ListDonationsRequest.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getDonationByRequestId } from '../api/donationService';
import { getRequestById } from '../api/requestNeedsService';
import { getUserById } from '../api/userService';
import { createAndAcceptDonationTransaction , rejectDonation } from '../api/donationTransactionService';
import imgmouna from '../assets/images/imgmouna.png';
import styled, { createGlobalStyle } from 'styled-components';
import { FaSearch } from 'react-icons/fa';

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
const DonationContainer = styled.div`
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

const DonationCard = styled.div`
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

const DonationDetails = styled.div`
  margin-bottom: 15px;
`;

const DonationDetail = styled.p`
  font-size: 14px;
  color: #495057;
  margin: 5px 0;

  strong {
    color: #222;
    font-weight: 600;
  }
`;

const ProductSection = styled.div`
  margin-bottom: 15px;
`;

const ProductsTitle = styled.h4`
  font-size: 16px;
  color: #222;
  margin: 0 0 10px;
`;

const ProductList = styled.ul`
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 10px;
`;

const ProductItem = styled.li`
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

const ProductDetails = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;

  span {
    display: block;
    font-size: 13px;
    color: #333;
  }
`;

const ProductQuantity = styled.span`
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

const NoDonations = styled.p`
  font-size: 18px;
  color: #888;
  text-align: center;
  padding: 20px;
`;

const ErrorContainer = styled.div`
  text-align: center;
  padding: 40px;
`;

const DonationTitle = styled.h1`
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

const RejectionModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
`;

const ModalTextarea = styled.textarea`
  width: 100%;
  min-height: 100px;
  margin: 10px 0;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const ModalButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
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

const ListDonationsRequest = () => {
  const { id } = useParams();
  const [donations, setDonations] = useState([]);
  const [filteredDonations, setFilteredDonations] = useState([]);
  const [request, setRequest] = useState(null);
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(3);
  const [filterOption, setFilterOption] = useState('all');
  const [sortOption, setSortOption] = useState('date');
  const [searchQuery, setSearchQuery] = useState('');
  const [processing, setProcessing] = useState({});
  const [rejectionReason, setRejectionReason] = useState('');
  const [currentRejectionId, setCurrentRejectionId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const requestResponse = await getRequestById(id);
        setRequest(requestResponse.data);

        const donationData = await getDonationByRequestId(id);
        const donationsArray = Array.isArray(donationData) ? donationData : [];
        setDonations(donationsArray);

        if (donationsArray.length > 0) {
          const userPromises = donationsArray.map(donation =>
            getUserById(donation.donor)
              .then(response => ({ id: donation.donor, data: response.data }))
              .catch(err => {
                console.error(`Error fetching user ${donation.donor}:`, err);
                return { id: donation.donor, data: null };
              })
          );
          const userResults = await Promise.all(userPromises);
          const userMap = userResults.reduce((acc, { id, data }) => {
            if (data) acc[id] = data;
            return acc;
          }, {});
          setUsers(userMap);
        }
      } catch (err) {
        console.error('Fetch error:', err.response?.data || err.message);
        setError(err.response?.data?.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    if (!request || donations.length === 0) return;

    let updatedDonations = [...donations];

    // Apply filters
    if (filterOption === 'pending' || filterOption === 'approved' || filterOption === 'rejected') {
      updatedDonations = updatedDonations.filter(d => d.status === filterOption);
    } else if (filterOption === 'full') {
      updatedDonations = updatedDonations.filter(donation =>
        donation.products.every(item => {
          const requestedProduct = request.requestedProducts?.find(
            rp => rp.productType === item.product?.productType || rp._id === item.product?._id
          );
          return requestedProduct && item.quantity >= requestedProduct.totalQuantity;
        })
      );
    }

    // Apply search
    if (searchQuery) {
      updatedDonations = updatedDonations.filter(donation => {
        const productMatch = donation.products?.some(product => 
          product.product?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.product?.productType?.toLowerCase().includes(searchQuery.toLowerCase())
        );
        const donorMatch = users[donation.donor]?.name?.toLowerCase().includes(searchQuery.toLowerCase());
        return productMatch || donorMatch;
      });
    }

    // Apply sorting
    updatedDonations.sort((a, b) => {
      if (sortOption === 'title') {
        return a.title.localeCompare(b.title);
      } else if (sortOption === 'donor') {
        return (users[a.donor]?.name || '').localeCompare(users[b.donor]?.name || '');
      } else if (sortOption === 'status') {
        return a.status.localeCompare(b.status);
      } else {
        return new Date(a.expirationDate) - new Date(b.expirationDate);
      }
    });

    setFilteredDonations(updatedDonations);
    setCurrentPage(1);
  }, [donations, request, users, filterOption, sortOption, searchQuery]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDonations = filteredDonations.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDonations.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleAcceptDonation = async (donationId) => {
    if (!window.confirm('Are you sure you want to accept this donation?')) return;

    try {
      setProcessing(prev => ({ ...prev, [donationId]: 'accepting' }));
      const response = await createAndAcceptDonationTransaction(donationId, id);

      setDonations(prev => prev.map(d => 
        d._id === donationId ? { ...d, status: 'approved' } : d
      ));
      alert('Donation accepted and transaction created successfully!');
    } catch (error) {
      console.error('Error accepting donation:', error.response?.data || error.message);
      alert(error.response?.data?.message || 'Failed to accept donation');
    } finally {
      setProcessing(prev => ({ ...prev, [donationId]: false }));
    }
  };

  const handleRejectDonation = async (donationId) => {
    if (!rejectionReason) {
      alert('Please provide a reason for rejection');
      return;
    }

    try {
      setProcessing(prev => ({ ...prev, [donationId]: 'rejecting' }));
      // Call the backend to update the donation status
      await rejectDonation(donationId, rejectionReason);

      // Update the local state to reflect the rejection
      setDonations(prev => prev.map(d => 
        d._id === donationId ? { ...d, status: 'rejected' } : d
      ));
      setCurrentRejectionId(null);
      setRejectionReason('');
      alert('Donation rejected successfully!');
    } catch (error) {
      console.error('Error rejecting donation:', error.response?.data || error.message);
      alert(error.response?.data?.message || 'Failed to reject donation');
    } finally {
      setProcessing(prev => ({ ...prev, [donationId]: false }));
    }
  };

  const openRejectionDialog = (donationId) => {
    setCurrentRejectionId(donationId);
    setRejectionReason('');
  };

  if (loading) return <LoadingMessage>Loading...</LoadingMessage>;

  if (error) return (
    <>
      <Navbar />
      <ErrorContainer>Error: {error}</ErrorContainer>
      <Footer />
    </>
  );

  if (!request || donations.length === 0) return (
    <>
      <Navbar />
      <ErrorContainer>
        {request ? `No donations found for request: ${request.title}` : 'Request not found'}
      </ErrorContainer>
      <Footer />
    </>
  );

  return (
    <>
      <GlobalStyle />
      <Navbar />
      <DonationContainer>
        <DonationTitle>
          🤝 Donations for Request: <br />
          <span className="request-title">{request.title}</span>
        </DonationTitle>

        <Controls>
          <SearchContainer>
            <SearchIcon />
            <SearchInput
              type="text"
              placeholder="Search by product or donor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </SearchContainer>

          <Select value={filterOption} onChange={(e) => setFilterOption(e.target.value)}>
            <option value="all">🟢 All Donations</option>
            <option value="pending">🟠 Pending</option>
            <option value="approved">🟢 Approved</option>
            <option value="rejected">🔴 Rejected</option>
            <option value="full">✅ Full Quantity Only</option>
          </Select>

          <Select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
            <option value="date">📆 Sort by Date</option>
            <option value="title">📝 Sort by Title</option>
            <option value="donor">👤 Sort by Donor</option>
            <option value="status">🔄 Sort by Status</option>
          </Select>
        </Controls>

        {currentDonations.length > 0 ? (
          currentDonations.map((donation) => {
            const userPhoto = users[donation.donor]?.photo
              ? `http://localhost:3000/${users[donation.donor].photo}`
              : imgmouna;
            return (
              <DonationCard key={donation._id}>
                <ProfileInfo>
                  <ProfileImg
                    src={userPhoto}
                    alt="Profile"
                    onError={(e) => {
                      e.target.src = imgmouna;
                      console.error(`Failed to load image: ${userPhoto}`);
                    }}
                  />
                  <ProfileText>{users[donation.donor]?.name || 'Unknown'}</ProfileText>
                  <ProfileText>{users[donation.donor]?.role || 'N/A'}</ProfileText>
                </ProfileInfo>
                <DonationDetails>
                  <DonationDetail><strong>Title:</strong> {donation.title || 'Untitled'}</DonationDetail>
                  <DonationDetail><strong>Location:</strong> {donation.location || 'Not specified'}</DonationDetail>
                  <DonationDetail>
                    <strong>Expiration Date:</strong> {donation.expirationDate ? new Date(donation.expirationDate).toLocaleDateString() : 'Not set'}
                  </DonationDetail>
                  <DonationDetail><strong>Category:</strong> {donation.category || 'Not specified'}</DonationDetail>
                  <DonationDetail>
                    <strong>Status:</strong>
                    <StatusBadge className={donation.status || 'pending'}>
                      {donation.status || 'pending'}
                    </StatusBadge>
                  </DonationDetail>
                  {donation.numberOfMeals && (
                    <DonationDetail><strong>Number of Meals:</strong> {donation.numberOfMeals}</DonationDetail>
                  )}
                </DonationDetails>
                <ProductSection>
                  <ProductsTitle>Products:</ProductsTitle>
                  <ProductList>
                    {donation.products && donation.products.length > 0 ? (
                      donation.products.map((item, itemIndex) => {
                        const requestedProduct = request.requestedProducts?.find(
                          rp => rp.productType === item.product?.productType || rp._id === item.product?._id
                        );
                        return (
                          <ProductItem key={item._id || itemIndex}>
                            <ProductDetails>
                              <span><strong>Name:</strong> {item.product?.name || 'N/A'}</span>
                              <span><strong>Type:</strong> {item.product?.productType || 'N/A'}</span>
                              <span><strong>Weight:</strong> {item.product?.weightPerUnit ? `${item.product.weightPerUnit} ${item.product.weightUnit || ''}` : 'N/A'}</span>
                            </ProductDetails>
                            <ProductQuantity>
                              <strong>Quantity Given:</strong> {item.quantity || 0} 
                            </ProductQuantity>
                          </ProductItem>
                        );
                      })
                    ) : (
                      <ProductItem>No products available</ProductItem>
                    )}
                  </ProductList>
                </ProductSection>
                <ButtonContainer>
                  {(!donation.status || donation.status === 'pending') ? (
                    <>
                      <ActionButton
                        className="accept-btn"
                        onClick={() => handleAcceptDonation(donation._id)}
                        disabled={processing[donation._id]}
                      >
                        {processing[donation._id] === 'accepting' ? (
                          <>
                            <Spinner size="sm" /> Processing...
                          </>
                        ) : '✔ Accept'}
                      </ActionButton>
                      <ActionButton
                        className="reject-btn"
                        onClick={() => openRejectionDialog(donation._id)}
                        disabled={processing[donation._id]}
                      >
                        ✖ Reject
                      </ActionButton>
                    </>
                  ) : (
                    <div style={{
                      color: donation.status === 'approved' ? 'green' : 'red',
                      fontWeight: 'bold'
                    }}>
                      Status: {donation.status}
                    </div>
                  )}
                </ButtonContainer>
              </DonationCard>
            );
          })
        ) : (
          <NoDonations>No matching donations found.</NoDonations>
        )}

        {currentRejectionId && (
          <RejectionModal>
            <ModalContent>
              <h3>Reason for Rejection</h3>
              <p>Please explain why you're rejecting this donation:</p>
              <ModalTextarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter rejection reason (required)..."
              />
              <ModalButtons>
                <ActionButton
                  className="cancel-btn"
                  onClick={() => setCurrentRejectionId(null)}
                >
                  Cancel
                </ActionButton>
                <ActionButton
                  className="reject-btn"
                  onClick={() => handleRejectDonation(currentRejectionId)}
                  disabled={!rejectionReason || processing[currentRejectionId]}
                >
                  {processing[currentRejectionId] === 'rejecting' ? (
                    <>
                      <Spinner size="sm" /> Submitting...
                    </>
                  ) : 'Submit Rejection'}
                </ActionButton>
              </ModalButtons>
            </ModalContent>
          </RejectionModal>
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
      </DonationContainer>
      <Footer />
    </>
  );
};

export default ListDonationsRequest;