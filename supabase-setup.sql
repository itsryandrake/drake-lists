-- Run this in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/hudacpdajmfsejnbognh/sql/new

-- Add new columns to shared_lists
ALTER TABLE shared_lists 
ADD COLUMN IF NOT EXISTS owner TEXT NOT NULL DEFAULT 'ryan',
ADD COLUMN IF NOT EXISTS list_slug TEXT NOT NULL DEFAULT 'shopping',
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS due_date DATE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS reminder_enabled BOOLEAN DEFAULT false;

-- Add check constraint for priority (skip if exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'shared_lists_priority_check' AND conrelid = 'shared_lists'::regclass
    ) THEN
        ALTER TABLE shared_lists ADD CONSTRAINT shared_lists_priority_check 
        CHECK (priority IN ('low', 'medium', 'high'));
    END IF;
END $$;

-- Add check constraint for owner
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'shared_lists_owner_check' AND conrelid = 'shared_lists'::regclass
    ) THEN
        ALTER TABLE shared_lists ADD CONSTRAINT shared_lists_owner_check 
        CHECK (owner IN ('ryan', 'emily', 'shared'));
    END IF;
END $$;
