-- Run this in the Supabase SQL Editor to set up the required tables for IngreCheck

-- 1. Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    name TEXT,
    dietary_tags TEXT[] DEFAULT '{}',
    allergens TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (RLS) on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profile Policies: Users can view and edit their own profiles
CREATE POLICY "Users can view own profile" 
    ON public.profiles FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
    ON public.profiles FOR INSERT 
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

-- Function to automatically create a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (new.id, new.raw_user_meta_data->>'name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Create scan_history table
-- To add scan_count if you already ran this script:
-- ALTER TABLE public.scan_history ADD COLUMN IF NOT EXISTS scan_count INT DEFAULT 1;
CREATE TABLE IF NOT EXISTS public.scan_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE,
    barcode TEXT,
    product_name TEXT,
    brand TEXT,
    image_url TEXT,
    nutriscore TEXT,
    nova_group INT,
    ingrecheck_score INT,
    scan_count INT DEFAULT 1,
    scanned_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on scan_history
ALTER TABLE public.scan_history ENABLE ROW LEVEL SECURITY;

-- Scan History Policies: Users can view and insert their own scan history
CREATE POLICY "Users can view own scan history" 
    ON public.scan_history FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scan history" 
    ON public.scan_history FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own scan history" 
    ON public.scan_history FOR DELETE 
    USING (auth.uid() = user_id);

-- 3. Add admin role to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- 4. Create custom_products table
CREATE TABLE IF NOT EXISTS public.custom_products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    barcode TEXT UNIQUE NOT NULL,
    product_name TEXT NOT NULL,
    brand TEXT,
    ingredients_text TEXT,
    image_url TEXT,
    status TEXT DEFAULT 'pending', -- pending, approved, rejected
    created_by UUID REFERENCES auth.users ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on custom_products
ALTER TABLE public.custom_products ENABLE ROW LEVEL SECURITY;

-- Custom Products Policies
-- Anyone can view approved products, or their own pending products
CREATE POLICY "View approved or own pending products" 
    ON public.custom_products FOR SELECT 
    USING (status = 'approved' OR auth.uid() = created_by);

-- Authenticated users can insert pending products
CREATE POLICY "Users can insert custom products" 
    ON public.custom_products FOR INSERT 
    WITH CHECK (auth.uid() = created_by);

-- Admin can do anything
CREATE POLICY "Admin can update custom products" 
    ON public.custom_products FOR UPDATE 
    USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Admin can delete custom products" 
    ON public.custom_products FOR DELETE 
    USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Admin can view all custom products" 
    ON public.custom_products FOR SELECT 
    USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
