import axios from "axios";

export const addDonation = async (donationrData) => {
    return await axios.post('http://localhost:3000/donation/', donationrData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  };