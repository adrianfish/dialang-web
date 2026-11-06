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
  booklet_id INTEGER,
  item_raw_score INTEGER,
  item_grade INTEGER,
  item_level TEXT,
  ended INTEGER
);

CREATE TABLE IF NOT EXISTS saved_sessions (
  token TEXT PRIMARY KEY,
  saved_json TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS questionnaire (
  session_id TEXT PRIMARY KEY,
  age_group TEXT,
  gender TEXT,
  other_gender TEXT,
  first_language TEXT,
  nationality TEXT,
  institution TEXT,
  reason TEXT,
  accuracy TEXT,
  comments TEXT
);

CREATE TABLE IF NOT EXISTS vspt_responses (
  pass_id TEXT NOT NULL,
  word_id TEXT NOT NULL,
  response INTEGER
);

CREATE TABLE IF NOT EXISTS sa_responses (
  pass_id TEXT NOT NULL,
  statement_id TEXT NOT NULL,
  response INTEGER
);

CREATE TABLE IF NOT EXISTS item_responses (
  pass_id TEXT NOT NULL,
  basket_id INTEGER NOT NUll,
  item_id INTEGER NOT NULL,
  answer_id INTEGER,
  answer_text TEXT,
  score INTEGER NOT NULL,
  correct INTEGER NOT NULL,
  pass_order INTEGER NOT NULL
);
