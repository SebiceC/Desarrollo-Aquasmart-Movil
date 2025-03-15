import React from "react";
import { View, Image, Text, StyleSheet } from "react-native";

export const LogoHeader = () => (
  <View style={styles.logoContainer}>
    <Image source={require("../assets/img_M1/logo.png")} style={styles.logo} />
    <Text style={styles.aquaSmartText}>AquaSmart</Text>
  </View>
);

const styles = StyleSheet.create({
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
});
