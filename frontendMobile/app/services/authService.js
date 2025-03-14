import api from "./api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const login = async (credentials) => {
  try {
    const response = await api.post("/users/login", credentials);

    await AsyncStorage.setItem("authToken", response.data.token);
    return response.data;
  } catch (error) {
    // Capturar errores de red
    if (!error.response) {
      throw new Error("No hay conexión con el servidor");
    }
    // Capturar mensajes del backend
    console.log("[Login] Error completo:", error.response?.data);

    throw new Error(
      error.response?.data?.error?.detail || "Usuario no encontrado"
    );
  }
};

export const validateOtp = async (data) => {
  try {
    const response = await api.post("/users/validate-otp", data);
    await AsyncStorage.setItem("authToken", response.data.token);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Token inválido");
  }
};

export const resendOtp = async (document) => {
  try {
    const response = await api.post("/users/generate-otp", {
      document: document,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error al reenviar");
  }
};

export const resetPassword = async (document, newPassword) => {
  try {
    console.log("[resetPassword] Enviando:", {
      document,
      new_password: newPassword,
    });
    const response = await api.post("/users/reset-password", {
      document,
      new_password: newPassword,
    });
    console.log("[resetPassword] Respuesta:", response.data);
    return response.data;
  } catch (error) {
    console.error("[resetPassword] Error:", error.response?.data);
    const errorMessage =
      error.response?.data?.detail ||
      error.response?.data?.error?.detail ||
      "Error al actualizar la contraseña";
    throw new Error(errorMessage);
  }
};
