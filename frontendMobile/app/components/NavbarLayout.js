import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const NavbarLayout = ({ children, navigation }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuOptions = [
    {
      icon: "person",
      title: "Mi Perfil",
      action: () => navigation.navigate("Home"),
    },
    { icon: "devices", title: "Control IoT" },
    { icon: "history", title: "Historial de consumo" },
    { icon: "assessment", title: "Reportes" },
    { icon: "receipt", title: "Mis facturas" },
    { icon: "timeline", title: "Predicción" },
    { icon: "security", title: "Seguridad" },

    // Ítems reordenados abajo
    {
      icon: "help-outline",
      title: "Manual de usuario y soporte",
      separator: true, // Añade separador visual
    },
    {
      icon: "exit-to-app",
      title: "Cerrar sesión",
      color: "#FF3B30", // Color distintivo
      action: () => logout(), // Función de logout
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header con menú */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setIsMenuOpen(!isMenuOpen)}>
          <MaterialIcons name="menu" size={28} color="#2D5B7B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AquaSmart</Text>
        <View style={{ width: 28 }} /> {/* Espacio equilibrado */}
      </View>

      {/* Menú desplegable */}
      {isMenuOpen && (
        <View style={styles.menuContainer}>
          {menuOptions.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.menuItem, item.separator && styles.separatorTop]}
              onPress={item.action || (() => navigation.navigate(item.title))}
            >
              <MaterialIcons
                name={item.icon}
                size={24}
                color={item.color || "#2D5B7B"}
              />
              <Text
                style={[styles.menuText, item.color && { color: item.color }]}
              >
                {item.title}
              </Text>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    backgroundColor: "white",
    elevation: 3,
    zIndex: 1000,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2D5B7B",
  },
  menuContainer: {
    position: "absolute",
    top: 60,
    left: 16,
    right: 16,
    backgroundColor: "white",
    borderRadius: 12,
    elevation: 5,
    zIndex: 1001,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  menuText: {
    fontSize: 16,
    color: "#444",
    marginLeft: 15,
  },
  contentContainer: {
    flex: 1,
    padding: 20,
    zIndex: 1,
  },
  separatorTop: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    marginTop: 8
  },
});

export default NavbarLayout;
