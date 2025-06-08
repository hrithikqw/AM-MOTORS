import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { Car } from '@/types/car';

export const exportToCsv = async (cars: Car[]): Promise<boolean> => {
  try {
    // Create CSV header
    const header = 'ID,Make,Model,Year,Miles,Purchase Price,Selling Price,Sold,Sold Date,Notes,Created At\n';
    
    // Create CSV content
    const csvContent = cars.reduce((content, car) => {
      const row = [
        car.id,
        car.make,
        car.model,
        car.year,
        car.miles,
        car.purchasePrice,
        car.sellingPrice || '',
        car.sold ? 'Yes' : 'No',
        car.soldDate || '',
        `"${(car.notes || '').replace(/"/g, '""')}"`,
        car.createdAt
      ].join(',');
      
      return content + row + '\n';
    }, header);
    
    if (Platform.OS === 'web') {
      // For web, create a download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'car_inventory.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return true;
    } else {
      // For mobile, save file and share
      const fileUri = `${FileSystem.documentDirectory}car_inventory.csv`;
      await FileSystem.writeAsStringAsync(fileUri, csvContent, {
        encoding: FileSystem.EncodingType.UTF8
      });
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          dialogTitle: 'Export Car Inventory',
          UTI: 'public.comma-separated-values-text'
        });
        return true;
      } else {
        console.error('Sharing is not available on this device');
        return false;
      }
    }
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    return false;
  }
};