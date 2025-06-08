import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSettingsStore } from '@/store/settingsStore';
import { colors } from '@/constants/colors';
import { supabase } from '@/lib/supabaseClient';

export default function SplashScreen() {
  const router = useRouter();
  const { darkMode } = useSettingsStore();
  const theme = darkMode ? colors.dark : colors.light;
  
  // Check authentication status and navigate accordingly
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        
        // Wait a moment to show the splash screen
        setTimeout(() => {
          if (data.session) {
            router.replace('/(tabs)');
          } else {
            router.replace('/sign-in');
          }
        }, 1500);
      } catch (error) {
        console.error('Error checking auth:', error);
        router.replace('/sign-in');
      }
    };
    
    checkAuth();
  }, []);
  
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.logoContainer}>
        <Text style={[styles.logoText, { color: theme.primary }]}>AM MOTORS</Text>
        <Text style={[styles.tagline, { color: theme.subtext }]}>Car Inventory Management</Text>
      </View>
      <ActivityIndicator 
        size="large" 
        color={theme.primary} 
        style={styles.loader} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoText: {
    fontSize: 42,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 18,
    fontStyle: 'italic',
  },
  loader: {
    marginTop: 20,
  },
});e