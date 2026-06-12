-- Create a system user for the global league
INSERT INTO users (id, email, display_name, is_admin)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'system@worldcup2026.local',
  'System',
  true
)
ON CONFLICT (id) DO NOTHING;

-- Create global league for 2026 World Cup
INSERT INTO leagues (id, name, code, description, max_members, created_by, is_active)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  '2026 FIFA World Cup Predictions',
  'WC2026',
  'Global league for 2026 FIFA World Cup predictions',
  10000,
  '00000000-0000-0000-0000-000000000001',
  true
)
ON CONFLICT (id) DO NOTHING;

-- Insert 2026 World Cup Group Stage Matches (Actual Schedule)
-- Times are in UTC (ET +4 hours during June/July, or +5 hours during DST)
-- Prediction window: Opens 10 hours before kickoff, closes 30 minutes before kickoff
INSERT INTO matches (home_team, away_team, kickoff_time, stage, group_label, venue, prediction_window_open, prediction_window_close) VALUES
-- Group A
('Mexico', 'South Africa', '2026-06-11 16:00:00+00', 'group', 'A', 'Estadio Azteca, Mexico City', '2026-06-11 15:30:00+00', '2026-06-11 16:00:00+00'),
('South Korea', 'Czechia', '2026-06-11 19:00:00+00', 'group', 'A', 'Estadio BBVA, Monterrey', '2026-06-11 18:30:00+00', '2026-06-11 19:00:00+00'),
('Czechia', 'South Africa', '2026-06-18 16:00:00+00', 'group', 'A', 'Mercedes-Benz Stadium, Atlanta', '2026-06-18 15:30:00+00', '2026-06-18 16:00:00+00'),
('Mexico', 'South Korea', '2026-06-19 01:00:00+00', 'group', 'A', 'Estadio Akron, Guadalajara', '2026-06-19 00:30:00+00', '2026-06-19 01:00:00+00'),
('Czechia', 'Mexico', '2026-06-25 01:00:00+00', 'group', 'A', 'Estadio Azteca, Mexico City', '2026-06-25 00:30:00+00', '2026-06-25 01:00:00+00'),
('South Africa', 'South Korea', '2026-06-25 01:00:00+00', 'group', 'A', 'Estadio BBVA, Monterrey', '2026-06-25 00:30:00+00', '2026-06-25 01:00:00+00'),

-- Group B
('Canada', 'Bosnia and Herzegovina', '2026-06-12 19:00:00+00', 'group', 'B', 'BMO Field, Toronto', '2026-06-12 18:30:00+00', '2026-06-12 19:00:00+00'),
('Qatar', 'Switzerland', '2026-06-13 19:00:00+00', 'group', 'B', E'Levi\'s Stadium, San Francisco Bay Area', '2026-06-13 18:30:00+00', '2026-06-13 19:00:00+00'),
('Switzerland', 'Bosnia and Herzegovina', '2026-06-18 19:00:00+00', 'group', 'B', 'SoFi Stadium, Los Angeles', '2026-06-18 18:30:00+00', '2026-06-18 19:00:00+00'),
('Canada', 'Qatar', '2026-06-18 22:00:00+00', 'group', 'B', 'BC Place, Vancouver', '2026-06-18 21:30:00+00', '2026-06-18 22:00:00+00'),
('Switzerland', 'Canada', '2026-06-24 19:00:00+00', 'group', 'B', 'BC Place, Vancouver', '2026-06-24 18:30:00+00', '2026-06-24 19:00:00+00'),
('Bosnia and Herzegovina', 'Qatar', '2026-06-24 19:00:00+00', 'group', 'B', 'Lumen Field, Seattle', '2026-06-24 18:30:00+00', '2026-06-24 19:00:00+00'),

