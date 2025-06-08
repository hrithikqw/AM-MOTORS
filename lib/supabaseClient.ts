import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { decode } from 'base64-arraybuffer';
import { Car } from '@/types/car';
import { Expense } from '@/types/expense';
import { Platform } from 'react-native';
import 'react-native-url-polyfill/auto';
import Constants from 'expo-constants';

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || '';
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Check your app.config.js file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});


// Authentication functions
export const signUpWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  
  if (error) throw error;
  return data.user;
};

export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
  return data.user;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user;
};

// Car functions
export const fetchCars = async (): Promise<Car[]> => {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) throw new Error('User not authenticated');
  
  const { data, error } = await supabase
    .from('cars')
    .select('*')
    .eq('user_id', userData.user.id)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  
  // Transform data to match app's Car type
  return data.map(car => ({
    id: car.id,
    make: car.make,
    model: car.model,
    year: car.year,
    miles: car.mileage,
    purchasePrice: car.purchase_price,
    bookValue: car.book_value || car.purchase_price,
    sellingPrice: car.sale_price,
    sold: car.sold,
    soldDate: car.sale_date,
    notes: car.notes,
    imageUri: car.image_url,
    pdfInvoiceUri: car.invoice_url,
    createdAt: car.created_at,
    expenses: [], // Expenses will be fetched separately
    color: car.color
  }));
};

export const createCar = async (carData: Omit<Car, 'id' | 'createdAt' | 'expenses' | 'sold' | 'soldDate' | 'sellingPrice'>): Promise<Car> => {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) throw new Error('User not authenticated');
  
  const { data, error } = await supabase
    .from('cars')
    .insert({
      user_id: userData.user.id,
      make: carData.make,
      model: carData.model,
      year: carData.year,
      mileage: carData.miles,
      purchase_price: carData.purchasePrice,
      book_value: carData.bookValue,
      color: carData.color || null,
      notes: carData.notes,
      image_url: carData.imageUri,
      invoice_url: carData.pdfInvoiceUri,
      sold: false
    })
    .select()
    .single();
  
  if (error) throw error;
  
  // Transform to Car type
  return {
    id: data.id,
    make: data.make,
    model: data.model,
    year: data.year,
    miles: data.mileage,
    purchasePrice: data.purchase_price,
    bookValue: data.book_value || data.purchase_price,
    sellingPrice: data.sale_price,
    sold: data.sold,
    soldDate: data.sale_date,
    notes: data.notes,
    imageUri: data.image_url,
    pdfInvoiceUri: data.invoice_url,
    createdAt: data.created_at,
    expenses: [],
    color: data.color
  };
};

export const updateCar = async (carId: string, carData: Partial<Car>): Promise<Car> => {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) throw new Error('User not authenticated');
  
  // Transform Car type to database schema
  const updates: any = {};
  
  if (carData.make !== undefined) updates.make = carData.make;
  if (carData.model !== undefined) updates.model = carData.model;
  if (carData.year !== undefined) updates.year = carData.year;
  if (carData.miles !== undefined) updates.mileage = carData.miles;
  if (carData.purchasePrice !== undefined) updates.purchase_price = carData.purchasePrice;
  if (carData.bookValue !== undefined) updates.book_value = carData.bookValue;
  if (carData.notes !== undefined) updates.notes = carData.notes;
  if (carData.imageUri !== undefined) updates.image_url = carData.imageUri;
  if (carData.pdfInvoiceUri !== undefined) updates.invoice_url = carData.pdfInvoiceUri;
  if (carData.color !== undefined) updates.color = carData.color;
  
  const { data, error } = await supabase
    .from('cars')
    .update(updates)
    .eq('id', carId)
    .eq('user_id', userData.user.id)
    .select()
    .single();
  
  if (error) throw error;
  
  // Transform to Car type
  return {
    id: data.id,
    make: data.make,
    model: data.model,
    year: data.year,
    miles: data.mileage,
    purchasePrice: data.purchase_price,
    bookValue: data.book_value || data.purchase_price,
    sellingPrice: data.sale_price,
    sold: data.sold,
    soldDate: data.sale_date,
    notes: data.notes,
    imageUri: data.image_url,
    pdfInvoiceUri: data.invoice_url,
    createdAt: data.created_at,
    expenses: [],
    color: data.color
  };
};

export const deleteCar = async (carId: string): Promise<void> => {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) throw new Error('User not authenticated');
  
  const { error } = await supabase
    .from('cars')
    .delete()
    .eq('id', carId)
    .eq('user_id', userData.user.id);
  
  if (error) throw error;
};

