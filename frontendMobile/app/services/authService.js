import api from "./api";

export const login = async (credentials) => {
  try {
    const response = await api.post("/users/login", credentials);
    return response.data;
  } catch (error) {
    // Capturar errores de red
    if (!error.response) {
      throw new Error("No hay conexión con el servidor");
    }

    // Capturar mensajes del backend
    const message = error.response.data?.message || "Error desconocido";
    throw new Error(message);
  }
};
