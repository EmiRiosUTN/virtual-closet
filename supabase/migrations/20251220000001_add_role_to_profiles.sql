-- Add role field to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- Create index for faster role queries
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Copy existing role data from user_profiles to profiles (if both records exist)
UPDATE profiles p
SET role = up.role
FROM user_profiles up
WHERE p.id = up.id AND up.role IS NOT NULL;
