-- Update predictions RLS policies to use kickoff time instead of prediction windows
-- Grant table permissions
GRANT SELECT, INSERT, UPDATE ON predictions TO anon;
GRANT SELECT, INSERT, UPDATE ON predictions TO authenticated;

-- Drop old policies
DROP POLICY IF EXISTS "Users can create predictions" ON predictions;
DROP POLICY IF EXISTS "Users can update own predictions before window closes" ON predictions;

-- Create new policies using kickoff time logic
CREATE POLICY "Users can create predictions"
  ON predictions FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM matches
      WHERE id = match_id
      AND kickoff_time > NOW() + INTERVAL '30 minutes'
      AND kickoff_time <= NOW() + INTERVAL '24 hours'
    )
  );

CREATE POLICY "Users can update own predictions before window closes"
  ON predictions FOR UPDATE
  USING (
    user_id = auth.uid()
    AND is_locked = false
    AND EXISTS (
      SELECT 1 FROM matches
      WHERE id = match_id
      AND kickoff_time > NOW() + INTERVAL '30 minutes'
    )
  )
  WITH CHECK (
    user_id = auth.uid()
    AND is_locked = false
    AND EXISTS (
      SELECT 1 FROM matches
      WHERE id = match_id
      AND kickoff_time > NOW() + INTERVAL '30 minutes'
    )
  );
