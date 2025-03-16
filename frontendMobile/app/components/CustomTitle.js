import React from "react";
import { Text, StyleSheet } from "react-native";

const CustomTitle = ({ children }) => {
  return <Text style={styles.titulo}>{children}</Text>;
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