-- Custom Analytics Tables

-- Page views and events
CREATE TABLE IF NOT EXISTS analytics_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type TEXT NOT NULL,
  event_name TEXT,
  page_path TEXT,
  referrer TEXT,
  user_agent TEXT,
  country TEXT,
  properties TEXT, -- JSON string
  session_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Daily aggregates for fast queries
CREATE TABLE IF NOT EXISTS analytics_daily (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date DATE NOT NULL,
  event_type TEXT NOT NULL,
  event_name TEXT,
  count INTEGER DEFAULT 0,
  unique_sessions INTEGER DEFAULT 0,
  UNIQUE(date, event_type, event_name)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_events_created ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_events_type ON analytics_events(event_type, event_name);
CREATE INDEX IF NOT EXISTS idx_events_session ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_daily_date ON analytics_daily(date);
