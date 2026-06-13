-- Create the global league if it doesn't exist
INSERT INTO leagues (id, name, code, description, max_members, created_by)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Global League',
  'GLOBAL',
  'The official World Cup prediction league',
  10000,
  '00000000-0000-0000-0000-000000000001'
)
ON CONFLICT (id) DO NOTHING;
