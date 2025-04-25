import React, { useState, useEffect } from 'react';
import { getDonationByUserId } from '../api/donationService';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

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

const NoDonationsContainer = styled.div`
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

const NoDonationsMessage = styled.p`
  font-size: 18px;
  color: #444;
  line-height: 1.6;
  margin-bottom: 20px;
`;

const AddDonationButton = styled(Link)`
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

const DonorProfile = ({ user }) => {
  const userid = user?._id || user?.id;

  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  useEffect(() => {
    const fetchDonations = async () => {
      if (!userid) {
        setError('User ID not found');
        setLoading(false);
        return;
      }

      try {
        console.log("Fetching donations for user ID:", userid); // Debug log
        const response = await getDonationByUserId(userid);
        console.log("Donations response:", response.data); // Debug log
        setDonations(response.data || []);
      } catch (err) {
        console.error("Error fetching donations:", err);
        setError(err.response?.data?.message || 'Error fetching donation data');
      } finally {
        setLoading(false);
      }
    };

    fetchDonations();
  }, [userid]);

  const filteredDonations = donations
    .filter(
      (donation) =>
        donation.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        donation.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((donation) => (statusFilter ? donation.status === statusFilter : true));

  const totalPages = Math.ceil(filteredDonations.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDonations = filteredDonations.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <ProfileHeader>{user.name}'s Donations</ProfileHeader>

      <SearchContainer>
        <SearchInput
          type="text"
          placeholder="🔍 Search donations..."
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
        {currentDonations.length > 0 ? (
          currentDonations.map((donation) => (
            <ProjectCard key={donation._id}>
              <Title>🛒 {donation.title || 'Untitled'}</Title>
              <DetailText>
                <strong>📍 Location:</strong> {donation.address || 'Not specified'}
              </DetailText>
              <DetailText>
                <strong>📆 Expiration Date:</strong>{' '}
                {donation.expirationDate
                  ? new Date(donation.expirationDate).toISOString().split('T')[0]
                  : 'Not set'}
              </DetailText>
              <DetailText>
                <strong>🚚 Delivery:</strong>{' '}
                {donation.delivery ? 'Yes' : 'No'}
              </DetailText>
              <DetailText>
                <strong>🔄 Status:</strong>{' '}
                <StatusBadge status={donation.status}>
                  {donation.status || 'Unknown'}
                </StatusBadge>
              </DetailText>
              <h4>📦 Available Products:</h4>
              <ProductList>
                {Array.isArray(donation.products) && donation.products.length > 0 ? (
                  donation.products.map((pro, index) => {
                    console.log('Product Entry:', pro);
                    return (
                      <ProductItem key={index}>
                        <span>
                          <strong>Name:</strong> {pro.product?.name || 'Not specified'}
                        </span>
                        <span>
                          <strong>Quantity:</strong> {pro.quantity || 0}{' '}
                          {pro.product?.weightUnitTotale || pro.product?.weightUnit || ''}
                        </span>
                        <span>
                          <strong>Status:</strong> {pro.product?.status || 'Unknown'}
                        </span>
                      </ProductItem>
                    );
                  })
                ) : (
                  <ProductItem>
                    {donation.category === 'prepared_meals'
                      ? `🍽️ Number of meals: ${donation.numberOfMeals || 'Not specified'}`
                      : 'No products available'}
                  </ProductItem>
                )}
              </ProductList>
              <BtnSeeMore to={`/DetailsDonations/${donation._id}`}>See More</BtnSeeMore>
            </ProjectCard>
          ))
        ) : (
          <NoDonationsContainer>
            <NoDonationsMessage>
              {user._id === JSON.parse(localStorage.getItem('user'))?._id
                ? "It looks like you haven't made any donations yet! Share your generosity and join us in making an impact—your contribution could change someone's life!"
                : `${user.name} has not made any donations yet.`}
            </NoDonationsMessage>
            {user._id === JSON.parse(localStorage.getItem('user'))?._id && (
              <AddDonationButton to="/addDonation">
                Add a Donation
              </AddDonationButton>
            )}
          </NoDonationsContainer>
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

export default DonorProfile;