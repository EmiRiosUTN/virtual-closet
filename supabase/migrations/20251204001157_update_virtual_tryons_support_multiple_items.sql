/*
  # Update virtual try-ons table to support multiple clothing items

  1. Changes
    - Drop the `clothing_item_id` column (single ID)
    - Add `clothing_item_ids` column (array of IDs) to support multiple clothing items in one try-on
    
  2. Important Notes
    - This migration uses IF EXISTS checks to be idempotent
    - The new column uses an array type to store multiple clothing item IDs
    - This matches the pattern used in the outfits table
*/

DO $$
BEGIN
  -- Check if the old column exists and drop it
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'virtual_tryons' AND column_name = 'clothing_item_id'
  ) THEN
    ALTER TABLE virtual_tryons DROP COLUMN clothing_item_id;
  END IF;

  -- Check if the new column doesn't exist and add it
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'virtual_tryons' AND column_name = 'clothing_item_ids'
  ) THEN
    ALTER TABLE virtual_tryons ADD COLUMN clothing_item_ids uuid[] NOT NULL DEFAULT ARRAY[]::uuid[];
  END IF;
END $$;