-- Grant permissions to authenticated users
GRANT ALL ON TABLE user_usage_limits TO authenticated;
GRANT ALL ON TABLE user_usage_limits TO service_role;

-- Ensure RLS is enabled
ALTER TABLE user_usage_limits ENABLE ROW LEVEL SECURITY;

-- Re-apply policies (drop first to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own usage limits" ON user_usage_limits;
DROP POLICY IF EXISTS "Users can update own usage limits" ON user_usage_limits;
DROP POLICY IF EXISTS "Users can insert own usage limits" ON user_usage_limits;

CREATE POLICY "Users can view own usage limits"
  ON user_usage_limits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own usage limits"
  ON user_usage_limits FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage limits"
  ON user_usage_limits FOR INSERT
  WITH CHECK (auth.uid() = user_id);
