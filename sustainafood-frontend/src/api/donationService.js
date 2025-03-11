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
  export const getDonationByUserId = async (id) => {
    return axios.get(`http://localhost:3000/donation/user/${id}`);
  };
  export const getDonationsByUserId=async(id)=>{
    
    return axios.get(`http://localhost:3000/donation/user/${id}`);
  }
  export const deleteDonation = async (id) => {
    return axios.delete(`http://localhost:3000/donation/${id}`);
  };
  export const updateDonation = async (id, donationData) => {
    console.log(donationData);
    return axios.put(`http://localhost:3000/donation/${id}`, donationData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  };
  