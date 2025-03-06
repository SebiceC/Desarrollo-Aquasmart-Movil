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
import { Image } from "react-native";
import api from "../services/api";
import Icon from "react-native-vector-icons/MaterialIcons";

const RecoverPasswordSchema = yup.object().shape({
  document: yup
    .string()
    .required("Campo obligatorio")
    .matches(/^\d{6,12}$/, "Cédula inválida"),
  phone: yup
    .string()
    .required("Campo obligatorio")
    .min(10, "Mínimo 10 dígitos")
    .max(15, "Máximo 15 dígitos")
    .matches(/^[0-9]+$/, "Solo números permitidos"),
});

export default function RecoverPasswordScreen() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(RecoverPasswordSchema),
    defaultValues: {
      document: "",
      phone: "",
    },
  });

  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [buttonColor, setButtonColor] = useState("#365486"); // Color inicial del botón

  const [showCustomAlert, setShowCustomAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  
  const onSubmit = async (data) => {
    console.log("[RecoverPassword] Iniciando envío...", data);
    setIsLoading(true);

    try {
      const response = await api.post("/users/generate-otp", {
        document: data.document,
        phone: data.phone,
      });

      console.log("[RecoverPassword] Respuesta exitosa:", response.data);

      navigation.navigate("TokenValidationScreen", {
        document: data.document,
        phone: data.phone,
        isPasswordRecovery: true,
      });
    } catch (error) {
      console.error("[RecoverPassword] Error completo:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });

      const errorMessage =
        error.response?.data?.error?.detail ||
        error.response?.data?.detail ||
        "Error al procesar la solicitud";

      setAlertMessage(errorMessage);
      setShowCustomAlert(true);

      setTimeout(() => setShowCustomAlert(false), 5000);
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
          source={require("../assets/img_M1/logo.png")}
          style={styles.logo}
        />
        <Text style={styles.aquaSmartText}>AquaSmart</Text>
      </View>

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

      <View style={styles.contenedorPrincipal}>
        <Text style={styles.titulo}>RECUPERACIÓN DE CONTRASEÑA</Text>
        <Text style={styles.subtitle}>
          Introduce tu cédula de ciudadanía y teléfono, para solicitar un token
          y recuperar tu contraseña.
        </Text>

        <View style={styles.formulario}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Cédula de Ciudadanía<Text style={{ color: "red" }}> *</Text>
            </Text>
            <Controller
              control={control}
              name="document"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="Ingresa tu Cédula de Ciudadanía"
                  placeholderTextColor="#A0AEC0"
                  keyboardType="numeric"
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            {errors.document && (
              <Text style={styles.error}>{errors.document.message}</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Teléfono<Text style={{ color: "red" }}> *</Text>
            </Text>
            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="Ingresa tu teléfono | Ej: 3012345678"
                  placeholderTextColor="#A0AEC0"
                  keyboardType="phone-pad"
                  onChangeText={onChange}
                  value={value}
                  maxLength={15}
                />
              )}
            />
            {errors.phone && (
              <Text style={styles.error}>{errors.phone.message}</Text>
            )}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.boton, { backgroundColor: buttonColor }]}
          onPress={handleSubmit(onSubmit)}
          disabled={isLoading}
          onPressIn={() => setButtonColor("#42A5F5")}
          onPressOut={() => setButtonColor("#365486")}
        >
          <Text style={styles.botonTexto}>
            {isLoading ? "CARGANDO..." : "SOLICITAR TOKEN"}
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
  subtitle: {
    fontSize: 16,
    textAlign: "justify",
    marginBottom: 30,
    color: "#000000",
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
};
