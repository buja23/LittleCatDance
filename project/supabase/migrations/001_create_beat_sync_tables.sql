
CREATE TABLE IF NOT EXISTS rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id text NOT NULL,
  status text DEFAULT 'waiting',
  master_sequence text,
  started_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES rooms(id) ON DELETE CASCADE,
  player_name text NOT NULL,
  score integer DEFAULT 0,
  combo integer DEFAULT 0,
  excellent_hits integer DEFAULT 0,
  good_hits integer DEFAULT 0,
  miss_count integer DEFAULT 0,
  is_ready boolean DEFAULT false,
  joined_at timestamptz DEFAULT now()
);

ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view rooms"
  ON rooms FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create rooms"
  ON rooms FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update rooms"
  ON rooms FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete rooms"
  ON rooms FOR DELETE
  USING (true);

CREATE POLICY "Anyone can view players"
  ON players FOR SELECT
  USING (true);

CREATE POLICY "Anyone can join as player"
  ON players FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update player stats"
  ON players FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can remove players"
  ON players FOR DELETE
  USING (true);

CREATE INDEX IF NOT EXISTS idx_players_room_id ON players(room_id);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status);
