-- Add missing columns to registrations table if they don't exist
DO $$
BEGIN
    -- Add is_affiliate column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'registrations'
        AND column_name = 'is_affiliate'
    ) THEN
        ALTER TABLE registrations ADD COLUMN is_affiliate BOOLEAN DEFAULT false;
    END IF;

    -- Add affiliate_status column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'registrations'
        AND column_name = 'affiliate_status'
    ) THEN
        ALTER TABLE registrations ADD COLUMN affiliate_status TEXT;
    END IF;

    -- Add role column if it doesn't exist (some tables might have user_role instead)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'registrations'
        AND column_name = 'role'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'registrations'
        AND column_name = 'user_role'
    ) THEN
        ALTER TABLE registrations ADD COLUMN role TEXT DEFAULT 'subscriber';
    END IF;
END $$;

-- If you have user_role but not role, you might want to rename it
-- Uncomment the following if needed:
-- ALTER TABLE registrations RENAME COLUMN user_role TO role;

-- Make sure the registrations table has proper indexes
CREATE INDEX IF NOT EXISTS idx_registrations_email ON registrations(email);
CREATE INDEX IF NOT EXISTS idx_registrations_username ON registrations(username);
CREATE INDEX IF NOT EXISTS idx_registrations_is_affiliate ON registrations(is_affiliate);
CREATE INDEX IF NOT EXISTS idx_registrations_role ON registrations(role);