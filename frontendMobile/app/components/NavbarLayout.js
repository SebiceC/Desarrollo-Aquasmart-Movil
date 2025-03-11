import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import api from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "react-native";

export const logout = async (navigation) => {
  try {
    await api.post("/users/logout");
    await AsyncStorage.removeItem("authToken");
    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  } catch (error) {
    console.error("[Logout] Error:", error);
    throw new Error("Error al cerrar sesión");
  }
};

const NavbarLayout = ({ children, navigation }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuOptions = [
    {
      icon: "person",
      title: "Mi Perfil",
      action: () => navigation.navigate("Home"),
    },
    {
      icon: "devices",
      title: "Control IoT",
      action: () => navigation.navigate("ControlIoT"),
    },
    {
      icon: "history",
      title: "Historial de consumo",
      action: () => navigation.navigate("HistorialConsumo"),
    },
    {
      icon: "assessment",
      title: "Reportes",
      action: () => navigation.navigate("Reportes"),
    },
    {
      icon: "receipt",
      title: "Mis facturas",
      action: () => navigation.navigate("MisFacturas"),
    },
    {
      icon: "timeline",
      title: "Predicción",
      action: () => navigation.navigate("Prediccion"),
    },
    {
      icon: "security",
      title: "Seguridad",
      action: () => navigation.navigate("Seguridad"),
    },
    {
      icon: "help-outline",
      title: "Manual de usuario y soporte",
      separator: true,
      action: () => navigation.navigate("Soporte"),
    },
    {
      icon: "exit-to-app",
      title: "Cerrar sesión",
      color: "#FF3B30",
      action: async () => {
        try {
          await logout(navigation);
        } catch (error) {
          Alert.alert("Error", "No se pudo cerrar sesión");
        }
      },
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header con menú */}
      <View style={styles.header}>
        {/* Logo y texto centrados */}
        <View style={styles.logoContainer}>
          <Image
            source={require("../assets/img_M1/logo.png")}
            style={styles.logo}
          />
          <Text style={styles.aquaSmartText}>AquaSmart</Text>
        </View>

        {/* Botón de menú posicionado a la derecha */}
        <TouchableOpacity
          onPress={() => setIsMenuOpen(!isMenuOpen)}
          style={styles.menuButton}
        >
          <MaterialIcons name="menu" size={36} color="#000" />
        </TouchableOpacity>
      </View>

      {isMenuOpen && (
        <View style={styles.menuContainer}>
          {/* Opciones del menú */}
          {menuOptions.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.menuItem,
                item.title === "Mi Perfil" && { paddingVertical: 15 },
                (index === 1 || item.separator) && styles.separatorTop,
              ]}
              onPress={item.action || (() => navigation.navigate(item.title))}
            >
              {/* Contenedor para alinear ícono, texto y la "X" */}
              <View style={styles.profileContainer}>
                <MaterialIcons
                  name={item.icon}
                  size={item.title === "Mi Perfil" ? 40 : 24}
                  color={item.color || "#000"}
                  style={styles.menuIcon}
                />
                <Text
                  style={[
                    styles.menuText,
                    item.title === "Mi Perfil" && { fontSize: 30 },
                  ]}
                >
                  {item.title}
                </Text>
              </View>

              {/* Botón de cerrar (solo en "Mi Perfil") */}
              {item.title === "Mi Perfil" && (
                <TouchableOpacity onPress={() => setIsMenuOpen(false)}>
                  <MaterialIcons name="close" size={40} color="#000" />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Contenido principal */}
      <View style={styles.contentContainer}>{children}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F9FF",
  },
  menuContainer: {
    position: "absolute",
    top: 0,
    right: 0, // Posiciona la navbar a la derecha
    width: "90%", // Ajusta el ancho
    height: "100%", // Ocupa toda la pantalla en altura
    backgroundColor: "#DCF2F1", // Color de fondo de la navbar
    borderLeftWidth: 2, // Grosor del borde izquierdo
    borderColor: "#003F88", // Color azul del borde
    borderTopLeftRadius: 20, // Bordes redondeados en la esquina superior izquierda
    borderBottomLeftRadius: 20, // Bordes redondeados en la esquina inferior izquierda
    elevation: 5,
    zIndex: 1001,
    paddingTop: 60, // Espacio en la parte superior para evitar que el contenido choque con el header
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
    paddingLeft: 50,
  },
  menuText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000000",
    marginLeft: 10,
  },
  separatorTop: {
    borderTopWidth: 3,
    borderTopColor: "#CCCCCC",
    marginTop: 33,
  },
  contentContainer: {
    flex: 1,
    padding: 20,
    zIndex: 1,
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1, // Para que ocupe el espacio disponible y la "X" se alinee a la derecha
    justifyContent: "flex-start",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center", // Centra el contenido
    paddingVertical: 25, // Aumenta la altura del header
    paddingHorizontal: 15,
    backgroundColor: "#DCF2F1", // Fondo azul claro
    elevation: 3,
    position: "relative",
    minHeight: 70, // Asegura que el grosor sea mayor
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 50,
    height: 50,
    marginRight: 20, // Aumenta separación entre logo y texto
  },
  aquaSmartText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000000",
  },
  menuButton: {
    position: "absolute",
    right: 15, // Fija el botón a la derecha
    padding: 10, // Aumenta el área táctil
  },
  menuIcon: {
    marginRight: 15, // Agrega espacio entre el ícono y el texto
  },
});

export default NavbarLayout;
