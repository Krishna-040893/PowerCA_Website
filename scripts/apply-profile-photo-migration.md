# Apply Profile Photo Migration

This guide will help you apply the profile photo storage migration to your Supabase database.

## Option 1: Supabase Dashboard (Recommended)

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your PowerCA project
3. Navigate to **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the entire contents of `supabase/migrations/027_add_profile_photos_storage.sql`
6. Paste into the SQL editor
7. Click **Run** (or press Ctrl/Cmd + Enter)

## Option 2: Supabase CLI

If you have Supabase CLI installed:

```bash
# Make sure you're logged in
supabase login

# Link your project (if not already linked)
supabase link --project-ref YOUR_PROJECT_REF

# Apply the migration
supabase db push
```

## Option 3: Manual SQL Execution

If the migration file has issues, you can run these commands manually:

### Step 1: Create Storage Bucket

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-photos', 'profile-photos', true)
ON CONFLICT (id) DO NOTHING;
```

### Step 2: Set Up Storage Policies

```sql
-- Service role full access
CREATE POLICY "Service role can manage all profile photos"
ON storage.objects
FOR ALL
TO service_role
USING (bucket_id = 'profile-photos')
WITH CHECK (bucket_id = 'profile-photos');

-- Public read access
CREATE POLICY "Public can view profile photos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'profile-photos');
```

### Step 3: Add Columns to Tables

```sql
-- Add to registration_forms table
ALTER TABLE public.registration_forms
ADD COLUMN IF NOT EXISTS profile_photo_url TEXT;

CREATE INDEX IF NOT EXISTS idx_registration_forms_profile_photo
ON public.registration_forms(profile_photo_url)
WHERE profile_photo_url IS NOT NULL;

-- Add to affiliate_registrations table
ALTER TABLE public.affiliate_registrations
ADD COLUMN IF NOT EXISTS profile_photo_url TEXT;

CREATE INDEX IF NOT EXISTS idx_affiliate_registrations_profile_photo
ON public.affiliate_registrations(profile_photo_url)
WHERE profile_photo_url IS NOT NULL;
```

## Verification

After running the migration, verify it worked:

1. **Check the storage bucket exists:**
   - Go to **Storage** in Supabase Dashboard
   - You should see a bucket named `profile-photos`

2. **Check the columns were added:**
   - Go to **Table Editor**
   - Open `registration_forms` table
   - Verify `profile_photo_url` column exists
   - Open `affiliate_registrations` table
   - Verify `profile_photo_url` column exists

3. **Test the upload:**
   - Go to http://localhost:3000/account
   - Click the camera icon to upload a profile photo
   - The upload should succeed without RLS errors

## Troubleshooting

### "new row violates row-level security policy"

This means the migration wasn't applied correctly. Make sure:

- The storage bucket `profile-photos` exists
- The RLS policies on `storage.objects` are created
- You're using the service role key in `.env.local`

### Storage bucket not found

Run Step 1 again from the manual SQL execution section.

### Column already exists

This is fine - the migration uses `ADD COLUMN IF NOT EXISTS` to prevent errors.

## Environment Variables Required

Make sure your `.env.local` has:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # Required for uploads
```

The `SUPABASE_SERVICE_ROLE_KEY` is critical for this feature to work!
