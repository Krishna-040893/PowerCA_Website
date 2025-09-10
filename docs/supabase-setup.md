# Supabase Setup Guide for PowerCA

## Why Supabase Instead of Prisma?

1. **Direct SQL Access** - No ORM complexity, write SQL directly
2. **Built-in Auth** - Authentication system included
3. **Real-time Updates** - WebSocket subscriptions out of the box
4. **Better Next.js Integration** - Official Next.js SDK
5. **No Build Issues** - No Prisma client generation problems
6. **Hosted Database** - PostgreSQL database in the cloud

## Setup Instructions

### 1. Create Supabase Account
1. Go to [https://supabase.com](https://supabase.com)
2. Sign up for a free account
3. Create a new project

### 2. Get Your Credentials
After creating your project, go to Settings > API and copy:
- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

### 3. Update Environment Variables
Update your `.env` file:
```env
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

### 4. Create Database Tables
Go to Supabase Dashboard > SQL Editor and run the schema from:
`supabase/schema.sql`

Or run each table creation one by one:

```sql
-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  firm_name TEXT,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  type TEXT DEFAULT 'demo',
  status TEXT DEFAULT 'CONFIRMED',
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enable Row Level Security
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- 4. Allow public inserts (for demo bookings)
CREATE POLICY "Anyone can create bookings" ON public.bookings
  FOR INSERT WITH CHECK (true);
```

### 5. Test Your Setup
The booking system will now:
1. Save bookings to Supabase if configured
2. Fall back to local storage if Supabase credentials are not set
3. Send email confirmations via Resend

## Current Implementation

### API Endpoints
- `/api/bookings/supabase` - Main booking endpoint using Supabase
- `/api/bookings/simple` - Fallback endpoint (file-based)
- `/api/bookings/db` - Old Prisma endpoint (deprecated)

### Features
- ✅ Create bookings without authentication
- ✅ Check available time slots
- ✅ Send confirmation emails
- ✅ Fallback to demo mode if Supabase not configured

## Benefits Over Prisma

1. **No Build Issues** - No query engine problems with Turbopack
2. **Cloud Database** - No local SQLite file management
3. **Better Performance** - Direct PostgreSQL queries
4. **Easier Deployment** - No migrations to run in production
5. **Built-in Features** - Auth, real-time, storage included

## Next Steps

After setting up Supabase:
1. Test booking functionality
2. Set up authentication (optional)
3. Enable real-time booking updates (optional)
4. Configure backup strategies

## Troubleshooting

### Booking Not Saving?
- Check Supabase credentials in `.env`
- Verify tables are created in Supabase
- Check browser console for errors

### Email Not Sending?
- Verify Resend API key
- Check email configuration

### Fallback Mode Active?
If you see "Booking confirmed successfully (demo mode)", Supabase is not configured properly.