# Contact Form Setup Documentation

## Overview

The contact form has been configured to save submissions to Supabase and send email notifications to contact@powerca.in.

## Features Implemented

### 1. Database Storage

- **Table Name**: `contacts`
- **Location**: Supabase database
- **Migration File**: `supabase/migrations/039_create_contacts_table.sql`

#### Table Schema

```sql
- id: UUID (primary key)
- name: TEXT (required)
- email: TEXT (required)
- phone: TEXT (required)
- message: TEXT (required)
- status: TEXT (default: 'new', options: 'new', 'contacted', 'resolved')
- notes: TEXT (optional, for admin use)
- created_at: TIMESTAMP (auto-generated)
```

#### Indexes

- `idx_contacts_created_at` - For sorting by date
- `idx_contacts_status` - For filtering by status
- `idx_contacts_email` - For searching by email

#### Row Level Security (RLS)

- **Public Insert**: Anyone can submit the contact form
- **Admin Access**: Only authenticated users can view/update contacts

### 2. Email Notifications

- **Recipient**: contact@powerca.in
- **Template**: `src/lib/email-templates/contact-notification.tsx`
- **Service**: Resend API
- **Includes**: Name, email, phone, message, submission timestamp

### 3. Contact Form Component

- **Location**: `src/app/Contact page/components/ContactForm.tsx`
- **Features**:
  - Real-time validation
  - Loading states during submission
  - Success/error messages
  - Form reset after successful submission
  - All fields required
  - Disabled state during submission

### 4. API Endpoint

- **Endpoint**: `/api/contact`
- **Method**: POST
- **File**: `src/app/api/contact/route.ts`
- **Functionality**:
  - Saves contact to Supabase
  - Sends notification email to contact@powerca.in
  - Sends welcome email to the submitter
  - Input sanitization using DOMPurify
  - Comprehensive error handling

## Setup Instructions

### Step 1: Run Database Migration

#### Option A: Manual Migration (Recommended)

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Navigate to SQL Editor
3. Copy the contents of `supabase/migrations/039_create_contacts_table.sql`
4. Paste into the SQL Editor
5. Click "Run"

#### Option B: Using Script

```bash
node scripts/run-contacts-migration.js
```

### Step 2: Configure Environment Variables

Ensure these variables are set in your `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Email (Resend)
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=PowerCA <noreply@powerca.in>
CONTACT_EMAIL=contact@powerca.in
```

**Important**: Make sure `CONTACT_EMAIL` is set to `contact@powerca.in` to receive form submissions at the correct email address.

### Step 3: Verify Email Configuration

Check `src/lib/send-emails.ts` line 24 to ensure it's using the `CONTACT_EMAIL` environment variable:

```typescript
to: process.env.CONTACT_EMAIL || 'support@powerca.com',
```

### Step 4: Test the Form

1. Navigate to `/contact` page
2. Fill out all fields (name, email, phone, message)
3. Click Submit
4. Verify:
   - Success message appears
   - Form clears
   - Entry appears in Supabase `contacts` table
   - Email received at contact@powerca.in
   - User receives welcome email

## Admin Management

### Viewing Contacts in Supabase

1. Go to Supabase Dashboard
2. Navigate to Table Editor
3. Select `contacts` table
4. View all submissions with filters and search

### Contact Status Workflow

- **new**: Just submitted, not yet contacted
- **contacted**: Followup sent to the user
- **resolved**: Issue/inquiry resolved

### Updating Contact Status

```sql
UPDATE contacts
SET status = 'contacted',
    notes = 'Called customer on 2024-10-27'
WHERE id = 'contact-id-here';
```

## Future Enhancements

### Recommended Admin Features

1. Create admin page to view/manage contacts at `/admin/contacts`
2. Add filters by status and date range
3. Add search by name/email
4. Add bulk actions (mark as contacted, export to CSV)
5. Add email templates for common responses
6. Add notes/comments for internal tracking

### Example Admin Page Route

Create `/src/app/admin/contacts/page.tsx` similar to the existing admin pages:

- List all contacts with pagination
- Filter by status
- Search functionality
- Update status inline
- View full message in modal

## Troubleshooting

### Form Submission Fails

1. Check browser console for errors
2. Verify environment variables are set
3. Check Supabase table permissions (RLS policies)
4. Verify API endpoint is accessible at `/api/contact`

### Emails Not Received

1. Verify `RESEND_API_KEY` is valid
2. Check `CONTACT_EMAIL` environment variable
3. Verify Resend domain is verified
4. Check spam/junk folder
5. Review Resend dashboard for delivery logs

### Database Errors

1. Verify migration ran successfully
2. Check Supabase logs in dashboard
3. Verify RLS policies are correct
4. Check service role key permissions

## Files Created/Modified

### New Files

- `supabase/migrations/039_create_contacts_table.sql` - Database migration
- `src/lib/email-templates/contact-notification.tsx` - Email template
- `scripts/run-contacts-migration.js` - Migration helper script
- `docs/CONTACT_FORM_SETUP.md` - This documentation

### Modified Files

- `src/app/api/contact/route.ts` - Added database storage
- `src/app/Contact page/components/ContactForm.tsx` - Added API integration, loading states, validation

## Security Considerations

1. **Input Sanitization**: All inputs are sanitized using DOMPurify
2. **RLS Policies**: Database access restricted via Row Level Security
3. **Rate Limiting**: Consider adding rate limiting to prevent spam
4. **CAPTCHA**: Consider adding reCAPTCHA for production
5. **Email Verification**: Welcome email confirms valid email address

## Support

For issues or questions about the contact form:

- Check this documentation
- Review Supabase logs
- Check Resend delivery logs
- Review browser console for frontend errors
- Check server logs for API errors
