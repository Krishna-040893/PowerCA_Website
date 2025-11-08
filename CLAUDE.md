# Claude Code Configuration

## Project Overview: PowerCA - Complete CA Practice Management Solution

PowerCA is a comprehensive SaaS platform designed for Chartered Accountants to manage their practice efficiently. Built with Next.js 15, TypeScript, Tailwind CSS, and Supabase.

### Key Features

- **Client Management** - Centralized client profiles with history tracking
- **Tax Compliance** - Automated deadline tracking and reminders
- **Document Management** - Secure cloud storage with collaboration
- **Billing & Invoicing** - Automated payment processing with GST calculations
- **Task Management** - Team collaboration and assignment tracking
- **Affiliate System** - Complete referral tracking and commission management
- **Admin Portal** - Modern dashboard with sidebar navigation and dual authentication

### Tech Stack

- **Frontend**: Next.js 15.5, React 19, TypeScript 5, Tailwind CSS 3.4, Framer Motion, shadcn/ui
- **Backend**: Supabase (PostgreSQL), NextAuth.js
- **Payments**: Razorpay (Indian payment gateway)
- **Email**: Resend with React Email templates
- **Authentication**: Dual system - Supabase for users, JWT for admin

### Project Structure

- `src/app/` - Next.js App Router pages
- `src/app/admin/` - Admin portal with management pages
- `src/components/admin/` - Admin-specific components
- `src/lib/` - Utilities, services, and authentication
- `src/hooks/` - Custom React hooks including useAdminAuth
- `supabase/` - Database migrations and setup
- `scripts/` - Setup and utility scripts
- `docs/` - Project documentation

## Project Conventions

### CRITICAL: Code Quality Guidelines

**IMPORTANT: DO NOT USE AUTOMATED FIX SCRIPTS**

- Never run scripts from `scripts/` folder that perform automated fixes (e.g., `fix-*.js`)
- These scripts often remove imports and variables without understanding context
- Always fix errors manually by understanding the root cause
- When fixing linting/TypeScript errors:
  1. Read the error message carefully
  2. Understand why the error exists
  3. Fix the actual issue, don't just suppress warnings
  4. Test that the fix doesn't break functionality

### Testing Commands

- Run tests: `npm test` (when implemented)
- Lint code: `npm run lint` (check for issues, don't auto-fix)
- Type check: `npm run typecheck` or `npx tsc --noEmit`
- **AVOID**: `npm run lint:fix` - can cause more issues than it solves

### Development Server

- Start dev server: `npm run dev`
- Build project: `npm run build`
- Start production: `npm start`
- Default port: 3000

### Environment Variables Required

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY

# Authentication
NEXTAUTH_URL
NEXTAUTH_SECRET  # Also used for admin JWT

# Razorpay
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
RAZORPAY_WEBHOOK_SECRET

# Email (Resend)
RESEND_API_KEY
EMAIL_FROM
```

### Database Tables

- `bookings` - Demo booking requests
- `registrations` - User registrations
- `affiliate_applications` - Affiliate partner requests
- `admin_users` - Admin authentication

### Admin Credentials (Development)

**Superadmin Account:**

- Username: `superadmin`
- Password: `Powerca@25`
- Email: `superadmin@powerca.in`

**Primary Admin Account:**

- Username: `PCAadmin`
- Password: `Powerca@25`
- Email: `admin@powerca.in`

- Login at: `/admin-login`

## Important Notes

- Project uses dual authentication: Supabase for users, JWT for admin
- Admin portal includes sidebar navigation that persists across pages
- All documentation files are located in the `docs/` folder
- Database migration files are located in the `supabase/` folder
