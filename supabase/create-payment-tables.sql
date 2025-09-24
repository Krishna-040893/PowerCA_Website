-- Create payment_orders table for tracking order status
CREATE TABLE IF NOT EXISTS payment_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id TEXT UNIQUE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'INR',
    status TEXT DEFAULT 'created',
    customer_email TEXT,
    customer_name TEXT,
    customer_phone TEXT,
    company TEXT,
    gst_number TEXT,
    product_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    order_id TEXT NOT NULL,
    payment_id TEXT NOT NULL,
    signature TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'INR',
    status TEXT NOT NULL,
    plan TEXT,
    email TEXT,
    phone TEXT,
    name TEXT,
    company TEXT,
    gst_number TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    pincode TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number TEXT UNIQUE NOT NULL,
    payment_id UUID REFERENCES payments(id),
    user_id UUID,
    amount DECIMAL(10,2) NOT NULL,
    gst DECIMAL(10,2),
    total DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'paid',
    invoice_date DATE DEFAULT CURRENT_DATE,
    due_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_id ON payments(payment_id);
CREATE INDEX IF NOT EXISTS idx_payments_email ON payments(email);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_payment_id ON invoices(payment_id);

-- Grant permissions
GRANT ALL ON payments TO authenticated;
GRANT ALL ON invoices TO authenticated;
GRANT ALL ON payments TO service_role;
GRANT ALL ON invoices TO service_role;