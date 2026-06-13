-- Fix RLS policy for matches table to allow authenticated users to read
-- First grant SELECT permissions to anon and authenticated roles
GRANT SELECT ON matches TO anon;
GRANT SELECT ON matches TO authenticated;

-- Re-enable RLS on matches table
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Drop existing matches read policy
DROP POLICY IF EXISTS "Authenticated users can read matches" ON matches;

-- Create a new simpler policy that allows all authenticated users to read matches
CREATE POLICY "Authenticated users can read matches"
  ON matches FOR SELECT
  USING (true);
