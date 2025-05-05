import React, { useState, useEffect } from 'react';
import { getDonationByUserId } from '../api/donationService';
import { Link } from 'react-router-dom';
import { updateUserAvailability } from '../api/userService';

const DonorProfile = ({ user }) => {
  const userid = user?._id || user?.id;
  let loggedInUser = null;
  try {
    const userData = localStorage.getItem('user');
    loggedInUser = userData ? JSON.parse(userData) : null;
  } catch (err) {
    console.error('Error parsing loggedInUser from localStorage:', err);
  }
  const loggedInUserId = loggedInUser?._id || loggedInUser?.id;
  const isOwnProfile = loggedInUser && userid && String(userid) === String(loggedInUserId);

  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 1;

  const [isAvailable, setIsAvailable] = useState(user?.isAvailable || false);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState(null);

  useEffect(() => {
    setIsAvailable(user?.isAvailable || false);
  }, [user?.isAvailable]);

  useEffect(() => {
    const fetchDonations = async () => {
      if (!userid) {
        setError('User ID not found');
        setLoading(false);
        return;
      }

      try {
        console.log("Fetching donations for user ID:", userid);
        const response = await getDonationByUserId(userid);
        console.log("Donations response:", response.data);
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

  const handleToggleAvailability = async () => {
    if (!user?._id) {
      setAvailabilityError('User ID is missing. Cannot update availability.');
      return;
    }

    setAvailabilityLoading(true);
    setAvailabilityError(null);

    try {
      const newAvailability = !isAvailable;
      await updateUserAvailability(user._id, newAvailability);
      setIsAvailable(newAvailability);
    } catch (err) {
      let errorMessage = 'Failed to update availability';

      if (err.response && err.response.data) {
        if (typeof err.response.data.message === 'string') {
          errorMessage = err.response.data.message;
        } else if (err.response.data.error) {
          errorMessage = typeof err.response.data.error === 'string'
            ? err.response.data.error
            : 'An error occurred while updating availability';
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      setAvailabilityError(errorMessage);
      console.error('Error updating availability:', err);
    } finally {
      setAvailabilityLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h3 style={{ textAlign: 'center', fontSize: '28px', fontWeight: 'bold', color: '#228b22', marginBottom: '20px' }}>
        {user?.name || "User"}'s Donations
      </h3>

      {isOwnProfile && (
        <div style={{
          background: '#f9f9f9',
          padding: '20px',
          borderRadius: '6px',
          marginBottom: '24px',
          borderLeft: '4px solid #228b22',
          maxWidth: '500px',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}>
          <h4 style={{
            color: '#2c3e50',
            fontSize: '19.2px',
            margin: '0 0 16px',
          }}>
            Availability Status
          </h4>
          <p style={{
            color: '#7f8c8d',
            margin: '8px 0',
          }}>
            <strong>Status:</strong> {isAvailable ? 'Available' : 'Unavailable'}
          </p>
          <button
            onClick={handleToggleAvailability}
            disabled={availabilityLoading}
            style={{
              padding: '12px 24px',
              border: 'none',
              borderRadius: '5px',
              fontSize: '16px',
              cursor: availabilityLoading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.3s ease, transform 0.2s ease',
              marginTop: '16px',
              backgroundColor: availabilityLoading ? '#bdc3c7' : isAvailable ? '#8dc73f' : '#f92007',
              color: 'white',
              opacity: 1,
              transform: 'translateY(0)',
            }}
            onMouseEnter={(e) => {
              if (!availabilityLoading) {
                e.currentTarget.style.opacity = '0.9';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseLeave={(e) => {
              if (!availabilityLoading) {
                e.currentTarget.style.opacity = '1';
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}
          >
            {isAvailable ? 'Set Unavailable' : 'Set Available'}
          </button>
          {availabilityLoading && (
            <p style={{
              color: '#3498db',
              fontSize: '14.4px',
              marginBottom: '16px',
              marginTop: '10px',
            }}>
              Updating...
            </p>
          )}
          {availabilityError && (
            <p style={{
              color: '#e74c3c',
              fontSize: '14.4px',
              marginBottom: '16px',
              marginTop: '10px',
            }}>
              {availabilityError}
            </p>
          )}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', gap: '10px', width: '100%', maxWidth: '600px' }}>
        <input
          type="text"
          placeholder="🔍 Search donations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1,
            padding: '12px',
            fontSize: '16px',
            border: '2px solid #ddd',
            borderRadius: '6px',
            outline: 'none',
            transition: 'all 0.3s',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#228b22';
            e.target.style.boxShadow = '0px 0px 5px rgba(34, 139, 34, 0.3)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#ddd';
            e.target.style.boxShadow = 'none';
          }}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: '12px',
            fontSize: '16px',
            border: '2px solid #ddd',
            borderRadius: '6px',
            outline: 'none',
          }}
        >
          <option value="">🟢 All Statuses</option>
          <option value="pending">🕒 Pending</option>
          <option value="approved">✅ Accepted</option>
          <option value="rejected">❌ Rejected</option>
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px', width: '100%' }}>
        {currentDonations.length > 0 ? (
          currentDonations.map((donation) => (
            <div
              key={donation._id}
              style={{
                background: 'white',
                borderRadius: '12px',
                boxShadow: '8px 8px 99px rgba(0, 0, 0, 0.1)',
                padding: '20px',
                transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0px 8px 15px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '8px 8px 99px rgba(0, 0, 0, 0.1)';
              }}
            >
              <h5 style={{ fontSize: '22px', fontWeight: 'bold', color: '#228b22', marginBottom: '10px' }}>
                🛒 {donation.title || 'Untitled'}
              </h5>
              <p style={{ fontSize: '16px', color: '#444', lineHeight: '1.6', margin: '5px 0' }}>
                <strong>📍 Location:</strong> {donation.address || 'Not specified'}
              </p>
              <p style={{ fontSize: '16px', color: '#444', lineHeight: '1.6', margin: '5px 0' }}>
                <strong>📆 Expiration Date:</strong>{' '}
                {donation.expirationDate
                  ? new Date(donation.expirationDate).toISOString().split('T')[0]
                  : 'Not set'}
              </p>
              <p style={{ fontSize: '16px', color: '#444', lineHeight: '1.6', margin: '5px 0' }}>
                <strong>🚚 Delivery:</strong>{' '}
                {donation.delivery ? 'Yes' : 'No'}
              </p>
              <p style={{ fontSize: '16px', color: '#444', lineHeight: '1.6', margin: '5px 0' }}>
                <strong>🔄 Status:</strong>{' '}
                <span
                  style={{
                    display: 'inline-block',
                    padding: '8px 14px',
                    borderRadius: '18px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: 'white',
                    background: donation.status === 'pending' ? 'orange' : donation.status === 'approved' ? '#228b22' : donation.status === 'rejected' ? 'red' : '#666',
                  }}
                >
                  {donation.status || 'Unknown'}
                </span>
              </p>
              <h4>📦 Available Products:</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: '10px 0 0 0', display: 'flex', flexDirection: 'column', width: '100%' }}>
                {Array.isArray(donation.products) && donation.products.length > 0 ? (
                  donation.products.map((pro, index) => {
                    console.log('Product Entry:', pro);
                    return (
                      <li
                        key={index}
                        style={{
                          backgroundColor: '#e8f5e9',
                          color: '#2e7d32',
                          padding: '12px 20px',
                          borderRadius: '8px',
                          fontSize: '14px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          width: '100%',
                          boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)',
                          marginBottom: '8px',
                        }}
                      >
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
                      </li>
                    );
                  })
                ) : (
                  <li
                    style={{
                      backgroundColor: '#e8f5e9',
                      color: '#2e7d32',
                      padding: '12px 20px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      width: '100%',
                      boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)',
                      marginBottom: '8px',
                    }}
                  >
                    {donation.category === 'prepared_meals'
                      ? `🍽️ Number of meals: ${donation.numberOfMeals || 'Not specified'}`
                      : 'No products available'}
                  </li>
                )}
              </ul>
              <Link
                to={`/DetailsDonations/${donation._id}`}
                style={{
                  display: 'block',
                  textDecoration: 'none',
                  padding: '10px 16px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  borderRadius: '8px',
                  background: '#228b22',
                  color: 'white',
                  textAlign: 'center',
                  marginTop: '10px',
                  transition: 'background 0.3s ease-in-out',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#1e7a1e')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#228b22')}
              >
                See More
              </Link>
            </div>
          ))
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px',
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0px 8px 15px rgba(0, 0, 0, 0.1)',
              textAlign: 'center',
              maxWidth: '600px',
              margin: '20px auto',
            }}
          >
            <p style={{ fontSize: '18px', color: '#444', lineHeight: '1.6', marginBottom: '20px' }}>
              {user?._id === loggedInUserId
                ? "It looks like you haven't made any donations yet! Share your generosity and join us in making an impact—your contribution could change someone's life!"
                : `${user?.name || "User"} has not made any donations yet.`}
            </p>
            {user?._id === loggedInUserId && (
              <Link
                to="/addDonation"
                style={{
                  display: 'inline-block',
                  textDecoration: 'none',
                  padding: '12px 24px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  borderRadius: '8px',
                  background: '#228b22',
                  color: 'white',
                  transition: 'background 0.3s ease-in-out',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#1e7a1e')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#228b22')}
              >
                Add a Donation
              </Link>
            )}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px', gap: '10px' }}>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            style={{
              background: currentPage === 1 ? '#ddd' : '#228b22',
              color: currentPage === 1 ? '#555' : 'white',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'background 0.3s',
            }}
            onMouseEnter={(e) => {
              if (currentPage !== 1) e.currentTarget.style.background = '#1e7a1e';
            }}
            onMouseLeave={(e) => {
              if (currentPage !== 1) e.currentTarget.style.background = '#228b22';
            }}
          >
            Previous
          </button>
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              onClick={() => handlePageChange(index + 1)}
              style={{
                background: currentPage === index + 1 ? '#228b22' : '#ddd',
                color: currentPage === index + 1 ? 'white' : '#555',
                border: 'none',
                padding: '8px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'background 0.3s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = currentPage === index + 1 ? '#1e7a1e' : '#bbb';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = currentPage === index + 1 ? '#228b22' : '#ddd';
              }}
            >
              {index + 1}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={{
              background: currentPage === totalPages ? '#ddd' : '#228b22',
              color: currentPage === totalPages ? '#555' : 'white',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'background 0.3s',
            }}
            onMouseEnter={(e) => {
              if (currentPage !== totalPages) e.currentTarget.style.background = '#1e7a1e';
            }}
            onMouseLeave={(e) => {
              if (currentPage !== totalPages) e.currentTarget.style.background = '#228b22';
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default DonorProfile;