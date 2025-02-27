import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import api from "../services/api";

export default function TokenValidationScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { document, phone } = route.params;

  const [token, setToken] = useState("");
  const [timeLeft, setTimeLeft] = useState(900);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async () => {
    console.log("[Token] Validando token:", token);
    try {
      const response = await api.post("/users/validate-otp", {
        document: document,
        otp: token,
      });
      console.log("[Token] Respuesta:", response.data);

      if (response.data.access) {
        Alert.alert("Éxito", "Validación exitosa");
        navigation.navigate("Home");
      } else {
        Alert.alert("Error", response.data.message || "Código inválido");
      }
    } catch (error) {
      console.error("[Token] Error:", error);
      Alert.alert("Error", "Error al validar el código");
    }
  };

  const handleResendToken = async () => {
    console.log("[Token] Reenviando token...");
    setIsResending(true);
    try {
      await api.post("/users/generate-otp", { document: document });
      console.log("[Token] Token reenviado");
      setTimeLeft(900);
      Alert.alert("Éxito", "Nuevo código enviado");
    } catch (error) {
      console.error("[Token] Error:", error);
      Alert.alert("Error", "No se pudo reenviar el código");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.contenedorPrincipal}>
        <Text style={styles.title}>INGRESO DE TOKEN</Text>

        <Text style={styles.subtitle}>
          Introduce el token enviado por SMS a tu teléfono. Recuerde que expira
          en 15 minutos.
        </Text>

        <Text style={styles.timer}>
          {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}{" "}
          restantes
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Código de 6 dígitos"
          placeholderTextColor="#A0AEC0"
          keyboardType="number-pad"
          maxLength={6}
          value={token}
          onChangeText={setToken}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit}
          disabled={token.length !== 6}
        >
          <Text style={styles.buttonText}>ENVIAR</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.resendButton}
          onPress={handleResendToken}
          disabled={isResending}
        >
          <Text style={styles.resendText}>
            {isResending ? "Enviando..." : "SOLICITAR NUEVO TOKEN"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#dcf2f1",
  },
  contenedorPrincipal: {
    backgroundColor: "#b7e1e7",
    borderColor: "#7aa6c4",
    borderRadius: 20,
    padding: 25,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#2D3748",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
    color: "#4A5568",
  },
  timer: {
    fontSize: 18,
    textAlign: "center",
    color: "#E53E3E",
    marginBottom: 30,
  },
  input: {
    height: 50,
    backgroundColor: "#ffff",
    borderColor: "#E2E8F0",
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    marginBottom: 30,
    fontSize: 18,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#4299E1",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  resendButton: {
    alignItems: "center",
  },
  resendText: {
    color: "#4299E1",
    fontWeight: "600",
  },
});
