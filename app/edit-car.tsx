import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { useSettingsStore } from '@/store/settingsStore';
import { colors } from '@/constants/colors';
import { CarForm } from '@/components/CarForm';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { fetchCars, updateCar, uploadCarImage, uploadInvoicePdf } from '@/lib/supabaseClient';

export default function EditCarScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { darkMode } = useSettingsStore();
  const theme = darkMode ? colors.dark : colors.light;
  
  const [car, setCar] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch car data
  useEffect(() => {
    const loadCar = async () => {
      try {
        setLoading(true);
        const cars = await fetchCars();
        const foundCar = cars.find(c => c.id === id);
        
        if (foundCar) {
          setCar(foundCar);
        } else {
          Alert.alert('Error', 'Car not found');
          router.back();
        }
      } catch (error) {
        console.error('Error loading car:', error);
        Alert.alert('Error', 'Failed to load car data. Please try again.');
        router.back();
      } finally {
        setLoading(false);
      }
    };
    
    loadCar();
  }, [id]);
  
  const handleSubmit = async (carData: any) => {
    if (!car) return;
    
    try {
      setIsSubmitting(true);
      
      // Check if image needs to be uploaded (if it's a local URI)
      let imageUrl = carData.imageUri;
      if (imageUrl && !imageUrl.startsWith('http')) {
        imageUrl = await uploadCarImage(imageUrl, car.id);
      }
      
      // Check if PDF needs to be uploaded (if it's a local URI)
      let pdfUrl = carData.pdfInvoiceUri;
      if (pdfUrl && !pdfUrl.startsWith('http')) {
        pdfUrl = await uploadInvoicePdf(pdfUrl, car.id);
      }
      
      // Update car with uploaded files
      await updateCar(id as string, {
        ...carData,
        imageUri: imageUrl,
        pdfInvoiceUri: pdfUrl
      });
      
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      router.back();
    } catch (error) {
      console.error('Error updating car:', error);
      Alert.alert('Error', 'Failed to update car. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }
  
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ title: "Edit Car" }} />
      <CarForm 
        initialValues={car}
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
        isSubmitting={isSubmitting}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
});