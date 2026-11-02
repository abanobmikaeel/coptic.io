-- Email subscriptions. Timestamps are UTC text in SQLite's datetime() format
-- (YYYY-MM-DD HH:MM:SS), so they compare correctly as strings. Booleans are 0/1.

CREATE TABLE subscribers (
	id TEXT PRIMARY KEY,
	email TEXT NOT NULL UNIQUE,
	name TEXT,
	patron_saint TEXT,
	verified INTEGER NOT NULL DEFAULT 0,
	daily_readings INTEGER NOT NULL DEFAULT 1,
	feast_reminders INTEGER NOT NULL DEFAULT 1,
	token TEXT UNIQUE,
	timezone TEXT NOT NULL DEFAULT 'America/New_York',
	created_at TEXT NOT NULL DEFAULT (datetime('now')),
	updated_at TEXT NOT NULL DEFAULT (datetime('now')),
	unsubscribed_at TEXT
);

CREATE TABLE otp_codes (
	id TEXT PRIMARY KEY,
	email TEXT NOT NULL,
	code TEXT NOT NULL,
	expires_at TEXT NOT NULL,
	used INTEGER NOT NULL DEFAULT 0,
	created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_otp_codes_email ON otp_codes (email);
