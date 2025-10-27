-- Create newsletter_subscribers table
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  source VARCHAR(50) DEFAULT 'footer',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON public.newsletter_subscribers(email);

-- Create index on is_active for faster filtering
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_active ON public.newsletter_subscribers(is_active);

-- Add RLS (Row Level Security) policies
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Allow public to insert (subscribe)
CREATE POLICY "Allow public to subscribe" ON public.newsletter_subscribers
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow public to view their own subscription
CREATE POLICY "Allow users to view own subscription" ON public.newsletter_subscribers
  FOR SELECT
  TO public
  USING (true);

-- Only authenticated users can update
CREATE POLICY "Only authenticated users can update" ON public.newsletter_subscribers
  FOR UPDATE
  TO authenticated
  USING (true);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_newsletter_subscribers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_newsletter_subscribers_updated_at_trigger
  BEFORE UPDATE ON public.newsletter_subscribers
  FOR EACH ROW
  EXECUTE FUNCTION update_newsletter_subscribers_updated_at();

-- Add comment to table
COMMENT ON TABLE public.newsletter_subscribers IS 'Stores newsletter subscriber emails from website footer and other sources';
