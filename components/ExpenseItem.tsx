import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Expense } from '@/types/expense';
import { useSettingsStore } from '@/store/settingsStore';
import { colors } from '@/constants/colors';
import { Trash2 } from 'lucide-react-native';

interface ExpenseItemProps {
  expense: Expense;
  onDelete: () => void;
  onEdit: () => void;
}

export const ExpenseItem = ({ expense, onDelete, onEdit }: ExpenseItemProps) => {
  const { darkMode } = useSettingsStore();
  const theme = darkMode ? colors.dark : colors.light;
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: theme.card, borderColor: theme.border }]}
      onPress={onEdit}
    >
      <View style={styles.content}>
        <Text style={[styles.description, { color: theme.text }]}>
          {expense.description}
        </Text>
        <Text style={[styles.date, { color: theme.subtext }]}>
          {formatDate(expense.date)}
        </Text>
      </View>
      
      <View style={styles.rightSection}>
        <Text style={[styles.amount, { color: theme.text }]}>
          ${expense.amount.toLocaleString()}
        </Text>
        
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={onDelete}
        >
          <Trash2 size={18} color={theme.danger} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  content: {
    flex: 1,
  },
  description: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 4,
  },
  date: {
    fontSize: 13,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 12,
  },
  deleteButton: {
    padding: 4,
  },
});