-- Group C
('Brazil', 'Morocco', '2026-06-13 22:00:00+00', 'group', 'C', 'MetLife Stadium, New York/New Jersey', '2026-06-13 21:30:00+00', '2026-06-13 22:00:00+00'),
('Haiti', 'Scotland', '2026-06-14 01:00:00+00', 'group', 'C', 'Gillette Stadium, Boston', '2026-06-14 00:30:00+00', '2026-06-14 01:00:00+00'),
('Scotland', 'Morocco', '2026-06-19 22:00:00+00', 'group', 'C', 'Gillette Stadium, Boston', '2026-06-19 21:30:00+00', '2026-06-19 22:00:00+00'),
('Brazil', 'Haiti', '2026-06-20 01:00:00+00', 'group', 'C', 'Lincoln Financial Field, Philadelphia', '2026-06-20 00:30:00+00', '2026-06-20 01:00:00+00'),
('Scotland', 'Brazil', '2026-06-24 22:00:00+00', 'group', 'C', 'Hard Rock Stadium, Miami', '2026-06-24 21:30:00+00', '2026-06-24 22:00:00+00'),
('Morocco', 'Haiti', '2026-06-24 22:00:00+00', 'group', 'C', 'Mercedes-Benz Stadium, Atlanta', '2026-06-24 21:30:00+00', '2026-06-24 22:00:00+00'),

-- Group D
('USA', 'Paraguay', '2026-06-13 01:00:00+00', 'group', 'D', 'SoFi Stadium, Los Angeles', '2026-06-13 00:30:00+00', '2026-06-13 01:00:00+00'),
('Australia', 'Turkiye', '2026-06-14 04:00:00+00', 'group', 'D', 'BC Place, Vancouver', '2026-06-14 03:30:00+00', '2026-06-14 04:00:00+00'),
('USA', 'Australia', '2026-06-19 19:00:00+00', 'group', 'D', 'Lumen Field, Seattle', '2026-06-19 18:30:00+00', '2026-06-19 19:00:00+00'),
('Turkiye', 'Paraguay', '2026-06-20 04:00:00+00', 'group', 'D', E'Levi\'s Stadium, San Francisco Bay Area', '2026-06-20 03:30:00+00', '2026-06-20 04:00:00+00'),
('Turkiye', 'USA', '2026-06-26 02:00:00+00', 'group', 'D', 'SoFi Stadium, Los Angeles', '2026-06-26 01:30:00+00', '2026-06-26 02:00:00+00'),
('Paraguay', 'Australia', '2026-06-26 02:00:00+00', 'group', 'D', E'Levi\'s Stadium, San Francisco Bay Area', '2026-06-26 01:30:00+00', '2026-06-26 02:00:00+00'),

-- Group E
('Germany', 'Curacao', '2026-06-14 17:00:00+00', 'group', 'E', 'NRG Stadium, Houston', '2026-06-14 16:30:00+00', '2026-06-14 17:00:00+00'),
('Ivory Coast', 'Ecuador', '2026-06-14 23:00:00+00', 'group', 'E', 'Lincoln Financial Field, Philadelphia', '2026-06-14 22:30:00+00', '2026-06-14 23:00:00+00'),
('Germany', 'Ivory Coast', '2026-06-20 20:00:00+00', 'group', 'E', 'BMO Field, Toronto', '2026-06-20 19:30:00+00', '2026-06-20 20:00:00+00'),
('Ecuador', 'Curacao', '2026-06-21 00:00:00+00', 'group', 'E', 'Arrowhead Stadium, Kansas City', '2026-06-20 23:30:00+00', '2026-06-21 00:00:00+00'),
('Ecuador', 'Germany', '2026-06-25 20:00:00+00', 'group', 'E', 'MetLife Stadium, New York/New Jersey', '2026-06-25 19:30:00+00', '2026-06-25 20:00:00+00'),
('Curacao', 'Ivory Coast', '2026-06-25 20:00:00+00', 'group', 'E', 'Lincoln Financial Field, Philadelphia', '2026-06-25 19:30:00+00', '2026-06-25 20:00:00+00'),

