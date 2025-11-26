/*
  # Virtual Closet Database Schema

  1. New Tables
    - `clothing_items`
      - `id` (uuid, primary key)
      - `name` (text)
      - `category` (text)
      - `image_url` (text) - Stores base64 image data
      - `created_at` (timestamptz)
    
    - `user_photos`
      - `id` (uuid, primary key)
      - `name` (text)
      - `image_url` (text) - Stores base64 image data
      - `created_at` (timestamptz)
    
    - `try_on_results`
      - `id` (uuid, primary key)
      - `result_image_url` (text) - Stores base64 result image
      - `user_photo_id` (uuid, foreign key to user_photos)
      - `clothing_item_ids` (text[]) - Array of clothing item IDs
      - `created_at` (timestamptz)
    
    - `outfits`
      - `id` (uuid, primary key)
      - `name` (text)
      - `clothing_item_ids` (text[]) - Array of clothing item IDs
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - All tables are public (no authentication required for this demo)
    - Anyone can read, insert, update, and delete their own data
*/

-- Create clothing_items table
CREATE TABLE IF NOT EXISTS clothing_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  image_url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE clothing_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view clothing items"
  ON clothing_items FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert clothing items"
  ON clothing_items FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update clothing items"
  ON clothing_items FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete clothing items"
  ON clothing_items FOR DELETE
  TO public
  USING (true);

-- Create user_photos table
CREATE TABLE IF NOT EXISTS user_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  image_url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view user photos"
  ON user_photos FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert user photos"
  ON user_photos FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update user photos"
  ON user_photos FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete user photos"
  ON user_photos FOR DELETE
  TO public
  USING (true);

-- Create try_on_results table
CREATE TABLE IF NOT EXISTS try_on_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  result_image_url text NOT NULL,
  user_photo_id uuid REFERENCES user_photos(id) ON DELETE CASCADE,
  clothing_item_ids text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE try_on_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view try-on results"
  ON try_on_results FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert try-on results"
  ON try_on_results FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update try-on results"
  ON try_on_results FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete try-on results"
  ON try_on_results FOR DELETE
  TO public
  USING (true);

-- Create outfits table
CREATE TABLE IF NOT EXISTS outfits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  clothing_item_ids text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE outfits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view outfits"
  ON outfits FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert outfits"
  ON outfits FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update outfits"
  ON outfits FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete outfits"
  ON outfits FOR DELETE
  TO public
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_clothing_items_category ON clothing_items(category);
CREATE INDEX IF NOT EXISTS idx_try_on_results_user_photo ON try_on_results(user_photo_id);
CREATE INDEX IF NOT EXISTS idx_clothing_items_created_at ON clothing_items(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_photos_created_at ON user_photos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_outfits_created_at ON outfits(created_at DESC);