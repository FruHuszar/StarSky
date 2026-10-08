CREATE TABLE star_maps (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  location TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  timezone TEXT,
  settings TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX star_maps_owner_created ON star_maps (owner_id, created_at DESC);

CREATE TABLE rate_limits (
  bucket TEXT PRIMARY KEY,
  window_start INTEGER NOT NULL,
  hits INTEGER NOT NULL
);

CREATE INDEX rate_limits_window ON rate_limits (window_start);
