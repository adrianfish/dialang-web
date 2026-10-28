-- Migration number: 0001 	 2026-10-27T12:50:20.976Z

CREATE TABLE IF NOT EXISTS sessions (
  session_id TEXT PRIMARY KEY,
  al TEXT NOT NULL,
  ip_address TEXT NOT NULL,
  referrer TEXT,
  started INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS passes (
  pass_id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  tl TEXT NOT NULL,
  skill TEXT NOT NULL,
  started INTEGER NOT NULL,
  vspt_zscore REAL,
  vspt_mearascore INTEGER,
  vspt_level TEXT,
  sa_ppe REAL,
  sa_level TEXT,
  item_raw_score INTEGER,
  item_grade INTEGER,
  item_level TEXT,
  ended INTEGER
);
