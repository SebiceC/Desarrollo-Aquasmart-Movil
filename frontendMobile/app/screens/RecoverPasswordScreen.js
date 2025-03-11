import React, { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigation } from "@react-navigation/native";
import api from "../services/api";
import Icon from "react-native-vector-icons/MaterialIcons";
import { AlertCustom } from "../components/AlertCustom";
import { CustomInput } from "../components/CustomInput";
import { CustomButton } from "../components/CustomButtom";
import { LogoHeader } from "../components/LogoHeader";

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
  const navigation = useNavigation();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(RecoverPasswordSchema),
    defaultValues: { document: "", phone: "" },
  });

  const [isLoading, setIsLoading] = useState(false);
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
      const response = await api.post("/users/generate-otp", {
        document: data.document,
        phone: data.phone,
      });
      console.log("[RecoverPassword] Respuesta exitosa:", response.data);

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
                isPasswordRecovery: true,
              });
            },
            style: { backgroundColor: "#365486" },
          },
        ],
        animationType: "slide",
      });
    } catch (error) {
      console.error("[RecoverPassword] Error completo:", error);
      let errorMessage = "Error al procesar la solicitud";
      if (error.response?.status === 404)
        errorMessage = "Usuario no registrado en el sistema";
      if (error.response?.status === 400)
        errorMessage = "El número de teléfono no coincide con el registrado.";

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
        <Text style={styles.titulo}>RECUPERACIÓN DE CONTRASEÑA</Text>
        <Text style={styles.subtitle}>
          Introduce tu cédula de ciudadanía y teléfono, para solicitar un token
          y recuperar tu contraseña.
        </Text>

        <View style={styles.formulario}>
          <CustomInput
            control={control}
            name="document"
            label="Cédula de Ciudadanía"
            placeholder="Ingresa tu Cédula de Ciudadanía"
            error={errors.document}
            keyboardType="numeric"
            maxLength={20}
            numericOnly
          />

          <CustomInput
            control={control}
            name="phone"
            label="Teléfono"
            placeholder="Ingresa tu teléfono | Ej: 3012345678"
            error={errors.phone}
            keyboardType="phone-pad"
            maxLength={15}
            numericOnly
          />
        </View>

        <CustomButton
          title={isLoading ? "CARGANDO..." : "SOLICITAR TOKEN"}
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
  formulario: {
    gap: 20,
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
