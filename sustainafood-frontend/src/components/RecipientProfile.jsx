import React, { useState, useEffect } from 'react';
import { getRequestsByRecipientId } from '../api/requestNeedsService';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { updateUserAvailability } from '../api/userService';


// Styled Components
const ProjectsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 20px;
  width: 100%;
`;

const ProjectCard = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 8px 8px 99px rgba(0, 0, 0, 0.1);
  padding: 20px;
  transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0px 8px 15px rgba(0, 0, 0, 0.15);
  }
`;

const BtnSeeMore = styled(Link)`
  display: block;
  text-decoration: none;
  padding: 10px 16px;
  font-size: 16px;
  font-weight: bold;
  border-radius: 8px;
  background: #228b22;
  color: white;
  text-align: center;
  margin-top: 10px;
  transition: background 0.3s ease-in-out;

  &:hover {
    background: #1e7a1e;
  }
`;

const SearchContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  gap: 10px;
  width: 100%;
  max-width: 600px;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 12px;
  font-size: 16px;
  border: 2px solid #ddd;
  border-radius: 6px;
  outline: none;
  transition: all 0.3s;

  &:focus {
    border-color: #228b22;
    box-shadow: 0px 0px 5px rgba(34, 139, 34, 0.3);
  }
`;

const FilterSelect = styled.select`
  padding: 12px;
  font-size: 16px;
  border: 2px solid #ddd;
  border-radius: 6px;
  outline: none;
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 8px 14px;
  border-radius: 18px;
  font-size: 14px;
  font-weight: bold;
  color: white;
  background: ${({ status }) => {
    switch (status) {
      case 'pending':
        return 'orange';
      case 'approved':
        return '#228b22';
      case 'rejected':
        return 'red';
      default:
        return '#666';
    }
  }};
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 20px;
  gap: 10px;
`;

const PageButton = styled.button`
  background: ${({ active }) => (active ? '#228b22' : '#ddd')};
  color: ${({ active }) => (active ? 'white' : '#555')};
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s;

  &:hover {
    background: ${({ active }) => (active ? '#1e7a1e' : '#bbb')};
  }
`;

const ProfileHeader = styled.h3`
  text-align: center;
  font-size: 28px;
  font-weight: bold;
  color: #228b22;
  margin-bottom: 20px;
`;

const Title = styled.h5`
  font-size: 22px;
  font-weight: bold;
  color: #228b22;
  margin-bottom: 10px;
`;

const DetailText = styled.p`
  font-size: 16px;
  color: #444;
  line-height: 1.6;
  margin: 5px 0;
`;

const ProductList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 10px 0 0 0;
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const ProductItem = styled.li`
  background-color: #e8f5e9;
  color: #2e7d32;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
  margin-bottom: 8px;
`;

const NoRequestsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: white;
  border-radius: 12px;
  box-shadow: 0px 8px 15px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 600px;
  margin: 20px auto;
`;

const NoRequestsMessage = styled.p`
  font-size: 18px;
  color: #444;
  line-height: 1.6;
  margin-bottom: 20px;
`;

const AddRequestButton = styled(Link)`
  display: inline-block;
  text-decoration: none;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: bold;
  border-radius: 8px;
  background: #228b22;
  color: white;
  transition: background 0.3s ease-in-out;

  &:hover {
    background: #1e7a1e;
  }
`;

