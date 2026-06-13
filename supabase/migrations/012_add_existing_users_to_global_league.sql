-- Add all existing users to the global league
INSERT INTO league_members (league_id, user_id, role)
SELECT 
  '00000000-0000-0000-0000-000000000001' as league_id,
  id as user_id,
  'member' as role
FROM users
WHERE id NOT IN (
  SELECT user_id 
  FROM league_members 
  WHERE league_id = '00000000-0000-0000-0000-000000000001'
)
ON CONFLICT (league_id, user_id) DO NOTHING;
