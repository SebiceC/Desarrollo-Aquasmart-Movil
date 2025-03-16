import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const api = axios.create({
  baseURL: "https://desarrollo-aquasmart-backend-yhde.onrender.com/api", // URL del backend https://desarrollo-aquasmart-backend-yhde.onrender.com/api
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para manejar errores de red
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      // Error de red o servidor no disponible
      console.error("Error de conexión:", error);
      return Promise.reject(new Error("No hay conexión con el servidor"));
    }
    return Promise.reject(error);
  }
);

api.interceptors.request.use(async (config) => {
  const publicEndpoints = [
    "/users/login",
    "/users/validate-otp",
    "/users/generate-otp",
    "/users/reset-password",
    "/users/pre-register",
    "users/list-document-type",
    "users/list-person-type",
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
