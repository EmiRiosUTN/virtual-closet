/*
  # Add Authentication and Storage Configuration

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `first_name` (text) - User's first name
      - `last_name` (text) - User's last name
      - `email` (text) - User's email (synced from auth.users)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Changes to Existing Tables
    - Add `user_id` column to: `clothing_items`, `user_photos`, `try_on_results`, `outfits`
    - Link all tables to `auth.users` via foreign key

  3. Storage Buckets
    - `clothing-images` - For clothing item photos
    - `user-photos` - For user's personal photos
    - Both buckets configured with authentication required

  4. Security Updates
    - Remove public access policies
    - Add restrictive RLS policies that check auth.uid()
    - Users can only access their own data
    - Profile table syncs with auth.users on sign up
*/

-- Create profiles table for user metadata
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Add user_id column to existing tables
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clothing_items' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE clothing_items ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_clothing_items_user_id ON clothing_items(user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_photos' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE user_photos ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_user_photos_user_id ON user_photos(user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'try_on_results' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE try_on_results ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_try_on_results_user_id ON try_on_results(user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'outfits' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE outfits ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_outfits_user_id ON outfits(user_id);
  END IF;
END $$;

-- Drop old public policies
DROP POLICY IF EXISTS "Anyone can view clothing items" ON clothing_items;
DROP POLICY IF EXISTS "Anyone can insert clothing items" ON clothing_items;
DROP POLICY IF EXISTS "Anyone can update clothing items" ON clothing_items;
DROP POLICY IF EXISTS "Anyone can delete clothing items" ON clothing_items;

DROP POLICY IF EXISTS "Anyone can view user photos" ON user_photos;
DROP POLICY IF EXISTS "Anyone can insert user photos" ON user_photos;
DROP POLICY IF EXISTS "Anyone can update user photos" ON user_photos;
DROP POLICY IF EXISTS "Anyone can delete user photos" ON user_photos;

DROP POLICY IF EXISTS "Anyone can view try-on results" ON try_on_results;
DROP POLICY IF EXISTS "Anyone can insert try-on results" ON try_on_results;
DROP POLICY IF EXISTS "Anyone can update try-on results" ON try_on_results;
DROP POLICY IF EXISTS "Anyone can delete try-on results" ON try_on_results;

DROP POLICY IF EXISTS "Anyone can view outfits" ON outfits;
DROP POLICY IF EXISTS "Anyone can insert outfits" ON outfits;
DROP POLICY IF EXISTS "Anyone can update outfits" ON outfits;
DROP POLICY IF EXISTS "Anyone can delete outfits" ON outfits;

-- Create secure RLS policies for clothing_items
CREATE POLICY "Users can view own clothing items"
  ON clothing_items FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own clothing items"
  ON clothing_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own clothing items"
  ON clothing_items FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own clothing items"
  ON clothing_items FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create secure RLS policies for user_photos
CREATE POLICY "Users can view own photos"
  ON user_photos FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own photos"
  ON user_photos FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own photos"
  ON user_photos FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own photos"
  ON user_photos FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create secure RLS policies for try_on_results
CREATE POLICY "Users can view own try-on results"
  ON try_on_results FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own try-on results"
  ON try_on_results FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own try-on results"
  ON try_on_results FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own try-on results"
  ON try_on_results FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create secure RLS policies for outfits
CREATE POLICY "Users can view own outfits"
  ON outfits FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own outfits"
  ON outfits FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own outfits"
  ON outfits FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own outfits"
  ON outfits FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create storage buckets for images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('clothing-images', 'clothing-images', false, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('user-photos', 'user-photos', false, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies for clothing-images bucket
CREATE POLICY "Users can upload own clothing images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'clothing-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own clothing images"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'clothing-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update own clothing images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'clothing-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own clothing images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'clothing-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for user-photos bucket
CREATE POLICY "Users can upload own user photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'user-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own user photos"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'user-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update own user photos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'user-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own user photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'user-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, email)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'first_name', ''),
    COALESCE(new.raw_user_meta_data->>'last_name', ''),
    new.email
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on profile changes
DROP TRIGGER IF EXISTS on_profile_updated ON profiles;
CREATE TRIGGER on_profile_updated
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();