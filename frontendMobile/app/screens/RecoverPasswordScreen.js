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

const RecoverPasswordSchema = yup.object().shape({
  document: yup
    .string()
    .matches(/^\d{6,12}$/, "Cédula inválida")
    .required("Campo obligatorio"),
  telefono: yup.string().required("Campo obligatorio"),
});

export default function RecoverPasswordScreen() {
  const navigation = useNavigation();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(RecoverPasswordSchema),
  });

  const [isLoading, setIsLoading] = useState(false);
  const [buttonColor, setButtonColor] = useState("#365486"); // Color inicial del botón

  // Función que se ejecuta al enviar el formulario
  const onSubmit = async (data) => {
    console.log("[RecoverPassword] Datos enviados:", data);
    setIsLoading(true);

    try {
      // Llamada a la función para recuperar la contraseña (esto debería ser una función definida)
      const response = await RecoverPassword(data);
      console.log("[RecoverPassword] Respuesta del backend:", response);

      if (response.document) {
        navigation.navigate("TokenValidationScreen", {
          document: response.document,
          phone: response.phone,
        });
      } else {
        console.log("Error al recuperar contraseña");
      }
    } catch (error) {
      console.error("[RecoverPassword] Error completo:", error);
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
        <Text style={styles.titulo}>RECUPERACIÓN DE CONTRASEÑA</Text>
        <Text style={styles.subtitle}>
          Introduce tu cédula de ciudadanía y teléfono, para solicitar un token y recuperar tu contraseña.
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
            {errors.document && <Text style={styles.error}>{errors.document.message}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Teléfono<Text style={{ color: "red" }}> *</Text>
            </Text>
            <Controller
              control={control}
              name="telefono"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="Ingresa tu teléfono"
                  placeholderTextColor="#A0AEC0"
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            {errors.telefono && <Text style={styles.error}>{errors.telefono.message}</Text>}
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
};
