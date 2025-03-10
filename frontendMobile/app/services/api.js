import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api", // URL del backend
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(async (config) => {
  const publicEndpoints = [
    "/users/login",
    "/users/validate-otp",
    "/users/generate-otp",
    "/users/reset-password",
  ];

  // Agregar token a TODAS las rutas excepto las públicas
  if (!publicEndpoints.some((endpoint) => config.url.includes(endpoint))) {
    const token = await AsyncStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
  }

  return config;
});

export default api;
