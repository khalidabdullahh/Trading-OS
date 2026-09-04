-- Trading-OS v2.0 Production Migration: Google OAuth Provider Identity
-- Adds auth_provider, provider_account_id, and email_verified columns with indexes

ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(50) DEFAULT 'email';
ALTER TABLE users ADD COLUMN IF NOT EXISTS provider_account_id VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS experience VARCHAR(100);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS country VARCHAR(100);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

CREATE INDEX IF NOT EXISTS idx_users_provider ON users(auth_provider, provider_account_id);
CREATE INDEX IF NOT EXISTS idx_users_email_lower ON users(LOWER(email));
