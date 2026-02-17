import React from 'react';
import { Text, View, StyleSheet, Dimensions } from 'react-native';

export default function Index() {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.avatar} />
        <Text style={styles.title}>Halo Julius!</Text>
        <Text style={styles.subtitle}>Fulus Siap Digunakan</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, // Mengisi seluruh layar
    backgroundColor: '#F3F4F6', // Warna abu-abu terang
    justifyContent: 'center', // Tengah secara vertikal
    alignItems: 'center', // Tengah secara horizontal
  },
  card: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 16, // Sudut melengkung
    alignItems: 'center',
    
    // Shadow (Bayangan) - agak beda dengan CSS Web
    elevation: 5, // Khusus Android
    shadowColor: '#000', // Khusus iOS
    shadowOffset: { width: 0, height: 2 }, // Khusus iOS
    shadowOpacity: 0.25, // Khusus iOS
    shadowRadius: 3.84, // Khusus iOS
  },
  avatar: {
    width: 64,
    height: 64,
    backgroundColor: '#10B981', // Warna Hijau Fulus
    borderRadius: 32, // Setengah dari width agar jadi bulat sempurna
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937', // Abu-abu gelap
  },
  subtitle: {
    marginTop: 8,
    color: '#6B7280', // Abu-abu sedang
  },
});