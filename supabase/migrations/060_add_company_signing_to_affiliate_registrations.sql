-- Add company signing columns to affiliate_registrations (mirrors registration_forms columns)
ALTER TABLE affiliate_registrations
ADD COLUMN IF NOT EXISTS agreement_company_signed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS agreement_company_file_path TEXT DEFAULT NULL;
