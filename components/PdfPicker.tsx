import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Platform,
  Alert
} from 'react-native';
import { useSettingsStore } from '@/store/settingsStore';
import { colors } from '@/constants/colors';
import { FileText, X } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

interface PdfPickerProps {
  pdfUri: string | undefined;
  onPdfSelected: (uri: string) => void;
  onPdfRemoved: () => void;
}

export const PdfPicker = ({ pdfUri, onPdfSelected, onPdfRemoved }: PdfPickerProps) => {
  const { darkMode } = useSettingsStore();
  const theme = darkMode ? colors.dark : colors.light;
  
  const pickPdf = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });
      
      if (result.canceled) {
        return;
      }
      
      // Check file size (limit to 10MB)
      if (Platform.OS !== 'web') {
        const fileInfo = await FileSystem.getInfoAsync(result.assets[0].uri);
        
        // Check if file exists and has size property
        if (fileInfo.exists && fileInfo.size && fileInfo.size > 10 * 1024 * 1024) {
          Alert.alert('File Too Large', 'Please select a PDF smaller than 10MB');
          return;
        }
      }
      
      // Validate it's a PDF
      const uri = result.assets[0].uri;
      const fileName = uri.split('/').pop() || '';
      if (!fileName.toLowerCase().endsWith('.pdf')) {
        Alert.alert('Invalid File', 'Please select a PDF file');
        return;
      }
      
      // For debugging
      console.log(`Selected PDF: ${uri}`);
      
      // Use the URI directly
      onPdfSelected(uri);
    } catch (error) {
      console.error('Error picking PDF:', error);
      Alert.alert('Error', 'There was an error selecting the PDF file');
    }
  };
  
  const getFileName = (uri: string) => {
    if (!uri) return '';
    return uri.split('/').pop() || 'invoice.pdf';
  };
  
  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.text }]}>Purchase Invoice (PDF)</Text>
      
      {pdfUri ? (
        <View style={[styles.pdfContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.pdfInfo}>
            <FileText size={24} color={theme.primary} style={styles.pdfIcon} />
            <Text style={[styles.pdfName, { color: theme.text }]} numberOfLines={1} ellipsizeMode="middle">
              {getFileName(pdfUri)}
            </Text>
          </View>
          
          <TouchableOpacity 
            style={styles.removeButton}
            onPress={onPdfRemoved}
          >
            <X size={20} color={theme.danger} />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity 
          style={[styles.pickButton, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={pickPdf}
        >
          <FileText size={24} color={theme.primary} style={styles.buttonIcon} />
          <Text style={[styles.buttonText, { color: theme.text }]}>
            Select Invoice PDF
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  pickButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  pdfContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  pdfInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  pdfIcon: {
    marginRight: 8,
  },
  pdfName: {
    fontSize: 14,
    flex: 1,
  },
  removeButton: {
    padding: 4,
  },
});