import React, { useState, useEffect } from "react";
import { View, Text, TextInput, StyleSheet, ScrollView } from "react-native";
import { AlertCustom } from "../components/AlertCustom";
import { CustomButton } from "../components/CustomButtom";
import NavbarLayout from "../components/NavbarLayout";
import api from "../services/api";
import * as yup from "yup";

// Esquema de validación
const validationSchema = yup.object().shape({
  phone: yup
    .string()
    .required("Teléfono es requerido")
    .matches(/^[0-9]+$/, "Solo debe contener números")
    .max(10, "Máximo 10 caracteres"),
  email: yup
    .string()
    .required("Correo es requerido")
    .email("Correo inválido")
    .max(50, "Máximo 50 caracteres"),
});

export default function EditProfileScreen({ navigation, route }) {
  const [formData, setFormData] = useState({
    phone: "",
    email: "",
  });
  const [userData, setUserData] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({});

  useEffect(() => {
    if (route.params?.userData) {
      setUserData(route.params.userData);
      setFormData({
        phone: route.params.userData.phone,
        email: route.params.userData.email,
      });
    }
  }, [route.params]);

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Limpiar errores al editar
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async () => {
    try {
      await validationSchema.validate(formData, { abortEarly: false });
      setLoading(true);

      console.log("Enviando datos:", formData);

      const updateData = {
        email: formData.email,
        phone: formData.phone,
      };

      const response = await api.patch("/users/profile/update", updateData);
      console.log("Respuesta API:", response.data);

      setAlertConfig({
        type: "info",
        title: "Actualización exitosa",
        message: response.data.message || "Datos actualizados correctamente",
        buttons: [
          {
            text: "Entendido",
            onPress: () => {
              setAlertVisible(false);
              navigation.navigate("Home", {
                userData: response.data.user,
              });
            },
          },
        ],
      });
      setAlertVisible(true);
    } catch (error) {
      console.error("Error detallado:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      let errorMessage = "Error al guardar los cambios";

      if (error.response) {
        // Error de respuesta del servidor
        switch (error.response.status) {
          case 404:
            errorMessage = "Ruta no encontrada. Contacta al administrador";
            break;
          case 401:
            errorMessage = "No autorizado. Por favor inicia sesión nuevamente";
            break;
          case 400:
            if (
              error.response.data.message &&
              error.response.data.message.includes("límite")
            ) {
              setAlertConfig({
                type: "error",
                title: "¡Error!",
                message: error.response.data.message,
                buttons: [
                  { text: "Entendido", onPress: () => setAlertVisible(false) },
                ],
              });
              setAlertVisible(true);
              return;
            }
            errorMessage =
              error.response.data.message ||
              "Has alcanzado el límite de 3 actualizaciones esta semana. Podrás actualizar nuevamente la próxima semana";
            break;
          default:
            errorMessage = "Error del servidor. Intenta más tarde";
        }
      }

      setAlertConfig({
        type: "error",
        title: "¡Error!",
        message: errorMessage,
        buttons: [{ text: "Entendido", onPress: () => setAlertVisible(false) }],
      });
      setAlertVisible(true);
    } finally {
      setLoading(false);
    }
  };

  if (!userData) return null;
  return (
    <NavbarLayout navigation={navigation}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <Text style={styles.title}>Mis datos</Text>

          {/* Campos no editables */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Nombre</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={userData.firstName}
              editable={false}
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Apellido</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={userData.lastName}
              editable={false}
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Cédula</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={userData.document}
              editable={false}
            />
          </View>

          {/* Campo editable: Teléfono */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Teléfono</Text>
            <TextInput
              style={[styles.input, errors.phone && styles.errorInput]}
              value={formData.phone}
              onChangeText={(value) => handleChange("phone", value)}
              keyboardType="phone-pad"
              maxLength={10}
            />
            {errors.phone && (
              <Text style={styles.errorText}>{errors.phone}</Text>
            )}
          </View>

          {/* Campo de email */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Correo electrónico</Text>
            <TextInput
              style={[styles.input, errors.email && styles.errorInput]}
              value={formData.email}
              onChangeText={(value) => handleChange("email", value)}
              keyboardType="email-address"
              autoCapitalize="none"
              maxLength={50}
            />
            {errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}
          </View>

          {/* Botones con componentes reutilizables */}
          <View style={styles.buttonContainer}>
            <CustomButton
              title={loading ? "Guardando..." : "Guardar"}
              onPress={handleSubmit}
              isLoading={loading}
              disabled={loading}
            />

            <CustomButton
              title="Salir"
              variant="secondary"
              onPress={() => navigation.goBack()}
              style={styles.cancelButton}
            />
          </View>
        </View>
      </ScrollView>

      <AlertCustom
        visible={alertVisible}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onClose={() => setAlertVisible(false)}
      />
    </NavbarLayout>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    margin: 20,
    borderWidth: 1,
    borderColor: "#003F88",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000000",
    textAlign: "center",
    marginVertical: 20,
  },
  fieldContainer: {
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    color: "#666",
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#003F88",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#000",
    backgroundColor: "#FFFFFF",
  },
  disabledInput: {
    backgroundColor: "#FFFFFF",
    borderColor: "#DDD",
    color: "#999",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 30,
    gap: 15,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButton: {
    backgroundColor: "#003F88",
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#FF3B30",
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  errorInput: {
    borderColor: "#FF3B30",
    backgroundColor: "#FFEBEE",
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 12,
    marginTop: 4,
  },
});
