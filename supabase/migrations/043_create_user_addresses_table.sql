-- Create user_addresses table for storing multiple billing addresses per user
-- This allows users to save multiple location-based addresses

CREATE TABLE IF NOT EXISTS public.user_addresses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.registration_forms(id) ON DELETE CASCADE,

    -- Address Details
    full_name TEXT NOT NULL,
    firm_name TEXT NOT NULL,
    gst_no TEXT,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    postcode TEXT NOT NULL,
    country TEXT NOT NULL DEFAULT 'India',
    phone TEXT NOT NULL,
    email TEXT NOT NULL,

    -- Metadata
    is_default BOOLEAN DEFAULT false,
    label TEXT, -- e.g., "Office", "Home", "Branch Office"
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id ON public.user_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_addresses_is_default ON public.user_addresses(is_default);
CREATE INDEX IF NOT EXISTS idx_user_addresses_country ON public.user_addresses(country);

-- Enable Row Level Security
ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only view their own addresses
CREATE POLICY "Users can view own addresses"
ON public.user_addresses
FOR SELECT
USING (
    auth.uid() IS NOT NULL
    AND user_id IN (
        SELECT id FROM public.registration_forms WHERE id = auth.uid()
    )
);

-- Users can insert their own addresses
CREATE POLICY "Users can insert own addresses"
ON public.user_addresses
FOR INSERT
WITH CHECK (
    auth.uid() IS NOT NULL
    AND user_id = auth.uid()
);

-- Users can update their own addresses
CREATE POLICY "Users can update own addresses"
ON public.user_addresses
FOR UPDATE
USING (
    auth.uid() IS NOT NULL
    AND user_id = auth.uid()
);

-- Users can delete their own addresses
CREATE POLICY "Users can delete own addresses"
ON public.user_addresses
FOR DELETE
USING (
    auth.uid() IS NOT NULL
    AND user_id = auth.uid()
);

-- Create a function to ensure only one default address per user
CREATE OR REPLACE FUNCTION public.ensure_single_default_address()
RETURNS TRIGGER AS $$
BEGIN
    -- If this address is being set as default
    IF NEW.is_default = true THEN
        -- Unset all other default addresses for this user
        UPDATE public.user_addresses
        SET is_default = false
        WHERE user_id = NEW.user_id AND id != NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to ensure only one default address
CREATE TRIGGER trigger_ensure_single_default_address
BEFORE INSERT OR UPDATE OF is_default ON public.user_addresses
FOR EACH ROW
EXECUTE FUNCTION public.ensure_single_default_address();

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.user_addresses
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Add comments
COMMENT ON TABLE public.user_addresses IS 'Stores multiple billing addresses for users';
COMMENT ON COLUMN public.user_addresses.user_id IS 'Reference to the user who owns this address';
COMMENT ON COLUMN public.user_addresses.is_default IS 'Whether this is the default address for the user';
COMMENT ON COLUMN public.user_addresses.label IS 'Custom label for the address (e.g., Office, Home)';
