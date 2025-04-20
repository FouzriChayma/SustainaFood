import axios from 'axios';

const API_URL = 'http://localhost:3000/deliveries';

// Retrieve JWT token from localStorage (adjust based on your auth storage method)
const getToken = () => localStorage.getItem('token') || '';

export const getTransporterDeliveries = async (transporterId) => {
  try {
    const response = await axios.get(`${API_URL}/transporter/${transporterId}`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    return response;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch transporter deliveries' };
  }
};

export const updateDeliveryStatus = async (deliveryId, status) => {
  try {
    const response = await axios.put(
      `${API_URL}/${deliveryId}/status`,
      { status }, // Backend expects { status }
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }
    );
    return response;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update delivery status' };
  }
};

export const getTransporterFeedbacks = async (transporterId) => {
  // Note: This endpoint is not defined in the provided backend routes.
  // Placeholder implementation; replace with actual endpoint when available.
  try {
    const response = await axios.get(`${API_URL}/feedbacks/transporter/${transporterId}`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    return response;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch transporter feedbacks' };
  }
};

export const createDelivery = async (donationTransactionId) => {
  try {
    const response = await axios.post(
      `${API_URL}`,
      { donationTransaction: donationTransactionId },
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }
    );
    return response;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create delivery' };
  }
};

export const assignTransporterToDelivery = async (deliveryId, transporterId) => {
  try {
    const response = await axios.put(
      `${API_URL}/${deliveryId}/assign`,
      { transporterId },
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }
    );
    return response;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to assign transporter' };
  }
};

export const getPendingDeliveries = async () => {
  try {
    const response = await axios.get(`${API_URL}/pending`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    return response;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch pending deliveries' };
  }
};