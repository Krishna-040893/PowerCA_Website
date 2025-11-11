# PowerCA - Practice Management Software for Chartered Accountants

<div align="center">

**Transform your CA practice with PowerCA - India's leading practice management solution**

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-Proprietary-red.svg)](LICENSE)

[Live Demo](https://powerca.in) · [Book Demo](https://powerca.in/book-demo) · [Documentation](./docs/)

</div>

---

## 📋 Table of Contents

- [About PowerCA](#about-powerca)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Environment Setup](#environment-setup)
- [Development](#development)
- [Deployment](#deployment)
- [Documentation](#documentation)
- [Support](#support)

---

## 🎯 About PowerCA

PowerCA is a comprehensive SaaS platform designed to help Chartered Accountants manage their practice efficiently. Built with modern web technologies, PowerCA provides an all-in-one solution for practice management, billing, compliance tracking, and client relationship management.

### Why PowerCA?

- **Save 10+ hours weekly** - Automate routine tasks and streamline workflows
- **Ensure 100% compliance** - Never miss a deadline with automated reminders
- **Grow effortlessly** - Scale your practice with confidence

### Who is PowerCA for?

- Chartered Accountants (CAs)
- Tax Professionals
- Audit Firms
- Financial Consultants
- Accounting Practices of all sizes

---

## ✨ Key Features

### 🎯 Core Modules

- **Job Card Management** - Comprehensive job tracking with intuitive dashboard, advanced search, and seamless workflow control
- **Client Management** - Centralized client profiles with complete history, documents, and communication tracking
- **Billing & Invoicing** - Automated billing with GST compliance, payment tracking, and financial reporting
- **Compliance Tracking** - Automated deadline reminders and regulatory compliance management
- **Task Management** - Efficient team collaboration with task assignment and progress tracking
- **Financial Statements** - Generate accurate balance sheets, P&L reports with real-time data
- **CRM Module** - Lead tracking, client engagement analytics, and relationship management
- **Costing Module** - Project cost tracking and profitability analysis

### 💼 Additional Features

- **Affiliate Program** - Complete referral tracking and commission management system
- **Admin Portal** - Modern dashboard with comprehensive management tools
- **Document Management** - Secure cloud storage with version control
- **Real-time Analytics** - Live data insights and performance metrics
- **24/7 Support** - Dedicated customer support team
- **Client-Server Architecture** - Scalable and secure infrastructure

### 🔒 Security & Compliance

- Dual authentication system (Supabase + JWT)
- End-to-end data encryption
- Role-based access control
- Regulatory compliance built-in
- Secure payment processing with Razorpay

---

## 🛠 Tech Stack

### Frontend

- **Framework:** Next.js 15.5 (App Router)
- **UI Library:** React 19.1
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 3.4
- **Components:** shadcn/ui + Radix UI
- **Animations:** Framer Motion
- **State Management:** React Query (TanStack Query)

### Backend

- **Database:** Supabase (PostgreSQL)
- **Authentication:** Dual system - Supabase Auth + NextAuth.js (JWT for admin)
- **Email Service:** Resend with React Email templates
- **Payment Gateway:** Razorpay (Indian payment processing)
- **CRM Integration:** HubSpot API

### DevOps & Monitoring

- **Hosting:** Vercel
- **Error Tracking:** Sentry
- **Analytics:** Google Analytics & Tag Manager
- **Testing:** Jest + React Testing Library
- **Code Quality:** ESLint + Prettier + Husky

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn package manager
- Supabase account
- Razorpay account (for payment features)
- Resend account (for email functionality)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd PowerCA_Website
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Configure the following variables in `.env.local`:

   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

   # Authentication
   NEXTAUTH_URL=http://localhost:3009
   NEXTAUTH_SECRET=your_nextauth_secret

   # Razorpay (Payment Gateway)
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

   # Email (Resend)
   RESEND_API_KEY=your_resend_api_key
   EMAIL_FROM=noreply@powerca.in

   # Sentry (Optional - for error tracking)
   SENTRY_DSN=your_sentry_dsn
   ```

4. **Set up the database**

   Run the database migrations in the `supabase/` folder:

   ```bash
   # Execute SQL files in order
   psql -h your-supabase-host -U postgres -d postgres -f supabase/schema.sql
   ```

5. **Run the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3009](http://localhost:3009) in your browser.

---

## 📁 Project Structure

```
PowerCA_Website/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Authentication pages (login, register)
│   │   ├── (marketing)/       # Marketing pages (features, pricing, contact)
│   │   ├── admin/             # Admin portal pages
│   │   ├── affiliate/         # Affiliate dashboard and management
│   │   ├── blog/              # Blog posts and articles
│   │   └── api/               # API routes
│   ├── components/            # React components
│   │   ├── admin/            # Admin-specific components
│   │   ├── forms/            # Form components
│   │   ├── home/             # Homepage sections
│   │   ├── layout/           # Layout components
│   │   ├── sections/         # Reusable sections
│   │   └── ui/               # UI components (shadcn/ui)
│   ├── lib/                   # Utilities and services
│   │   ├── auth/             # Authentication utilities
│   │   ├── db/               # Database utilities
│   │   └── utils/            # Helper functions
│   ├── hooks/                 # Custom React hooks
│   ├── types/                 # TypeScript type definitions
│   └── styles/                # Global styles
├── public/                    # Static assets
│   ├── images/               # Images and icons
│   └── docs/                 # PDF documents
├── supabase/                  # Database migrations and setup
├── scripts/                   # Utility scripts
├── docs/                      # Project documentation
└── tests/                     # Test files

```

---

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev              # Start development server (port 3009)
npm run build            # Build for production
npm start                # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run typecheck        # Run TypeScript type checking
npm run test             # Run tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate test coverage report

# Bundle Analysis
npm run analyze          # Analyze bundle size
```

### Code Quality Standards

- **No automated fix scripts** - Always fix errors manually to understand the root cause
- **Type safety** - Ensure all TypeScript errors are resolved before committing
- **Testing** - Write tests for critical business logic
- **Code reviews** - All changes must be reviewed before merging

### Git Hooks

This project uses Husky for Git hooks:

- **Pre-commit:** Runs ESLint and Prettier on staged files
- **Pre-push:** Runs TypeScript type checking

---

## 🌐 Deployment

### Vercel Deployment (Recommended)

1. **Connect your repository to Vercel**

   ```bash
   vercel
   ```

2. **Configure environment variables** in Vercel dashboard

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Manual Deployment

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Environment-Specific Configuration

- **Development:** Uses `.env.local`
- **Production:** Configure environment variables in your hosting platform
- **Staging:** Use `.env.staging` (create if needed)

---

## 📚 Documentation

Comprehensive documentation is available in the [`docs/`](./docs/) folder:

### Setup & Configuration

- [Admin Setup Guide](./docs/ADMIN_SETUP.md)
- [Affiliate System Setup](./docs/AFFILIATE_SYSTEM_SETUP.md)
- [Environment Configuration](./docs/)

### Features & Modules

- [Affiliate Program Guide](./docs/AFFILIATE_SYSTEM_SUMMARY.md)
- [Blog Enhancement Plan](./docs/BLOG_ENHANCEMENT_PLAN.md)
- [Payment Tracking](./docs/AFFILIATE_PAYMENT_TRACKING_SETUP.md)

### Troubleshooting

- [Affiliate Troubleshooting](./docs/AFFILIATE_TROUBLESHOOTING.md)
- [Blog Troubleshooting](./docs/BLOG_TROUBLESHOOTING.md)
- [Error Handling Guide](./docs/ERROR_HANDLING_MIGRATION_GUIDE.md)

### Reports & Audits

- [Security Audit Report](./docs/SECURITY_AUDIT_REPORT.md)
- [Performance Audit Report](./docs/PERFORMANCE_AUDIT_REPORT.md)
- [SEO Audit Report](./docs/SEO_AUDIT_REPORT_UPDATED.md)
- [Code Quality Report](./docs/CODE_QUALITY_AUDIT_REPORT.md)

---

## 🔐 Admin Access

### Admin Portal

- **URL:** `/admin-login`
- **Features:** User management, bookings, registrations, affiliate management, payments, analytics

### Default Credentials (Development Only)

**Superadmin:**

- Username: `superadmin`
- Password: `Powerca@25`
- Email: `superadmin@powerca.in`

**Admin:**

- Username: `PCAadmin`
- Password: `Powerca@25`
- Email: `admin@powerca.in`

> ⚠️ **Important:** Change these credentials immediately in production!

---

## 🤝 Affiliate Program

PowerCA includes a comprehensive affiliate program:

- **Referral Dashboard** - Track referrals and commissions
- **Unique Referral Links** - Generate and share custom links
- **Commission Tracking** - Real-time commission calculations
- **Payment Management** - Automated payout processing
- **Performance Analytics** - Detailed performance insights

Learn more in the [Affiliate Program Documentation](./docs/AFFILIATE_PROGRAM_TERMS_AND_CONDITIONS.md).

---

## 📊 Database Schema

The application uses PostgreSQL (via Supabase) with the following main tables:

- `registrations` - User registrations and onboarding
- `bookings` - Demo booking requests
- `affiliate_applications` - Affiliate partner applications
- `affiliate_profiles` - Active affiliate profiles
- `affiliate_referrals` - Referral tracking
- `admin_users` - Admin authentication
- `payment_orders` - Payment transactions

Database migrations are located in the [`supabase/`](./supabase/) folder.

---

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

Test files are located in:

- `src/components/__tests__/` - Component tests
- `src/lib/__tests__/` - Utility tests
- Integration tests use Jest and React Testing Library

---

## 🐛 Error Tracking & Monitoring

PowerCA uses **Sentry** for error tracking and performance monitoring:

- Real-time error reporting
- Performance metrics
- User session replay
- Release tracking

Configure Sentry in your environment variables and check the [Sentry Setup Guide](./docs/SENTRY_SETUP.md).

---

## 📈 Performance

- **Lighthouse Score:** 95+ (Performance, Accessibility, SEO)
- **Core Web Vitals:** All metrics in green
- **Bundle Size:** Optimized with code splitting and lazy loading
- **Image Optimization:** Next.js Image component with WebP support
- **Caching Strategy:** Static generation with ISR for optimal performance

---

## 🔒 Security Features

- **Authentication:** Dual-layer authentication with Supabase and JWT
- **Data Encryption:** End-to-end encryption for sensitive data
- **HTTPS Only:** Enforced secure connections
- **CSRF Protection:** Built-in protection against cross-site request forgery
- **Rate Limiting:** API rate limiting to prevent abuse
- **Input Validation:** Comprehensive input sanitization
- **Secure Headers:** CSP, HSTS, and other security headers configured

---

## 🌍 Browser Support

PowerCA supports all modern browsers:

- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)
- Mobile browsers (iOS Safari 14+, Chrome Mobile)

---

## 📝 License

This project is proprietary software. All rights reserved.

© 2025 PowerCA. Unauthorized copying, modification, or distribution is prohibited.

---

## 💬 Support

### For Users

- **Email:** contact@powerca.in
- **Website:** [https://powerca.in](https://powerca.in)
- **Book a Demo:** [https://powerca.in/book-demo](https://powerca.in/book-demo)

### For Developers

- **Documentation:** [./docs/](./docs/)
- **Issue Tracker:** Contact development team
- **Technical Support:** dev@powerca.in

---

## 🙏 Acknowledgments

Built with modern technologies:

- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Backend as a Service
- [Vercel](https://vercel.com/) - Deployment platform
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Tailwind CSS](https://tailwindcss.com/) - Styling framework

---

<div align="center">

**Made with ❤️ for Chartered Accountants in India**

[Website](https://powerca.in) · [Features](https://powerca.in/features) · [Pricing](https://powerca.in/pricing) · [Contact](https://powerca.in/contact)

</div>
