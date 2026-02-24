-- Add company signing columns to registration_forms
ALTER TABLE registration_forms
ADD COLUMN IF NOT EXISTS agreement_company_signed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS agreement_company_file_path TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS agreement_final_downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Add index for company signing status
CREATE INDEX IF NOT EXISTS idx_registration_forms_company_sign_status
ON registration_forms (agreement_company_signed_at, agreement_final_downloaded_at);
