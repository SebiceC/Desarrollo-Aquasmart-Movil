import React, { useState } from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  TextInput,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigation } from "@react-navigation/native";
import { login } from "../services/authService";
import { Image } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { AlertCustom } from "../components/AlertCustom";
import AsyncStorage from "@react-native-async-storage/async-storage";

const loginSchema = yup.object().shape({
  document: yup
    .string()
    .required("Campo obligatorio")
    .matches(/^\d{6,12}$/, "Cédula inválida"),
  password: yup
    .string()
    .required("Campo obligatorio")
    .max(20, "Máximo 20 caracteres"),
});

export default function LoginScreen() {
  const navigation = useNavigation();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [buttonColor, setButtonColor] = useState("#365486"); // Color inicial del botón

  const [showCustomAlert, setShowCustomAlert] = useState(false); // Estado para mostrar la alerta personalizada
  const [alertMessage, setAlertMessage] = useState(""); // Estado para el mensaje de la alerta

  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    type: "info",
    title: "",
    message: "",
    buttons: [],
  });

  const onSubmit = async (data) => {
    console.log("[Login] Datos enviados:", data);
    setIsLoading(true);

    try {
      await AsyncStorage.removeItem("authToken");

      const response = await login(data);
      console.log("[Login] Respuesta del backend:", response);

      if (response.document) {
        setAlertConfig({
          visible: true,
          type: "info",
          title: "TOKEN ENVIADO",
          message:
            "Se ha enviado un token de 6 caracteres\na tu número de teléfono registrado.",
          buttons: [
            {
              text: "CONFIRMAR",
              onPress: () => {
                setAlertConfig((prev) => ({ ...prev, visible: false }));
                navigation.navigate("TokenValidationScreen", {
                  document: data.document,
                  phone: data.phone,
                });
              },
              style: { backgroundColor: "#365486" },
            },
          ],
          animationType: "slide",
        });
      }
    } catch (error) {
      console.error("[Login] Error capturado:", error.message);
      setAlertMessage(
        error.response?.data?.message || "Credenciales incorrectas"
      );
      setShowCustomAlert(true); // Mostrar alerta
      setTimeout(() => setShowCustomAlert(false), 8000);

      if (
        error.response?.status === 403 &&
        error.response.data?.error?.detail
      ) {
        alertMessage = error.response.data.error.detail;

        setAlertConfig({
          visible: true,
          type: "error",
          message: "Error en el inicio de sesión, ya existe una sesión activa.",
          buttons: [
            {
              text: "VOLVER",
              onPress: () =>
                setAlertConfig((prev) => ({ ...prev, visible: false })),
            },
          ],
        });
      } else if (error.message.startsWith("Último intento")) {
        setAlertConfig({
          visible: true,
          type: "warning",
          title: "¡ADVERTENCIA!",
          message: "Último intento antes de bloqueo por 1 hora",
          buttons: [
            {
              text: "ENTENDIDO",
              onPress: () =>
                setAlertConfig((prev) => ({ ...prev, visible: false })),
            },
          ],
        });
      } else if (error.message.startsWith("Usuario bloqueado")) {
        setAlertConfig({
          visible: true,
          type: "error",
          title: "CUENTA BLOQUEADA",
          message: "Usuario bloqueado por 1 hora",
          buttons: [
            {
              text: "ENTENDIDO",
              onPress: () =>
                setAlertConfig((prev) => ({ ...prev, visible: false })),
            },
          ],
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.logoContainer}>
        <Image
          source={require("../assets/img_M1/logo.png")} // Ruta de la imagen
          style={styles.logo}
        />
        <Text style={styles.aquaSmartText}>AquaSmart</Text>
      </View>

      <View style={styles.contenedorPrincipal}>
        <Text style={styles.titulo}>INICIO DE SESIÓN</Text>

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

        <AlertCustom
          visible={alertConfig.visible}
          type={alertConfig.type}
          title={alertConfig.title}
          message={alertConfig.message}
          buttons={alertConfig.buttons}
          onClose={() =>
            setAlertConfig((prev) => ({ ...prev, visible: false }))
          }
        />

        <View style={styles.formulario}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Cedula de Ciudadanía<Text style={{ color: "red" }}> *</Text>
            </Text>
            <Controller
              control={control}
              name="document"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="Ingresa tu Cedula de Ciudadanía"
                  placeholderTextColor="#A0AEC0"
                  keyboardType="numeric"
                  onChangeText={(text) => onChange(text.replace(/[^0-9]/g, ""))}
                  value={value}
                  maxLength={20}
                />
              )}
            />
            {errors.document && (
              <Text style={styles.error}>{errors.document.message}</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Contraseña<Text style={{ color: "red" }}> *</Text>
            </Text>
            <View style={styles.passwordInputContainer}>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Ingresa tu contraseña"
                    placeholderTextColor="#A0AEC0"
                    secureTextEntry={!showPassword}
                    onChangeText={onChange}
                    value={value}
                    maxLength={20}
                  />
                )}
              />
              <TouchableOpacity
                style={styles.toggleButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text style={styles.toggleText}>
                  {showPassword ? "Ocultar" : "Mostrar"}
                </Text>
              </TouchableOpacity>
            </View>
            {errors.password && (
              <Text style={styles.error}>{errors.password.message}</Text>
            )}
          </View>
        </View>

        <View style={styles.enlacesContainer}>
          <TouchableOpacity
            onPress={() => navigation.navigate("RecoverPassword")}
          >
            <Text style={styles.enlace}>OLVIDE MI CONTRASEÑA</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("PreRegister")}>
            <Text style={styles.enlace}>SOY USUARIO NUEVO</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.boton, { backgroundColor: buttonColor }]}
          onPress={handleSubmit(onSubmit)}
          disabled={isLoading}
          onPressIn={() => setButtonColor("#42A5F5")}
          onPressOut={() => setButtonColor("#365486")}
        >
          <Text style={styles.botonTexto}>
            {isLoading ? "CARGANDO..." : "INICIAR SESIÓN"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = {
  container: {
    flexGrow: 1,
    justifyContent: "center",
    backgroundColor: "#dcf2f1",
    padding: 24,
  },
  contenedorPrincipal: {
    backgroundColor: "#FFFFFF",
    borderColor: "#000000",
    borderRadius: 12,
    borderWidth: 1.5,
    padding: 25,
    elevation: 5,
  },
  titulo: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000000",
    textAlign: "center",
    marginBottom: 40,
    textTransform: "uppercase",
  },
  inputContainer: {
    marginBottom: 24,
  },
  formulario: {
    gap: 20,
  },
  label: {
    fontSize: 14,
    color: "#000000",
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 6,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    fontSize: 16,
    color: "#2D3748",
  },
  error: {
    color: "#E53E3E",
    fontSize: 12,
    marginTop: 4,
  },
  boton: {
    height: 48,
    width: "60%",
    backgroundColor: "#365486",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    alignSelf: "center",
  },
  botonTexto: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  enlacesContainer: {
    marginTop: 32,
    gap: 16,
  },
  enlace: {
    color: "#2D3748",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    textDecorationLine: "underline",
  },
  passwordInputContainer: {
    position: "relative",
  },
  passwordInput: {
    height: 48,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 6,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    fontSize: 16,
    color: "#2D3748",
    paddingRight: 70,
  },
  toggleButton: {
    position: "absolute",
    right: 10,
    top: 12,
    zIndex: 2,
  },
  toggleText: {
    color: "#4299E1",
    fontWeight: "600",
    fontSize: 14,
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
    backgroundColor: "#FFA7A9", // Rojo de fondo
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
};
