-- Manual migration script for account lockout feature
-- Run this if you cannot use alembic

-- Add failed_login_attempts column
ALTER TABLE users ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0;

-- Add locked_until column  
ALTER TABLE users ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP NULL;

-- Verify columns were added
-- SELECT column_name, data_type, is_nullable, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'users' AND column_name IN ('failed_login_attempts', 'locked_until');
