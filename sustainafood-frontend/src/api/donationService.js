import axios from "axios";

export const addDonation = async (donationrData) => {
    return await axios.post('http://localhost:3000/donation/', donationrData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  };
  export const getDonations = async () => {
    return axios.get(`http://localhost:3000/donation/`);
  };
  export const getDonationById = async (id) => {
    return axios.get(`http://localhost:3000/donation/${id}`);
  };
  