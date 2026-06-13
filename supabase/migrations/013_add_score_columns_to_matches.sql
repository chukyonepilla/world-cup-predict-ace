-- Add score columns to matches table
ALTER TABLE matches ADD COLUMN IF NOT EXISTS home_score INTEGER;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS away_score INTEGER;
