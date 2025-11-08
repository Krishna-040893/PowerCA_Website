# Registration System - Complete Working Guide

## ✅ System Status

The registration system now writes to the dedicated `registration_forms` table in Supabase.

## Current Setup

### Registration Flow

1. User fills form at http://localhost:3001/register
2. Data is saved to Supabase `registration_forms` table
3. Email is sent to user via Resend API
4. Admin can view all registrations at http://localhost:3001/admin/registrations

### Database Table: `registration_forms`

This table stores both professional and student sign-ups with the following columns:

- `id` - Auto-generated UUID
- `name` - User's full name
- `email` - Unique email address
- `username` - Unique username
- `phone` - Phone number
- `password_hash` - Encrypted password
- `role` - professional / student (admin tools may still set affiliate for promotions)
- `professional_type` - CA/CMA/CS/NA (for professionals)
- `membership_number` - Professional membership ID (stored as `NA` when “NA” is selected)
- `registration_number` - Student registration ID
- `institute_name` - Student's institute
- `agreed_to_terms` - Boolean flag confirming T&C acceptance
- `created_at`, `updated_at` - Timestamps managed automatically

### Additional Tables

To make it easier to query each signup type individually, the following tables mirror the relevant fields:

- `professional_registrations` – stores professional signups with `name`, `email`, `phone`, `username`, `password_hash`, `professional_type`, `membership_number`, and `agreed_to_terms`.
- `student_registrations` – stores student signups with `name`, `email`, `phone`, `username`, `password_hash`, `institute_name`, `registration_number`, and `agreed_to_terms`.

Both tables include automatic timestamps, the hashed password, and service-role RLS policies identical to `registration_forms`.

## Testing Registration

### 1. Access Registration Page

Open: http://localhost:3001/register

### 2. Fill the Form

#### For Professional Registration:

```
Name: John Doe
Email: john@example.com
Username: johndoe
Mobile: 9876543210
Password: Test@123
Role: Professional
Professional Type: CA
Membership No: 123456
```

#### For Student Registration:

```
Name: Jane Smith
Email: jane@example.com
Username: janesmith
Mobile: 9876543211
Password: Test@123
Role: Student
Registration No: ABC123
Institute Name: TestInstitute
```

### 3. Submit and Verify

- Click "Register"
- If successful, you'll see "Registration successful!"
- Check your Supabase Dashboard to see the new entry

## Viewing Registrations (Admin)

### 1. Access Admin Panel

Go to: http://localhost:3001/admin/registrations

### 2. Features Available:

- View all registered users
- See registration details
- Filter by role (Professional/Student)
- Export to CSV
- Real-time statistics

## Email Notifications

### Current Configuration:

- **Service**: Resend API
- **From**: contact@powerca.in
- **Template**: HTML email with registration details

### Email Features:

- Welcome message
- Registration confirmation
- User details summary
- Professional styling

## API Endpoints

### Registration Endpoints:

- `POST /api/registrations` - Create new registration (writes to `registration_forms`)
- `GET /api/registrations` - Get all registrations (admin, reads from `registration_forms`)
- `POST /api/auth/register` - Alternative registration endpoint

## Troubleshooting

### If Registration Fails:

1. **Check Supabase Connection**
   - Verify your Supabase project is running
   - Check `.env.local` has correct credentials

2. **Check Browser Console**
   - Press F12 to open Developer Tools
   - Look for error messages

3. **Check Server Logs**
   - View terminal where `npm run dev` is running
   - Look for "Supabase error" messages

### Common Issues:

**Issue**: "Email already registered"
**Solution**: User with this email exists. Use a different email.

**Issue**: "Username already taken"
**Solution**: Username is in use. Choose another username.

**Issue**: "Registration failed. Please try again."
**Solution**: Check if the `registration_forms` table exists in Supabase.

## Affiliate System (Ready)

### Database Tables Created:

- `affiliate_profiles` - Stores affiliate information
- `referrals` - Tracks referrals
- `commission_transactions` - Manages commissions

### To Enable Affiliate Features:

1. User registers normally
2. Admin promotes user to affiliate
3. User gets unique affiliate code
4. Can track referrals and commissions

### Affiliate Pages:

- Apply: http://localhost:3001/affiliate/apply
- Dashboard: http://localhost:3001/affiliate/dashboard

## Next Steps

### Immediate Actions:

1. ✅ Test registration with sample data
2. ✅ Verify data in Supabase Dashboard
3. ✅ Check admin panel for registrations

### Future Enhancements:

1. Email verification system
2. Password reset functionality
3. User profile management
4. Advanced affiliate tracking
5. Commission payment system

## Security Features

- ✅ Password hashing with bcrypt
- ✅ SQL injection prevention
- ✅ Duplicate user prevention
- ✅ Row Level Security in Supabase
- ✅ Input validation on frontend

## Support

For any issues:

1. Check error messages in browser console
2. Review server logs in terminal
3. Verify Supabase table structure
4. Ensure all environment variables are set

## Summary

✅ **Registration**: Working with Supabase `registration_forms` table
✅ **Email**: Sends confirmation via Resend
✅ **Admin Panel**: View all registrations
✅ **Affiliate System**: Database ready for activation
✅ **Security**: Passwords hashed, validation in place

The system is now fully functional and uses the Supabase `registration_forms` table!