-- Group F
('Netherlands', 'Japan', '2026-06-14 20:00:00+00', 'group', 'F', 'AT&T Stadium, Dallas', '2026-06-14 19:30:00+00', '2026-06-14 20:00:00+00'),
('Sweden', 'Tunisia', '2026-06-15 02:00:00+00', 'group', 'F', 'Estadio BBVA, Monterrey', '2026-06-15 01:30:00+00', '2026-06-15 02:00:00+00'),
('Netherlands', 'Sweden', '2026-06-20 17:00:00+00', 'group', 'F', 'NRG Stadium, Houston', '2026-06-20 16:30:00+00', '2026-06-20 17:00:00+00'),
('Tunisia', 'Japan', '2026-06-21 04:00:00+00', 'group', 'F', 'Estadio BBVA, Monterrey', '2026-06-21 03:30:00+00', '2026-06-21 04:00:00+00'),
('Japan', 'Sweden', '2026-06-25 23:00:00+00', 'group', 'F', 'AT&T Stadium, Dallas', '2026-06-25 22:30:00+00', '2026-06-25 23:00:00+00'),
('Tunisia', 'Netherlands', '2026-06-25 23:00:00+00', 'group', 'F', 'Arrowhead Stadium, Kansas City', '2026-06-25 22:30:00+00', '2026-06-25 23:00:00+00'),

-- Group G
('Iran', 'New Zealand', '2026-06-16 01:00:00+00', 'group', 'G', 'SoFi Stadium, Los Angeles', '2026-06-16 00:30:00+00', '2026-06-16 01:00:00+00'),
('Belgium', 'Egypt', '2026-06-15 19:00:00+00', 'group', 'G', 'Lumen Field, Seattle', '2026-06-15 18:30:00+00', '2026-06-15 19:00:00+00'),
('Belgium', 'Iran', '2026-06-21 19:00:00+00', 'group', 'G', 'SoFi Stadium, Los Angeles', '2026-06-21 18:30:00+00', '2026-06-21 19:00:00+00'),
('New Zealand', 'Egypt', '2026-06-22 01:00:00+00', 'group', 'G', 'BC Place, Vancouver', '2026-06-22 00:30:00+00', '2026-06-22 01:00:00+00'),
('Egypt', 'Iran', '2026-06-27 03:00:00+00', 'group', 'G', 'Lumen Field, Seattle', '2026-06-27 02:30:00+00', '2026-06-27 03:00:00+00'),
('New Zealand', 'Belgium', '2026-06-27 03:00:00+00', 'group', 'G', 'BC Place, Vancouver', '2026-06-27 02:30:00+00', '2026-06-27 03:00:00+00'),

-- Group H
('Spain', 'Cape Verde', '2026-06-15 16:00:00+00', 'group', 'H', 'Mercedes-Benz Stadium, Atlanta', '2026-06-15 15:30:00+00', '2026-06-15 16:00:00+00'),
('Saudi Arabia', 'Uruguay', '2026-06-15 22:00:00+00', 'group', 'H', 'Hard Rock Stadium, Miami', '2026-06-15 21:30:00+00', '2026-06-15 22:00:00+00'),
('Spain', 'Saudi Arabia', '2026-06-21 16:00:00+00', 'group', 'H', 'Mercedes-Benz Stadium, Atlanta', '2026-06-21 15:30:00+00', '2026-06-21 16:00:00+00'),
('Uruguay', 'Cape Verde', '2026-06-21 22:00:00+00', 'group', 'H', 'Hard Rock Stadium, Miami', '2026-06-21 21:30:00+00', '2026-06-21 22:00:00+00'),
('Cape Verde', 'Saudi Arabia', '2026-06-27 00:00:00+00', 'group', 'H', 'NRG Stadium, Houston', '2026-06-26 23:30:00+00', '2026-06-27 00:00:00+00'),
('Uruguay', 'Spain', '2026-06-27 00:00:00+00', 'group', 'H', 'Estadio Akron, Guadalajara', '2026-06-26 23:30:00+00', '2026-06-27 00:00:00+00'),

