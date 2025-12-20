-- Migration: Create tables for App Download feature
-- Date: 2025-12-17
-- Description: Tables to store app download orders and payments with download tracking

-- Table: app_download_orders
-- Stores orders when user clicks "Pay" button (tracks abandoned payments)
CREATE TABLE IF NOT EXISTS app_download_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id VARCHAR(255) NOT NULL UNIQUE,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    status VARCHAR(50) DEFAULT 'created',
    customer_email VARCHAR(255),
    customer_name VARCHAR(255),
    customer_phone VARCHAR(50),
    product_id VARCHAR(100),
    product_name VARCHAR(255),
    user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: app_download_payments
-- Stores completed payments with download tracking
CREATE TABLE IF NOT EXISTS app_download_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    order_id VARCHAR(255) NOT NULL,
    payment_id VARCHAR(255) NOT NULL UNIQUE,
    signature TEXT,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    status VARCHAR(50) DEFAULT 'captured',
    product_id VARCHAR(100),
    product_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    name VARCHAR(255),

    -- License and download tracking (one-time download)
    license_key VARCHAR(50) NOT NULL,
    download_token VARCHAR(255) NOT NULL UNIQUE,
    download_count INTEGER DEFAULT 0,
    last_download_at TIMESTAMP WITH TIME ZONE,

    -- Success page token (one-time use for secure redirect)
    success_token VARCHAR(100),
    success_token_used BOOLEAN DEFAULT FALSE,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_app_download_orders_order_id ON app_download_orders(order_id);
CREATE INDEX IF NOT EXISTS idx_app_download_orders_user_id ON app_download_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_app_download_orders_status ON app_download_orders(status);

CREATE INDEX IF NOT EXISTS idx_app_download_payments_order_id ON app_download_payments(order_id);
CREATE INDEX IF NOT EXISTS idx_app_download_payments_payment_id ON app_download_payments(payment_id);
CREATE INDEX IF NOT EXISTS idx_app_download_payments_user_id ON app_download_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_app_download_payments_download_token ON app_download_payments(download_token);
CREATE INDEX IF NOT EXISTS idx_app_download_payments_email ON app_download_payments(email);
CREATE INDEX IF NOT EXISTS idx_app_download_payments_success_token ON app_download_payments(success_token);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_app_download_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
DROP TRIGGER IF EXISTS trigger_app_download_orders_updated_at ON app_download_orders;
CREATE TRIGGER trigger_app_download_orders_updated_at
    BEFORE UPDATE ON app_download_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_app_download_updated_at();

DROP TRIGGER IF EXISTS trigger_app_download_payments_updated_at ON app_download_payments;
CREATE TRIGGER trigger_app_download_payments_updated_at
    BEFORE UPDATE ON app_download_payments
    FOR EACH ROW
    EXECUTE FUNCTION update_app_download_updated_at();

-- RLS Policies - Using service role key bypasses RLS
ALTER TABLE app_download_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_download_payments ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for service role (API routes use service role key)
CREATE POLICY "Allow all for app_download_orders"
    ON app_download_orders FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow all for app_download_payments"
    ON app_download_payments FOR ALL
    USING (true)
    WITH CHECK (true);

-- Comments for documentation
COMMENT ON TABLE app_download_orders IS 'Stores app download orders when user clicks Pay (tracks abandoned payments)';
COMMENT ON TABLE app_download_payments IS 'Stores completed app download payments with one-time download tracking';
COMMENT ON COLUMN app_download_payments.license_key IS 'License key (set to N/A for demo version)';
COMMENT ON COLUMN app_download_payments.download_token IS 'Secure token for one-time download link verification';
COMMENT ON COLUMN app_download_payments.download_count IS 'Number of times downloaded (max 1 for one-time use)';
