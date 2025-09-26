# PowerCA Affiliate System Setup Guide

## Overview

The affiliate system allows admin to promote subscribers and customers to affiliates. Approved affiliates can promote PowerCA services and earn commissions.

## Database Setup Required

Execute these SQL files in your Supabase SQL editor:

1. **Create Affiliate Tables:**
   ```sql
   -- Run: supabase/create-affiliate-tables.sql
   ```

2. **Update Registrations Table:**
   ```sql
   -- Run: supabase/update-registrations-for-affiliates.sql
   ```

## System Components

### 1. Admin Role Management
- **Location:** `/admin/users`
- **Features:**
  - View all registered users
  - Change user roles (Professional, Student, Subscriber, Customer, Affiliate)
  - Promote users to affiliates automatically

### 2. Affiliate Application Process
- **Application Form:** `/affiliate/apply`
- **Required Fields:**
  - Name
  - Account Email
  - Payment Email
  - Website URL (optional)
  - Promotion Method (required, min 50 chars)

### 3. Admin Affiliate Management
- **Location:** `/admin/affiliates`
- **Features:**
  - View all affiliate applications
  - Review application details
  - Approve/reject applications with admin notes
  - Statistics dashboard
  - Email notifications to applicants

### 4. User Flow

#### For Users:
1. Register as Subscriber/Customer
2. Apply for affiliate program at `/affiliate/apply`
3. Wait for admin approval
4. Once approved, role changes to "Affiliate"

#### For Admin:
1. View users in `/admin/users`
2. Can directly promote users to "Affiliate" role
3. Review applications in `/admin/affiliates`
4. Approve/reject with notes
5. System automatically creates affiliate profile on approval

## API Endpoints

### User Management
- `GET /api/admin/users` - Fetch all users
- `PUT /api/admin/users` - Update user role

### Affiliate Management
- `POST /api/affiliate/apply` - Submit affiliate application
- `GET /api/admin/affiliates` - Fetch all applications
- `PUT /api/admin/affiliates` - Approve/reject applications

## Database Schema

### Tables Created:
1. **affiliate_applications** - Stores affiliate applications
2. **affiliate_profiles** - Stores approved affiliate data
3. **affiliate_referrals** - Tracks affiliate referrals and commissions

### Updated:
1. **registrations** - Added affiliate-related columns

## Features Implemented

✅ **Admin role management system**
✅ **Affiliate application form**
✅ **Admin approval/rejection workflow**
✅ **Email notifications**
✅ **Automatic affiliate code generation**
✅ **Commission tracking structure**
✅ **Role-based access control**

## Next Steps (Optional Enhancements)

- [ ] Affiliate dashboard for approved affiliates
- [ ] Referral tracking system
- [ ] Commission calculation and payment
- [ ] Affiliate analytics and reporting
- [ ] Custom affiliate links generation

## Testing the System

1. **Register a test user** as Subscriber
2. **Apply for affiliate program** at `/affiliate/apply`
3. **Admin login** and review application at `/admin/affiliates`
4. **Approve application** and verify user role change
5. **Check User Management** at `/admin/users` to see updated role

## Email Configuration

All emails are currently sent to `contact@powerca.in` due to Resend test mode. To enable emails to actual users, verify your domain at https://resend.com/domains.

The affiliate system is now fully functional and integrated into the PowerCA website!