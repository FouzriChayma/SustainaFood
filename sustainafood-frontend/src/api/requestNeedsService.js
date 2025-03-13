import axios from "axios";
export const createrequests=async(requestData)=>{
    return await axios.post('http://localhost:3000/requests/',requestData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  };