-- Group I
('France', 'Senegal', '2026-06-16 19:00:00+00', 'group', 'I', 'MetLife Stadium, New York/New Jersey', '2026-06-16 18:30:00+00', '2026-06-16 19:00:00+00'),
('Iraq', 'Norway', '2026-06-16 22:00:00+00', 'group', 'I', 'Gillette Stadium, Boston', '2026-06-16 21:30:00+00', '2026-06-16 22:00:00+00'),
('France', 'Iraq', '2026-06-22 21:00:00+00', 'group', 'I', 'Lincoln Financial Field, Philadelphia', '2026-06-22 20:30:00+00', '2026-06-22 21:00:00+00'),
('Norway', 'Senegal', '2026-06-23 00:00:00+00', 'group', 'I', 'MetLife Stadium, New York/New Jersey', '2026-06-22 23:30:00+00', '2026-06-23 00:00:00+00'),
('Norway', 'France', '2026-06-26 19:00:00+00', 'group', 'I', 'Gillette Stadium, Boston', '2026-06-26 18:30:00+00', '2026-06-26 19:00:00+00'),
('Senegal', 'Iraq', '2026-06-26 19:00:00+00', 'group', 'I', 'BMO Field, Toronto', '2026-06-26 18:30:00+00', '2026-06-26 19:00:00+00'),

-- Group J
('Argentina', 'Algeria', '2026-06-17 01:00:00+00', 'group', 'J', 'Arrowhead Stadium, Kansas City', '2026-06-17 00:30:00+00', '2026-06-17 01:00:00+00'),
('Austria', 'Jordan', '2026-06-17 04:00:00+00', 'group', 'J', E'Levi\'s Stadium, San Francisco Bay Area', '2026-06-17 03:30:00+00', '2026-06-17 04:00:00+00'),
('Argentina', 'Austria', '2026-06-22 17:00:00+00', 'group', 'J', 'AT&T Stadium, Dallas', '2026-06-22 16:30:00+00', '2026-06-22 17:00:00+00'),
('Jordan', 'Algeria', '2026-06-23 03:00:00+00', 'group', 'J', E'Levi\'s Stadium, San Francisco Bay Area', '2026-06-23 02:30:00+00', '2026-06-23 03:00:00+00'),
('Algeria', 'Austria', '2026-06-28 02:00:00+00', 'group', 'J', 'Arrowhead Stadium, Kansas City', '2026-06-28 01:30:00+00', '2026-06-28 02:00:00+00'),
('Jordan', 'Argentina', '2026-06-28 02:00:00+00', 'group', 'J', 'AT&T Stadium, Dallas', '2026-06-28 01:30:00+00', '2026-06-28 02:00:00+00'),

-- Group K
('Portugal', 'Democratic Republic of Congo', '2026-06-17 17:00:00+00', 'group', 'K', 'NRG Stadium, Houston', '2026-06-17 16:30:00+00', '2026-06-17 17:00:00+00'),
('Uzbekistan', 'Colombia', '2026-06-18 02:00:00+00', 'group', 'K', 'Estadio Azteca, Mexico City', '2026-06-18 01:30:00+00', '2026-06-18 02:00:00+00'),
('Portugal', 'Uzbekistan', '2026-06-23 17:00:00+00', 'group', 'K', 'NRG Stadium, Houston', '2026-06-23 16:30:00+00', '2026-06-23 17:00:00+00'),
('Colombia', 'Democratic Republic of Congo', '2026-06-24 02:00:00+00', 'group', 'K', 'Estadio Akron, Guadalajara', '2026-06-24 01:30:00+00', '2026-06-24 02:00:00+00'),
('Colombia', 'Portugal', '2026-06-27 23:30:00+00', 'group', 'K', 'Hard Rock Stadium, Miami', '2026-06-27 23:00:00+00', '2026-06-27 23:30:00+00'),
('Democratic Republic of Congo', 'Uzbekistan', '2026-06-27 23:30:00+00', 'group', 'K', 'Mercedes-Benz Stadium, Atlanta', '2026-06-27 23:00:00+00', '2026-06-27 23:30:00+00'),

