-- Grant permissions for league_members table to service role
GRANT SELECT, INSERT, UPDATE, DELETE ON league_members TO service_role;
GRANT SELECT ON league_members TO authenticated;
GRANT SELECT ON league_members TO anon;

-- Ensure the unique constraint exists on league_members
ALTER TABLE league_members DROP CONSTRAINT IF EXISTS league_members_league_id_user_id_key;
ALTER TABLE league_members ADD CONSTRAINT league_members_league_id_user_id_key UNIQUE (league_id, user_id);
