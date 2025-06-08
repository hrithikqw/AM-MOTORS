import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as WebBrowser from 'expo-web-browser';
import { Platform, Alert } from 'react-native';

// Open or download the PDF
export const openPdf = async (uri: string): Promise<boolean> => {
  try {
    if (!uri) {
      Alert.alert('Error', 'No PDF invoice available for this car');
      return false;
    }
    
    // If it's a URL (from Supabase storage), open it directly
    if (uri.startsWith('http')) {
      await WebBrowser.openBrowserAsync(uri);
      return true;
    }
    
    // For local files on mobile
    if (Platform.OS !== 'web') {
      // Check if file exists
      const fileInfo = await FileSystem.getInfoAsync(uri);
      
      if (!fileInfo.exists) {
        console.error(`PDF file not found at path: ${uri}`);
        Alert.alert('Error', 'PDF file not found. The file may have been moved or deleted.');
        return false;
      }
      
      // Offer download options
      if (await Sharing.isAvailableAsync()) {
        // Create options for sharing/saving
        const options = {
          mimeType: 'application/pdf',
          dialogTitle: 'Invoice PDF',
          UTI: 'com.adobe.pdf'
        };
        
        // Show sharing options that include save to files
        await Sharing.shareAsync(uri, options);
        return true;
      } else {
        Alert.alert('Error', 'Sharing is not available on this device');
        return false;
      }
    } else {
      // On web, open in a new tab
      window.open(uri, '_blank');
      return true;
    }
  } catch (error) {
    console.error('Error opening PDF:', error);
    Alert.alert('Error', 'Failed to open the PDF file');
    return false;
  }
};