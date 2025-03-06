import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api", // URL del backend
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(async (config) => {
  console.log("Request Headers:", config.headers);

  if (
    !config.url.includes("/users/login") &&
    !config.url.includes("/users/validate-otp") &&
    !config.url.includes("/users/generate-otp")
  ) {
    const token = await AsyncStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Token ${token}`; // Usar "Token" en lugar de "Bearer"
    }
  }
  return config;
});

export default api;
