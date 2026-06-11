-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE league_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
  ON users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id 
    AND is_admin = (SELECT is_admin FROM users WHERE id = auth.uid())
  );

-- Leagues table policies
CREATE POLICY "Anyone can read league by code"
  ON leagues FOR SELECT
  USING (true);

CREATE POLICY "League members can read league"
  ON leagues FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM league_members
      WHERE league_members.league_id = leagues.id
      AND league_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create leagues"
  ON leagues FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "League creator can update league"
  ON leagues FOR UPDATE
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "League creator can delete league"
  ON leagues FOR DELETE
  USING (created_by = auth.uid());

-- League members table policies
CREATE POLICY "League members can read members"
  ON league_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM league_members lm
      WHERE lm.league_id = league_members.league_id
      AND lm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can read own memberships"
  ON league_members FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Authenticated users can create membership"
  ON league_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "League admin can update membership"
  ON league_members FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM league_members
      WHERE league_id = league_members.league_id
      AND user_id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "League admin can delete membership"
  ON league_members FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM league_members
      WHERE league_id = league_members.league_id
      AND user_id = auth.uid()
      AND role = 'admin'
    )
    OR user_id = auth.uid()
  );

-- Matches table policies
CREATE POLICY "Authenticated users can read matches"
  ON matches FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can create matches"
  ON matches FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admins can update matches"
  ON matches FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admins can delete matches"
  ON matches FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Predictions table policies
CREATE POLICY "Users can read own predictions"
  ON predictions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "League members can read predictions after window closes"
  ON predictions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM league_members lm
      JOIN matches m ON m.id = predictions.match_id
      WHERE lm.league_id = predictions.league_id
      AND lm.user_id = auth.uid()
      AND m.prediction_window_close < NOW()
    )
  );

CREATE POLICY "Users can create predictions"
  ON predictions FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM matches
      WHERE id = match_id
      AND prediction_window_open <= NOW()
      AND prediction_window_close > NOW()
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
      AND prediction_window_close > NOW()
    )
  )
  WITH CHECK (
    user_id = auth.uid()
    AND is_locked = false
    AND EXISTS (
      SELECT 1 FROM matches
      WHERE id = match_id
      AND prediction_window_close > NOW()
    )
  );

-- Match results table policies
CREATE POLICY "Authenticated users can read results"
  ON match_results FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can create results"
  ON match_results FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admins can update results"
  ON match_results FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Rankings table policies
CREATE POLICY "League members can read rankings"
  ON rankings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM league_members
      WHERE league_id = rankings.league_id
      AND user_id = auth.uid()
    )
  );

-- Statistics table policies
CREATE POLICY "Users can read own statistics"
  ON statistics FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "League members can read league statistics"
  ON statistics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM league_members
      WHERE league_id = statistics.league_id
      AND user_id = auth.uid()
    )
  );

-- Notifications table policies
CREATE POLICY "Users can read own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- Audit logs table policies
CREATE POLICY "Admins can read audit logs"
  ON audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "System can create audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (true);
