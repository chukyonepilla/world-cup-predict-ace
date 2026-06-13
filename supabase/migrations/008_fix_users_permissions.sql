-- Fix users table permissions for registration
-- Grant permissions to service role (for registration)
GRANT SELECT, INSERT, UPDATE ON users TO service_role;

-- Grant SELECT to authenticated users
GRANT SELECT ON users TO authenticated;

-- Grant SELECT to anon (for public profile viewing if needed)
GRANT SELECT ON users TO anon;

-- Check if the registration policy exists and update it
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

-- Create a policy that allows service role to insert users
CREATE POLICY "Service role can insert users"
  ON users FOR INSERT
  WITH CHECK (true);
