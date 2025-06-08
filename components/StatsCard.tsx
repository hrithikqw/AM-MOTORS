import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CarStats } from '@/types/car';
import { useSettingsStore } from '@/store/settingsStore';
import { colors } from '@/constants/colors';

interface StatsCardProps {
  stats: CarStats;
}

export const StatsCard = ({ stats }: StatsCardProps) => {
  const { darkMode } = useSettingsStore();
  const theme = darkMode ? colors.dark : colors.light;
  
  return (
    <View style={[styles.container, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <Text style={[styles.title, { color: theme.text }]}>Inventory Summary</Text>
      
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.text }]}>{stats.totalCars}</Text>
          <Text style={[styles.statLabel, { color: theme.subtext }]}>Total Cars</Text>
        </View>
        
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.text }]}>{stats.inventoryCars}</Text>
          <Text style={[styles.statLabel, { color: theme.subtext }]}>In Stock</Text>
        </View>
        
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.text }]}>{stats.soldCars}</Text>
          <Text style={[styles.statLabel, { color: theme.subtext }]}>Sold</Text>
        </View>
      </View>
      
      <View style={[styles.horizontalDivider, { backgroundColor: theme.border }]} />
      
      <View style={styles.profitSection}>
        <View style={styles.profitRow}>
          <Text style={[styles.profitLabel, { color: theme.subtext }]}>Total Profit:</Text>
          <Text style={[
            styles.profitValue, 
            { color: stats.totalProfit >= 0 ? theme.success : theme.danger }
          ]}>
            ${stats.totalProfit.toLocaleString()}
          </Text>
        </View>
        
        <View style={styles.profitRow}>
          <Text style={[styles.profitLabel, { color: theme.subtext }]}>Average Profit:</Text>
          <Text style={[
            styles.profitValue, 
            { color: stats.averageProfit >= 0 ? theme.success : theme.danger }
          ]}>
            ${Math.round(stats.averageProfit).toLocaleString()}
          </Text>
        </View>
        
        <View style={styles.profitRow}>
          <Text style={[styles.profitLabel, { color: theme.subtext }]}>Total Inventory Value:</Text>
          <Text style={[styles.profitValue, { color: theme.text }]}>
            ${stats.totalBookValue.toLocaleString()}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
  },
  divider: {
    width: 1,
    height: 40,
  },
  horizontalDivider: {
    height: 1,
    width: '100%',
    marginBottom: 16,
  },
  profitSection: {
    marginTop: 4,
  },
  profitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  profitLabel: {
    fontSize: 16,
  },
  profitValue: {
    fontSize: 18,
    fontWeight: '600',
  },
});