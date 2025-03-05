import axios from "axios";

//const API_URL = import.meta.env.VITE_API_URL + "/users";

// 🔹 Créer un utilisateur
export const signupUser = async (userData) => {
  return await axios.post('http://localhost:3000/users/create', userData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const createuser=async(userData)=>{
  return await axios.post('http://localhost:3000/users/createUser',userData)
}
export const userwinthemailandpss = async (userData) => {
    return await axios.post('http://localhost:3000/users/userwinthemailandpss', userData);
}
// 🔹 Récupérer tous les utilisateurs
export const getUsers = async () => {
  return axios.get(`http://localhost:3000/users/list`);
};

// 🔹 Récupérer un utilisateur par ID
export const getUserById = async (id) => {
  return axios.get(`http://localhost:3000/users/details/${id}`);
};

// 🔹 Mettre à jour un utilisateur
export const updateUser = async (id, userData) => {
  return axios.put(`http://localhost:3000/users/update/${id}`, userData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
export const updateUserwithemail = async (id, userData) => {
  return axios.put(`http://localhost:3000/users/update/${id}`, userData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// 🔹 Supprimer un utilisateur
export const deleteUser = async (id) => {
  return axios.delete(`http://localhost:3000/users/delete/${id}`);
};

// 🔹 Connexion utilisateur
export const loginUser = async (userData) => {
    console.log("Données envoyées :", userData); // 🔹 Vérifie si les bonnes données sont envoyées
  
    return await axios.post("http://localhost:3000/users/login", userData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  };
export const deactivateAccount = async (userId, token) => {
  return axios.put(
    `http://localhost:3000/users/deactivate-account/${userId}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};



// 🔹 Toggle 2FA Status
export const toggle2FA = async (email) => {
  return await axios.post("http://localhost:3000/users/toggle-2fa", { email },    console.log("Données envoyées :", email),
  {
    headers: {
      "Content-Type": "application/json",
    },
  });
};
// userService.js

// 🔹 Validate 2FA Code
export const validate2FACode = async (email, twoFACode) => {
  return await axios.post("http://localhost:3000/users/validate-2fa-code", {
    email,
    twoFACode,
  }, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};
export const changePassword = async (userId, currentPassword, newPassword) => {
  return axios.put(
    `http://localhost:3000/users/change-password/${userId}`, // <-- note the "/:id"
    { currentPassword, newPassword }, // No "userId" in body now
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};
export const send2FACodeforsigninwithgoogle = async (email) => {
  return axios.post("http://localhost:3000/users/send2FACodeforsigninwithgoogle", { email });
};
