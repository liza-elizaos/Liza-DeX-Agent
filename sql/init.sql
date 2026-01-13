-- Initial schema for Liza analytics
CREATE TABLE IF NOT EXISTS tokens (
  id SERIAL PRIMARY KEY,
  mint TEXT UNIQUE NOT NULL,
  symbol TEXT,
  name TEXT,
  first_seen TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS holders (
  id SERIAL PRIMARY KEY,
  mint TEXT NOT NULL,
  owner TEXT NOT NULL,
  balance NUMERIC DEFAULT 0,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(mint, owner)
);

CREATE TABLE IF NOT EXISTS transfers (
  id SERIAL PRIMARY KEY,
  mint TEXT,
  tx_sig TEXT UNIQUE,
  "from" TEXT,
  "to" TEXT,
  amount NUMERIC,
  slot BIGINT,
  ts TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS watchlists (
  id SERIAL PRIMARY KEY,
  owner TEXT NOT NULL,
  mint TEXT NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(owner, mint)
);

CREATE TABLE IF NOT EXISTS alerts (
  id SERIAL PRIMARY KEY,
  owner TEXT,
  mint TEXT,
  type TEXT,
  payload JSONB,
  enabled BOOLEAN DEFAULT true,
  last_triggered TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_transfers_mint ON transfers(mint);
CREATE INDEX IF NOT EXISTS idx_holders_mint ON holders(mint);
