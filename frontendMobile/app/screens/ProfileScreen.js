import React, { useEffect, useState } from "react";
import {
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
import Icon from "react-native-vector-icons/MaterialIcons";
import { Image } from "react-native";

export default function ProfileScreen({ navigation }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await api.get("/users/profile");
        console.log("[Profile] Datos recibidos:", response.data);

        // Mapear datos del backend al formato necesario
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
          <Icon name="error-outline" size={40} color="#FF3B30" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </NavbarLayout>
    );
  }

  return (
    <NavbarLayout navigation={navigation}>
      <SafeAreaView style={styles.container}>
        <View style={styles.profileHeader}>
          <Text style={styles.headerTitle}>Mi perfil</Text>
        </View>

        <View style={styles.profileContainer}>
          <Image
            source={require("../assets/img_M1/icon-profile.png")}
            style={styles.profileImage}
          />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {userData.firstName} {userData.lastName}
            </Text>
            <Text style={styles.userId}>ID: {userData.document}</Text>

            <View style={styles.infoRow}>
              <MaterialIcons name="person-outline" size={20} color="#2D5B7B" />
              <Text style={styles.infoText}>Persona Natural</Text>
            </View>

            <View style={styles.infoRow}>
              <MaterialIcons name="phone-iphone" size={20} color="#2D5B7B" />
              <Text style={styles.infoText}>{userData.phone}</Text>
            </View>

            <View style={styles.infoRow}>
              <MaterialIcons name="email" size={20} color="#2D5B7B" />
              <Text style={styles.infoText}>{userData.email}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate("EditarPerfil")}
          >
            <Text style={styles.editText}>Editar</Text>
            <MaterialIcons name="edit" size={22} color="#2D5B7B" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </NavbarLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  profileHeader: {
    paddingVertical: 150,
    alignItems: "center",
    zIndex: 2,
    elevation: 2,
  },
  headerTitle: {
    color: "#000000",
    fontSize: 30,
    fontWeight: "bold",
    position: "absolute",
    zIndex: 3,
    top: 50,
  },
  profileContainer: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 24,
    elevation: 5,
    marginTop: -100,
    zIndex: 1,
    alignItems: "center",
  },
  profileImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignSelf: "center",
    marginTop: -100,
    borderWidth: 4,
    borderColor: "white",
    backgroundColor: "white",
    zIndex: 1,
  },
  userInfo: {
    width: "100%",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    paddingBottom: 16,
  },
  userName: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#000000",
    marginTop: 15,
    marginBottom: 6,
  },
  userId: {
    fontSize: 16,
    color: "#666",
    marginBottom: 25,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
    width: "100%",
    justifyContent: "center",
  },
  infoText: {
    fontSize: 16,
    color: "#000000",
    marginLeft: 10,
  },
  editButton: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 16,
  },
  editText: {
    color: "#000000",
    fontSize: 16,
    marginRight: 8,
    fontWeight: "500",
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
