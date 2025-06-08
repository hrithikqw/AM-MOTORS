import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useSettingsStore } from '@/store/settingsStore';
import { colors } from '@/constants/colors';
import { Car } from '@/types/car';
import { X, Camera, Image as ImageIcon, Palette } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { PdfPicker } from './PdfPicker';
import DateTimePicker from '@react-native-community/datetimepicker';

interface CarFormProps {
  initialValues?: Partial<Car>;
  onSubmit: (values: Omit<Car, 'id' | 'createdAt' | 'sold' | 'expenses'>) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const CarForm = ({ initialValues, onSubmit, onCancel, isSubmitting = false }: CarFormProps) => {
  const { darkMode } = useSettingsStore();
  const theme = darkMode ? colors.dark : colors.light;
  
  const [make, setMake] = useState(initialValues?.make || '');
  const [model, setModel] = useState(initialValues?.model || '');
  const [year, setYear] = useState(initialValues?.year?.toString() || '');
  const [miles, setMiles] = useState(initialValues?.miles?.toString() || '');
  const [purchasePrice, setPurchasePrice] = useState(initialValues?.purchasePrice?.toString() || '');
  const [bookValue, setBookValue] = useState(initialValues?.bookValue?.toString() || '');
  const [color, setColor] = useState(initialValues?.color || '');
  const [notes, setNotes] = useState(initialValues?.notes || '');
  const [imageUri, setImageUri] = useState(initialValues?.imageUri || '');
  const [pdfInvoiceUri, setPdfInvoiceUri] = useState(initialValues?.pdfInvoiceUri || '');
  
  const [purchaseDate, setPurchaseDate] = useState(
    initialValues?.createdAt ? new Date(initialValues.createdAt) : new Date()
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!make.trim()) newErrors.make = 'Make is required';
    if (!model.trim()) newErrors.model = 'Model is required';
    
    if (!year.trim()) {
      newErrors.year = 'Year is required';
    } else if (isNaN(Number(year)) || Number(year) < 1900 || Number(year) > new Date().getFullYear() + 1) {
      newErrors.year = 'Please enter a valid year';
    }
    
    if (!miles.trim()) {
      newErrors.miles = 'Mileage is required';
    } else if (isNaN(Number(miles)) || Number(miles) < 0) {
      newErrors.miles = 'Please enter a valid mileage';
    }
    
    if (!purchasePrice.trim()) {
      newErrors.purchasePrice = 'Purchase price is required';
    } else if (isNaN(Number(purchasePrice)) || Number(purchasePrice) <= 0) {
      newErrors.purchasePrice = 'Please enter a valid purchase price';
    }
    
    if (bookValue.trim() && (isNaN(Number(bookValue)) || Number(bookValue) < 0)) {
      newErrors.bookValue = 'Please enter a valid inventory value';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async () => {
    if (validate() && !isSubmitting) {
      try {
        // Use purchase price as book value if not provided
        const finalBookValue = bookValue.trim() 
          ? parseFloat(bookValue) 
          : parseFloat(purchasePrice);
        
        onSubmit({
          make,
          model,
          year: parseInt(year),
          miles: parseInt(miles),
          purchasePrice: parseFloat(purchasePrice),
          bookValue: finalBookValue,
          notes,
          imageUri,
          pdfInvoiceUri,
          color
        });
      } catch (error) {
        console.error('Error submitting form:', error);
        Alert.alert('Error', 'There was an error saving the car data');
      }
    }
  };
  
  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'You need to grant access to your photo library to add images.');
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'There was an error selecting the image.');
    }
  };
  
  const takePhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'You need to grant access to your camera to take photos.');
        return;
      }
      
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'There was an error taking the photo.');
    }
  };
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || purchaseDate;
    setShowDatePicker(Platform.OS === 'ios');
    setPurchaseDate(currentDate);
  };
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardAvoid}
    >
      <ScrollView 
        style={[styles.container, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>
            {initialValues ? 'Edit Car' : 'Add New Car'}
          </Text>
          <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
            <X size={24} color={theme.text} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.form}>
          <View style={styles.imageSection}>
            {imageUri ? (
              <View style={styles.imageContainer}>
                <Image 
                  source={{ uri: imageUri }} 
                  style={styles.carImage} 
                  resizeMode="cover"
                />
                <TouchableOpacity 
                  style={[styles.removeImageButton, { backgroundColor: theme.danger }]}
                  onPress={() => setImageUri('')}
                >
                  <X size={16} color="white" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={[styles.imagePlaceholder, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <ImageIcon size={40} color={theme.subtext} />
                <Text style={[styles.placeholderText, { color: theme.subtext }]}>
                  Add Car Image
                </Text>
              </View>
            )}
            
            <View style={styles.imageButtons}>
              <TouchableOpacity 
                style={[styles.imageButton, { backgroundColor: theme.card, borderColor: theme.border }]}
                onPress={pickImage}
              >
                <ImageIcon size={20} color={theme.primary} style={styles.buttonIcon} />
                <Text style={[styles.buttonText, { color: theme.text }]}>Gallery</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.imageButton, { backgroundColor: theme.card, borderColor: theme.border }]}
                onPress={takePhoto}
              >
                <Camera size={20} color={theme.primary} style={styles.buttonIcon} />
                <Text style={[styles.buttonText, { color: theme.text }]}>Camera</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.text }]}>Make</Text>
            <TextInput
              style={[
                styles.input, 
                { 
                  backgroundColor: theme.card, 
                  borderColor: errors.make ? theme.danger : theme.border,
                  color: theme.text
                }
              ]}
              value={make}
              onChangeText={setMake}
              placeholder="e.g. Toyota"
              placeholderTextColor={theme.subtext}
            />
            {errors.make && <Text style={[styles.errorText, { color: theme.danger }]}>{errors.make}</Text>}
          </View>
          
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.text }]}>Model</Text>
            <TextInput
              style={[
                styles.input, 
                { 
                  backgroundColor: theme.card, 
                  borderColor: errors.model ? theme.danger : theme.border,
                  color: theme.text
                }
              ]}
              value={model}
              onChangeText={setModel}
              placeholder="e.g. Camry"
              placeholderTextColor={theme.subtext}
            />
            {errors.model && <Text style={[styles.errorText, { color: theme.danger }]}>{errors.model}</Text>}
          </View>
          
          <View style={styles.row}>
            <View style={[styles.formGroup, styles.halfWidth]}>
              <Text style={[styles.label, { color: theme.text }]}>Year</Text>
              <TextInput
                style={[
                  styles.input, 
                  { 
                    backgroundColor: theme.card, 
                    borderColor: errors.year ? theme.danger : theme.border,
                    color: theme.text
                  }
                ]}
                value={year}
                onChangeText={setYear}
                placeholder="e.g. 2018"
                placeholderTextColor={theme.subtext}
                keyboardType="number-pad"
              />
              {errors.year && <Text style={[styles.errorText, { color: theme.danger }]}>{errors.year}</Text>}
            </View>
            
            <View style={[styles.formGroup, styles.halfWidth]}>
              <Text style={[styles.label, { color: theme.text }]}>Miles</Text>
              <TextInput
                style={[
                  styles.input, 
                  { 
                    backgroundColor: theme.card, 
                    borderColor: errors.miles ? theme.danger : theme.border,
                    color: theme.text
                  }
                ]}
                value={miles}
                onChangeText={setMiles}
                placeholder="e.g. 45000"
                placeholderTextColor={theme.subtext}
                keyboardType="number-pad"
              />
              {errors.miles && <Text style={[styles.errorText, { color: theme.danger }]}>{errors.miles}</Text>}
            </View>
          </View>
          
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.text }]}>Color (Optional)</Text>
            <TextInput
              style={[
                styles.input, 
                { 
                  backgroundColor: theme.card, 
                  borderColor: theme.border,
                  color: theme.text
                }
              ]}
              value={color}
              onChangeText={setColor}
              placeholder="e.g. Silver"
              placeholderTextColor={theme.subtext}
            />
          </View>
          
          <View style={styles.row}>
            <View style={[styles.formGroup, styles.halfWidth]}>
              <Text style={[styles.label, { color: theme.text }]}>Purchase Price ($)</Text>
              <TextInput
                style={[
                  styles.input, 
                  { 
                    backgroundColor: theme.card, 
                    borderColor: errors.purchasePrice ? theme.danger : theme.border,
                    color: theme.text
                  }
                ]}
                value={purchasePrice}
                onChangeText={setPurchasePrice}
                placeholder="e.g. 12500"
                placeholderTextColor={theme.subtext}
                keyboardType="decimal-pad"
              />
              {errors.purchasePrice && <Text style={[styles.errorText, { color: theme.danger }]}>{errors.purchasePrice}</Text>}
            </View>
            
            <View style={[styles.formGroup, styles.halfWidth]}>
              <Text style={[styles.label, { color: theme.text }]}>Inventory Value ($)</Text>
              <TextInput
                style={[
                  styles.input, 
                  { 
                    backgroundColor: theme.card, 
                    borderColor: errors.bookValue ? theme.danger : theme.border,
                    color: theme.text
                  }
                ]}
                value={bookValue}
                onChangeText={setBookValue}
                placeholder="e.g. 14000"
                placeholderTextColor={theme.subtext}
                keyboardType="decimal-pad"
              />
              {errors.bookValue && <Text style={[styles.errorText, { color: theme.danger }]}>{errors.bookValue}</Text>}
              <Text style={[styles.helperText, { color: theme.subtext }]}>
                Leave blank to use purchase price
              </Text>
            </View>
          </View>
          
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.text }]}>Purchase Date</Text>
            <TouchableOpacity
              style={[
                styles.datePickerButton,
                { 
                  backgroundColor: theme.card,
                  borderColor: theme.border
                }
              ]}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={[styles.dateText, { color: theme.text }]}>
                {formatDate(purchaseDate)}
              </Text>
            </TouchableOpacity>
            
            {showDatePicker && (
              <DateTimePicker
                value={purchaseDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onDateChange}
                maximumDate={new Date()}
              />
            )}
          </View>
          
          {/* PDF Invoice Picker */}
          <PdfPicker 
            pdfUri={pdfInvoiceUri}
            onPdfSelected={setPdfInvoiceUri}
            onPdfRemoved={() => setPdfInvoiceUri('')}
          />
          
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.text }]}>Notes (Optional)</Text>
            <TextInput
              style={[
                styles.textArea, 
                { 
                  backgroundColor: theme.card, 
                  borderColor: theme.border,
                  color: theme.text
                }
              ]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Add any notes about the car's condition, repairs needed, etc."
              placeholderTextColor={theme.subtext}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
          
          <TouchableOpacity 
            style={[
              styles.submitButton, 
              { 
                backgroundColor: theme.primary,
                opacity: isSubmitting ? 0.7 : 1
              }
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.submitButtonText}>
                {initialValues ? 'Update Car' : 'Add Car'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  form: {
    flex: 1,
  },
  imageSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  carImage: {
    width: 200,
    height: 150,
    borderRadius: 12,
    aspectRatio: 4/3,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholder: {
    width: 200,
    height: 150,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    marginBottom: 12,
  },
  placeholderText: {
    marginTop: 8,
    fontSize: 14,
  },
  imageButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 6,
    borderWidth: 1,
  },
  buttonIcon: {
    marginRight: 6,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  formGroup: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  datePickerButton: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingTop: 12,
    fontSize: 16,
    minHeight: 100,
  },
  errorText: {
    fontSize: 14,
    marginTop: 4,
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  submitButton: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});