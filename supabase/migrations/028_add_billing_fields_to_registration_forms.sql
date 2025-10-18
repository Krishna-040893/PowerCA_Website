-- Migration: Add billing address fields to registration_forms table
-- This allows users to maintain billing information even before making a payment

-- Add billing address columns to registration_forms table
ALTER TABLE public.registration_forms
ADD COLUMN IF NOT EXISTS firm_name TEXT,
ADD COLUMN IF NOT EXISTS company TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS gst_number TEXT;

-- Create index for faster lookups on GST number
CREATE INDEX IF NOT EXISTS idx_registration_forms_gst_number
ON public.registration_forms(gst_number)
WHERE gst_number IS NOT NULL;

-- Add comment to document the new columns
COMMENT ON COLUMN public.registration_forms.firm_name IS 'Firm or business name for billing purposes';
COMMENT ON COLUMN public.registration_forms.company IS 'Company name for billing purposes';
COMMENT ON COLUMN public.registration_forms.address IS 'Billing address';
COMMENT ON COLUMN public.registration_forms.gst_number IS 'GST registration number for invoicing';
