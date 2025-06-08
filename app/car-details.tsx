import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useSettingsStore } from '@/store/settingsStore';
import { colors } from '@/constants/colors';
import { SellCarModal } from '@/components/SellCarModal';
import { ExpenseForm } from '@/components/ExpenseForm';
import { ExpenseItem } from '@/components/ExpenseItem';
import { Expense } from '@/types/expense';
import { 
  Calendar, 
  DollarSign, 
  Gauge, 
  Edit3, 
  Trash2, 
  Tag, 
  FileText,
  PlusCircle,
  Car as CarIcon,
  BookOpen,
  Palette
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { openPdf } from '@/utils/pdf-handler';
import { 
  fetchCars, 
  fetchExpensesByCar, 
  deleteCar, 
  markCarAsSold, 
  createExpense, 
  updateExpense, 
  deleteExpense 
} from '@/lib/supabaseClient';

export default function CarDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { darkMode } = useSettingsStore();
  const theme = darkMode ? colors.dark : colors.light;
  
  const [car, setCar] = useState<any>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [sellModalVisible, setSellModalVisible] = useState(false);
  const [expenseModalVisible, setExpenseModalVisible] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);
  
  // Fetch car and expenses
  const loadData = async () => {
    try {
      setLoading(true);
      
      // Fetch all cars and find the one with matching ID
      const cars = await fetchCars();
      const foundCar = cars.find(c => c.id === id);
      
      if (foundCar) {
        setCar(foundCar);
        
        // Fetch expenses for this car
        const carExpenses = await fetchExpensesByCar(foundCar.id);
        setExpenses(carExpenses);
      }
    } catch (error) {
      console.error('Error loading car details:', error);
      Alert.alert('Error', 'Failed to load car details. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Load data on component mount
  useEffect(() => {
    loadData();
  }, [id]);
  
  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} style={styles.loader} />
      </View>
    );
  }
  
  if (!car) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorText, { color: theme.text }]}>Car not found</Text>
      </View>
    );
  }
  
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalCost = car.purchasePrice + totalExpenses;
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const handleDelete = () => {
    Alert.alert(
      "Delete Car",
      "Are you sure you want to delete this car from your inventory?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              if (Platform.OS !== 'web') {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              }
              
              await deleteCar(car.id);
              router.back();
            } catch (error) {
              console.error('Error deleting car:', error);
              Alert.alert('Error', 'Failed to delete car. Please try again.');
            }
          }
        }
      ]
    );
  };
  
  const handleSell = async (sellingPrice: number) => {
    try {
      const soldDate = new Date().toISOString();
      await markCarAsSold(car.id, sellingPrice, soldDate);
      
      // Update local state
      setCar({
        ...car,
        sold: true,
        sellingPrice,
        soldDate
      });
      
      setSellModalVisible(false);
      
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error('Error marking car as sold:', error);
      Alert.alert('Error', 'Failed to mark car as sold. Please try again.');
    }
  };
  
  const handleAddExpense = async (expenseData: Omit<Expense, 'id'>) => {
    try {
      const newExpense = await createExpense(car.id, expenseData);
      
      // Update local state
      setExpenses([newExpense, ...expenses]);
      
      setExpenseModalVisible(false);
      
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error('Error adding expense:', error);
      Alert.alert('Error', 'Failed to add expense. Please try again.');
    }
  };
  
  const handleUpdateExpense = async (expenseData: Omit<Expense, 'id'>) => {
    if (selectedExpense) {
      try {
        const updatedExpense = await updateExpense(selectedExpense.id, expenseData);
        
        // Update local state
        setExpenses(expenses.map(exp => 
          exp.id === selectedExpense.id ? updatedExpense : exp
        ));
        
        setSelectedExpense(null);
        setExpenseModalVisible(false);
        
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      } catch (error) {
        console.error('Error updating expense:', error);
        Alert.alert('Error', 'Failed to update expense. Please try again.');
      }
    }
  };
  
  const handleDeleteExpense = (expenseId: string) => {
    Alert.alert(
      "Delete Expense",
      "Are you sure you want to delete this expense?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteExpense(expenseId);
              
              // Update local state
              setExpenses(expenses.filter(exp => exp.id !== expenseId));
              
              if (Platform.OS !== 'web') {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              }
            } catch (error) {
              console.error('Error deleting expense:', error);
              Alert.alert('Error', 'Failed to delete expense. Please try again.');
            }
          }
        }
      ]
    );
  };
  
  const handleEditExpense = (expense: Expense) => {
    setSelectedExpense(expense);
    setExpenseModalVisible(true);
  };
  
  const openAddExpenseModal = () => {
    setSelectedExpense(null);
    setExpenseModalVisible(true);
  };
  
  const handleViewInvoice = async () => {
    if (!car.pdfInvoiceUri) {
      Alert.alert('No Invoice', 'There is no invoice PDF attached to this car.');
      return;
    }
    
    try {
      setIsLoadingPdf(true);
      await openPdf(car.pdfInvoiceUri);
    } catch (error) {
      console.error('Error opening invoice:', error);
      Alert.alert('Error', 'Failed to open the invoice PDF. The file may be corrupted or missing.');
    } finally {
      setIsLoadingPdf(false);
    }
  };
  
  const handleEditCar = () => {
    router.push({
      pathname: '/edit-car',
      params: { id: car.id }
    });
  };
  
  const profit = car.sold && car.sellingPrice 
    ? car.sellingPrice - totalCost
    : null;
  
  const isProfitable = profit !== null && profit > 0;
  
  return (
    <>
      <Stack.Screen 
        options={{
          title: `${car.year} ${car.make} ${car.model}`,
          headerRight: () => (
            <TouchableOpacity 
              onPress={handleDelete}
              style={styles.headerButton}
            >
              <Trash2 size={20} color={theme.danger} />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <ScrollView 
        style={[styles.container, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.content}
      >
        {car.imageUri ? (
          <Image 
            source={{ uri: car.imageUri }} 
            style={styles.carImage} 
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.imagePlaceholder, { backgroundColor: theme.card }]}>
            <CarIcon size={40} color={theme.primary} />
          </View>
        )}
        
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            {car.year} {car.make} {car.model}
          </Text>
          {car.sold && (
            <View style={[styles.soldBadge, { backgroundColor: theme.success }]}>
              <Text style={styles.soldBadgeText}>SOLD</Text>
            </View>
          )}
        </View>
        
        <View style={styles.detailsSection}>
          <DetailRow 
            icon={<Calendar size={20} color={theme.primary} />}
            label="Year"
            value={car.year.toString()}
            theme={theme}
          />
          
          <DetailRow 
            icon={<Gauge size={20} color={theme.primary} />}
            label="Mileage"
            value={`${car.miles.toLocaleString()} miles`}
            theme={theme}
          />
          
          {car.color && (
            <DetailRow 
              icon={<Palette size={20} color={theme.primary} />}
              label="Color"
              value={car.color}
              theme={theme}
            />
          )}
          
          <DetailRow 
            icon={<DollarSign size={20} color={theme.primary} />}
            label="Purchase Price"
            value={`$${car.purchasePrice.toLocaleString()}`}
            theme={theme}
          />
          
          <DetailRow 
            icon={<BookOpen size={20} color={theme.primary} />}
            label="Inventory Value"
            value={`$${car.bookValue.toLocaleString()}`}
            theme={theme}
          />
          
          <DetailRow 
            icon={<DollarSign size={20} color={theme.primary} />}
            label="Total Expenses"
            value={`$${totalExpenses.toLocaleString()}`}
            theme={theme}
          />
          
          <DetailRow 
            icon={<DollarSign size={20} color={theme.primary} />}
            label="Total Cost"
            value={`$${totalCost.toLocaleString()}`}
            theme={theme}
          />
          
          <DetailRow 
            icon={<Calendar size={20} color={theme.primary} />}
            label="Added On"
            value={formatDate(car.createdAt)}
            theme={theme}
          />
          
          {car.sold && car.sellingPrice && (
            <>
              <DetailRow 
                icon={<DollarSign size={20} color={theme.primary} />}
                label="Selling Price"
                value={`$${car.sellingPrice.toLocaleString()}`}
                theme={theme}
              />
              
              <DetailRow 
                icon={<DollarSign size={20} color={isProfitable ? theme.success : theme.danger} />}
                label="Profit/Loss"
                value={`${isProfitable ? '+' : ''}$${Math.abs(profit || 0).toLocaleString()}`}
                valueColor={isProfitable ? theme.success : theme.danger}
                theme={theme}
              />
              
              <DetailRow 
                icon={<Calendar size={20} color={theme.primary} />}
                label="Sold On"
                value={car.soldDate ? formatDate(car.soldDate) : 'N/A'}
                theme={theme}
              />
            </>
          )}
          
          {car.pdfInvoiceUri && (
            <TouchableOpacity 
              style={[styles.invoiceButton, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={handleViewInvoice}
              disabled={isLoadingPdf}
            >
              {isLoadingPdf ? (
                <ActivityIndicator size="small" color={theme.primary} style={styles.buttonIcon} />
              ) : (
                <FileText size={20} color={theme.primary} style={styles.buttonIcon} />
              )}
              <Text style={[styles.invoiceButtonText, { color: theme.text }]}>
                {isLoadingPdf ? 'Opening Invoice...' : 'View Purchase Invoice'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.expensesSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Expenses
            </Text>
            <TouchableOpacity 
              style={[styles.addExpenseButton, { backgroundColor: theme.primary }]}
              onPress={openAddExpenseModal}
            >
              <PlusCircle size={16} color="white" style={styles.buttonIcon} />
              <Text style={styles.addExpenseText}>Add Expense</Text>
            </TouchableOpacity>
          </View>
          
          {expenses.length > 0 ? (
            expenses.map((expense) => (
              <ExpenseItem 
                key={expense.id}
                expense={expense}
                onDelete={() => handleDeleteExpense(expense.id)}
                onEdit={() => handleEditExpense(expense)}
              />
            ))
          ) : (
            <Text style={[styles.noExpensesText, { color: theme.subtext }]}>
              No expenses added yet.
            </Text>
          )}
        </View>
        
        {car.notes && (
          <View style={styles.notesSection}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Notes
            </Text>
            <Text style={[styles.notesText, { color: theme.text }]}>
              {car.notes}
            </Text>
          </View>
        )}
        
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.editButton, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={handleEditCar}
          >
            <Edit3 size={20} color={theme.primary} style={styles.buttonIcon} />
            <Text style={[styles.editButtonText, { color: theme.text }]}>Edit Car</Text>
          </TouchableOpacity>
          
          {!car.sold && (
            <TouchableOpacity 
              style={[styles.sellButton, { backgroundColor: theme.primary }]}
              onPress={() => setSellModalVisible(true)}
            >
              <Tag size={20} color="white" style={styles.buttonIcon} />
              <Text style={styles.sellButtonText}>Mark as Sold</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
      
      <SellCarModal 
        visible={sellModalVisible}
        purchasePrice={totalCost}
        onClose={() => setSellModalVisible(false)}
        onSell={handleSell}
      />
      
      <ExpenseForm 
        visible={expenseModalVisible}
        initialValues={selectedExpense || undefined}
        onClose={() => {
          setExpenseModalVisible(false);
          setSelectedExpense(null);
        }}
        onSubmit={selectedExpense ? handleUpdateExpense : handleAddExpense}
      />
    </>
  );
}

interface DetailRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueColor?: string;
  theme: typeof colors.light;
}

const DetailRow = ({ icon, label, value, valueColor, theme }: DetailRowProps) => (
  <View style={[styles.detailRow, { borderBottomColor: theme.border }]}>
    <View style={styles.detailIcon}>
      {icon}
    </View>
    <View style={styles.detailContent}>
      <Text style={[styles.detailLabel, { color: theme.subtext }]}>{label}</Text>
      <Text style={[styles.detailValue, { color: valueColor || theme.text }]}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  loader: {
    marginTop: 40,
  },
  carImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  headerButton: {
    padding: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  soldBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  soldBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  detailsSection: {
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  detailIcon: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailContent: {
    flex: 1,
    marginLeft: 12,
  },
  detailLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  invoiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  invoiceButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  expensesSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  addExpenseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  buttonIcon: {
    marginRight: 4,
  },
  addExpenseText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  noExpensesText: {
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 8,
    marginBottom: 12,
  },
  notesSection: {
    marginBottom: 24,
  },
  notesText: {
    fontSize: 16,
    lineHeight: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 8,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 8,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  sellButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginLeft: 8,
  },
  sellButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});