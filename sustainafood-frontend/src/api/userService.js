import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL + "/users";

// 🔹 Créer un utilisateur
export const signupUser = async (userData) => {
    return await axios.post('http://localhost:3000/users/create', userData);
};
export const userwinthemailandpss = async (userData) => {
    return await axios.post('http://localhost:3000/users/userwinthemailandpss', userData);
}
// 🔹 Récupérer tous les utilisateurs
export const getUsers = async () => {
  return axios.get(`${API_URL}/list`);
};

// 🔹 Récupérer un utilisateur par ID
export const getUserById = async (id) => {
  return axios.get(`${API_URL}/details/${id}`);
};

// 🔹 Mettre à jour un utilisateur
export const updateUser = async (id, userData) => {
  return axios.put(`${API_URL}/update/${id}`, userData);
};

// 🔹 Supprimer un utilisateur
export const deleteUser = async (id) => {
  return axios.delete(`${API_URL}/delete/${id}`);
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