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
  type = "info", // 'error' | 'success' | 'warning' | 'info'
  title,
  message,
  buttons = [{ text: "ENTENDIDO", onPress: () => {} }],
  animationType = "fade",
  icon,
  onClose,
  showCloseButton = false,
}) => {
  const getStylesByType = () => {
    switch (type) {
      case "error":
        return {
          backgroundColor: "#FFA7A9",
          icon: require("../assets/img_M1/error-icon.png"),
        };
      case "success":
        return {
          backgroundColor: "#A9FFB8",
          icon: require("../assets/img_M1/success-icon.png"),
        };
      case "warning":
        return {
          backgroundColor: "#FFEBA9",
          icon: require("../assets/img_M1/warning-icon.png"),
        };
      default:
        return {
          backgroundColor: "white",
          icon: require("../assets/img_M1/info-icon.png"),
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
            { backgroundColor: typeStyles.backgroundColor },
          ]}
        >
          {showCloseButton && (
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>X</Text>
            </TouchableOpacity>
          )}

          {/* Título opcional */}
          {title && <Text style={styles.title}>{title}</Text>}

          {/* Icono personalizado */}
          {icon && <Image source={icon} style={styles.icon} />}

          {/* Mensaje principal */}
          <Text style={styles.message}>{message}</Text>

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
  },
  icon: {
    width: 50,
    height: 50,
    marginBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#2D2D2D",
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 25,
    lineHeight: 22,
    color: "#2D2D2D",
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
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    padding: 8,
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2D2D2D",
  },
});
