# PowerCA Setup Guide - Supabase & Resend Configuration

## Prerequisites
- Supabase account (https://supabase.com)
- Resend account (https://resend.com)
- Node.js installed on your machine

---

## Part 1: Supabase Database Setup

### Step 1: Create Supabase Project
1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click "New project"
3. Enter project details:
   - Project name: `powerca-website`
   - Database Password: (save this securely)
   - Region: Choose nearest to your location
4. Click "Create new project" and wait for setup

### Step 2: Get Your Supabase Credentials
1. Once project is created, go to **Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **Anon/Public Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **Service Role Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (keep secret!)

### Step 3: Create Database Tables
1. Go to **SQL Editor** in Supabase dashboard
2. Click "New query"
3. Copy and paste this SQL:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create bookings table
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

-- Enable Row Level Security
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Allow public inserts for demo bookings
CREATE POLICY "Anyone can create bookings" ON public.bookings
  FOR INSERT WITH CHECK (true);

-- Allow reading bookings
CREATE POLICY "Anyone can read bookings" ON public.bookings
  FOR SELECT USING (true);

-- Create indexes for performance
CREATE INDEX idx_bookings_date ON public.bookings(date);
CREATE INDEX idx_bookings_status ON public.bookings(status);
CREATE INDEX idx_bookings_email ON public.bookings(email);
```

4. Click "Run" to execute the SQL

### Step 4: Verify Table Creation
1. Go to **Table Editor** in sidebar
2. You should see `bookings` table
3. Check that columns are created correctly

---

## Part 2: Resend Email Setup

### Step 1: Get Resend API Key
1. Go to [https://resend.com/api-keys](https://resend.com/api-keys)
2. Click "Create API Key"
3. Enter details:
   - Name: `PowerCA Website`
   - Permission: `Full access`
4. Click "Add" and copy the API key (starts with `re_`)

### Step 2: Add Your Domain (Optional but Recommended)
1. Go to **Domains** section in Resend
2. Click "Add Domain"
3. Enter `powerca.in`
4. Add these DNS records to your domain provider:

   **MX Record:**
   - Type: MX
   - Name: send
   - Value: feedback-smtp.us-east-1.amazonses.com
   - Priority: 10

   **TXT Records for SPF:**
   - Type: TXT
   - Name: send
   - Value: `v=spf1 include:amazonses.com ~all`

   **DKIM Records:** (Resend will provide 3 CNAME records)

5. Click "Verify DNS Records" after adding them
6. Wait for verification (can take up to 48 hours)

### Step 3: For Immediate Testing
If you want to test immediately without domain verification:
- Use `onboarding@resend.dev` as sender email
- Add your test email addresses to "Verified Emails" in Resend dashboard

---

## Part 3: Update Environment Variables

### Step 1: Update .env.local file
Replace the placeholder values with your actual credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_PUBLIC_KEY_HERE
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY_HERE

# Resend Email Service
RESEND_API_KEY=re_YOUR_ACTUAL_API_KEY_HERE

# NextAuth Configuration (keep as is)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-please-change-in-production

# Database URL (Optional - if using Prisma with Supabase)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-ID].supabase.co:5432/postgres
```

### Step 2: Update Email Configuration
If using custom domain, update the sender email in:
`src/lib/resend.ts` (line 116 and 141)

Change from:
```typescript
from: 'PowerCA <onboarding@resend.dev>'
```

To:
```typescript
from: 'PowerCA <noreply@powerca.in>'
```

---

## Part 4: Test Your Setup

### Step 1: Restart Development Server
```bash
# Stop the server (Ctrl+C)
# Start it again
npm run dev
```

### Step 2: Test Database Connection
1. Open browser to `http://localhost:3000/book-demo`
2. Fill the booking form
3. Check Supabase Table Editor for new booking entry

### Step 3: Test Email Sending
1. Submit a booking with your email
2. Check your inbox for confirmation email
3. Check `contact@powerca.in` inbox for admin notification

---

## Part 5: Troubleshooting

### Common Issues and Solutions

#### 1. Database Not Connecting
- **Error**: "fetch failed" or "Network request failed"
- **Solution**:
  - Verify Supabase URL is correct (no typos)
  - Check if project is active in Supabase dashboard
  - Ensure Row Level Security policies are created

#### 2. Emails Not Sending
- **Error**: "API key is invalid"
- **Solution**:
  - Verify Resend API key starts with `re_`
  - Check API key has full access permissions
  - Ensure no extra spaces in .env.local

#### 3. "Invalid email address" Error
- **Solution**:
  - If using test domain, add recipient email to Resend verified emails
  - Wait for domain verification if using custom domain

#### 4. Booking Creates but No Email
- **Solution**:
  - Check Resend dashboard for failed emails
  - Verify sender email matches your configuration
  - Check console logs for specific error messages

### View Logs
To see detailed logs while testing:
1. Open browser Developer Tools (F12)
2. Go to Network tab
3. Submit a booking
4. Check the `/api/bookings/supabase` request
5. Look at Response for error details

### Database Verification
To verify your Supabase setup:
1. Go to Supabase dashboard → SQL Editor
2. Run: `SELECT * FROM bookings ORDER BY created_at DESC;`
3. You should see your test bookings

---

## Part 6: Production Checklist

Before going live:

- [ ] Change `NEXTAUTH_SECRET` to a secure random string
- [ ] Verify domain in Resend for professional emails
- [ ] Enable additional security in Supabase (2FA, API restrictions)
- [ ] Set up email rate limiting to prevent spam
- [ ] Configure CORS in Supabase for your production domain
- [ ] Add error monitoring (Sentry, LogRocket, etc.)
- [ ] Set up database backups in Supabase
- [ ] Test with real email addresses
- [ ] Update admin email from `contact@powerca.in` to actual address

---

## Need Help?

1. **Supabase Issues**: Check [Supabase Docs](https://supabase.com/docs)
2. **Resend Issues**: Check [Resend Docs](https://resend.com/docs)
3. **Application Issues**: Check console logs and network tab

## Support Contacts
- Supabase Support: support@supabase.io
- Resend Support: support@resend.com