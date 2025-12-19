-- Check if RLS is blocking the query
-- Run this in Supabase SQL Editor to verify RLS policies

-- Check current RLS policies on user_profiles
SELECT * FROM pg_policies WHERE tablename = 'user_profiles';

-- Temporarily check if data exists (this bypasses RLS)
SELECT id, first_name, last_name, role, created_at 
FROM user_profiles 
LIMIT 10;

-- If you see data above but not in the app, you need to add a policy for admins to read all profiles:
CREATE POLICY "Admins can view all profiles"
ON user_profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role = 'admin'
  )
);
