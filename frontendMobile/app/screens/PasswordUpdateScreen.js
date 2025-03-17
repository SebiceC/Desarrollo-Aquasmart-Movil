import React, { useState } from "react";
import { StyleSheet, Text, View, ScrollView } from "react-native";
import NavbarLayout from "../components/NavbarLayout";
import * as yup from "yup";
import api from "../services/api";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { CustomInput } from "../components/CustomInput";
import { CustomButton } from "../components/CustomButtom";
import { AlertCustom } from "../components/AlertCustom"; // Importa el componente AlertCustom
import CustomTitle from "../components/CustomTitle"; // Importa el componente CustomTitle

const PasswordUpdateSchema = yup.object().shape({
  current_password: yup.string().required("Campo obligatorio"),
  new_password: yup
    .string()
    .required("Campo obligatorio")
    .min(8, "Debe contener al menos 8 caracteres")
    .max(20, "Debe contener máximo 20 caracteres")
    .matches(/[A-Z]/, "Debe contener al menos una mayúscula")
    .matches(/[a-z]/, "Debe contener al menos una minúscula")
    .matches(/[0-9]/, "Debe contener al menos un número")
    .matches(
      /[!@#$%^&*()_+\-=\{}|\:;"'<>,.?/]/,
      "Debe contener un carácter especial"
    )
    .notOneOf(
      [yup.ref("current_password")],
      "Debe ser diferente de la contraseña actual"
    ),
  confirm_password: yup
    .string()
    .oneOf([yup.ref("new_password")], "Las contraseñas no coinciden")
    .required("Campo obligatorio"),
});

export default function PasswordUpdateScreen({ navigation }) {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(PasswordUpdateSchema),
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showAlert, setShowAlert] = useState(false); // Controla la visibilidad de la alerta
  const [alertType, setAlertType] = useState("info"); // Tipo de alerta ('error' o 'success')
  const [alertMessage, setAlertMessage] = useState(""); // Mensaje de la alerta
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data) => {
    setIsLoading(true); // Activar el estado de carga
    try {
      const response = await api.post("/users/change-password", {
        current_password: data.current_password,
        new_password: data.new_password,
        confirm_password: data.confirm_password,
      });

      console.log("[Cambio de contraseña] Respuesta del backend:", response);

      if (response.status === 200) {
        setAlertType("success"); // Establece el tipo de alerta como "success"
        setAlertMessage("Contraseña actualizada con éxito");
        setShowAlert(true);
        reset({
          current_password: "",
          new_password: "",
          confirm_password: "",
        });
      }
    } catch (error) {
      console.error("[Cambio de contraseña] Error:", error.message);

      if (error.response && error.response.data) {
        const errorData = error.response.data;
        let errorMessage = "Error al actualizar la contraseña";

        if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.new_password) {
          errorMessage = errorData.new_password[0];
        } else if (errorData.current_password) {
          errorMessage = errorData.current_password[0];
        } else if (errorData.confirm_password) {
          errorMessage = errorData.confirm_password[0];
        }

        // Mostrar alerta de error
        setAlertType("error");
        setAlertMessage(errorMessage);
      } else {
        setAlertType("error"); // Establece el tipo de alerta como "error"
        setAlertMessage("Error desconocido. Intente nuevamente.");
      }

      setShowAlert(true);
    } finally {
      setIsLoading(false); // Desactivar el estado de carga
    }
  };

  return (
    <NavbarLayout navigation={navigation}>
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.container}>
          <CustomTitle>Actualización de Contraseña</CustomTitle>
          <View style={{ width: "90%", maxWidth: 400 }}>
            <CustomInput
              control={control}
              name="current_password"
              label="Contraseña actual"
              placeholder="Ingresa tu contraseña"
              error={errors.current_password}
              secureTextEntry={!showCurrentPassword}
              showPasswordToggle
              onTogglePassword={() =>
                setShowCurrentPassword(!showCurrentPassword)
              }
              style={styles.inputContainer}
            />
            <CustomInput
              control={control}
              name="new_password"
              label="Nueva contraseña"
              placeholder="Ingresa la nueva contraseña"
              error={errors.new_password}
              secureTextEntry={!showNewPassword}
              showPasswordToggle
              onTogglePassword={() => setShowNewPassword(!showNewPassword)}
              style={styles.inputContainer}
            />
            <CustomInput
              control={control}
              name="confirm_password"
              label="Confirmar contraseña nueva"
              placeholder="Confirma la contraseña nueva"
              error={errors.confirm_password}
              secureTextEntry={!showConfirmPassword}
              showPasswordToggle
              onTogglePassword={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
              style={styles.inputContainer}
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
            title={isLoading ? "CARGANDO..." : "Actualizar"}
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
          />
        </View>
      </ScrollView>

      {/* AlertCustom */}
      <AlertCustom
        visible={showAlert}
        type={alertType}
        title={alertType === "success" ? "¡ÉXITO!" : "ERROR"}
        message={alertMessage}
        buttons={[
          {
            text: "ENTENDIDO",
            onPress: () => setShowAlert(false),
          },
        ]}
        onClose={() => setShowAlert(false)}
      />
    </NavbarLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "white",
    alignItems: "center",
    paddingVertical: 22,
    paddingHorizontal: 18,
    width: "100%",
  },
  subtitle: {
    fontSize: 16,
    color: "#000000",
    textAlign: "left",
    marginBottom: 30,
    lineHeight: 24,
  },
  inputContainer: {
    width: "100%",
  },
  safeArea: {
    flex: 1,
    backgroundColor: "white",
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 20,
  },
});
