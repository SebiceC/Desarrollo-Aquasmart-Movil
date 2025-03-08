import React, { useState, useEffect } from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Alert,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigation } from "@react-navigation/native";
import { Image } from "react-native";
import { Picker } from "@react-native-picker/picker";

// Esquema de validación con Yup
const PreRegisterSchema = yup.object().shape({
  nombre: yup
  .string()
  .required("Campo obligatorio")
  .matches(/^[A-Za-zÁ-ÿ\s]+$/, "Solo se permiten letras y espacios") // Validación para solo letras y espacios
  .max(20, "Máximo 20 caracteres"),
  apellido: yup
    .string()
    .required("Campo obligatorio")
    .matches(/^[A-Za-zÁ-ÿ\s]+$/, "Solo se permiten letras y espacios") // Validación para solo letras y espacios
    .max(20, "Máximo 20 caracteres"),
  identificacion: yup
    .string()
    .matches(/^\d{6,12}$/, "Debe tener entre 6 y 12 dígitos")
    .required("Campo obligatorio"),
  direccion: yup
    .string()
    .max(30, "Máximo 30 caracteres")
    .required("Campo obligatorio"),
  telefono: yup
    .string()
    .required("Campo obligatorio")
    .matches(/^\d{7,13}$/, "Debe tener entre 7 y 13 dígitos"),
  email: yup
    .string()
    .email("Correo inválido")
    .max(50, "Máximo 50 caracteres")
    .required("Campo obligatorio"),
  Contraseña: yup
    .string()
    .min(8, "Mínimo 8 caracteres")
    .max(20, "Máximo 20 caracteres")
    .matches(/[A-Z]/, "Debe contener al menos una mayúscula")
    .matches(/[a-z]/, "Debe contener al menos una minúscula")
    .matches(/[0-9]/, "Debe contener al menos un número")
    .matches(
      /[!@#$%^&*()_+\-=\{}|\:;"'<>,.?/]/,
      "Debe contener un carácter especial"
    )
    .required("Campo obligatorio"),
  confirmarContraseña: yup
    .string()
    .oneOf([yup.ref("Contraseña"), null], "Las contraseñas no coinciden")
    .required("Campo obligatorio"),
  tipoIdentificacion: yup.string().required("Campo obligatorio"),
  tipoPersona: yup.string().required("Campo obligatorio"),
});

export default function PreRegisterScreen() {
  const navigation = useNavigation();
  const [selectedOption, setSelectedOption] = useState("opcion1"); // Estado para el selector
  const [showPassword, setShowPassword] = useState(false); // Estado para Contraseña
  const [showPasswordConfirmar, setShowPasswordConfirmar] = useState(false); // Estado para Confirmar Contraseña
  const [documentTypes, setDocumentTypes] = useState([]);
  const [personTypes, setPersonTypes] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [buttonColor, setButtonColor] = useState("#365486"); // Color inicial del botón
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(PreRegisterSchema),
  });

  useEffect(() => {
    async function fetchTypes() {
       try {
        const docRes = await fetch("http://127.0.0.1:8000/api/users/list-person-type");
         const personRes = await fetch("http://127.0.0.1:8000/api/users/list-document-type");
        const docData = await docRes.json();
         const personData = await personRes.json();
         setDocumentTypes(docData);
         setPersonTypes(personData);
       } catch (error) {
         console.error("Error al cargar los tipos de datos:", error);
       }
     }
     fetchTypes();
   }, []);

  const [alertStates, setAlertStates] = useState({
    nombre: false,
    apellido: false,
    identificacion: false,
    telefono: false,
    direccion: false,
    email: false,
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/users/pre-register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            document: data.identificacion,
            first_name: data.nombre,
            last_name: data.apellido,
            email: data.email,
            document_type: data.tipoIdentificacion,
            person_type: data.tipoPersona,
            phone: data.telefono,
            address: data.direccion,
            password: data.Contraseña,
          }),
        }
      );
      const result = await response.json();
      console.log("Respuesta del backend:", result);
      if (response.ok) {
        Alert.alert(
          "Registro exitoso",
          "El usuario ha sido pre-registrado exitosamente.",
          [{ text: "OK", onPress: () => navigation.navigate("Login") }]
        );
      } else {
        Alert.alert(
          "Error en el registro",
          result.message || "Hubo un problema en el pre-registro."
        );
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo conectar con el servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.logoContainer}>
        <Image
          source={require("../assets/img_M1/logo.png")}
          style={styles.logo}
        />
        <Text style={styles.aquaSmartText}>AquaSmart</Text>
      </View>

      <View style={styles.contenedorPrincipal}>
        <Text style={styles.titulo}>PRE REGISTRO</Text>

        <View style={styles.formulario}>
          {/* NOMBRE */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Nombres<Text style={{ color: "red" }}> *</Text>
            </Text>
            <Controller
              control={control}
              name="nombre"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="Ingresa tus nombres"
                  placeholderTextColor="#A0AEC0"
                  onChangeText={(text) => {
                    onChange(text); // Permitir que el usuario siga escribiendo
                    if (text.length > 20) {
                      setAlertStates((prevState) => ({
                        ...prevState,
                        nombre: true,
                      })); // Mostrar alerta para 'nombre' si se excede el límite
                    } else {
                      setAlertStates((prevState) => ({
                        ...prevState,
                        nombre: false,
                      })); // Ocultar alerta si está dentro del límite
                    }
                  }}
                  value={value}
                />
              )}
            />
            {errors.nombre && !alertStates.nombre && (
              <Text style={styles.error}>{errors.nombre.message}</Text>
            )}
            {alertStates.nombre && (
              <Text style={styles.error}>Máximo 20 caracteres permitidos.</Text>
            )}
          </View>
          {/* APELLIDO */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Apellidos<Text style={{ color: "red" }}> *</Text>
            </Text>
            <Controller
              control={control}
              name="apellido"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="Ingresa tus apellidos"
                  placeholderTextColor="#A0AEC0"
                  onChangeText={(text) => {
                    onChange(text);
                    if (text.length > 20) {
                      setAlertStates((prevState) => ({
                        ...prevState,
                        apellido: true,
                      }));
                    } else {
                      setAlertStates((prevState) => ({
                        ...prevState,
                        apellido: false,
                      }));
                    }
                  }}
                  value={value}
                />
              )}
            />
            {errors.apellido && !alertStates.apellido && (
              <Text style={styles.error}>{errors.apellido.message}</Text>
            )}
            {alertStates.apellido && (
              <Text style={styles.error}>Máximo 20 caracteres permitidos.</Text>
            )}
          </View>
          {/* TIPO IDENTIFICACION */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Selecciona el tipo de identificación
              <Text style={{ color: "red" }}> *</Text>
            </Text>
            <Controller
              control={control}
              name="tipoIdentificacion"
              render={({ field: { onChange, value } }) => (
                <View style={styles.pickerContainer}>
                  <Picker selectedValue={value} onValueChange={onChange}>
                    <Picker.Item label="Seleccione una opción" value="" />

                    <Picker.Item label="Cédula de ciudadanía (CC)" value="CC" />
                    <Picker.Item
                      label="Cédula de extranjería (CE)"
                      value="CE"
                    />
                    <Picker.Item
                      label="Permiso especial de permanencia (PEP)"
                      value="PEP"
                    />
                    <Picker.Item
                      label="Documento de identificación extranjero (DIE)"
                      value="DIE"
                    />
                  </Picker>
                </View>
              )}
            />
            {errors.tipoIdentificacion && (
              <Text style={styles.error}>
                {errors.tipoIdentificacion.message}
              </Text>
            )}
          </View>
          {/* IDENTIFICACION */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Identificación<Text style={{ color: "red" }}> *</Text>
            </Text>
            <Controller
              control={control}
              name="identificacion"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="Ingresa tu número de identificación"
                  placeholderTextColor="#A0AEC0"
                  keyboardType="numeric"
                  onChangeText={(text) => {
                    const numericText = text.replace(/[^0-9]/g, "");
                    onChange(numericText);
                    if (numericText.length > 15) {
                      setAlertStates((prevState) => ({
                        ...prevState,
                        identificacion: true,
                      }));
                    } else {
                      setAlertStates((prevState) => ({
                        ...prevState,
                        identificacion: false,
                      }));
                    }
                  }}
                  value={value}
                />
              )}
            />
            {errors.identificacion && !alertStates.identificacion && (
              <Text style={styles.error}>{errors.identificacion.message}</Text>
            )}
            {alertStates.identificacion && (
              <Text style={styles.error}>Máximo 15 caracteres permitidos.</Text>
            )}
          </View>
          {/* tIPO DE PERSONA */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Selecciona el tipo de persona
              <Text style={{ color: "red" }}> *</Text>
            </Text>
            <Controller
              control={control}
              name="tipoPersona"
              render={({ field: { onChange, value } }) => (
                <View style={styles.pickerContainer}>
                  <Picker selectedValue={value} onValueChange={onChange}>
                    <Picker.Item label="Seleccione una opción" value="" />
                    <Picker.Item
                      label="Persona Natural"
                      value="persona_natural"
                    />
                    <Picker.Item
                      label="Persona Jurídica"
                      value="persona_juridica"
                    />
                  </Picker>
                </View>
              )}
            />
            {errors.tipoPersona && (
              <Text style={styles.error}>{errors.tipoPersona.message}</Text>
            )}
          </View>
          {/* DIRECCION */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Dirección de residencia<Text style={{ color: "red" }}> *</Text>
            </Text>
            <Controller
              control={control}
              name="direccion"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="Ingresa tu dirección de residencia"
                  placeholderTextColor="#A0AEC0"
                  onChangeText={(text) => {
                    onChange(text); // Permitir que el usuario siga escribiendo
                    if (text.length > 30) {
                      setAlertStates((prevState) => ({
                        ...prevState,
                        direccion: true,
                      }));
                    } else {
                      setAlertStates((prevState) => ({
                        ...prevState,
                        direccion: false,
                      }));
                    }
                  }}
                  value={value}
                />
              )}
            />
            {errors.direccion && !alertStates.direccion && (
              <Text style={styles.error}>{errors.direccion.message}</Text>
            )}
            {alertStates.direccion && (
              <Text style={styles.error}>Máximo 30 caracteres permitidos.</Text>
            )}
          </View>
          {/* TELEFONO */}
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
                  placeholder="Ingresa tu número de teléfono"
                  placeholderTextColor="#A0AEC0"
                  keyboardType="numeric"
                  onChangeText={(text) => {
                    const numericText = text.replace(/[^0-9]/g, "");
                    onChange(numericText);
                    if (numericText.length > 13) {
                      setAlertStates((prevState) => ({
                        ...prevState,
                        telefono: true,
                      }));
                    } else {
                      setAlertStates((prevState) => ({
                        ...prevState,
                        telefono: false,
                      }));
                    }
                  }}
                  value={value}
                />
              )}
            />
            {errors.telefono && !alertStates.telefono && (
              <Text style={styles.error}>{errors.telefono.message}</Text>
            )}
            {alertStates.telefono && (
              <Text style={styles.error}>Máximo 13 caracteres permitidos.</Text>
            )}
          </View>
          {/* CORREO */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Correo electrónico<Text style={{ color: "red" }}> *</Text>
            </Text>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="Ingresa tu correo electrónico"
                  placeholderTextColor="#A0AEC0"
                  keyboardType="email-address"
                  onChangeText={(text) => {
                    onChange(text);
                    if (text.length > 50) {
                      setAlertStates((prevState) => ({
                        ...prevState,
                        email: true,
                      }));
                    } else {
                      setAlertStates((prevState) => ({
                        ...prevState,
                        email: false,
                      }));
                    }
                  }}
                  value={value}
                />
              )}
            />
            {errors.email && !alertStates.email && (
              <Text style={styles.error}>{errors.email.message}</Text>
            )}
            {alertStates.email && (
              <Text style={styles.error}>Máximo 50 caracteres permitidos.</Text>
            )}
          </View>

        </View>

        {/* CONTRASEÑA */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Contraseña<Text style={{ color: "red" }}> *</Text>
          </Text>
          <View style={styles.passwordInputContainer}>
            <Controller
              control={control}
              name="Contraseña"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="Ingresa la contraseña"
                  placeholderTextColor="#A0AEC0"
                  secureTextEntry={!showPassword} // Mostrar/Ocultar Contraseña
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
          {errors.Contraseña && (
            <Text style={styles.error}>{errors.Contraseña.message}</Text>
          )}
        </View>
        {/* CONFIRMAR CONTRASEÑA */}
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
                  secureTextEntry={!showPasswordConfirmar} // Mostrar/Ocultar Confirmar Contraseña
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
            <Text style={styles.error}>
              {errors.confirmarContraseña.message}
            </Text>
          )}
        </View>

        <Text style={styles.subtitle}>
          Anexe los siguientes documentos:
          {"\n"}
          {"\u2022"} Copia por ambas caras de la cédula.
          {"\n"}
          {"\u2022"} Copia del NIT (si es persona juridica).
          {"\n"}
          {"\u2022"} Copia del RUT.
          {"\n"}
          {"\u2022"} Copia del certificado de libertad y tradición.
        </Text>

        <TouchableOpacity
          style={[styles.boton, { backgroundColor: buttonColor }]}
          onPress={handleSubmit(onSubmit)}
          disabled={isLoading}
          onPressIn={() => setButtonColor("#42A5F5")}
          onPressOut={() => setButtonColor("#365486")}
        >
          <Text style={styles.botonTexto}>
            {isLoading ? "CARGANDO..." : "REGISTRAR"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = {
  pickerContainer: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 6,
  },
  container: {
    flexGrow: 1, // Esto asegura que el contenido se expanda si es necesario
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
    marginTop: 20, // Reducir el margen superior para acercar el contenedor más arriba
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
    marginBottom: 20,
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
