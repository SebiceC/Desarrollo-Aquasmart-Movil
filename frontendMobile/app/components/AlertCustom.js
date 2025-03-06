import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";

export const AlertCustom = ({ visible, message, onClose }) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.alertContainer}>
          <Text style={styles.message}>{message}</Text>

          <TouchableOpacity
            style={styles.button}
            onPress={onClose}
            activeOpacity={0.3}
          >
            <Text style={styles.buttonText}>ENTENDIDO</Text>
          </TouchableOpacity>
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
    backgroundColor: "#FFA7A9",
    width: "80%",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  message: {
    color: "black",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 25,
    lineHeight: 24,
  },
  button: {
    backgroundColor: "#365486",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});