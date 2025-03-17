import React, { useState, useEffect } from "react";
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
import api from "../services/api";
import { Picker } from "@react-native-picker/picker";
import { AlertCustom } from "../components/AlertCustom";
import * as DocumentPicker from "expo-document-picker";
import CustomTitle from "../components/CustomTitle";
import CustomButton from '../components/CustomButtom';
import { LogoHeader } from "../components/LogoHeader";

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
    .matches(/^\d{6,15}$/, "Debe tener entre 6 y 15 dígitos")
    .required("Campo obligatorio"),
  direccion: yup
    .string()
    .max(35, "Máximo 35 caracteres")
    .required("Campo obligatorio"),
  telefono: yup
    .string()
    .required("Campo obligatorio")
    .matches(/^\d{10,13}$/, "Debe tener entre 10 y 13 dígitos"),
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
      /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/,
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
  const [showPassword, setShowPassword] = useState(false); // Estado para Contraseña
  const [showPasswordConfirmar, setShowPasswordConfirmar] = useState(false); // Estado para Confirmar Contraseña
  const [documentTypes, setDocumentTypes] = useState([]);
  const [personTypes, setPersonTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(PreRegisterSchema),
  });

  const [selectedFiles, setSelectedFiles] = useState([]); // Almacenar múltiples archivos

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        multiple: true,
      });

      if (!result.canceled) {
        if (selectedFiles.length + result.assets.length > 6) {
          alert("Solo puedes seleccionar hasta 6 archivos PDF.");
          return;
        }

        setSelectedFiles((prevFiles) => [...prevFiles, ...result.assets]);
      }
    } catch (error) {
      console.error("Error seleccionando archivos:", error);
    }
  };

  const removeFile = (index) => {
    setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const [alertStates, setAlertStates] = useState({
    nombre: false,
    apellido: false,
    identificacion: false,
    telefono: false,
    direccion: false,
    email: false,
  });

  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    type: "success",
    title: "",
    message: "",
    buttons: [],
  });

  useEffect(() => {
    async function fetchTypes() {
      try {
        const docRes = await api.get("/users/list-document-type");
        const personRes = await api.get("/users/list-person-type");

        const docData = docRes.data;
        const personData = personRes.data;

        console.log("Respuesta tipos de documento:", docData);
        console.log("Respuesta tipos de persona:", personData);

        setDocumentTypes(docData);
        setPersonTypes(personData);
      } catch (error) {
        console.error("Error al cargar los tipos de datos:", error);
      }
    }
    fetchTypes();
  }, []);

  const onSubmit = async (data) => {
    if (selectedFiles.length === 0) {
      setAlertConfig({
        visible: true,
        type: "info", 
        title: "Documentos requeridos",
        message: "Debe adjuntar al menos un documento PDF para completar el pre-registro.",
        buttons: [
          {
            text: "Entendido",
            onPress: () => {
              setAlertConfig((prev) => ({ ...prev, visible: false }));
            },
            style: { backgroundColor: "#365486" },
          },
        ],
      });
      return;
    }
    setIsLoading(true);
    try {
      const response = await api.post("/users/pre-register", {
        document: data.identificacion,
        first_name: data.nombre,
        last_name: data.apellido,
        email: data.email,
        document_type: data.tipoIdentificacion,
        person_type: data.tipoPersona,
        phone: data.telefono,
        address: data.direccion,
        password: data.Contraseña,
      });

      console.log("Respuesta completa:", response);

      const result = response.data;

      if (response.status === 200 || response.status === 201) {
        setAlertConfig({
          visible: true,
          type: "success",
          title: "¡Registro exitoso!",
          message: "El usuario ha sido pre-registrado exitosamente.",
          buttons: [
            {
              text: "Iniciar sesión",
              onPress: () => {
                setAlertConfig((prev) => ({ ...prev, visible: false }));
                navigation.navigate("Login");
              },
              style: { backgroundColor: "#365486" },
            },
          ],
        });
      } else {
        setAlertConfig({
          visible: true,
          type: "error",
          title: "Error en el registro",
          message: result.message || "Hubo un problema en el pre-registro.",
          buttons: [
            {
              text: "Reintentar",
              onPress: () => {
                setAlertConfig((prev) => ({ ...prev, visible: false }));
              },
              style: { backgroundColor: "#365486" },
            },
          ],
        });
      }
    } catch (error) {
      if (error.response?.status === 400) {
        const errorData = error.response.data;
        let errorMessage = "";

        if (errorData.document) {
          errorMessage += errorData.document[0] + "\n";
        }
        if (errorData.email) {
          errorMessage += errorData.email[0];
        }

        setAlertConfig({
          visible: true,
          type: "error",
          title: "Error en el registro",
          message: errorMessage.trim(),
          buttons: [
            {
              text: "Entendido",
              onPress: () => {
                setAlertConfig((prev) => ({ ...prev, visible: false }));
              },
              style: { backgroundColor: "#365486" },
            },
          ],
        });
      } else {
        setAlertConfig({
          visible: true,
          type: "error",
          title: "Error de conexión",
          message: "No se pudo conectar con el servidor.",
          buttons: [
            {
              text: "Entendido",
              onPress: () => {
                setAlertConfig((prev) => ({ ...prev, visible: false }));
              },
              style: { backgroundColor: "#365486" },
            },
          ],
        });
      }
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
<LogoHeader />
      <AlertCustom
        visible={alertConfig.visible}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onClose={() => setAlertConfig((prev) => ({ ...prev, visible: false }))}
      />

      <View style={styles.contenedorPrincipal}>
        <CustomTitle>PRE REGISTRO</CustomTitle>
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
                  maxLength={20}
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
                  maxLength={20}
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
                    {personTypes.length > 0 ? (
                      personTypes.map((person) => (
                        <Picker.Item
                          key={person.personTypeId}
                          label={person.typeName}
                          value={person.personTypeId}
                        />
                      ))
                    ) : (
                      <Picker.Item label="No hay datos" value="" />
                    )}
                  </Picker>
                </View>
              )}
            />
            {errors.tipoPersona && (
              <Text style={styles.error}>{errors.tipoPersona.message}</Text>
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
                    {documentTypes.length > 0 ? (
                      documentTypes.map((doc) => (
                        <Picker.Item
                          key={doc.documentTypeId}
                          label={doc.typeName}
                          value={doc.documentTypeId}
                        />
                      ))
                    ) : (
                      <Picker.Item label="No hay datos" value="" />
                    )}
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
                  maxLength={20}
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
                    if (text.length > 35) {
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
                  maxLength={35}
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
                  maxLength={15}
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
                  maxLength={50}
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
                  maxLength={20}
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
                  maxLength={20}
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
          Anexe los siguientes documentos en formato PDF:
          {"\n"}
          {"\u2022"} Copia por ambas caras de la cédula.
          {"\n"}
          {"\u2022"} Copia del NIT (si es persona juridica).
          {"\n"}
          {"\u2022"} Copia del RUT.
          {"\n"}
          {"\u2022"} Copia del certificado de libertad y tradición.
        </Text>
        <View>
          {selectedFiles.length > 0 && (
            <View style={styles.fileList}>
              {selectedFiles.map((file, index) => (
                <View key={index} style={styles.fileItem}>
                  <Text style={styles.fileName}>{file.name}</Text>
                  <TouchableOpacity onPress={() => removeFile(index)}>
                    <Text style={styles.removeButton}>X</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
          <View style={styles.botonContainer}>
            <CustomButton
              title="Seleccionar archivos"
              onPress={pickDocument}
              variant="primary"
              style={{ width: "48%" }} // Ajustar el ancho del botón
            />

            <CustomButton
              title={isLoading ? "CARGANDO..." : "REGISTRAR"}
              onPress={handleSubmit(onSubmit)}
              variant="primary"
              disabled={isLoading}
              isLoading={isLoading}
              style={{ width: "48%" }} // Ajustar el ancho del botón
            />
          </View>
        </View>
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
  fileList: {
    marginTop: 10,
  },
  fileItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 5,
  },
  fileName: {
    flex: 1,
    fontSize: 14,
  },
  removeButton: {
    color: "red",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
  botonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    gap: 10, // Espacio entre los botones
  },
};
