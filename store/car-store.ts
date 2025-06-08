import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Car, CarStats, Expense } from '@/types/car';
import { Platform } from 'react-native';

interface CarState {
  cars: Car[];
  searchQuery: string;
  loading: boolean;
  error: string | null;
  
  // Query functions
  setSearchQuery: (query: string) => void;
  getFilteredCars: () => Car[];
  getCarStats: () => CarStats;
  
  // CRUD operations
  fetchCars: () => Promise<void>;
  addCar: (car: Omit<Car, 'id' | 'createdAt' | 'sold' | 'expenses'>) => Promise<void>;
  updateCar: (id: string, updates: Partial<Car>) => Promise<void>;
  deleteCar: (id: string) => Promise<void>;
  sellCar: (id: string, sellingPrice: number) => Promise<void>;
  
  // Expense operations
  addExpense: (carId: string, expense: Omit<Expense, 'id'>) => Promise<void>;
  updateExpense: (carId: string, expenseId: string, updates: Partial<Expense>) => Promise<void>;
  deleteExpense: (carId: string, expenseId: string) => Promise<void>;
}

export const useCarStore = create<CarState>((set, get) => ({
  cars: [],
  searchQuery: '',
  loading: false,
  error: null,
  
  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },
  
  getFilteredCars: () => {
    const { cars, searchQuery } = get();
    if (!searchQuery.trim()) return cars;
    
    const query = searchQuery.toLowerCase().trim();
    return cars.filter(car => 
      car.make.toLowerCase().includes(query) || 
      car.model.toLowerCase().includes(query) ||
      car.year.toString().includes(query)
    );
  },
  
  getCarStats: () => {
    const { cars } = get();
    const soldCars = cars.filter(car => car.sold);
    const inventoryCars = cars.filter(car => !car.sold);
    
    const totalInvestment = cars.reduce((sum, car) => {
      const expensesTotal = car.expenses.reduce((total, expense) => total + expense.amount, 0);
      return sum + car.purchasePrice + expensesTotal;
    }, 0);
    
    const totalRevenue = soldCars.reduce((sum, car) => sum + (car.sellingPrice || 0), 0);
    
    const totalProfit = soldCars.reduce((sum, car) => {
      const expensesTotal = car.expenses.reduce((total, expense) => total + expense.amount, 0);
      return sum + ((car.sellingPrice || 0) - car.purchasePrice - expensesTotal);
    }, 0);
    
    const totalBookValue = inventoryCars.reduce((sum, car) => sum + car.bookValue, 0);
    
    return {
      totalCars: cars.length,
      soldCars: soldCars.length,
      inventoryCars: inventoryCars.length,
      totalInvestment,
      totalRevenue,
      totalProfit,
      averageProfit: soldCars.length > 0 ? totalProfit / soldCars.length : 0,
      totalBookValue
    };
  },
  
  fetchCars: async () => {
    set({ loading: true, error: null });
    
    try {
      const storedCars = await AsyncStorage.getItem('cars');
      if (storedCars) {
        set({ 
          cars: JSON.parse(storedCars),
          loading: false
        });
      } else {
        set({ loading: false });
      }
    } catch (error: any) {
      console.error('Error fetching cars:', error);
      set({ 
        error: error.message || 'Failed to fetch cars',
        loading: false
      });
    }
  },
  
  addCar: async (carData) => {
    try {
      set({ loading: true, error: null });
      
      // Create a new car object
      const newCar: Car = {
        ...carData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        sold: false,
        expenses: [],
        bookValue: carData.bookValue || carData.purchasePrice,
      };
      
      // Update local state
      set(state => ({
        cars: [newCar, ...state.cars],
        loading: false
      }));
      
      // Update local storage
      const updatedCars = [...get().cars];
      await AsyncStorage.setItem('cars', JSON.stringify(updatedCars));
      
    } catch (error: any) {
      console.error('Error adding car:', error);
      set({ 
        error: error.message || 'Failed to add car',
        loading: false
      });
    }
  },
  
  updateCar: async (id, updates) => {
    const { cars } = get();
    
    try {
      set({ loading: true, error: null });
      
      // Find the car to update
      const carIndex = cars.findIndex(car => car.id === id);
      if (carIndex === -1) {
        throw new Error('Car not found');
      }
      
      // Create updated car object
      const updatedCar = { ...cars[carIndex], ...updates };
      
      // Update local state
      const updatedCars = [...cars];
      updatedCars[carIndex] = updatedCar;
      
      set({
        cars: updatedCars,
        loading: false
      });
      
      // Update local storage
      await AsyncStorage.setItem('cars', JSON.stringify(updatedCars));
      
    } catch (error: any) {
      console.error('Error updating car:', error);
      set({ 
        error: error.message || 'Failed to update car',
        loading: false
      });
    }
  },
  
  deleteCar: async (id) => {
    const { cars } = get();
    
    try {
      set({ loading: true, error: null });
      
      // Update local state
      const updatedCars = cars.filter(car => car.id !== id);
      
      set({
        cars: updatedCars,
        loading: false
      });
      
      // Update local storage
      await AsyncStorage.setItem('cars', JSON.stringify(updatedCars));
      
    } catch (error: any) {
      console.error('Error deleting car:', error);
      set({ 
        error: error.message || 'Failed to delete car',
        loading: false
      });
    }
  },
  
  sellCar: async (id, sellingPrice) => {
    const { cars } = get();
    
    try {
      set({ loading: true, error: null });
      
      // Find the car to update
      const carIndex = cars.findIndex(car => car.id === id);
      if (carIndex === -1) {
        throw new Error('Car not found');
      }
      
      const soldDate = new Date().toISOString();
      
      // Create updated car object
      const updatedCar = { 
        ...cars[carIndex], 
        sold: true, 
        sellingPrice, 
        soldDate 
      };
      
      // Update local state
      const updatedCars = [...cars];
      updatedCars[carIndex] = updatedCar;
      
      set({
        cars: updatedCars,
        loading: false
      });
      
      // Update local storage
      await AsyncStorage.setItem('cars', JSON.stringify(updatedCars));
      
    } catch (error: any) {
      console.error('Error selling car:', error);
      set({ 
        error: error.message || 'Failed to mark car as sold',
        loading: false
      });
    }
  },
  
  addExpense: async (carId, expense) => {
    const { cars } = get();
    
    try {
      set({ loading: true, error: null });
      
      // Find the car to update
      const carIndex = cars.findIndex(car => car.id === carId);
      if (carIndex === -1) {
        throw new Error('Car not found');
      }
      
      // Create new expense object
      const newExpense: Expense = {
        ...expense,
        id: Date.now().toString()
      };
      
      // Update local state
      const updatedCar = { 
        ...cars[carIndex],
        expenses: [...cars[carIndex].expenses, newExpense]
      };
      
      const updatedCars = [...cars];
      updatedCars[carIndex] = updatedCar;
      
      set({
        cars: updatedCars,
        loading: false
      });
      
      // Update local storage
      await AsyncStorage.setItem('cars', JSON.stringify(updatedCars));
      
    } catch (error: any) {
      console.error('Error adding expense:', error);
      set({ 
        error: error.message || 'Failed to add expense',
        loading: false
      });
    }
  },
  
  updateExpense: async (carId, expenseId, updates) => {
    const { cars } = get();
    
    try {
      set({ loading: true, error: null });
      
      // Find the car
      const carIndex = cars.findIndex(car => car.id === carId);
      if (carIndex === -1) {
        throw new Error('Car not found');
      }
      
      // Find the expense
      const expenseIndex = cars[carIndex].expenses.findIndex(exp => exp.id === expenseId);
      if (expenseIndex === -1) {
        throw new Error('Expense not found');
      }
      
      // Create updated expense
      const updatedExpense = { 
        ...cars[carIndex].expenses[expenseIndex],
        ...updates
      };
      
      // Update local state
      const updatedExpenses = [...cars[carIndex].expenses];
      updatedExpenses[expenseIndex] = updatedExpense;
      
      const updatedCar = { 
        ...cars[carIndex],
        expenses: updatedExpenses
      };
      
      const updatedCars = [...cars];
      updatedCars[carIndex] = updatedCar;
      
      set({
        cars: updatedCars,
        loading: false
      });
      
      // Update local storage
      await AsyncStorage.setItem('cars', JSON.stringify(updatedCars));
      
    } catch (error: any) {
      console.error('Error updating expense:', error);
      set({ 
        error: error.message || 'Failed to update expense',
        loading: false
      });
    }
  },
  
  deleteExpense: async (carId, expenseId) => {
    const { cars } = get();
    
    try {
      set({ loading: true, error: null });
      
      // Find the car
      const carIndex = cars.findIndex(car => car.id === carId);
      if (carIndex === -1) {
        throw new Error('Car not found');
      }
      
      // Update local state
      const updatedExpenses = cars[carIndex].expenses.filter(exp => exp.id !== expenseId);
      
      const updatedCar = { 
        ...cars[carIndex],
        expenses: updatedExpenses
      };
      
      const updatedCars = [...cars];
      updatedCars[carIndex] = updatedCar;
      
      set({
        cars: updatedCars,
        loading: false
      });
      
      // Update local storage
      await AsyncStorage.setItem('cars', JSON.stringify(updatedCars));
      
    } catch (error: any) {
      console.error('Error deleting expense:', error);
      set({ 
        error: error.message || 'Failed to delete expense',
        loading: false
      });
    }
  },
}));