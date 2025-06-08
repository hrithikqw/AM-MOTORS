import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  Modal, 
  TouchableOpacity,
  TouchableWithoutFeedback,
  Platform
} from 'react-native';
import { useSettingsStore } from '@/store/settingsStore';
import { colors } from '@/constants/colors';
import { X } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface SellCarModalProps {
  visible: boolean;
  purchasePrice: number;
  onClose: () => void;
  onSell: (sellingPrice: number) => void;
}

export const SellCarModal = ({ 
  visible, 
  purchasePrice, 
  onClose, 
  onSell 
}: SellCarModalProps) => {
  const { darkMode } = useSettingsStore();
  const theme = darkMode ? colors.dark : colors.light;
  
  const [sellingPrice, setSellingPrice] = useState('');
  const [saleDate, setSaleDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [error, setError] = useState('');
  
  const calculateProfit = () => {
    const price = parseFloat(sellingPrice);
    if (isNaN(price)) return null;
    
    return price - purchasePrice;
  };
  
  const profit = calculateProfit();
  const isProfitable = profit !== null && profit > 0;
  
  const handleSell = () => {
    const price = parseFloat(sellingPrice);
    
    if (isNaN(price) || price <= 0) {
      setError('Please enter a valid selling price');
      return;
    }
    
    onSell(price);
    setSellingPrice('');
    setError('');
    setSaleDate(new Date());
  };
  
  // Reset the form when modal closes
  const handleClose = () => {
    setSellingPrice('');
    setError('');
    setSaleDate(new Date());
    onClose();
  };
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || saleDate;
    setShowDatePicker(Platform.OS === 'ios');
    setSaleDate(currentDate);
  };
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={e => e.stopPropagation()}>
            <View style={[
              styles.modalContent,
              { backgroundColor: theme.card }
            ]}>
              <View style={styles.header}>
                <Text style={[styles.title, { color: theme.text }]}>
                  Mark as Sold
                </Text>
                <TouchableOpacity onPress={handleClose}>
                  <X size={24} color={theme.text} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.content}>
                <Text style={[styles.label, { color: theme.text }]}>
                  Total Cost (Purchase + Expenses)
                </Text>
                <Text style={[styles.price, { color: theme.text }]}>
                  ${purchasePrice.toLocaleString()}
                </Text>
                
                <Text style={[styles.label, { color: theme.text, marginTop: 16 }]}>
                  Selling Price ($)
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    { 
                      backgroundColor: theme.background,
                      borderColor: error ? theme.danger : theme.border,
                      color: theme.text
                    }
                  ]}
                  value={sellingPrice}
                  onChangeText={(text) => {
                    setSellingPrice(text);
                    setError('');
                  }}
                  placeholder="Enter selling price"
                  placeholderTextColor={theme.subtext}
                  keyboardType="decimal-pad"
                  autoFocus={Platform.OS !== 'web'}
                />
                {error ? (
                  <Text style={[styles.errorText, { color: theme.danger }]}>
                    {error}
                  </Text>
                ) : null}
                
                <Text style={[styles.label, { color: theme.text, marginTop: 16 }]}>
                  Sale Date
                </Text>
                <TouchableOpacity
                  style={[
                    styles.datePickerButton,
                    { 
                      backgroundColor: theme.background,
                      borderColor: theme.border
                    }
                  ]}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={[styles.dateText, { color: theme.text }]}>
                    {formatDate(saleDate)}
                  </Text>
                </TouchableOpacity>
                
                {showDatePicker && (
                  <DateTimePicker
                    value={saleDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onDateChange}
                    maximumDate={new Date()}
                  />
                )}
                
                {profit !== null && (
                  <View style={styles.profitContainer}>
                    <Text style={[styles.profitLabel, { color: theme.text }]}>
                      Profit/Loss:
                    </Text>
                    <Text style={[
                      styles.profitValue,
                      { color: isProfitable ? theme.success : theme.danger }
                    ]}>
                      {isProfitable ? '+' : ''}{profit.toLocaleString()}
                    </Text>
                  </View>
                )}
              </View>
              
              <View style={styles.actions}>
                <TouchableOpacity 
                  style={[styles.cancelButton, { borderColor: theme.border }]}
                  onPress={handleClose}
                >
                  <Text style={[styles.cancelButtonText, { color: theme.text }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.sellButton, { backgroundColor: theme.primary }]}
                  onPress={handleSell}
                >
                  <Text style={styles.sellButtonText}>
                    Mark as Sold
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    borderRadius: 16,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  price: {
    fontSize: 18,
    fontWeight: '600',
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
    marginBottom: 16,
  },
  dateText: {
    fontSize: 16,
  },
  errorText: {
    fontSize: 14,
    marginTop: 4,
    color: 'red',
  },
  profitContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  profitLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginRight: 8,
  },
  profitValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  sellButton: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sellButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});