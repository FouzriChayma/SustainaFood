import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getDonationById } from '../api/donationService';
import { getDonationTransactionsByDonationId } from '../api/donationTransactionService'; // New API call
import { createAndAcceptDonationTransaction, rejectDonationTransaction } from '../api/donationTransactionService';
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

// Styled Components (mostly unchanged)
const TransactionContainer = styled.div`
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

const TransactionCard = styled.div`
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

const TransactionDetails = styled.div`
  margin-bottom: 15px;
`;

const TransactionDetail = styled.p`
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

const NoTransactions = styled.p`
  font-size: 18px;
  color: #888;
  text-align: center;
  padding: 20px;
`;

const ErrorContainer = styled.div`
  text-align: center;
  padding: 40px;
`;

const TransactionTitle = styled.h1`
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

  &.fulfilled {
    background-color: #cce5ff;
    color: #004085;
  }

  &.partially_fulfilled {
    background-color: #e2e3e5;
    color: #383d41;
  }
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

const ListRequestsDonation = () => {
  const { showAlert } = useAlert();
  const { donationId } = useParams();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [donation, setDonation] = useState(null);
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
      const token = localStorage.getItem('token');
      if (!token) {
        showAlert('error', 'Please log in to view transactions');
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        const donationResponse = await getDonationById(donationId);
        setDonation(donationResponse.data);

        const transactionResponse = await getDonationTransactionsByDonationId(donationId);
        console.log('Transactions response:', transactionResponse);
        const transactionsArray = Array.isArray(transactionResponse) ? transactionResponse : [];
        setTransactions(transactionsArray);
      } catch (err) {
        console.error('Fetch error:', err.response?.data || err.message);
        let errorMessage = 'Failed to fetch data';
        if (err.response) {
          if (err.response.status === 404) {
            errorMessage = 'Donation or transactions not found';
          } else if (err.response.status === 400) {
            errorMessage = 'Invalid donation ID';
          } else {
            errorMessage = err.response.data?.message || err.response.data?.error || err.message;
          }
        }
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [donationId, navigate, showAlert]);

  useEffect(() => {
    if (!donation || transactions.length === 0) return;

    let updatedTransactions = [...transactions];

    // Apply filters
    if (filterOption !== 'all') {
      updatedTransactions = updatedTransactions.filter(t => t.status === filterOption);
    }

    // Apply search
    if (searchQuery) {
      updatedTransactions = updatedTransactions.filter(transaction => {
        const request = transaction.requestNeed;
        const productMatch = request.requestedProducts?.some(product => 
          product.product?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.product?.productType?.toLowerCase().includes(searchQuery.toLowerCase())
        );
        const mealMatch = request.requestedMeals?.some(meal => 
          meal.meal?.mealName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          meal.meal?.mealType?.toLowerCase().includes(searchQuery.toLowerCase())
        );
        const recipientMatch = request.recipient?.name?.toLowerCase().includes(searchQuery.toLowerCase());
        return productMatch || mealMatch || recipientMatch;
      });
    }

    // Apply sorting
    updatedTransactions.sort((a, b) => {
      const requestA = a.requestNeed;
      const requestB = b.requestNeed;
      if (sortOption === 'title') {
        return requestA.title.localeCompare(requestB.title);
      } else if (sortOption === 'recipient') {
        const aName = requestA.recipient?.name || '';
        const bName = requestB.recipient?.name || '';
        return aName.localeCompare(bName);
      } else if (sortOption === 'status') {
        return a.status.localeCompare(b.status);
      } else {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
    });

    setFilteredTransactions(updatedTransactions);
    setCurrentPage(1);
  }, [transactions, donation, filterOption, sortOption, searchQuery]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTransactions = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleAcceptTransaction = async (transactionId) => {
    if (!window.confirm('Are you sure you want to accept this transaction?')) return;

    try {
      setProcessing(prev => ({ ...prev, [transactionId]: 'accepting' }));

      const transaction = transactions.find(t => t._id === transactionId);
      const donation = transaction.donation;
      const requestNeed = transaction.requestNeed;

      // Optimistic update
      setTransactions(prev => prev.map(t => 
        t._id === transactionId ? { ...t, status: 'approved' } : t
      ));

      if (donation.category === 'prepared_meals') {
        const totalAllocated = transaction.allocatedMeals.reduce((sum, m) => sum + m.quantity, 0);
        setDonation(prev => ({
          ...prev,
          remainingMeals: prev.remainingMeals - totalAllocated
        }));
      } else if (donation.category === 'packaged_products') {
        setDonation(prev => ({
          ...prev,
          products: prev.products.map(p => {
            const allocatedProduct = transaction.allocatedProducts.find(ap => 
              ap.product._id.toString() === p.product._id.toString()
            );
            if (allocatedProduct) {
              return {
                ...p,
                quantity: p.quantity - allocatedProduct.quantity
              };
            }
            return p;
          })
        }));
      }

      const response = await createAndAcceptDonationTransaction(
        donation._id,
        requestNeed._id,
        transaction.allocatedProducts,
        transaction.allocatedMeals
      );
      console.log('createAndAcceptDonationTransaction response:', response);

      const { transaction: updatedTransaction, donation: updatedDonation, request: updatedRequest } = response;
      setTransactions(prev => prev.map(t => 
        t._id === transactionId ? updatedTransaction : t
      ));
      setDonation(updatedDonation);

      setFilterOption('all');
      showAlert('success', 'Transaction accepted successfully!');
    } catch (error) {
      console.error('Error accepting transaction:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || 'An unexpected error occurred while accepting the transaction.';
      
      // Revert optimistic update
      setTransactions(prev => prev.map(t => 
        t._id === transactionId ? { ...t, status: 'pending' } : t
      ));
      setDonation(prev => ({ ...prev }));

      showAlert('error', errorMessage);
    } finally {
      setProcessing(prev => ({ ...prev, [transactionId]: false }));
    }
  };

  const handleRejectTransaction = async (transactionId) => {
    if (!rejectionReason) {
      showAlert('warning', 'Please provide a reason for rejection');
      return;
    }

    try {
      setProcessing(prev => ({ ...prev, [transactionId]: 'rejecting' }));
      await rejectDonationTransaction(transactionId, rejectionReason);

      setTransactions(prev => prev.map(t => 
        t._id === transactionId ? { ...t, status: 'rejected', rejectionReason } : t
      ));
      setCurrentRejectionId(null);
      setRejectionReason('');

      showAlert('success', 'Transaction rejected successfully!');
    } catch (error) {
      console.error('Error rejecting transaction:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || 'Failed to reject transaction';
      showAlert('error', errorMessage);
    } finally {
      setProcessing(prev => ({ ...prev, [transactionId]: false }));
    }
  };

  const openRejectionDialog = (transactionId) => {
    setCurrentRejectionId(transactionId);
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

  if (!donation || transactions.length === 0) return (
    <>
      <Navbar />
      <ErrorContainer>
        {donation ? `No transactions found for donation: ${donation.title}` : 'Donation not found'}
      </ErrorContainer>
      <Footer />
    </>
  );

  return (
    <>
      <GlobalStyle />
      <Navbar />
      <TransactionContainer>
        <TransactionTitle>
          🤝 Transactions for Donation: <p>{donation.title}</p>
        </TransactionTitle>

        <Controls>
          <SearchContainer>
            <SearchIcon />
            <SearchInput
              type="text"
              placeholder="Search by product, meal, or recipient..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search transactions"
            />
          </SearchContainer>

          <Select 
            value={filterOption} 
            onChange={(e) => setFilterOption(e.target.value)}
            aria-label="Filter by status"
          >
            <option value="all">🟢 All Transactions</option>
            <option value="pending">🟠 Pending</option>
            <option value="approved">🟢 Approved</option>
            <option value="rejected">🔴 Rejected</option>
          </Select>

          <Select 
            value={sortOption} 
            onChange={(e) => setSortOption(e.target.value)}
            aria-label="Sort transactions"
          >
            <option value="date">📆 Sort by Date</option>
            <option value="title">📝 Sort by Request Title</option>
            <option value="recipient">👤 Sort by Recipient</option>
            <option value="status">🔄 Sort by Status</option>
          </Select>
        </Controls>

        {currentTransactions.length > 0 ? (
          currentTransactions.map((transaction) => {
            const request = transaction.requestNeed;
            const userPhoto = request.recipient?.photo
              ? `http://localhost:3000/${request.recipient.photo}`
              : imgmouna;
            return (
              <TransactionCard key={transaction._id}>
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
                    {request.recipient?.name || 'Unknown User'}
                  </ProfileText>
                  <ProfileText>{request.recipient?.role || 'Role Not Specified'}</ProfileText>
                </ProfileInfo>
                <TransactionDetails>
                  <TransactionDetail><strong>Transaction ID:</strong> {transaction.id}</TransactionDetail>
                  <TransactionDetail><strong>Request Title:</strong> {request.title || 'Untitled'}</TransactionDetail>
                  <TransactionDetail><strong>Location:</strong> {request.address || 'Not specified'}</TransactionDetail>
                  <TransactionDetail><strong>Description:</strong> {request.description || 'No description'}</TransactionDetail>
                  <TransactionDetail>
                    <strong>Status:</strong>
                    <StatusBadge className={transaction.status || 'pending'}>
                      {transaction.status || 'pending'}
                    </StatusBadge>
                  </TransactionDetail>
                  {donation.category === 'prepared_meals' && (
                    <TransactionDetail>
                      <strong>Number of Meals Requested:</strong> {request.numberOfMeals || 'Not specified'}
                    </TransactionDetail>
                  )}
                  {transaction.rejectionReason && (
                    <TransactionDetail>
                      <strong>Rejection Reason:</strong> {transaction.rejectionReason}
                    </TransactionDetail>
                  )}
                </TransactionDetails>
                <ItemSection>
                  {donation.category === 'prepared_meals' ? (
                    <>
                      <ItemsTitle>Allocated Meals:</ItemsTitle>
                      <ItemList>
                        {transaction.allocatedMeals && transaction.allocatedMeals.length > 0 ? (
                          transaction.allocatedMeals.map((item, itemIndex) => (
                            <Item key={item._id || itemIndex}>
                              <ItemDetails>
                                <span><strong>Name:</strong> {item.meal?.mealName || 'Meal Not Specified'}</span>
                                <span><strong>Type:</strong> {item.meal?.mealType || 'Type Not Specified'}</span>
                                <span><strong>Description:</strong> {item.meal?.mealDescription || 'No Description'}</span>
                              </ItemDetails>
                              <ItemQuantity>
                                Quantity: {item.quantity !== undefined ? item.quantity : 'Not specified'}
                              </ItemQuantity>
                            </Item>
                          ))
                        ) : (
                          <Item>No meals allocated</Item>
                        )}
                      </ItemList>
                    </>
                  ) : (
                    <>
                      <ItemsTitle>Allocated Products:</ItemsTitle>
                      <ItemList>
                        {transaction.allocatedProducts && transaction.allocatedProducts.length > 0 ? (
                          transaction.allocatedProducts.map((item, itemIndex) => (
                            <Item key={item._id || itemIndex}>
                              <ItemDetails>
                                <span><strong>Name:</strong> {item.product?.name || 'Product Not Found'}</span>
                                <span><strong>Type:</strong> {item.product?.productType || 'Type Not Specified'}</span>
                                <span>
                                  <strong>Weight:</strong>{' '}
                                  {item.product?.weightPerUnit && item.product?.weightUnit
                                    ? `${item.product.weightPerUnit} ${item.product.weightUnit}`
                                    : 'Weight Not Specified'}
                                </span>
                              </ItemDetails>
                              <ItemQuantity>
                                Quantity: {item.quantity !== undefined ? item.quantity : 'Not specified'}
                              </ItemQuantity>
                            </Item>
                          ))
                        ) : (
                          <Item>No products allocated</Item>
                        )}
                      </ItemList>
                    </>
                  )}
                </ItemSection>
                {transaction.status === 'pending' && (
                  <ButtonContainer>
                    <ActionButton
                      className="accept-btn"
                      onClick={() => handleAcceptTransaction(transaction._id)}
                      disabled={processing[transaction._id]}
                      aria-label="Accept transaction"
                    >
                      {processing[transaction._id] === 'accepting' ? (
                        <>
                          <Spinner size="sm" /> Processing...
                        </>
                      ) : '✔ Accept'}
                    </ActionButton>
                    <ActionButton
                      className="reject-btn"
                      onClick={() => openRejectionDialog(transaction._id)}
                      disabled={processing[transaction._id]}
                      aria-label="Reject transaction"
                    >
                      ✖ Reject
                    </ActionButton>
                  </ButtonContainer>
                )}
              </TransactionCard>
            );
          })
        ) : (
          <NoTransactions>No matching transactions found.</NoTransactions>
        )}

        {currentRejectionId && (
          <RejectionModal>
            <ModalContent>
              <h3>Reason for Rejection</h3>
              <p>Please explain why you're rejecting this transaction:</p>
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
                  onClick={() => handleRejectTransaction(currentRejectionId)}
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
      </TransactionContainer>
      <Footer />
    </>
  );
};

export default ListRequestsDonation;