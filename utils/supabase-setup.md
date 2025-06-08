# Supabase Integration Guide for AM Motor

This guide will walk you through setting up Supabase for your Car Flipping Inventory Management app.

## 1. Create a Supabase Account and Project

1. Go to [supabase.com](https://supabase.com/) and sign up for an account
2. Create a new project and note your project URL and anon key

## 2. Set Up Database Tables

Execute the following SQL in the Supabase SQL Editor:

```sql
-- Create cars table
CREATE TABLE cars (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  miles INTEGER NOT NULL,
  purchase_price DECIMAL(10, 2) NOT NULL,
  selling_price DECIMAL(10, 2),
  sold BOOLEAN DEFAULT false,
  sold_date TIMESTAMP,
  notes TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create expenses table
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  car_id UUID REFERENCES cars(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Set up Row Level Security (RLS)
ALTER TABLE cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Create policies for cars
CREATE POLICY "Users can view their own cars" 
  ON cars FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cars" 
  ON cars FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cars" 
  ON cars FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cars" 
  ON cars FOR DELETE 
  USING (auth.uid() = user_id);

-- Create policies for expenses
CREATE POLICY "Users can view their own expenses" 
  ON expenses FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own expenses" 
  ON expenses FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own expenses" 
  ON expenses FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own expenses" 
  ON expenses FOR DELETE 
  USING (auth.uid() = user_id);
```

## 3. Install Supabase Client in Your App

```bash
npm install @supabase/supabase-js
```

## 4. Create Supabase Client Configuration

Create a new file `lib/supabase.ts`:

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

// Replace with your Supabase URL and anon key
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

## 5. Create Authentication Screens

Create login and signup screens to authenticate users with Supabase.

## 6. Update Car Store to Use Supabase

Modify your car store to use Supabase for data storage:

```typescript
// Example of fetching cars from Supabase
const fetchCars = async () => {
  try {
    const { data, error } = await supabase
      .from('cars')
      .select(`
        *,
        expenses (*)
      `)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    // Transform data to match your app's structure
    const transformedCars = data.map(car => ({
      id: car.id,
      make: car.make,
      model: car.model,
      year: car.year,
      miles: car.miles,
      purchasePrice: car.purchase_price,
      sellingPrice: car.selling_price,
      sold: car.sold,
      soldDate: car.sold_date,
      notes: car.notes,
      imageUri: car.image_url,
      createdAt: car.created_at,
      expenses: car.expenses.map(expense => ({
        id: expense.id,
        description: expense.description,
        amount: expense.amount,
        date: expense.date
      }))
    }));
    
    set({ cars: transformedCars });
  } catch (error) {
    console.error('Error fetching cars:', error);
  }
};

// Example of adding a car to Supabase
const addCar = async (carData) => {
  try {
    const { data, error } = await supabase
      .from('cars')
      .insert({
        make: carData.make,
        model: carData.model,
        year: carData.year,
        miles: carData.miles,
        purchase_price: carData.purchasePrice,
        notes: carData.notes,
        image_url: carData.imageUri,
        user_id: supabase.auth.user()?.id
      })
      .select();
      
    if (error) throw error;
    
    // Refresh cars after adding
    fetchCars();
  } catch (error) {
    console.error('Error adding car:', error);
  }
};
```

## 7. Set Up Real-time Subscriptions

```typescript
// In your component or store
useEffect(() => {
  const subscription = supabase
    .from('cars')
    .on('*', payload => {
      // Refresh data when changes occur
      fetchCars();
    })
    .subscribe();
    
  return () => {
    supabase.removeSubscription(subscription);
  };
}, []);
```

## 8. Handle Image Uploads

```typescript
const uploadImage = async (uri) => {
  try {
    const fileName = uri.split('/').pop();
    const fileExt = fileName.split('.').pop();
    const filePath = `${supabase.auth.user()?.id}/${Date.now()}.${fileExt}`;
    
    // Convert image to blob
    const response = await fetch(uri);
    const blob = await response.blob();
    
    // Upload to Supabase Storage
    const { data, error } = await supabase
      .storage
      .from('car-images')
      .upload(filePath, blob);
      
    if (error) throw error;
    
    // Get public URL
    const { publicURL, error: urlError } = supabase
      .storage
      .from('car-images')
      .getPublicUrl(filePath);
      
    if (urlError) throw urlError;
    
    return publicURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
};
```

## 9. Update Your App to Handle Offline/Online Sync

Consider implementing a sync mechanism that stores changes locally when offline and syncs when the app comes back online.

## 10. Implement Error Handling and Loading States

Add proper error handling and loading states throughout your app to provide a good user experience.

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase React Native Guide](https://supabase.com/docs/guides/with-react-native)
- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)