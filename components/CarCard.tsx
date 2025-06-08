import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { Car } from '@/types/car';
import { useSettingsStore } from '@/store/settingsStore';
import { colors } from '@/constants/colors';
import { ChevronRight, Car as CarIcon } from 'lucide-react-native';

interface CarCardProps {
  car: Car;
  onPress: () => void;
}

export const CarCard = ({ car, onPress }: CarCardProps) => {
  const { darkMode } = useSettingsStore();
  const theme = darkMode ? colors.dark : colors.light;
  
  const totalExpenses = car.expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalCost = car.purchasePrice + totalExpenses;
  
  const profit = car.sold && car.sellingPrice 
    ? car.sellingPrice - totalCost
    : null;
  
  const isProfitable = profit !== null && profit > 0;
  
  return (
    <Pressable
      style={[
        styles.container,
        { backgroundColor: theme.card, borderColor: theme.border }
      ]}
      onPress={onPress}
    >
      <View style={styles.leftSection}>
        {car.imageUri ? (
          <Image 
            source={{ uri: car.imageUri }} 
            style={styles.carImage} 
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.imagePlaceholder, { backgroundColor: theme.border }]}>
            <CarIcon size={24} color={theme.primary} />
          </View>
        )}
        {car.sold && (
          <View style={[styles.soldBadge, { backgroundColor: theme.success }]}>
            <Text style={styles.soldBadgeText}>SOLD</Text>
          </View>
        )}
      </View>
      
      <View style={styles.contentContainer}>
        <Text style={[styles.title, { color: theme.text }]} numberOfLines={1} ellipsizeMode="tail">
          {car.year} {car.make} {car.model}
        </Text>
        
        <Text style={[styles.subtitle, { color: theme.subtext }]}>
          {car.miles.toLocaleString()} miles • ${car.purchasePrice.toLocaleString()}
        </Text>
        
        {totalExpenses > 0 && (
          <Text style={[styles.expensesText, { color: theme.subtext }]}>
            Expenses: ${totalExpenses.toLocaleString()}
          </Text>
        )}
        
        {car.sold && profit !== null && (
          <Text style={[
            styles.profitText, 
            { color: isProfitable ? theme.success : theme.danger }
          ]}>
            {isProfitable ? 'Profit: +' : 'Loss: '}${Math.abs(profit).toLocaleString()}
          </Text>
        )}
      </View>
      
      <ChevronRight size={20} color={theme.subtext} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  leftSection: {
    marginRight: 12,
    alignItems: 'center',
    position: 'relative',
  },
  carImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    aspectRatio: 4/3,
  },
  imagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  soldBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  soldBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 2,
  },
  expensesText: {
    fontSize: 14,
    marginBottom: 2,
  },
  profitText: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 2,
  },
});