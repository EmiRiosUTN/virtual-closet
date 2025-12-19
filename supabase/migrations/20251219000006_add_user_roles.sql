-- Add role field to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- Create index for faster role queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- Note: After running this migration, you need to manually set the first admin:
-- UPDATE user_profiles SET role = 'admin' WHERE id = 'your-user-id';
