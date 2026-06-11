-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  notification_preferences JSONB
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_display_name ON users(display_name);

-- Leagues table
CREATE TABLE IF NOT EXISTS leagues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  max_members INTEGER NOT NULL DEFAULT 50,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX idx_leagues_code ON leagues(code);
CREATE INDEX idx_leagues_created_by ON leagues(created_by);

-- League members table
CREATE TABLE IF NOT EXISTS league_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  league_id UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE(league_id, user_id)
);

CREATE INDEX idx_league_members_league_user ON league_members(league_id, user_id);
CREATE INDEX idx_league_members_user ON league_members(user_id);

-- Matches table
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fifa_match_id TEXT UNIQUE,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  home_team_flag TEXT,
  away_team_flag TEXT,
  kickoff_time TIMESTAMPTZ NOT NULL,
  stage TEXT NOT NULL CHECK (stage IN ('group', 'round16', 'quarter', 'semi', 'third_place', 'final')),
  group_label TEXT,
  venue TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'finished', 'postponed')),
  prediction_window_open TIMESTAMPTZ NOT NULL,
  prediction_window_close TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_matches_kickoff ON matches(kickoff_time);
CREATE INDEX idx_matches_stage ON matches(stage);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_matches_prediction_window ON matches(prediction_window_close);

-- Predictions table
CREATE TABLE IF NOT EXISTS predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  league_id UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
  home_score INTEGER NOT NULL,
  away_score INTEGER NOT NULL,
  bonus_type TEXT NOT NULL CHECK (bonus_type IN ('penalty', 'red_card')),
  bonus_prediction BOOLEAN NOT NULL,
  extra_time_prediction BOOLEAN,
  penalty_shootout_prediction BOOLEAN,
  eventual_winner TEXT CHECK (eventual_winner IN ('home', 'away')),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_locked BOOLEAN NOT NULL DEFAULT FALSE,
  points_earned INTEGER NOT NULL DEFAULT 0,
  points_breakdown JSONB,
  UNIQUE(match_id, user_id, league_id)
);

CREATE INDEX idx_predictions_match_user_league ON predictions(match_id, user_id, league_id);
CREATE INDEX idx_predictions_user ON predictions(user_id);
CREATE INDEX idx_predictions_league ON predictions(league_id);
CREATE INDEX idx_predictions_match ON predictions(match_id);

-- Match results table
CREATE TABLE IF NOT EXISTS match_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID UNIQUE NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  home_score INTEGER NOT NULL,
  away_score INTEGER NOT NULL,
  penalty_occurred BOOLEAN NOT NULL DEFAULT FALSE,
  red_card_occurred BOOLEAN NOT NULL DEFAULT FALSE,
  extra_time_played BOOLEAN NOT NULL DEFAULT FALSE,
  penalty_shootout_occurred BOOLEAN NOT NULL DEFAULT FALSE,
  eventual_winner TEXT CHECK (eventual_winner IN ('home', 'away', 'draw')),
  entered_by UUID NOT NULL REFERENCES users(id),
  entered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  scoring_completed BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_match_results_match ON match_results(match_id);

-- Rankings table
CREATE TABLE IF NOT EXISTS rankings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  league_id UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_points INTEGER NOT NULL DEFAULT 0,
  group_stage_points INTEGER NOT NULL DEFAULT 0,
  knockout_points INTEGER NOT NULL DEFAULT 0,
  current_rank INTEGER NOT NULL,
  previous_rank INTEGER,
  exact_scores_count INTEGER NOT NULL DEFAULT 0,
  correct_outcomes_count INTEGER NOT NULL DEFAULT 0,
  correct_bonus_count INTEGER NOT NULL DEFAULT 0,
  correct_extra_time_count INTEGER NOT NULL DEFAULT 0,
  correct_shootout_count INTEGER NOT NULL DEFAULT 0,
  highest_round_score INTEGER NOT NULL DEFAULT 0,
  current_streak INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(league_id, user_id)
);

CREATE INDEX idx_rankings_league_user ON rankings(league_id, user_id);
CREATE INDEX idx_rankings_league_points ON rankings(league_id, total_points DESC);
CREATE INDEX idx_rankings_league_rank ON rankings(league_id, current_rank);

-- Statistics table
CREATE TABLE IF NOT EXISTS statistics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  league_id UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
  total_predictions INTEGER NOT NULL DEFAULT 0,
  prediction_accuracy DECIMAL(5,2),
  exact_score_rate DECIMAL(5,2),
  bonus_accuracy DECIMAL(5,2),
  average_points_per_match DECIMAL(5,2),
  best_match_score INTEGER NOT NULL DEFAULT 0,
  worst_match_score INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, league_id)
);

CREATE INDEX idx_statistics_user_league ON statistics(user_id, league_id);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  changes JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rankings_updated_at BEFORE UPDATE ON rankings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_statistics_updated_at BEFORE UPDATE ON statistics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
