-- Add policy to allow users to insert their own profile during registration
CREATE POLICY IF NOT EXISTS "Users can insert own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);
