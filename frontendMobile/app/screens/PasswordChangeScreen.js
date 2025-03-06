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

const PasswordChangeSchema = yup.object().shape({
  document: yup
    .string()
    .matches(/^\d{6,12}$/, "Cédula inválida")
    .required("Campo obligatorio"),
  nuevaContraseña: yup
    .string()
    .min(8, "Mínimo 8 caracteres")
    .max(20, "Máximo 20 caracteres")
    .matches(/[A-Z]/, "Debe contener al menos una letra mayúscula")
    .matches(/[a-z]/, "Debe contener al menos una letra minúscula")
    .matches(/[0-9]/, "Debe contener al menos un número")
    .matches(/[! @ # $ % ^ & * ( ) _ + - = { } | \ : ; " ' < > , . ? /]/, "Debe contener al menos un carácter especial")
    .required("Campo obligatorio"),
  confirmarContraseña: yup
    .string()
    .oneOf([yup.ref("nuevaContraseña"), null], "Las contraseñas no coinciden")
    .required("Campo obligatorio"),
});

export default function PasswordChangeScreen() {
  const navigation = useNavigation();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(PasswordChangeSchema),
  });

  const [isLoading, setIsLoading] = useState(false);
  const [buttonColor, setButtonColor] = useState("#365486"); 
  const [showPasswordNueva, setShowPasswordNueva] = useState(false); 
  const [showPasswordConfirmar, setShowPasswordConfirmar] = useState(false); 

  const onSubmit = async (data) => {
    console.log("[PasswordChange] Datos enviados:", data);
    setIsLoading(true);

    try {
      const response = await api.post("/users/reset-password", {
        document: route.params.document,
        new_password: data.nuevaContraseña
      });
      
      console.log("[PasswordChange] Respuesta del backend:", response);

      if (response.document) {
        navigation.navigate("TokenValidationScreen", {
          document: response.document,
          phone: response.phone,
        });
      } else {
        console.log("Error al cambiar la contraseña");
      }
    } catch (error) {
      console.error("[PasswordChange] Error completo:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.logoContainer}>
        <Image
          source={require('../assets/img_M1/logo.png')}
          style={styles.logo}
        />
        <Text style={styles.aquaSmartText}>AquaSmart</Text>
      </View>

      <View style={styles.contenedorPrincipal}>
        <Text style={styles.titulo}>CAMBIO DE CONTRASEÑA</Text>

        <View style={styles.formulario}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Nueva contraseña<Text style={{ color: "red" }}> *</Text>
            </Text>
            <View style={styles.passwordInputContainer}>
              <Controller
                control={control}
                name="nuevaContraseña"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={styles.input}
                    placeholder="Ingresa la nueva contraseña"
                    placeholderTextColor="#A0AEC0"
                    secureTextEntry={!showPasswordNueva}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              <TouchableOpacity
                style={styles.toggleButton}
                onPress={() => setShowPasswordNueva(!showPasswordNueva)}
              >
                <Text style={styles.toggleText}>
                  {showPasswordNueva ? "Ocultar" : "Mostrar"}
                </Text>
              </TouchableOpacity>
            </View>
            {errors.nuevaContraseña && (
              <Text style={styles.error}>{errors.nuevaContraseña.message}</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Confirmar contraseña<Text style={{ color: "red" }}> *</Text>
            </Text>
            <View style={styles.passwordInputContainer}>
              <Controller
                control={control}
                name="confirmarContraseña"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={styles.input}
                    placeholder="Confirma la contraseña"
                    placeholderTextColor="#A0AEC0"
                    secureTextEntry={!showPasswordConfirmar}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              <TouchableOpacity
                style={styles.toggleButton}
                onPress={() => setShowPasswordConfirmar(!showPasswordConfirmar)}
              >
                <Text style={styles.toggleText}>
                  {showPasswordConfirmar ? "Ocultar" : "Mostrar"}
                </Text>
              </TouchableOpacity>
            </View>
            {errors.confirmarContraseña && (
              <Text style={styles.error}>{errors.confirmarContraseña.message}</Text>
            )}
          </View>
        </View>

        <Text style={styles.subtitle}>
          {'\u2022'} Máximo 20 caracteres, mínimo 8 caracteres.
          {'\n'}
          {'\u2022'} Al menos una letra mayúscula.
          {'\n'}
          {'\u2022'} Al menos una letra minúscula.
          {'\n'}
          {'\u2022'} Al menos un número.
          {'\n'}
          {'\u2022'} Al menos un carácter especial (como @, #, $, etc.).
        </Text>

        <TouchableOpacity
          style={[styles.boton, { backgroundColor: buttonColor }]}
          onPress={handleSubmit(onSubmit)}
          disabled={isLoading}
          onPressIn={() => setButtonColor("#42A5F5")}
          onPressOut={() => setButtonColor("#365486")}
        >
          <Text style={styles.botonTexto}>
            {isLoading ? "CARGANDO..." : "GUARDAR CONTRASEÑA"}
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
    color: "#000000",
    textAlign: "left", // Asegura que el texto esté alineado a la izquierda
    marginBottom: 30,
    lineHeight: 24, // Ajusta el espaciado entre las líneas
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
  passwordInputContainer: {
    position: "relative",
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
};
