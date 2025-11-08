-- Create monitoring_events table for storing client-side errors, performance metrics, and user actions
-- This table supports the monitoring service at /api/monitoring/events

CREATE TABLE IF NOT EXISTS monitoring_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50) NOT NULL CHECK (type IN ('error', 'performance', 'user_action')),
  event_data JSONB NOT NULL,
  session_id VARCHAR(100),
  user_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_monitoring_events_type ON monitoring_events(type);
CREATE INDEX IF NOT EXISTS idx_monitoring_events_session_id ON monitoring_events(session_id);
CREATE INDEX IF NOT EXISTS idx_monitoring_events_user_id ON monitoring_events(user_id);
CREATE INDEX IF NOT EXISTS idx_monitoring_events_created_at ON monitoring_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_monitoring_events_type_created_at ON monitoring_events(type, created_at DESC);

-- Add GIN index for JSONB queries
CREATE INDEX IF NOT EXISTS idx_monitoring_events_event_data ON monitoring_events USING GIN (event_data);

-- Add comment for documentation
COMMENT ON TABLE monitoring_events IS 'Stores client-side monitoring events including errors, performance metrics, and user actions';
COMMENT ON COLUMN monitoring_events.type IS 'Type of event: error, performance, or user_action';
COMMENT ON COLUMN monitoring_events.event_data IS 'Full event data including message, stack trace, metrics, context, etc.';
COMMENT ON COLUMN monitoring_events.session_id IS 'Browser session identifier for tracking events across a user session';
COMMENT ON COLUMN monitoring_events.user_id IS 'Optional authenticated user ID';

-- Create a partition for better performance on large datasets (optional, can be enabled later)
-- This will automatically partition by month
-- CREATE TABLE monitoring_events_y2025m10 PARTITION OF monitoring_events
--   FOR VALUES FROM ('2025-10-01') TO ('2025-11-01');

-- Enable Row Level Security (RLS)
ALTER TABLE monitoring_events ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow service role to insert and select
CREATE POLICY "Service role can insert monitoring events"
  ON monitoring_events
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can select monitoring events"
  ON monitoring_events
  FOR SELECT
  TO service_role
  USING (true);

-- Allow authenticated users to read their own events (useful for debugging)
CREATE POLICY "Users can view their own monitoring events"
  ON monitoring_events
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid()::text::uuid);
