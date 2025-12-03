/*
  # Create try-on-results storage bucket

  1. New Storage Bucket
    - `try-on-results` - For storing saved virtual try-on result images
    - Configured with authentication required
    - 5MB file size limit
    - Supports common image formats (JPEG, PNG, WebP, GIF)

  2. Security
    - Users can only upload images to their own folder (user_id/tryons/)
    - Users can only view their own try-on result images
    - Users can update and delete their own try-on result images
    - All operations require authentication

  3. Important Notes
    - Images are organized by user_id in folder structure
    - Policies check that the user owns the folder they're accessing
    - Uses the same security pattern as other storage buckets
*/

-- Create storage bucket for try-on results
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('try-on-results', 'try-on-results', false, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies for try-on-results bucket
CREATE POLICY "Users can upload own try-on results"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'try-on-results' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own try-on results"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'try-on-results' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update own try-on results"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'try-on-results' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own try-on results"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'try-on-results' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );