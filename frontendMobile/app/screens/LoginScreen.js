import { useState } from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  Alert,
  View,
  TextInput,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigation } from "@react-navigation/native";
import { login } from "../services/authService";

const loginSchema = yup.object().shape({
  document: yup
    .string()
    .matches(/^\d{6,12}$/, "Cédula inválida")
    .required("Campo obligatorio"),
  password: yup.string().required("Campo obligatorio"),
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

  const onSubmit = async (data) => {
    console.log("[Login] Datos enviados:", data);
    setIsLoading(true);

    try {
      const response = await login(data);
      console.log("[Login] Respuesta del backend:", response);

      if (response.document) {
        navigation.navigate("TokenValidationScreen", {
          document: response.document,
          phone: response.phone,
        });
      } else {
        Alert.alert(
          "Error",
          response.data.message || "Credenciales incorrectas"
        );
      }
    } catch (error) {
      console.error("[Login] Error completo:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Error de conexión"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.contenedorPrincipal}>
        <Text style={styles.titulo}>INICIO DE SESIÓN</Text>

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
          <TouchableOpacity onPress={() => navigation.navigate("Register")}>
            <Text style={styles.enlace}>SOY USUARIO NUEVO</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.boton}
          onPress={handleSubmit(onSubmit)}
          disabled={isLoading}
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
    backgroundColor: "#b7e1e7",
    borderColor: "#7aa6c4",
    borderRadius: 20,
    padding: 25,
    elevation: 5,
  },
  titulo: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2D3748",
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
    color: "#4A5568",
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
    backgroundColor: "#4299E1",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
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
};
