import axios from 'axios';

// Fetch all donation transactions
export const getAllDonationTransactions = async () => {
    try {
        const response = await axios.get('http://localhost:3000/donationTransaction/');
        console.log("Full API Response (getAllDonationTransactions):", JSON.stringify(response, null, 2));
        console.log("Response Data:", response.data);
        return response.data; // Return the array directly
    } catch (error) {
        console.error('Error fetching all donation transactions:', {
            message: error.message,
            response: error.response ? error.response.data : null,
            status: error.response ? error.response.status : null,
        });
        throw error;
    }
};

// Fetch a donation transaction by ID
export const getDonationTransactionById = async (id) => {
    try {
        const response = await axios.get(`http://localhost:3000/donationTransaction/${id}`);
        console.log(`Full API Response (getDonationTransactionById ${id}):`, response);
        return response.data;
    } catch (error) {
        console.error(`Error fetching donation transaction with ID ${id}:`, error.message);
        throw error;
    }
};

// Fetch donation transactions by RequestNeed ID
export const getDonationTransactionsByRequestNeedId = async (requestNeedId) => {
    try {
        const response = await axios.get(`http://localhost:3000/donationTransaction/requestNeed/${requestNeedId}`);
        console.log(`Full API Response (getDonationTransactionsByRequestNeedId ${requestNeedId}):`, response);
        return response.data;
    } catch (error) {
        console.error(`Error fetching donation transactions for RequestNeed ID ${requestNeedId}:`, error.message);
        throw error;
    }
};

// Fetch donation transactions by Donation ID
export const getDonationTransactionsByDonationId = async (donationId) => {
    try {
        const response = await axios.get(`http://localhost:3000/donationTransaction/donation/${donationId}`);
        console.log(`Full API Response (getDonationTransactionsByDonationId ${donationId}):`, response);
        return response.data;
    } catch (error) {
        console.error(`Error fetching donation transactions for Donation ID ${donationId}:`, error.message);
        throw error;
    }
};

// Fetch donation transactions by Status
export const getDonationTransactionsByStatus = async (status) => {
    try {
        const response = await axios.get(`http://localhost:3000/donationTransaction/status/${status}`);
        console.log(`Full API Response (getDonationTransactionsByStatus ${status}):`, response);
        return response.data;
    } catch (error) {
        console.error(`Error fetching donation transactions with status ${status}:`, error.message);
        throw error;
    }
};

// Create a new donation transaction
export const createDonationTransaction = async (transactionData) => {
    try {
        const response = await axios.post('http://localhost:3000/donationTransaction/', transactionData);
        console.log("Full API Response (createDonationTransaction):", response);
        return response.data;
    } catch (error) {
        console.error('Error creating donation transaction:', error.message);
        throw error;
    }
};

// Update a donation transaction by ID
export const updateDonationTransaction = async (id, transactionData) => {
    try {
        const response = await axios.put(`http://localhost:3000/donationTransaction/${id}`, transactionData);
        console.log(`Full API Response (updateDonationTransaction ${id}):`, response);
        return response.data;
    } catch (error) {
        console.error(`Error updating donation transaction with ID ${id}:`, error.message);
        throw error;
    }
};

// Delete a donation transaction by ID
export const deleteDonationTransaction = async (id) => {
    try {
        const response = await axios.delete(`http://localhost:3000/donationTransaction/${id}`);
        console.log(`Full API Response (deleteDonationTransaction ${id}):`, response);
        return response.data;
    } catch (error) {
        console.error(`Error deleting donation transaction with ID ${id}:`, error.message);
        throw error;
    }
};

export default {
    getAllDonationTransactions,
    getDonationTransactionById,
    getDonationTransactionsByRequestNeedId,
    getDonationTransactionsByDonationId,
    getDonationTransactionsByStatus,
    createDonationTransaction,
    updateDonationTransaction,
    deleteDonationTransaction,
};