export const markCarAsSold = async (carId: string, sellingPrice: number, soldDate: string): Promise<Car> => {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) throw new Error('User not authenticated');
  
  const { data, error } = await supabase
    .from('cars')
    .update({
      sold: true,
      sale_price: sellingPrice,
      sale_date: soldDate
    })
    .eq('id', carId)
    .eq('user_id', userData.user.id)
    .select()
    .single();
  
  if (error) throw error;
  
  // Transform to Car type
  return {
    id: data.id,
    make: data.make,
    model: data.model,
    year: data.year,
    miles: data.mileage,
    purchasePrice: data.purchase_price,
    bookValue: data.book_value || data.purchase_price,
    sellingPrice: data.sale_price,
    sold: data.sold,
    soldDate: data.sale_date,
    notes: data.notes,
    imageUri: data.image_url,
    pdfInvoiceUri: data.invoice_url,
    createdAt: data.created_at,
    expenses: [],
    color: data.color
  };
};

// Expense functions
export const fetchExpensesByCar = async (carId: string): Promise<Expense[]> => {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) throw new Error('User not authenticated');
  
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('car_id', carId)
    .eq('user_id', userData.user.id)
    .order('expense_date', { ascending: false });
  
  if (error) throw error;
  
  // Transform data to match app's Expense type
  return data.map(expense => ({
    id: expense.id,
    description: expense.description,
    amount: expense.amount,
    date: expense.expense_date
  }));
};

export const createExpense = async (carId: string, expenseData: Omit<Expense, 'id'>): Promise<Expense> => {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) throw new Error('User not authenticated');
  
  const { data, error } = await supabase
    .from('expenses')
    .insert({
      car_id: carId,
      user_id: userData.user.id,
      description: expenseData.description,
      amount: expenseData.amount,
      expense_date: expenseData.date
    })
    .select()
    .single();
  
  if (error) throw error;
  
  // Transform to Expense type
  return {
    id: data.id,
    description: data.description,
    amount: data.amount,
    date: data.expense_date
  };
};

export const updateExpense = async (expenseId: string, expenseData: Partial<Expense>): Promise<Expense> => {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) throw new Error('User not authenticated');
  
  // Transform Expense type to database schema
  const updates: any = {};
  
  if (expenseData.description !== undefined) updates.description = expenseData.description;
  if (expenseData.amount !== undefined) updates.amount = expenseData.amount;
  if (expenseData.date !== undefined) updates.expense_date = expenseData.date;
  
  const { data, error } = await supabase
    .from('expenses')
    .update(updates)
    .eq('id', expenseId)
    .eq('user_id', userData.user.id)
    .select()
    .single();
  
  if (error) throw error;
  
  // Transform to Expense type
  return {
    id: data.id,
    description: data.description,
    amount: data.amount,
    date: data.expense_date
  };
};

export const deleteExpense = async (expenseId: string): Promise<void> => {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) throw new Error('User not authenticated');
  
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', expenseId)
    .eq('user_id', userData.user.id);
  
  if (error) throw error;
};

// File upload functions
export const uploadCarImage = async (fileUri: string, carId: string): Promise<string> => {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) throw new Error('User not authenticated');
  
  try {
    // Generate a unique filename
    const fileName = `${Date.now()}.jpg`;
    const filePath = `${userData.user.id}/${carId}/${fileName}`;
    
    // Fetch the image and convert to blob
    const response = await fetch(fileUri);
    const blob = await response.blob();
    
    // Upload to Supabase Storage
    const { data, error } = await supabase
      .storage
      .from('car-photos')
      .upload(filePath, blob, {
        contentType: 'image/jpeg',
        upsert: true
      });
    
    if (error) throw error;
    
    // Get public URL
    const { data: urlData } = supabase
      .storage
      .from('car-photos')
      .getPublicUrl(filePath);
    
    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

export const uploadInvoicePdf = async (fileUri: string, carId: string): Promise<string> => {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) throw new Error('User not authenticated');
  
  try {
    // Generate a unique filename
    const fileName = `invoice_${Date.now()}.pdf`;
    const filePath = `${userData.user.id}/${carId}/${fileName}`;
    
    // Fetch the PDF and convert to blob
    const response = await fetch(fileUri);
    const blob = await response.blob();
    
    // Upload to Supabase Storage
    const { data, error } = await supabase
      .storage
      .from('invoices')
      .upload(filePath, blob, {
        contentType: 'application/pdf',
        upsert: true
      });
    
    if (error) throw error;
    
    // Get public URL
    const { data: urlData } = supabase
      .storage
      .from('invoices')
      .getPublicUrl(filePath);
    
    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading PDF:', error);
    throw error;
  }
};

// Helper function to get total expenses for a car
export const getCarTotalExpenses = async (carId: string): Promise<number> => {
  const expenses = await fetchExpensesByCar(carId);
  return expenses.reduce((sum, expense) => sum + expense.amount, 0);
};

// Helper function to get inventory stats
export const getInventoryStats = async () => {
  const cars = await fetchCars();
  
  // Fetch expenses for each car
  for (const car of cars) {
    car.expenses = await fetchExpensesByCar(car.id);
  }
  
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
};