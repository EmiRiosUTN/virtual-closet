/*
  # Create virtual try-ons table

  1. New Tables
    - `virtual_tryons`
      - `id` (uuid, primary key) - Unique identifier for each saved try-on
      - `user_id` (uuid, foreign key) - Reference to the user who owns this try-on
      - `name` (text) - Custom name given by the user to identify this try-on
      - `user_photo_id` (uuid, foreign key) - Reference to the user photo used
      - `clothing_item_id` (uuid, foreign key) - Reference to the clothing item used
      - `result_image_url` (text) - URL of the generated try-on image stored in Supabase storage
      - `created_at` (timestamptz) - Timestamp when the try-on was saved

  2. Security
    - Enable RLS on `virtual_tryons` table
    - Add policy for users to view their own saved try-ons
    - Add policy for users to insert their own try-ons
    - Add policy for users to delete their own try-ons
    - Add policy for users to update their own try-ons

  3. Important Notes
    - Foreign keys ensure referential integrity
    - Cascading deletes ensure cleanup when related records are removed
    - All policies check user ownership via auth.uid()
*/

CREATE TABLE IF NOT EXISTS virtual_tryons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  user_photo_id uuid NOT NULL REFERENCES user_photos(id) ON DELETE CASCADE,
  clothing_item_id uuid NOT NULL REFERENCES clothing_items(id) ON DELETE CASCADE,
  result_image_url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE virtual_tryons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saved try-ons"
  ON virtual_tryons FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own try-ons"
  ON virtual_tryons FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own try-ons"
  ON virtual_tryons FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own try-ons"
  ON virtual_tryons FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_virtual_tryons_user_id ON virtual_tryons(user_id);
CREATE INDEX IF NOT EXISTS idx_virtual_tryons_created_at ON virtual_tryons(created_at DESC);