-- Create cars table
CREATE TABLE cars (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  mileage INTEGER NOT NULL,
  purchase_price DECIMAL(10, 2) NOT NULL,
  book_value DECIMAL(10, 2),
  color TEXT,
  sale_price DECIMAL(10, 2),
  sold BOOLEAN DEFAULT false,
  sale_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  image_url TEXT,
  invoice_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create expenses table
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  car_id UUID REFERENCES cars(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  expense_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
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

-- Storage bucket policies
-- For car-photos bucket
CREATE POLICY "Anyone can view car photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'car-photos');

CREATE POLICY "Authenticated users can upload car photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'car-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own car photos"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'car-photos' AND auth.uid() = owner);

CREATE POLICY "Users can delete their own car photos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'car-photos' AND auth.uid() = owner);

-- For invoices bucket
CREATE POLICY "Authenticated users can view invoices"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'invoices' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can upload invoices"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'invoices' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own invoices"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'invoices' AND auth.uid() = owner);

CREATE POLICY "Users can delete their own invoices"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'invoices' AND auth.uid() = owner);