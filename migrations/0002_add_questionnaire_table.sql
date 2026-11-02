-- Migration number: 0002 	 2026-11-02T15:12:35.396Z

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
