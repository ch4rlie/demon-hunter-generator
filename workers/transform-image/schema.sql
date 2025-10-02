-- User emails and data
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  first_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
  transform_count INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Transformation history
CREATE TABLE IF NOT EXISTS transformations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  prediction_id TEXT UNIQUE NOT NULL,
  user_email TEXT,
  original_image_url TEXT,
  original_image_r2_key TEXT,
  transformed_image_url TEXT,
  transformed_image_r2_key TEXT,
  replicate_output_url TEXT,
  status TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  processing_time REAL,
  FOREIGN KEY (user_email) REFERENCES users(email)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_transformations_user ON transformations(user_email);
CREATE INDEX IF NOT EXISTS idx_transformations_created ON transformations(created_at DESC);
