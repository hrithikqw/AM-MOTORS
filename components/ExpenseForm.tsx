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
import { Expense } from '@/types/expense';
import { X } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface ExpenseFormProps {
  visible: boolean;
  initialValues?: Expense;
  onClose: () => void;
  onSubmit: (expense: Omit<Expense, 'id'>) => void;
}

export const ExpenseForm = ({ 
  visible, 
  initialValues, 
  onClose, 
  onSubmit 
}: ExpenseFormProps) => {
  const { darkMode } = useSettingsStore();
  const theme = darkMode ? colors.dark : colors.light;
  
  const [description, setDescription] = useState(initialValues?.description || '');
  const [amount, setAmount] = useState(initialValues?.amount?.toString() || '');
  const [date, setDate] = useState(initialValues?.date ? new Date(initialValues.date) : new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!amount.trim()) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(Number(amount)) || Number(amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = () => {
    if (validate()) {
      onSubmit({
        description,
        amount: parseFloat(amount),
        date: date.toISOString()
      });
      resetForm();
    }
  };
  
  const resetForm = () => {
    if (!initialValues) {
      setDescription('');
      setAmount('');
      setDate(new Date());
    }
    setErrors({});
  };
  
  const handleClose = () => {
    resetForm();
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
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
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
                  {initialValues ? 'Edit Expense' : 'Add Expense'}
                </Text>
                <TouchableOpacity onPress={handleClose}>
                  <X size={24} color={theme.text} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.form}>
                <View style={styles.formGroup}>
                  <Text style={[styles.label, { color: theme.text }]}>
                    Description
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      { 
                        backgroundColor: theme.background,
                        borderColor: errors.description ? theme.danger : theme.border,
                        color: theme.text
                      }
                    ]}
                    value={description}
                    onChangeText={(text) => {
                      setDescription(text);
                      if (errors.description) {
                        setErrors({ ...errors, description: '' });
                      }
                    }}
                    placeholder="e.g. New Tires"
                    placeholderTextColor={theme.subtext}
                    autoFocus={Platform.OS !== 'web'}
                  />
                  {errors.description && (
                    <Text style={[styles.errorText, { color: theme.danger }]}>
                      {errors.description}
                    </Text>
                  )}
                </View>
                
                <View style={styles.formGroup}>
                  <Text style={[styles.label, { color: theme.text }]}>
                    Amount ($)
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      { 
                        backgroundColor: theme.background,
                        borderColor: errors.amount ? theme.danger : theme.border,
                        color: theme.text
                      }
                    ]}
                    value={amount}
                    onChangeText={(text) => {
                      setAmount(text);
                      if (errors.amount) {
                        setErrors({ ...errors, amount: '' });
                      }
                    }}
                    placeholder="e.g. 450"
                    placeholderTextColor={theme.subtext}
                    keyboardType="decimal-pad"
                  />
                  {errors.amount && (
                    <Text style={[styles.errorText, { color: theme.danger }]}>
                      {errors.amount}
                    </Text>
                  )}
                </View>
                
                <View style={styles.formGroup}>
                  <Text style={[styles.label, { color: theme.text }]}>
                    Date
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
                      {formatDate(date)}
                    </Text>
                  </TouchableOpacity>
                  
                  {showDatePicker && (
                    <DateTimePicker
                      value={date}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={onDateChange}
                      maximumDate={new Date()}
                    />
                  )}
                </View>
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
                  style={[styles.submitButton, { backgroundColor: theme.primary }]}
                  onPress={handleSubmit}
                >
                  <Text style={styles.submitButtonText}>
                    {initialValues ? 'Update' : 'Add'}
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
  form: {
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 16,
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
  errorText: {
    fontSize: 14,
    marginTop: 4,
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
  submitButton: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});