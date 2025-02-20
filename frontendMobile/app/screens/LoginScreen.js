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

// Esquema de validación
const loginSchema = yup.object().shape({
  document: yup
    .string()
    .matches(/^\d{1,12}$/, "Cédula inválida")
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

  const onSubmit = async (data) => {
    console.log("Datos enviados", data);
    setIsLoading(true);
    try {
      const response = await login(data); // Llamada al backend
      console.log("Servidor:", response);
      if (response.document) {
        Alert.alert("Message", response.message);
      } else {
        Alert.alert("Error", "Credenciales incorrectas");
      }
    } catch (error) {
      console.error("Error completo:", error);
      Alert.alert("Error", error.message);
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
        {/* Título */}
        <Text style={styles.titulo}>INICIO DE SESIÓN</Text>
        <View style={styles.formulario}>
          {/* Campo Cédula */}
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
                  placeholder="Ingressa tu Cedula de Ciudadanía"
                  placeholderTextColor="#A0AEC0"
                  keyboardType="numeric"
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            {errors.cedula && (
              <Text style={styles.error}>{errors.cedula.message}</Text>
            )}
          </View>

          {/* Campo Contraseña */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Contraseña<Text style={{ color: "red" }}> *</Text>
            </Text>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="Ingressa tu contraseña"
                  placeholderTextColor="#A0AEC0"
                  secureTextEntry
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            {errors.password && (
              <Text style={styles.error}>{errors.password.message}</Text>
            )}
          </View>
        </View>

        {/* Enlaces */}
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

        {/* Botón */}
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

// Estilos
const styles = {
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: "#dcf2f1", // Fondo azul general
    padding: 20,
  },
  contenedorPrincipal: {
    backgroundColor: "#b7e1e7",
    borderColor: "#7aa6c4",
    borderRadius: 20, // Bordes redondeados
    padding: 25,
    elevation: 5,
  },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    backgroundColor: "#dcf2f1",
    padding: 24,
  },
  titulo: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2D3748",
    textAlign: "center",
    marginBottom: 40,
    textTransform: "uppercase",
    letterSpacing: 0.5,
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
    fontSize: 10,
    fontWeight: "600",
    textAlign: "center",
    textDecorationLine: "underline",
  },
};
