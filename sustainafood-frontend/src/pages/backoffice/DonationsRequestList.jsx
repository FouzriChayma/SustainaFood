import React, { useState, useEffect } from "react";
import Sidebar from "../../components/backoffcom/Sidebar";
import Navbar from "../../components/backoffcom/Navbar";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { FaFilePdf, FaEye, FaSearch } from "react-icons/fa";
import { getrequests } from "../../api/requestNeedsService";
import "../../assets/styles/backoffcss/RequestTable.css";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import imgmouna from '../../assets/images/imgmouna.png';
import logo from '../../assets/images/logooo.png';
import { getDonationByRequestId, getDonationById } from '../../api/donationService';
import { getRequestById } from '../../api/requestNeedsService';
import { getUserById } from '../../api/userService';
import { createAndAcceptDonationTransaction, rejectDonation } from '../../api/donationTransactionService';
import styled from 'styled-components';
import { useAlert } from '../../contexts/AlertContext';
import "../../assets/styles/backoffcss/RequestDetail.css";

// Styled Components
const Button = styled.button`
  display: inline-block;
  padding: 12px 20px;
  font-size: 16px;
  font-weight: 600;
  text-align: center;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 8px;
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  ${({ variant }) => variant === 'add' && `
    background: #228b22;
    &:hover { background: #1e7b1e; transform: translateY(-2px); }
  `}
  ${({ variant }) => variant === 'cancel' && `
    background: #dc3545;
    &:hover { background: #b02a37; transform: translateY(-2px); }
  `}
  ${({ variant }) => variant === 'submit' && `
    background: #28a745;
    &:hover { background: #218838; transform: translateY(-2px); }
  `}
  ${({ variant }) => variant === 'donate' && `
    background: #228b22;
    &:hover { background: #1e7b1e; transform: translateY(-2px); }
  `}
  ${({ variant }) => variant === 'back' && `
    background: #6c757d;
    &:hover { background: #5a6268; transform: translateY(-2px); }
  `}

  &:active {
    transform: translateY(1px);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
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

const ErrorContainer = styled.div`
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  margin-top: -500px;
  margin-left:200px;
  color: #4CAF50;
  font-size: 1.5rem;
  text-align: center;
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
    font-size: 16px;
    background: #228b22;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background 0.3s;

    &:hover {
      background: #56ab2f;
    }

    &:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
  }

  span {
    font-size: 16px;
    color: #333;
  }
`;

const DonationsRequestList = () => {
  const { showAlert } = useAlert();
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
  const [currentRejectionId, setCurrentRejectionId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const DonationCardComponent = ({
    donation,
    handleAcceptDonation,
    handleRejectDonation,
    processing,
    openRejectionDialog,
    currentRejectionId,
    rejectionReason,
    setRejectionReason
  }) => (
    <DonationCard>
      <ProfileInfo>
      <ProfileImg 
            src={
                users[donation.donor]?.photo 
                ? `http://localhost:3000/${users[donation.donor].photo}`
                : imgmouna
            } 
            alt="Donor" 
            />
        <ProfileText>{users[donation.donor]?.name || 'Unknown Donor'} </ProfileText><br/>
        <ProfileText> {users[donation.donor]?.role || 'Unknown Donor'}</ProfileText>

      </ProfileInfo>
      <DonationDetails>
        <DonationDetail><strong>Status:</strong> {donation.status}</DonationDetail>
        <DonationDetail><strong>Date:</strong> {new Date(donation.createdAt).toLocaleDateString()}</DonationDetail>
      </DonationDetails>
      <ProductSection>
        <ProductsTitle>Products:</ProductsTitle>
        <ProductList>
          {donation.products?.map((item, index) => (
            <ProductItem key={index}>
              <ProductDetails >
                <div style={{display:"flex"}}>
                <p> <strong>Name:</strong>{item.product?.name || item.product?.productType || 'Unknown Product'}</p>
                <p>📦 <strong>Type:</strong> {item.product?.productType || 'Not specified'}</p>
                        <p>⚖️ <strong>Weight:</strong> {item.product?.weightPerUnit || 0} {item.product?.weightUnit || ''}</p>
                        <p>🔢 <strong>Quantity:</strong> {item.quantity || 0} {item.product?.weightUnitTotale || ''}</p>
                        <p>🟢 <strong>Status:</strong> {item.product?.status || 'Unknown'}</p>
            </div>  </ProductDetails>
              <ProductQuantity>{item.quantity}</ProductQuantity>
            </ProductItem>
          ))}
        </ProductList>
      </ProductSection>
      
      {currentRejectionId === donation._id && (
        <div>
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Reason for rejection"
          />
          <Button
            variant="submit"
            onClick={() => handleRejectDonation(donation._id)}
            disabled={processing[donation._id]}
          >
            Submit Rejection
          </Button>
        </div>
      )}
    </DonationCard>
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [requestResponse, donationData] = await Promise.all([
          getRequestById(id),
          getDonationByRequestId(id)
        ]);

        setRequest(requestResponse.data);
        const donationsArray = Array.isArray(donationData) ? donationData : [];
        setDonations(donationsArray);

        if (donationsArray.length > 0) {
          const uniqueDonorIds = [...new Set(donationsArray.map(d => d.donor))];
          const userPromises = uniqueDonorIds.map(id => 
            getUserById(id)
              .then(response => ({ id, data: response.data }))
              .catch(() => ({ id, data: null }))
          );
          
          const userResults = await Promise.all(userPromises);
          setUsers(Object.fromEntries(
            userResults.map(({ id, data }) => [id, data])
          ));
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    if (!donations.length) return;

    let result = [...donations];

    if (filterOption !== 'all') {
      if (['pending', 'approved', 'rejected'].includes(filterOption)) {
        result = result.filter(d => d.status === filterOption);
      } else if (filterOption === 'full') {
        result = result.filter(donation =>
          donation.products.every(item => {
            const requestedProduct = request?.requestedProducts?.find(
              rp => rp.productType === item.product?.productType || rp._id === item.product?._id
            );
            return requestedProduct && item.quantity >= requestedProduct.totalQuantity;
          })
        );
      }
    }

    if (searchQuery) {
      result = result.filter(donation => {
        const productMatch = donation.products?.some(product => 
          product.product?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.product?.productType?.toLowerCase().includes(searchQuery.toLowerCase())
        );
        const donorMatch = users[donation.donor]?.name?.toLowerCase().includes(searchQuery.toLowerCase());
        return productMatch || donorMatch;
      });
    }

    result.sort((a, b) => {
      switch (sortOption) {
        case 'title': return (a.title || '').localeCompare(b.title || '');
        case 'donor': return (users[a.donor]?.name || '').localeCompare(users[b.donor]?.name || '');
        case 'status': return a.status.localeCompare(b.status);
        default: return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    setFilteredDonations(result);
  }, [donations, request, users, filterOption, sortOption, searchQuery]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDonations.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDonations.length / itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleAcceptDonation = async (donationId) => {
    if (!window.confirm('Are you sure you want to accept this donation?')) return;

    try {
      setProcessing(prev => ({ ...prev, [donationId]: 'accepting' }));
      setDonations(prev => prev.map(d => 
        d._id === donationId ? { ...d, status: 'approved' } : d
      ));
      setRequest(prev => ({
        ...prev,
        numberOfMeals: prev.numberOfMeals - 2
      }));
      
      const response = await createAndAcceptDonationTransaction(donationId, id);
      const updatedDonationResponse = await getDonationById(donationId);
      const updatedDonation = updatedDonationResponse.data;

      setDonations(prev => prev.map(d => 
        d._id === donationId ? updatedDonation : d
      ));

      const updatedRequestResponse = await getRequestById(id);
      setRequest(updatedRequestResponse.data);

      setFilterOption('all');
      showAlert('success', 'Donation accepted and transaction created successfully!');
    } catch (error) {
      console.error('Error accepting donation:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || 'Error accepting donation';
      setDonations(prev => prev.map(d => 
        d._id === donationId ? { ...d, status: 'pending' } : d
      ));
      showAlert('error', errorMessage);
    } finally {
      setProcessing(prev => ({ ...prev, [donationId]: false }));
    }
  };

  const handleRejectDonation = async (donationId) => {
    if (!rejectionReason) {
      showAlert('warning', 'Please provide a reason for rejection');
      return;
    }

    try {
      setProcessing(prev => ({ ...prev, [donationId]: 'rejecting' }));
      await rejectDonation(donationId, rejectionReason);

      setDonations(prev => prev.map(d => 
        d._id === donationId ? { ...d, status: 'rejected' } : d
      ));
      setCurrentRejectionId(null);
      setRejectionReason('');

      showAlert('success', 'Donation rejected successfully!');
    } catch (error) {
      console.error('Error rejecting donation:', error.response?.data || error.message);
      showAlert('error', 'Failed to reject donation');
    } finally {
      setProcessing(prev => ({ ...prev, [donationId]: false }));
    }
  };

  const openRejectionDialog = (donationId) => {
    setCurrentRejectionId(donationId);
    setRejectionReason('');
  };

  if (loading) return <div className="loading-message">Loading...</div>;

  if (error) return (
    <>
      <Navbar />
      <Sidebar />
      <ErrorContainer>
        {error}<br></br>
        <Button variant="back" onClick={() => window.history.back()}>🔙 Go Back</Button>
      </ErrorContainer>
    </>
  );

  return (
    <div className="request-detail-container">
      <Sidebar />
      <div className="request-detail-content">
        <Navbar />
        <div className="container my-5">
          <h1>Donations for Request: {request?.title || 'Loading...'}</h1>
          <div className="header-container" style={{ display: 'flex', justifyContent: 'space-between',marginTop:'20px' ,padding:'10px' }}>
        
            <div className="filter-container">
            <Button variant="back" onClick={() => window.history.back()}>🔙 Go Back</Button>

              <select onChange={(e) => setFilterOption(e.target.value)} value={filterOption}>
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="full">Full</option>
              </select>
              <select onChange={(e) => setSortOption(e.target.value)} value={sortOption}>
                <option value="date">Sort by Date</option>
                <option value="title">Sort by Title</option>
                <option value="donor">Sort by Donor</option>
                <option value="status">Sort by Status</option>
              </select>
            </div>
          </div>

          {currentItems.length > 0 ? (
            currentItems.map(donation => (
              <DonationCardComponent
                key={donation._id}
                donation={donation}
                handleAcceptDonation={handleAcceptDonation}
                handleRejectDonation={handleRejectDonation}
                processing={processing}
                openRejectionDialog={openRejectionDialog}
                currentRejectionId={currentRejectionId}
                rejectionReason={rejectionReason}
                setRejectionReason={setRejectionReason}
              />
            ))
          ) : (
            <p>No donations match the current filters</p>
          )}

          <PaginationControls>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span>Page {currentPage} of {totalPages}</span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </PaginationControls>
        </div>
      </div>
    </div>
  );
};

export default DonationsRequestList;