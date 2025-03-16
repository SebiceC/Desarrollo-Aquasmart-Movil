import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
} from "react-native";

export const CustomButton = ({
  title,
  onPress,
  isLoading = false,
  variant = "primary",
  style,
  disabled = false,
}) => {
  // Definición de variantes de color
  const variants = {
    primary: { bg: "#000000", pressedBg: "#42A5F5" }, // Azul principal
    secondary: { bg: "#2C7A7B", pressedBg: "#38B2AC" }, // Verde secundario
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: disabled ? "#CBD5E0" : variants[variant].bg }, // Color de fondo deshabilitado
        style, // Estilos personalizados adicionales
      ]}
      onPress={onPress}
      disabled={disabled || isLoading} // Deshabilitar si está en estado de carga o deshabilitado
      activeOpacity={0.8} // Efecto de opacidad al presionar
    >
      {isLoading ? (
        <ActivityIndicator color="#FFFFFF" /> // Indicador de carga
      ) : (
        <Text style={styles.buttonText}>{title}</Text> // Texto del botón
      )}
    </TouchableOpacity>
  );
};

// Estilos del botón
const styles = StyleSheet.create({
  button: {
    height: 48, // Altura fija
    width: "60%", // Ancho del 60%
    borderRadius: 6, // Bordes redondeados
    justifyContent: "center", // Centrar contenido verticalmente
    alignItems: "center", // Centrar contenido horizontalmente
    alignSelf: "center", // Centrar el botón en su contenedor
    marginVertical: 10, // Margen vertical
  },
  buttonText: {
    color: "#FFFFFF", // Color del texto
    fontSize: 15, // Tamaño de la fuente
    fontWeight: "700", // Grosor de la fuente
    textTransform: "uppercase", // Texto en mayúsculas
  },
});