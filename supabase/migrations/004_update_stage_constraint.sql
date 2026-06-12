-- Update stage check constraint to include Round of 32 for 2026 World Cup format (48 teams)
ALTER TABLE matches DROP CONSTRAINT matches_stage_check;

ALTER TABLE matches ADD CONSTRAINT matches_stage_check 
  CHECK (stage IN ('group', 'round_of_32', 'round16', 'quarter', 'semi', 'third_place', 'final'));
