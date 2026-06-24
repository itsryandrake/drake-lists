-- Run this in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/hudacpdajmfsejnbognh/sql/new

CREATE TABLE IF NOT EXISTS shared_lists (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    list_name TEXT NOT NULL DEFAULT 'Shared Shopping + Grocery',
    item TEXT NOT NULL,
    completed BOOLEAN DEFAULT false,
    added_by TEXT NOT NULL DEFAULT 'donna',
    created_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ
);

-- Enable RLS but allow public read access (for the web app)
ALTER TABLE shared_lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON shared_lists
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert" ON shared_lists
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update" ON shared_lists
    FOR UPDATE USING (true);

CREATE POLICY "Allow public delete" ON shared_lists
    FOR DELETE USING (true);
