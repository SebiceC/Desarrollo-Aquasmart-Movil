import React, { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useRoute, useNavigation } from "@react-navigation/native";
import api from "../services/api";
import Icon from "react-native-vector-icons/MaterialIcons";
import { AlertCustom } from "../components/AlertCustom";
import { CustomInput } from "../components/CustomInput";
import { CustomButton } from "../components/CustomButtom";
import { LogoHeader } from "../components/LogoHeader";

const PasswordChangeSchema = yup.object().shape({
  new_password: yup
    .string()
    .required("Campo obligatorio")
    .min(8, "Mínimo 8 caracteres")
    .max(20, "Máximo 20 caracteres")
    .matches(/[A-Z]/, "Debe contener al menos una mayúscula")
    .matches(/[a-z]/, "Debe contener al menos una minúscula")
    .matches(/[0-9]/, "Debe contener al menos un número")
    .matches(
      /[!@#$%^&*()_+\-=\{}|\:;"'<>,.?/]/,
      "Debe contener un carácter especial"
    ),
  confirmPassword: yup
    .string()
    .required("Campo obligatorio")
    .oneOf([yup.ref("new_password"), null], "Las contraseñas no coinciden"),
});

export default function PasswordChangeScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(PasswordChangeSchema),
    defaultValues: {
      document: route.params?.document || "",
      new_password: "",
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState({
    new: false,
    confirm: false,
  });
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
      const response = await api.post("/users/reset-password", {
        document: data.document,
        new_password: data.new_password,
      });

      setAlertConfig({
        visible: true,
        type: "info",
        title: "CAMBIO DE CONTRASEÑA EXITOSO",
        buttons: [
          {
            text: "Iniciar Sesión",
            onPress: () => {
              setAlertConfig((prev) => ({ ...prev, visible: false }));
              navigation.navigate("Login");
            },
            style: { backgroundColor: "#365486" },
          },
        ],
        animationType: "slide",
      });
    } catch (error) {
      console.error("[PasswordChange] Error completo:", error);
      setAlertMessage("¡La contraseña no puede ser igual a la anterior!");
      setShowCustomAlert(true);
      setTimeout(() => setShowCustomAlert(false), 7000);
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
          <Icon name="warning" size={20} color="#757777" />
          <Text style={styles.alertText}>{alertMessage}</Text>
          <Icon name="warning" size={20} color="#757777" />
        </View>
      )}

      <AlertCustom
        visible={alertConfig.visible}
        type={alertConfig.type}
        title={alertConfig.title}
        buttons={alertConfig.buttons}
        onClose={() => setAlertConfig((prev) => ({ ...prev, visible: false }))}
      />

      <View style={styles.contenedorPrincipal}>
        <Text style={styles.titulo}>CAMBIO DE CONTRASEÑA</Text>

        <View style={styles.formulario}>
          <CustomInput
            control={control}
            name="new_password"
            label="Nueva contraseña"
            placeholder="Ingresa la nueva contraseña"
            error={errors.new_password}
            secureTextEntry={!showPassword.new}
            maxLength={22}
            showPasswordToggle
            onTogglePassword={() =>
              setShowPassword((prev) => ({ ...prev, new: !prev.new }))
            }
          />

          <CustomInput
            control={control}
            name="confirmPassword"
            label="Confirmar contraseña"
            placeholder="Confirma la contraseña"
            error={errors.confirmPassword}
            secureTextEntry={!showPassword.confirm}
            maxLength={22}
            showPasswordToggle
            onTogglePassword={() =>
              setShowPassword((prev) => ({ ...prev, confirm: !prev.confirm }))
            }
          />
        </View>

        <Text style={styles.subtitle}>
          {"\u2022"} Máximo 20 caracteres, mínimo 8 caracteres.
          {"\n"}
          {"\u2022"} Al menos una letra mayúscula.
          {"\n"}
          {"\u2022"} Al menos una letra minúscula.
          {"\n"}
          {"\u2022"} Al menos un número.
          {"\n"}
          {"\u2022"} Al menos un carácter especial (como @, #, $, etc.).
        </Text>

        <CustomButton
          title={isLoading ? "CARGANDO..." : "GUARDAR CONTRASEÑA"}
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
    color: "#000000",
    textAlign: "left",
    marginBottom: 30,
    lineHeight: 24,
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
};
