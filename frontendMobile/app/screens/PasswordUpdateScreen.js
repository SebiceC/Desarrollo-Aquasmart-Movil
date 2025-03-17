import React, { useEffect, useState } from "react";
import { SafeAreaView, StyleSheet, Text, View, ScrollView } from "react-native";
import NavbarLayout from "../components/NavbarLayout";
import * as yup from "yup";
import api from "../services/api";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { CustomInput } from "../components/CustomInput";
import { CustomButton } from "../components/CustomButtom";
import { AlertCustom } from "../components/AlertCustom";

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
  } = useForm({
    resolver: yupResolver(PasswordUpdateSchema),
    defaultValues: { document: "", password: "" },
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showAlert, setShowAlert] = useState(false); // Controla la visibilidad de la alerta
  const [alertType, setAlertType] = useState("info"); // Tipo de alerta ('error' o 'success')
  const [alertMessage, setAlertMessage] = useState(""); // Mensaje de la alerta

  const onSubmit = async (data) => {
    try {
      const response = await api.post("/users/change-password", {
        current_password: data.current_password,
        new_password: data.new_password,
        confirm_password: data.confirm_password,
      });

      console.log("[Cambio de contraseña] Respuesta del backend:", response);

      if (response.status === 200) {
        // Mostrar alerta de éxito
        setAlertType("success");
        setAlertMessage("Contraseña actualizada con éxito");
        setShowAlert(true);
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
        setShowAlert(true);
      } else {
        // Mostrar alerta de error genérico
        setAlertType("error");
        setAlertMessage("Error desconocido. Intente nuevamente.");
        setShowAlert(true);
      }
    }
  };

  return (
    <NavbarLayout navigation={navigation}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.headerTitle}>Actualización de Contraseña</Text>
        <View style={styles.separator} />
        <View style={styles.profileContainer}>
          <CustomInput
            control={control}
            name="current_password"
            label="Contraseña actual"
            placeholder="Ingresa tu contraseña"
            error={errors.current_password}
            secureTextEntry={!showPassword}
            showPasswordToggle
            onTogglePassword={() => setShowPassword(!showPassword)}
          />
          <CustomInput
            control={control}
            name="new_password"
            label="Nueva contraseña"
            placeholder="Ingresa la nueva contraseña"
            error={errors.new_password}
            secureTextEntry={!showPassword}
            showPasswordToggle
            onTogglePassword={() => setShowPassword(!showPassword)}
          />
          <CustomInput
            control={control}
            name="confirm_password"
            label="Confirmar contraseña nueva"
            placeholder="Confirma la contraseña nueva"
            error={errors.confirm_password}
            secureTextEntry={!showPassword}
            showPasswordToggle
            onTogglePassword={() => setShowPassword(!showPassword)}
          />
          <CustomButton title={"Actualizar"} onPress={handleSubmit(onSubmit)} />
        </View>

        <AlertCustom
          visible={showAlert}
          type={alertType}
          message={alertMessage}
          buttons={[
            {
              text: "ENTENDIDO",
              onPress: () => setShowAlert(false),
            },
          ]}
          showCloseButton={true}
          onClose={() => setShowAlert(false)}
        />
      </ScrollView>
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
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 8,
  },
  separator: {
    width: "80%",
    height: 1,
    backgroundColor: "#CCC",
    marginBottom: 20,
  },
  profileContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 24,
    width: "100%",
    alignItems: "center",
    elevation: 5,
    gap: 10,
  },
  profileImage: {
    width: 180,
    height: 180,
    borderRadius: 60,
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },
  userId: {
    fontSize: 23,
    color: "#666",
    marginBottom: 16,
    marginVertical: 5,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25, // Antes era 18, ahora es 25 para mayor separación
    width: "100%",
    justifyContent: "flex-start",
    paddingLeft: 60,
  },
  infoText: {
    fontSize: 18,
    color: "#000000",
    marginLeft: 10,
    textAlign: "left",
    flex: 1,
    marginTop: 5,
  },
  editButton: {
    backgroundColor: "#003F88",
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 25,
    marginTop: 30,
  },
  editText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 18,
    marginTop: 10,
    textAlign: "center",
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
