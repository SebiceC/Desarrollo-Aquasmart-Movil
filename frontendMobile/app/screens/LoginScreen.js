import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigation } from "@react-navigation/native";
import { login } from "../services/authService";
import Icon from "react-native-vector-icons/MaterialIcons";
import { AlertCustom } from "../components/AlertCustom";
import { CustomInput } from "../components/CustomInput";
import { CustomButton } from "../components/CustomButtom";
import { LogoHeader } from "../components/LogoHeader";
import CustomTitle from "../components/CustomTitle";

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
    defaultValues: { document: "", password: "" },
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showCustomAlert, setShowCustomAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    type: "info",
    title: "",
    message: "",
    buttons: [],
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
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
                  phone: response.phone || data.phone,
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

      let errorMessage = "Credenciales incorrectas";
      if (error.message === "User not found") {
        errorMessage = "Usuario no encontrado";
      } else if (
        error.message === "Your account is inactive. Please contact support."
      ) {
        errorMessage = "Usuario inhabilitado, contacte con soporte";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      setAlertMessage(errorMessage);
      setShowCustomAlert(true);
      setTimeout(() => setShowCustomAlert(false), 8000);

      if (
        error.response?.status === 403 &&
        error.response.data?.error?.detail
      ) {
        setAlertConfig({
          visible: true,
          type: "error",
          message: "Error en el inicio de sesión, ya existe una sesión activa.",
          buttons: [{ text: "VOLVER" }],
        });
      } else if (error.message.startsWith("Último intento")) {
        setAlertConfig({
          visible: true,
          type: "warning",
          title: "¡ADVERTENCIA!",
          message: "Último intento antes de bloqueo por 30 minutos",
          buttons: [{ text: "ENTENDIDO" }],
        });
      } else if (error.message.startsWith("Usuario bloqueado")) {
        setAlertConfig({
          visible: true,
          type: "error",
          title: "CUENTA BLOQUEADA",
          message: "Usuario bloqueado por 30 minutos",
          buttons: [{ text: "ENTENDIDO" }],
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
      <LogoHeader />

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
        onClose={() => setAlertConfig((prev) => ({ ...prev, visible: false }))}
      />

      <View style={styles.contenedorPrincipal}>
      <CustomTitle>INICIO DE SESIÓN</CustomTitle>
        <View style={styles.formulario}>
          <CustomInput
            control={control}
            name="document"
            label="Cédula de Ciudadanía"
            placeholder="Ingresa tu Cedula de Ciudadanía"
            error={errors.document}
            keyboardType="numeric"
            maxLength={20}
            numericOnly
            rules={{ required: true }}
          />

          <CustomInput
            control={control}
            name="password"
            label="Contraseña"
            placeholder="Ingresa tu contraseña"
            error={errors.password}
            secureTextEntry={!showPassword}
            showPasswordToggle
            onTogglePassword={() => setShowPassword(!showPassword)}
          />
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

        <CustomButton
          title={isLoading ? "CARGANDO..." : "INICIAR SESIÓN"}
          onPress={handleSubmit(onSubmit)}
          isLoading={isLoading}
        />
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
  formulario: {
    gap: 20,
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
};