const RecipientProfile = ({ user }) => {
  const userid = user?._id || user?.id;

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  const [isAvailable, setIsAvailable] = useState(user.isAvailable || false);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState(null);

  useEffect(() => {
    setIsAvailable(user.isAvailable || false);
  }, [user.isAvailable]);

  useEffect(() => {
    const fetchRequests = async () => {
      if (!userid) {
        setError('User ID not found');
        setLoading(false);
        return;
      }

      try {
        console.log("Fetching requests for user ID:", userid); // Debug log
        const response = await getRequestsByRecipientId(userid);
        console.log('Requests Data:', response.data); // Debug log
        setRequests(response.data || []);
      } catch (err) {
        if (err.response?.status === 404 && err.response?.data?.message === 'No requests found for this recipient') {
          setRequests([]);
        } else {
          console.error('Fetch Error:', err);
          setError(err.response?.data?.message || 'Error fetching request data');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [userid]);

  const filteredRequests = requests
    .filter(
      (request) =>
        (request.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (request.description?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    )
    .filter((request) => (statusFilter ? request.status === statusFilter : true));

  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRequests = filteredRequests.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleToggleAvailability = async () => {
    setAvailabilityLoading(true);
    setAvailabilityError(null);
    try {
      await updateUserAvailability(user._id, !isAvailable);
      setIsAvailable(!isAvailable);
    } catch (err) {
      setAvailabilityError('Failed to update availability');
    } finally {
      setAvailabilityLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <ProfileHeader>{user.name}'s Donation Requests</ProfileHeader>

      <div>
        <label>
          Availability:
          <input
            type="checkbox"
            checked={isAvailable}
            onChange={handleToggleAvailability}
            disabled={availabilityLoading}
          />
        </label>
        {availabilityLoading && <span>Updating availability...</span>}
        {availabilityError && <span style={{ color: 'red' }}>{availabilityError}</span>}
      </div>

      <SearchContainer>
        <SearchInput
          type="text"
          placeholder="🔍 Search requests..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <FilterSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">🟢 All Statuses</option>
          <option value="pending">🕒 Pending</option>
          <option value="approved">✅ Accepted</option>
          <option value="rejected">❌ Rejected</option>
        </FilterSelect>
      </SearchContainer>

      <ProjectsContainer>
        {currentRequests.length > 0 ? (
          currentRequests.map((request) => (
            <ProjectCard key={request._id}>
              <Title>🛒 {request.title || 'Untitled'}</Title>
              <DetailText>
                <strong>📍 Location:</strong> {request.address || 'Not specified'}
              </DetailText>
              <DetailText>
                <strong>📆 Before Date:</strong>{' '}
                {request.expirationDate
                  ? new Date(request.expirationDate).toISOString().split('T')[0]
                  : 'Not set'}
              </DetailText>
              <DetailText>
                <strong>📑 Details:</strong> {request.description || 'No description'}
              </DetailText>
              <DetailText>
                <strong>🔄 Status:</strong>{' '}
                <StatusBadge status={request.status}>
                  {request.status || 'Unknown'}
                </StatusBadge>
              </DetailText>
              <h4>📦 Requested Products:</h4>
              <ProductList>
                {Array.isArray(request.requestedProducts) && request.requestedProducts.length > 0 ? (
                  request.requestedProducts.map((item, index) => (
                    <ProductItem key={index}>
                      <span>
                        <strong>Type:</strong> {item.product?.productType || 'Not specified'}
                      </span>
                      <span>
                        <strong>Weight:</strong> {item.product?.weightPerUnit || 0}{' '}
                        {item.product?.weightUnit || ''}
                      </span>
                      <span>
                        <strong>Quantity:</strong> {item.product?.totalQuantity || 0}
                      </span>
                      <span>
                        <strong>Status:</strong> {item.product?.status || 'Unknown'}
                      </span>
                    </ProductItem>
                  ))
                ) : (
                  <ProductItem>
                    {request.category === 'prepared_meals'
                      ? `🍽️ Number of meals: ${request.numberOfMeals || 'Not specified'}`
                      : 'No requested products'}
                  </ProductItem>
                )}
              </ProductList>
              <BtnSeeMore to={`/DetailsRequest/${request._id}`}>See More</BtnSeeMore>
            </ProjectCard>
          ))
        ) : (
          <NoRequestsContainer>
            <NoRequestsMessage>
              {user._id === JSON.parse(localStorage.getItem('user'))?._id
                ? "It looks like you haven't made any requests yet! Share your needs and join us in making a difference—your next step could help someone in need!"
                : `${user.name} has not made any requests yet.`}
            </NoRequestsMessage>
            {user._id === JSON.parse(localStorage.getItem('user'))?._id && (
              <AddRequestButton to="/addDonation">
                Add a Request
              </AddRequestButton>
            )}
          </NoRequestsContainer>
        )}
      </ProjectsContainer>

      {totalPages > 1 && (
        <PaginationContainer>
          <PageButton
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </PageButton>
          {[...Array(totalPages)].map((_, index) => (
            <PageButton
              key={index}
              active={currentPage === index + 1}
              onClick={() => handlePageChange(index + 1)}
            >
              {index + 1}
            </PageButton>
          ))}
          <PageButton
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </PageButton>
        </PaginationContainer>
      )}
    </div>
  );
};

export default RecipientProfile;
