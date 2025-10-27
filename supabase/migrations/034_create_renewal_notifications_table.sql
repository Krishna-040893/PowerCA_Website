-- Create renewal_notifications table to track when renewal emails have been sent
CREATE TABLE IF NOT EXISTS public.renewal_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID NOT NULL,
  notification_type VARCHAR(50) NOT NULL, -- e.g., '11_month_renewal'
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  email_sent_to VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_renewal_notifications_user_id ON public.renewal_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_renewal_notifications_subscription_id ON public.renewal_notifications(subscription_id);
CREATE INDEX IF NOT EXISTS idx_renewal_notifications_type ON public.renewal_notifications(notification_type);

-- Enable Row Level Security
ALTER TABLE public.renewal_notifications ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view their own notifications
CREATE POLICY "Users can view their own renewal notifications"
  ON public.renewal_notifications
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy to allow service role to insert notifications
CREATE POLICY "Service role can insert renewal notifications"
  ON public.renewal_notifications
  FOR INSERT
  WITH CHECK (true);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_renewal_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_renewal_notifications_updated_at
  BEFORE UPDATE ON public.renewal_notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_renewal_notifications_updated_at();

-- Add comment to table
COMMENT ON TABLE public.renewal_notifications IS 'Tracks renewal notification emails sent to users when they complete 11 months of their subscription';
