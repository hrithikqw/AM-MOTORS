import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSettingsStore } from '@/store/settingsStore';
import { colors } from '@/constants/colors';
import { CarForm } from '@/components/CarForm';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { createCar, uploadCarImage, uploadInvoicePdf } from '@/lib/supabaseClient';

export default function AddCarScreen() {
  const router = useRouter();
  const { darkMode } = useSettingsStore();
  const theme = darkMode ? colors.dark : colors.light;
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (carData: any) => {
    try {
      setIsSubmitting(true);
      
      // Upload image if provided
      let imageUrl = carData.imageUri;
      if (imageUrl && !imageUrl.startsWith('http')) {
        // Generate a temporary ID for the car (will be replaced by the actual ID)
        const tempId = Date.now().toString();
        imageUrl = await uploadCarImage(imageUrl, tempId);
      }
      
      // Upload PDF if provided
      let pdfUrl = carData.pdfInvoiceUri;
      if (pdfUrl && !pdfUrl.startsWith('http')) {
        // Generate a temporary ID for the car (will be replaced by the actual ID)
        const tempId = Date.now().toString();
        pdfUrl = await uploadInvoicePdf(pdfUrl, tempId);
      }
      
      // Create car with uploaded files
      await createCar({
        ...carData,
        imageUri: imageUrl,
        pdfInvoiceUri: pdfUrl
      });
      
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      router.back();
    } catch (error) {
      console.error('Error adding car:', error);
      Alert.alert('Error', 'Failed to add car. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <CarForm 
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
  },
});