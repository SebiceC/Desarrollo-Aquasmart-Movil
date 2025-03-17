import React from "react";
import { Text, StyleSheet } from "react-native";

const CustomTitle = ({ children, style }) => {
  return <Text style={[styles.titulo, style]}>{children}</Text>;
};

const styles = StyleSheet.create({
  titulo: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000000",
    textAlign: "center",
    marginBottom: 40,
    textTransform: "uppercase",
  },
});

export default CustomTitle;