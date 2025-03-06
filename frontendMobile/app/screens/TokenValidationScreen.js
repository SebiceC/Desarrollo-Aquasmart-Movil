import { useState, useEffect, useRef } from "react";
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
import { Image } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function TokenValidationScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { document, phone } = route.params;

  const [token, setToken] = useState(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(900);
  const [isResending, setIsResending] = useState(false);
  const [showCustomAlert, setShowCustomAlert] = useState(false); // Estado para mostrar la alerta personalizada
  const [alertMessage, setAlertMessage] = useState(""); // Estado para el mensaje de la alerta

  const inputRefs = useRef([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async () => {
    const tokenString = token.join("");
    console.log("[Token] Validando token:", tokenString);
    try {
      const response = await api.post(
        "/users/validate-otp",
        {
          document: document,
          otp: tokenString,
        },
        {
          headers: {
            Authorization: undefined, // Elimina el token si existe
          },
        }
      );
      console.log("[Token] Respuesta:", response.data);

      if (response.status === 200) {
        const { token: authToken } = response.data;

        if (route.params?.isPasswordRecovery) {
          console.log("Redirigiendo a Cambio de contraseña...");
          // Navegar a cambio de contraseña
          navigation.replace("PasswordChange", {
            document: document,
            token: tokenString,
          });
        } else {
          await AsyncStorage.setItem("authToken", response.data.token);
          console.log("Redirigiendo a HomeScreen...");
          navigation.replace("Home");
        }
      }
    } catch (error) {
      console.error("[Token] Error:", error);
      setAlertMessage(error.response?.data?.message || "Código incorrecto");
      setShowCustomAlert(true);
      setTimeout(() => setShowCustomAlert(false), 5000);
    }
  };

  const handleResendToken = async () => {
    console.log("[Token] Reenviando token...");
    setIsResending(true);
    try {
      await api.post("/users/generate-otp", {
        document: document,
        phone: route.params.phone,
      });
      console.log("[Token] Token reenviado");

      setTimeLeft(900);
      setToken(["", "", "", "", "", ""]); // Limpia los campos de token
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus(); // Enfoca el primer campo de entrada
      }
      Alert.alert("Éxito", "Nuevo código enviado");
    } catch (error) {
      console.error("[Token] Error:", error);
      setAlertMessage(
        error.response?.data?.message || "Error al reenviar el token"
      );
      setShowCustomAlert(true);
      setTimeout(() => setShowCustomAlert(false), 5000);
    } finally {
      setIsResending(false);
    }
  };

  const handleChange = (text, index) => {
    const updatedToken = [...token];
    updatedToken[index] = text.slice(0, 1);
    setToken(updatedToken);

    if (text.length === 1 && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require("../assets/img_M1/logo.png")}
          style={styles.logo}
        />
        <Text style={styles.aquaSmartText}>AquaSmart</Text>
      </View>

      <View style={styles.contenedorPrincipal}>
        <Text style={styles.title}>INGRESO DE TOKEN</Text>

        <Text style={styles.subtitle}>
          Introduce el token enviado por SMS a tu teléfono. Recuerda que expira
          en 15 minutos.
        </Text>

        {/* Alerta personalizada debajo del título */}
        {showCustomAlert && (
          <View style={styles.customAlert}>
            <Icon
              name="warning"
              size={20}
              color="#757777"
              style={styles.alertIcon}
            />
            <Text style={styles.alertText}>{alertMessage}</Text>
            <Icon
              name="warning"
              size={20}
              color="#656767"
              style={styles.alertIcon}
            />
          </View>
        )}

        <View style={styles.tokenInputContainer}>
          {token.map((digit, index) => (
            <TextInput
              key={index}
              style={styles.tokenInput}
              keyboardType="number-pad"
              maxLength={1}
              value={digit}
              onChangeText={(text) => handleChange(text, index)}
              ref={(ref) => (inputRefs.current[index] = ref)}
              textAlign="center"
            />
          ))}
        </View>

        <Text style={styles.timer}>
          {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}{" "}
          restantes
        </Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.resendButton}
            onPress={handleResendToken}
            disabled={isResending}
          >
            <Text style={styles.buttonText}>
              {isResending ? "Enviando..." : "SOLICITAR NUEVO TOKEN"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={handleSubmit}
            disabled={token.some((digit) => digit === "")}
          >
            <Text style={styles.buttonText}>ENVIAR</Text>
          </TouchableOpacity>
        </View>
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
    backgroundColor: "#FFFFFF",
    borderColor: "#000000",
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 25,
    elevation: 5,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#000000",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
    color: "#000000",
  },
  timer: {
    fontSize: 18,
    textAlign: "center",
    color: "#000000",
    marginBottom: 30,
  },
  tokenInputContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
    borderRadius: 8,
    borderColor: "#000000",
  },
  tokenInput: {
    width: 50,
    height: 70,
    backgroundColor: "#ffff",
    borderColor: "#000000",
    borderWidth: 1,
    borderRadius: 8,
    textAlign: "center",
    fontSize: 18,
  },

  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#2D5B7B",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    flex: 1,
    marginLeft: 10,
    justifyContent: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },
  resendButton: {
    backgroundColor: "#2D5B7B",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    flex: 1,
    marginRight: 10,
    justifyContent: "center",
  },

  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
  },
  logo: {
    width: 60,
    height: 60,
    marginRight: 20,
  },
  aquaSmartText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000000",
  },
  customAlert: {
    backgroundColor: "#FFA7A9",
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    flexDirection: "row",
  },
  alertText: {
    color: "#757777",
    fontSize: 16,
    fontWeight: "bold",
    marginHorizontal: 10,
  },
  alertIcon: {
    marginHorizontal: 5,
  },
});
