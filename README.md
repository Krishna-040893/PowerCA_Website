# PowerCA - Complete CA Practice Management Solution

![PowerCA Logo](public/assets/logo.svg)

PowerCA is a comprehensive SaaS platform designed specifically for Chartered Accountants to manage their practice efficiently. Built with modern web technologies, it offers client management, tax compliance tracking, document management, billing & invoicing, and much more.

## 🚀 Features

### Core Functionality
- **Client Management** - Centralized client profiles with complete history tracking
- **Tax Compliance** - Automated deadline tracking and reminders
- **Document Management** - Secure cloud storage with collaboration features
- **Billing & Invoicing** - Automated payment processing with GST calculations
- **Task Management** - Team collaboration and assignment tracking
- **Affiliate System** - Complete referral tracking and commission management

### Admin Portal Features
- **Modern Admin Dashboard** - Comprehensive overview with real-time stats
- **Sidebar Navigation** - Persistent navigation across all admin pages
- **User Management** - Manage users, roles, and permissions
- **Booking Management** - Track and manage demo bookings
- **Affiliate Management** - Review and approve affiliate applications
- **Registration Tracking** - Monitor user registrations and exports
- **Dual Authentication** - Separate admin auth with JWT tokens

### Technical Features
- **Authentication** - Dual auth system (Supabase for users, JWT for admin)
- **Payment Integration** - Razorpay payment gateway with invoice generation
- **Email Notifications** - Automated emails for bookings and payments
- **Responsive Design** - Mobile-first approach with Tailwind CSS
- **Real-time Updates** - Powered by Supabase real-time subscriptions
- **Type Safety** - Full TypeScript coverage

## 🛠️ Tech Stack

### Frontend
- **Next.js 15.5** - React framework with App Router
- **React 19** - Latest React version
- **TypeScript 5** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling
- **Framer Motion** - Smooth animations
- **shadcn/ui** - Pre-built component library

### Backend & Database
- **Supabase** - Backend-as-a-Service with PostgreSQL
- **Prisma ORM** - Type-safe database queries
- **NextAuth.js** - Authentication solution

### Integrations
- **Razorpay** - Payment processing (Indian payment gateway)
- **Resend** - Email service
- **React Email** - Email template builder

## 📋 Prerequisites

- Node.js 18+ 
- npm/yarn/pnpm
- Supabase account (for production)
- Razorpay account (for payments)
- Resend account (for emails)

## 🔧 Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/PowerCA_Website.git
cd PowerCA_Website
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Copy `.env.example` to `.env.local` and fill in your credentials:

```env
# Database (Supabase)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key  # Also used for admin JWT signing

# Payment Gateway (Razorpay)
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
RAZORPAY_WEBHOOK_SECRET=your-webhook-secret

# Email Service (Resend)
RESEND_API_KEY=your-resend-api-key
EMAIL_FROM=noreply@yourdomain.com

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. **Set up the database**

For local development with Prisma:
```bash
npx prisma generate
npx prisma db push
```

For Supabase production:
```bash
# Run migrations
supabase db push

# Or manually run SQL from supabase/migrations/
```

5. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
PowerCA_Website/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/            # Auth route group
│   │   ├── (marketing)/       # Marketing pages
│   │   ├── admin/             # Admin portal pages
│   │   │   ├── affiliates/    # Affiliate management
│   │   │   ├── bookings/      # Booking management
│   │   │   ├── registrations/ # Registration tracking
│   │   │   └── users/         # User management
│   │   ├── admin-login/       # Admin authentication
│   │   ├── api/               # API routes
│   │   │   └── admin/         # Admin API endpoints
│   │   ├── auth/              # User authentication
│   │   ├── checkout/          # Payment checkout
│   │   ├── dashboard/         # User dashboard
│   │   └── payment-*/         # Payment status pages
│   ├── components/            # React components
│   │   ├── admin/            # Admin components
│   │   │   ├── admin-sidebar-layout.tsx
│   │   │   └── admin-page-wrapper.tsx
│   │   ├── ui/               # UI components (shadcn)
│   │   ├── sections/         # Page sections
│   │   └── layout/           # Layout components
│   ├── lib/                  # Utilities and services
│   │   ├── supabase/         # Supabase client
│   │   ├── admin-auth.ts     # Admin authentication
│   │   ├── email-templates/  # Email templates
│   │   └── invoice-generator.ts
│   ├── hooks/                # Custom React hooks
│   │   └── useAdminAuth.ts   # Admin auth hook
│   └── config/               # Configuration files
├── prisma/                   # Database schema
├── supabase/                 # Supabase migrations
├── public/                   # Static assets
└── docs/                     # Documentation
```

## 💳 Payment Integration

PowerCA uses Razorpay for payment processing:

1. **Pricing Model**: ₹22,000 one-time implementation fee with first year FREE
2. **Payment Flow**:
   - User fills checkout form → Order created → Payment processed → Invoice generated → Email sent
3. **Webhook Setup**: Configure webhook URL in Razorpay Dashboard:
   ```
   https://yourdomain.com/api/payment/webhook
   ```

## 🔐 Authentication

### User Authentication
- **Powered by Supabase Auth**
- Email/Password login
- Google OAuth (optional)
- Protected routes via middleware

### Admin Authentication
- **Separate JWT-based system**
- Custom admin login at `/admin-login`
- Secure token storage in localStorage
- Session persistence with auto-logout
- Default credentials (development):
  - Username: `superadmin`
  - Password: `Admin@123`

⚠️ **Important**: Change admin credentials in production!

## 📧 Email Templates

Email templates are built with React Email and sent via Resend:
- Booking confirmations
- Payment confirmations with invoice
- Welcome emails

## 🚀 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Other Platforms
Build the production bundle:
```bash
npm run build
npm start
```

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Type checking
npx tsc --noEmit

# Linting
npm run lint
```

## 📊 Database Schema

### Supabase Tables
- `bookings` - Demo booking requests
- `registrations` - User registrations
- `affiliate_applications` - Affiliate partner requests
- `admin_users` - Admin authentication

### Key Features
- **Admin Users Table**: Separate admin authentication
- **Affiliate System**: Complete referral tracking
- **Booking Management**: Demo scheduling system
- **User Roles**: Professional, Student, Admin, Affiliate

See `supabase/migrations/` for database setup.

## 🎨 Customization

### Styling
- Edit Tailwind config in `tailwind.config.ts`
- Modify color scheme in `src/app/globals.css`
- Component styles in respective component files
- Admin theme in `src/components/admin/`

### Features
- Add new features in `src/config/features.ts`
- Modify pricing in `src/config/features.ts`
- Admin navigation in `admin-sidebar-layout.tsx`

### Admin Portal
- Sidebar menu items in `admin-sidebar-layout.tsx`
- Add new admin pages in `src/app/admin/`
- Custom admin components in `src/components/admin/`

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

This project is proprietary software. All rights reserved.

## 🆘 Support

For support, email contact@powerca.in or call +91 96295 14635

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Backend infrastructure
- [Razorpay](https://razorpay.com/) - Payment processing
- [shadcn/ui](https://ui.shadcn.com/) - Component library
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework

## 📈 Recent Updates

### ✅ Completed
- [x] Admin portal with sidebar navigation
- [x] Unified authentication across admin pages
- [x] User management system
- [x] Affiliate management and approvals
- [x] Registration tracking with CSV export
- [x] Responsive admin dashboard

### 🚧 Roadmap
- [ ] CRM Management
- [ ] Automated affiliate commission tracking
- [ ] Multi-tenant support
- [ ] SEO Audit
 
---

Built with ❤️ for Chartered Accountants in India