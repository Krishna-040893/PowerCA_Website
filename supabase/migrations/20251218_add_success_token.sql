-- Migration: Add success_token columns to app_download_payments
-- Date: 2025-12-18
-- Description: Add secure token for success page access (prevents exposing orderId and email in URL)

-- Add success_token column (unique token for success page)
ALTER TABLE app_download_payments
ADD COLUMN IF NOT EXISTS success_token VARCHAR(64) UNIQUE;

-- Add success_token_used column (track if token was used)
ALTER TABLE app_download_payments
ADD COLUMN IF NOT EXISTS success_token_used BOOLEAN DEFAULT FALSE;

-- Create index for fast token lookups
CREATE INDEX IF NOT EXISTS idx_app_download_payments_success_token
ON app_download_payments(success_token);

-- Comments for documentation
COMMENT ON COLUMN app_download_payments.success_token IS 'Secure token for accessing the success page (32 bytes hex = 64 chars)';
COMMENT ON COLUMN app_download_payments.success_token_used IS 'Whether the success token has been viewed (for analytics)';
