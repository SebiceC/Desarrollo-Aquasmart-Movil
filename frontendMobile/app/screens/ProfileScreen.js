import React, { useEffect, useState } from "react";
import {
  ScrollView,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import NavbarLayout from "../components/NavbarLayout";
import api from "../services/api";
import { Image } from "react-native";
import CustomTitle from "../components/CustomTitle";
import CustomButton from "../components/CustomButtom";

export default function ProfileScreen({ navigation }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await api.get("/users/profile");
        console.log("[Profile] Datos recibidos:", response.data);

        const mappedData = {
          document: response.data.document,
          firstName: response.data.first_name,
          lastName: response.data.last_name,
          personType: response.data.person_type_name,
          phone: response.data.phone,
          email: response.data.email,
        };

        setUserData(mappedData);
      } catch (error) {
        console.error("[Profile] Error fetching data:", error);
        setError(error.response?.data?.detail || "Error cargando perfil");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  if (loading) {
    return (
      <NavbarLayout navigation={navigation}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2D5B7B" />
        </View>
      </NavbarLayout>
    );
  }

  if (error) {
    return (
      <NavbarLayout navigation={navigation}>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={40} color="#FF3B30" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </NavbarLayout>
    );
  }

  return (
    <NavbarLayout navigation={navigation}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <CustomTitle style={{ fontSize: 32 }}>Mi perfil</CustomTitle>{" "}
        <View style={styles.separator} />
        <View style={styles.profileContainer}>
          <Image
            source={require("../assets/img_M1/icon-profile.png")}
            style={styles.profileImage}
          />
          <Text style={styles.userName}>
            {userData.firstName} {userData.lastName}
          </Text>
          <Text style={styles.userId}>ID: {userData.document}</Text>

          <View style={styles.infoRow}>
            <MaterialIcons name="person-outline" size={20} color="#000" />
            <Text style={styles.infoText}> Persona {userData.personType}</Text>
          </View>

          <View style={styles.infoRow}>
            <MaterialIcons name="phone-iphone" size={20} color="#000" />
            <Text style={styles.infoText}>{userData.phone}</Text>
          </View>

          <View style={styles.infoRow}>
            <MaterialIcons name="email" size={20} color="#000" />
            <Text style={styles.infoText}>{userData.email}</Text>
          </View>

          <CustomButton
            title="Editar"
            onPress={() => navigation.navigate("EditarPerfil")}
            variant="primary"
            style={{ marginTop: 30 }}
          />
        </View>
      </ScrollView>
    </NavbarLayout>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 40,
    allignItems: "center",
  },
  container: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 40,
  },
  separator: {
    width: "80%",
    height: 1,
    backgroundColor: "#CCC",
    marginBottom: 20,
    alignSelf: "center",
  },
  profileContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 24,
    width: "100%",
    alignItems: "center",
    elevation: 5,
    marginBottom: 30,
  },
  profileImage: {
    width: 180,
    height: 180,
    borderRadius: 60,
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
  },
  userId: {
    fontSize: 23,
    color: "#666",
    marginBottom: 16,
    marginVertical: 5,
    textAlign: "center",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25, // Antes era 18, ahora es 25 para mayor separación
    width: "100%",
    justifyContent: "center",
    paddingLeft: 60,
  },
  infoText: {
    fontSize: 18,
    color: "#000000",
    marginLeft: 10,
    textAlign: "left",
    flex: 1,
    marginTop: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 18,
    marginTop: 10,
    textAlign: "center",
  },
});
