-- Supabase Schema for Budget Tracker App
-- Run these commands in your Supabase SQL Editor

-- Create transactions table
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  amount DECIMAL(10,2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'savings', 'withdrawal')),
  category TEXT,
  reason TEXT,
  "user" TEXT NOT NULL CHECK ("user" IN ('Nuone', 'Kate')),
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create settings table for savings goal
CREATE TABLE settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  savings_goal DECIMAL(10,2) NOT NULL DEFAULT 150000,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings
INSERT INTO settings (savings_goal) VALUES (150000);

-- Enable Row Level Security (RLS)
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (since this is a shared budget app)
CREATE POLICY "Allow all operations on transactions" ON transactions
  FOR ALL USING (true);

CREATE POLICY "Allow all operations on settings" ON settings
  FOR ALL USING (true);

-- Create indexes for better performance
CREATE INDEX idx_transactions_user ON transactions("user");
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_date ON transactions(date);

-- Enable real-time subscriptions
ALTER PUBLICATION supabase_realtime ADD TABLE transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE settings;