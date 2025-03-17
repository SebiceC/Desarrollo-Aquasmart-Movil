import { useState, useEffect, useRef } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import api from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AlertCustom } from "../components/AlertCustom";
import CustomTitle from "../components/CustomTitle";
import CustomButton from "../components/CustomButtom";
import { LogoHeader } from "../components/LogoHeader";

export default function TokenValidationScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { document, phone } = route.params;

  const [token, setToken] = useState(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(300);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef([]);

  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    type: "success",
    title: "",
    message: "",
    buttons: [],
  });

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
          });
        } else {
          setAlertConfig({
            visible: true,
            type: "success",
            title: "¡BIENVENIDO!",
            buttons: [
              {
                text: "CONTINUAR",
                onPress: () => {
                  setAlertConfig((prev) => ({ ...prev, visible: false }));
                  navigation.replace("Home");
                },
              },
            ],
          });
          await AsyncStorage.setItem("authToken", response.data.token);
          console.log("Redirigiendo a HomeScreen...");
        }
      }
    } catch (error) {
      console.error("[Token] Error:", error);
      setAlertConfig({
        visible: true,
        type: "error",
        title: "ERROR DE VALIDACIÓN",
        message: error.response?.data?.message || "Código incorrecto",
        buttons: [
          {
            text: "ENTENDIDO",
            onPress: () =>
              setAlertConfig((prev) => ({ ...prev, visible: false })),
          },
        ],
      });
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

      setTimeLeft(300);
      setToken(["", "", "", "", "", ""]); // Limpia los campos de token
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus(); // Enfoca el primer campo de entrada
      }
      setAlertConfig({
        visible: true,
        type: "success",
        title: "ÉXITO",
        message: "Nuevo código enviado",
        buttons: [
          {
            text: "ENTENDIDO",
            onPress: () =>
              setAlertConfig((prev) => ({ ...prev, visible: false })),
          },
        ],
      });
    } catch (error) {
      console.error("[Token] Error:", error);
      setAlertConfig({
        visible: true,
        type: "error",
        title: "ERROR AL GENERAR TOKEN",
        buttons: [
          {
            text: "VOLVER",
            onPress: () =>
              setAlertConfig((prev) => ({ ...prev, visible: false })),
            style: { backgroundColor: "#E53E3E" },
          },
        ],
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleChange = (text, index) => {
    const updatedToken = [...token];

    // Si es un número nuevo, reemplaza el valor actual
    if (text.length === 1) {
      updatedToken[index] = text;
      setToken(updatedToken);
      // Mover al siguiente input si no es el último
      if (index < 5) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  // Agregar esta nueva función para manejar el borrado
  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === "Backspace") {
      const updatedToken = [...token];

      // Si el campo actual está vacío, borra el anterior y mueve el foco
      if (token[index] === "" && index > 0) {
        updatedToken[index - 1] = "";
        setToken(updatedToken);
        inputRefs.current[index - 1].focus();
      } else {
        // Si el campo actual tiene un valor, lo borra
        updatedToken[index] = "";
        setToken(updatedToken);
      }
    }
  };

  return (
    <View style={styles.container}>
      <LogoHeader />
      <AlertCustom
        visible={alertConfig.visible}
        type={alertConfig.type}
        title={alertConfig.title}
        icon={alertConfig.icon}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onClose={() => setAlertConfig((prev) => ({ ...prev, visible: false }))}
      />

      <View style={styles.contenedorPrincipal}>
        <CustomTitle>INGRESO DE TOKEN</CustomTitle>
        <Text style={styles.subtitle}>
          Introduce el token enviado por correo electronico. Recuerda que expira
          en 5 minutos.
        </Text>

        <View style={styles.tokenInputContainer}>
          {token.map((digit, index) => (
            <TextInput
              key={index}
              style={styles.tokenInput}
              keyboardType="number-pad"
              maxLength={1}
              value={digit}
              onChangeText={(text) => handleChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
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
          <CustomButton
            title={isResending ? "CARGANDO..." : "SOLICITAR NUEVO TOKEN"}
            onPress={handleResendToken}
            disabled={isResending}
            isLoading={isResending}
            variant="primary"
            style={{ width: "48%" }}
          />

          <CustomButton
            title="ENVIAR"
            onPress={handleSubmit}
            disabled={token.some((digit) => digit === "")}
            variant="primary"
            style={{ width: "48%" }}
          />
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
    width: "100%",
  },
});
