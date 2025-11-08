# PowerCA - CA Practice Management Solution

A comprehensive SaaS platform for Chartered Accountants to manage their practice efficiently.

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Razorpay account (for payments)

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd PowerCA_Website
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

- Supabase URL and keys
- NextAuth configuration
- Razorpay keys
- Resend API key (for emails)

4. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: NextAuth.js (dual auth system)
- **Payments**: Razorpay
- **Email**: Resend

## Project Structure

```
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # React components
│   ├── lib/             # Utilities and services
│   ├── hooks/           # Custom React hooks
│   └── types/           # TypeScript types
├── public/              # Static assets
├── docs/                # Documentation
├── scripts/             # Utility scripts
└── supabase/            # Database migrations
```

## Deployment

The application is configured for deployment on Vercel:

```bash
npm run build
```

See `docs/VERCEL_DEPLOYMENT.md` for detailed deployment instructions.

## Admin Access

- URL: `/admin-login`
- Default credentials: Check `docs/ADMIN_CREDENTIALS.md`

## Documentation

Comprehensive documentation is available in the `docs/` folder:

- Setup guides
- API documentation
- Deployment instructions
- Troubleshooting guides

For detailed documentation, see `docs/README_DETAILED.md`.

## License

Proprietary - All rights reserved

## Support

For issues or questions, please contact the development team.
