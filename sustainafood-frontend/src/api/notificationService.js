import axios from "axios";
export const createnotification = async (requestData) => {
  return await axios.post('http://localhost:3000/notification', requestData, {
    headers: {
      "Content-Type": "application/json",
    },
  });
}