-- Group L
('England', 'Croatia', '2026-06-17 20:00:00+00', 'group', 'L', 'AT&T Stadium, Dallas', '2026-06-17 19:30:00+00', '2026-06-17 20:00:00+00'),
('Ghana', 'Panama', '2026-06-17 23:00:00+00', 'group', 'L', 'BMO Field, Toronto', '2026-06-17 22:30:00+00', '2026-06-17 23:00:00+00'),
('England', 'Ghana', '2026-06-23 20:00:00+00', 'group', 'L', 'Gillette Stadium, Boston', '2026-06-23 19:30:00+00', '2026-06-23 20:00:00+00'),
('Panama', 'Croatia', '2026-06-23 23:00:00+00', 'group', 'L', 'BMO Field, Toronto', '2026-06-23 22:30:00+00', '2026-06-23 23:00:00+00'),
('Panama', 'England', '2026-06-27 21:00:00+00', 'group', 'L', 'MetLife Stadium, New York/New Jersey', '2026-06-27 20:30:00+00', '2026-06-27 21:00:00+00'),
('Croatia', 'Ghana', '2026-06-27 21:00:00+00', 'group', 'L', 'Lincoln Financial Field, Philadelphia', '2026-06-27 20:30:00+00', '2026-06-27 21:00:00+00'),

-- Round of 32 (Knockout Stage)
('TBD', 'TBD', '2026-06-28 19:00:00+00', 'round_of_32', 'R32', 'SoFi Stadium, Los Angeles', '2026-06-28 18:30:00+00', '2026-06-28 19:00:00+00'),
('TBD', 'TBD', '2026-06-29 17:00:00+00', 'round_of_32', 'R32', 'NRG Stadium, Houston', '2026-06-29 16:30:00+00', '2026-06-29 17:00:00+00'),
('TBD', 'TBD', '2026-06-29 20:30:00+00', 'round_of_32', 'R32', 'Gillette Stadium, Boston', '2026-06-29 20:00:00+00', '2026-06-29 20:30:00+00'),
('TBD', 'TBD', '2026-06-30 01:00:00+00', 'round_of_32', 'R32', 'Estadio BBVA, Monterrey', '2026-06-30 00:30:00+00', '2026-06-30 01:00:00+00'),
('TBD', 'TBD', '2026-06-30 17:00:00+00', 'round_of_32', 'R32', 'AT&T Stadium, Dallas', '2026-06-30 16:30:00+00', '2026-06-30 17:00:00+00'),
('TBD', 'TBD', '2026-06-30 21:00:00+00', 'round_of_32', 'R32', 'MetLife Stadium, New York/New Jersey', '2026-06-30 20:30:00+00', '2026-06-30 21:00:00+00'),
('TBD', 'TBD', '2026-07-01 01:00:00+00', 'round_of_32', 'R32', 'Estadio Azteca, Mexico City', '2026-07-01 00:30:00+00', '2026-07-01 01:00:00+00'),
('TBD', 'TBD', '2026-07-01 16:00:00+00', 'round_of_32', 'R32', 'Mercedes-Benz Stadium, Atlanta', '2026-07-01 15:30:00+00', '2026-07-01 16:00:00+00'),
('TBD', 'TBD', '2026-07-01 20:00:00+00', 'round_of_32', 'R32', 'Lumen Field, Seattle', '2026-07-01 19:30:00+00', '2026-07-01 20:00:00+00'),
('TBD', 'TBD', '2026-07-02 00:00:00+00', 'round_of_32', 'R32', E'Levi\'s Stadium, San Francisco Bay Area', '2026-07-01 23:30:00+00', '2026-07-02 00:00:00+00'),
('TBD', 'TBD', '2026-07-02 19:00:00+00', 'round_of_32', 'R32', 'SoFi Stadium, Los Angeles', '2026-07-02 18:30:00+00', '2026-07-02 19:00:00+00'),
('TBD', 'TBD', '2026-07-02 23:00:00+00', 'round_of_32', 'R32', 'BMO Field, Toronto', '2026-07-02 22:30:00+00', '2026-07-02 23:00:00+00'),
('TBD', 'TBD', '2026-07-03 00:00:00+00', 'round_of_32', 'R32', 'BC Place, Vancouver', '2026-07-02 23:30:00+00', '2026-07-03 00:00:00+00'),
('TBD', 'TBD', '2026-07-03 18:00:00+00', 'round_of_32', 'R32', 'AT&T Stadium, Dallas', '2026-07-03 17:30:00+00', '2026-07-03 18:00:00+00'),
('TBD', 'TBD', '2026-07-03 22:00:00+00', 'round_of_32', 'R32', 'Hard Rock Stadium, Miami', '2026-07-03 21:30:00+00', '2026-07-03 22:00:00+00'),
('TBD', 'TBD', '2026-07-04 01:30:00+00', 'round_of_32', 'R32', 'Arrowhead Stadium, Kansas City', '2026-07-04 01:00:00+00', '2026-07-04 01:30:00+00'),

