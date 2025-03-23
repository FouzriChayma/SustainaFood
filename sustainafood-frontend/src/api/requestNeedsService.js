import axios from "axios";
export const createrequests=async(requestData)=>{
    return await axios.post('http://localhost:3000/request/',requestData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  };
  export const addDonationToRequest = async (requestId, donationData) => {
    const token = localStorage.getItem("token");
    //const  = user?.token; // Adjust based on your user object structure
  
    if (!token) {
      throw new Error('User not authenticated');
    }
  console.log(donationData);
    const response = await axios.post(
      `http://localhost:3000/request/addDonationToRequest/${requestId}/donations`,
      donationData, // Send full donationData object
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  };
  
  export const getrequests = async () => {
    return axios.get(`http://localhost:3000/request/`);
  };
  export const getRequestsByRecipientId = async (id) => {
    return axios.get(`http://localhost:3000/request/recipient/${id}`);
  };
  export const getRequestById = async (id) => {
    try {
        return await axios.get(`http://localhost:3000/request/${id}`);
    } catch (error) {
        console.error("Error fetching request:", error);
        throw error;
    }
};
export const deleteRequest = async (id) => {
  return axios.delete(`http://localhost:3000/request/${id}`);
};
export const updateRequest = async (id, RequestData) => {
  console.log(RequestData);
  return axios.put(`http://localhost:3000/request/${id}`, RequestData, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};
  