import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";

export const AlertCustom = ({
  visible,
  type = "info", // 'error' | 'success' | 'info'
  title,
  message,
  buttons = [{ text: "ENTENDIDO", onPress: () => {} }],
  animationType = "fade",
  onClose,
}) => {
  const getStylesByType = () => {
    switch (type) {
      case "error":
        return {
          backgroundColor: "white", // Fondo blanco para errores
          icon: require("../assets/img_M1/error-icon.png"), // Ícono de error
        };
      case "success":
        return {
          backgroundColor: "white", // Fondo blanco para éxito
          icon: require("../assets/img_M1/success-icon.png"), // Ícono de éxito
        };
      default:
        return {
          backgroundColor: "white", // Fondo blanco por defecto (info)
          icon: require("../assets/img_M1/info-icon.png"), // Ícono de info
        };
    }
  };

  const typeStyles = getStylesByType();

  return (
    <Modal visible={visible} transparent animationType={animationType}>
      <View style={styles.overlay}>
        <View
          style={[
            styles.alertContainer,
            { backgroundColor: typeStyles.backgroundColor }, // Aplica el color de fondo
          ]}
        >
          {/* Título opcional */}
          {title && <Text style={styles.title}>{title}</Text>}

          {/* Mensaje principal */}
          <Text style={styles.message}>{message}</Text>

          {/* Icono personalizado */}
          <Image source={typeStyles.icon} style={styles.icon} />

          {/* Contenedor de botones dinámicos */}
          <View
            style={[
              styles.buttonsContainer,
              buttons.length === 1 && styles.singleButtonContainer, // Nuevo estilo para un solo botón
            ]}
          >
            {buttons.map((button, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.button,
                  buttons.length > 1 && {
                    flex: 1,
                    marginHorizontal: 5,
                    width: "70%",
                  },
                  button.style,
                ]}
                onPress={button.onPress || onClose}
                activeOpacity={0.3}
              >
                <Text style={styles.buttonText}>{button.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  alertContainer: {
    width: "80%",
    borderRadius: 12,
    padding: 25,
    alignItems: "center",
    elevation: 5, // Sombra en Android
    shadowColor: "#000", // Sombra en iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  icon: {
    width: 100,
    height: 100,
    marginBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#2D2D2D",
    textAlign: "center", // Centrar el título
  },
  message: {
    fontSize: 20,
    textAlign: "center",
    marginBottom: 25,
    lineHeight: 22,
    color: "#000000",
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
    gap: 10,
  },
  button: {
    backgroundColor: "#365486",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    minWidth: 100,
    flexGrow: 0,
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  singleButtonContainer: {
    justifyContent: "center", // Centrado para botón único
  },
});