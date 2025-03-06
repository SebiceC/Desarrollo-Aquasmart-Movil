import React from 'react';
import { SafeAreaView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import NavbarLayout from '../components/NavbarLayout';

export default function ProfileScreen( navigation ) {
  const userData = {
    name: 'Luis Fernando Medina',
    id: '55162345',
    type: 'Persona natural',
    phone: '+57 3152349526',
    email: 'lulamedina@gmail.com',
  };

  return (
    <NavbarLayout navigation={navigation}>
    <SafeAreaView style={styles.container}>
      <View style={styles.profileHeader}>
        <Text style={styles.headerTitle}>Mi perfil</Text>
      </View>

      <View style={styles.profileContainer}>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{userData.name}</Text>
          <Text style={styles.userId}>ID: {userData.id}</Text>
          
          <View style={styles.infoRow}>
            <MaterialIcons name="person-outline" size={20} color="#2D5B7B" />
            <Text style={styles.infoText}>{userData.type}</Text>
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

        <TouchableOpacity style={styles.editButton}>
          <Text style={styles.editText}>Editar</Text>
          <MaterialIcons name="edit" size={18} color="#2D5B7B" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
    </NavbarLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F9FF',
  },
  profileHeader: {
    backgroundColor: '#2D5B7B',
    paddingVertical: 20,
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  profileContainer: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    elevation: 3,
  },
  userInfo: {
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingBottom: 16,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2D5B7B',
    marginBottom: 4,
  },
  userId: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    color: '#444',
    marginLeft: 10,
  },
  editButton: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 16,
  },
  editText: {
    color: '#2D5B7B',
    fontSize: 16,
    marginRight: 8,
    fontWeight: '500',
  },
});