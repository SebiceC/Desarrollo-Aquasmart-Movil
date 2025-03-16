import api from "./api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const login = async (credentials) => {
  try {
    const response = await api.post("/users/login", credentials);

    if (response.data.document) {
      return response.data;
    }

    if (response.data.token) {
      await AsyncStorage.setItem("authToken", response.data.token);
    }

    return response.data;
  } catch (error) {
    console.error("[Login] Error:", error);

    if (!error.response) {
      throw error;
    }

    // Manejo específico de errores del backend
    const backendError =
      error.response?.data?.error?.detail ||
      error.response?.data?.message ||
      "Error en el inicio de sesión";
    throw new Error(backendError);
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