-- Round of 16
('TBD', 'TBD', '2026-07-04 17:00:00+00', 'round16', 'R16', 'NRG Stadium, Houston', '2026-07-04 16:30:00+00', '2026-07-04 17:00:00+00'),
('TBD', 'TBD', '2026-07-04 21:00:00+00', 'round16', 'R16', 'Lincoln Financial Field, Philadelphia', '2026-07-04 20:30:00+00', '2026-07-04 21:00:00+00'),
('TBD', 'TBD', '2026-07-05 20:00:00+00', 'round16', 'R16', 'MetLife Stadium, New York/New Jersey', '2026-07-05 19:30:00+00', '2026-07-05 20:00:00+00'),
('TBD', 'TBD', '2026-07-06 00:00:00+00', 'round16', 'R16', 'Estadio Azteca, Mexico City', '2026-07-05 23:30:00+00', '2026-07-06 00:00:00+00'),
('TBD', 'TBD', '2026-07-06 19:00:00+00', 'round16', 'R16', 'AT&T Stadium, Dallas', '2026-07-06 18:30:00+00', '2026-07-06 19:00:00+00'),
('TBD', 'TBD', '2026-07-07 00:00:00+00', 'round16', 'R16', 'Lumen Field, Seattle', '2026-07-06 23:30:00+00', '2026-07-07 00:00:00+00'),
('TBD', 'TBD', '2026-07-07 16:00:00+00', 'round16', 'R16', 'Mercedes-Benz Stadium, Atlanta', '2026-07-07 15:30:00+00', '2026-07-07 16:00:00+00'),
('TBD', 'TBD', '2026-07-07 20:00:00+00', 'round16', 'R16', 'BC Place, Vancouver', '2026-07-07 19:30:00+00', '2026-07-07 20:00:00+00'),

-- Quarterfinals
('TBD', 'TBD', '2026-07-09 20:00:00+00', 'quarter', 'QF', 'Gillette Stadium, Boston', '2026-07-09 19:30:00+00', '2026-07-09 20:00:00+00'),
('TBD', 'TBD', '2026-07-10 19:00:00+00', 'quarter', 'QF', 'SoFi Stadium, Los Angeles', '2026-07-10 18:30:00+00', '2026-07-10 19:00:00+00'),
('TBD', 'TBD', '2026-07-11 21:00:00+00', 'quarter', 'QF', 'Hard Rock Stadium, Miami', '2026-07-11 20:30:00+00', '2026-07-11 21:00:00+00'),
('TBD', 'TBD', '2026-07-12 01:00:00+00', 'quarter', 'QF', 'Arrowhead Stadium, Kansas City', '2026-07-11 23:30:00+00', '2026-07-12 01:00:00+00'),

-- Semifinals
('TBD', 'TBD', '2026-07-14 19:00:00+00', 'semi', 'SF', 'AT&T Stadium, Dallas', '2026-07-14 18:30:00+00', '2026-07-14 19:00:00+00'),
('TBD', 'TBD', '2026-07-15 19:00:00+00', 'semi', 'SF', 'Mercedes-Benz Stadium, Atlanta', '2026-07-15 18:30:00+00', '2026-07-15 19:00:00+00'),

-- Third-place match
('TBD', 'TBD', '2026-07-18 21:00:00+00', 'third_place', '3rd', 'Hard Rock Stadium, Miami', '2026-07-18 20:30:00+00', '2026-07-18 21:00:00+00'),

-- Final
('TBD', 'TBD', '2026-07-19 19:00:00+00', 'final', 'F', 'MetLife Stadium, New York/New Jersey', '2026-07-19 18:30:00+00', '2026-07-19 19:00:00+00')
ON CONFLICT DO NOTHING;

-- Update prediction_window_open to 10 hours before kickoff for all matches
UPDATE matches
SET prediction_window_open = kickoff_time - INTERVAL '10 hours'
WHERE prediction_window_open IS NOT NULL;
