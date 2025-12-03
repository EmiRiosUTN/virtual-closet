/*
  # Fix Storage Buckets - Enable Public Access

  1. Changes
    - Update storage buckets to be public
    - This allows images to be accessed via public URLs
    - RLS policies still protect who can upload/modify/delete

  2. Security
    - Users can only upload/modify/delete their own images (via RLS)
    - Anyone with the exact URL can view images (standard for image storage)
    - URLs include user_id in path, making them hard to guess
*/

-- Update buckets to be public
UPDATE storage.buckets
SET public = true
WHERE id IN ('clothing-images', 'user-photos');
