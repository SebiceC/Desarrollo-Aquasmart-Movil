import axios from "axios";

const api = axios.create({
  baseURL: "https://desarrollo-aquasmart-backend.onrender.com/api", // URL del backend
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
