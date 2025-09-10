# PowerCA Project Setup - Claude Code Prompt

## Project Overview
I need to set up a modern, professional website for PowerCA - a practice management software for Chartered Accountants. The website should be built with Next.js 14+, include demo booking functionality, Razorpay payment integration, and feature smooth animations.

## Tech Stack Requirements
- **Framework**: Next.js 14+ with App Router
- **Styling**: Tailwind CSS with Shadcn/ui components
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Payments**: Razorpay
- **Animations**: Framer Motion
- **State Management**: Zustand
- **Forms**: React Hook Form with Zod validation
- **Email**: Resend API0
- **Analytics**: Google Analytics 4

## Setup Instructions

Please help me set up this project by executing the following steps:

### Step 1: Initialize Next.js Project
```bash
# Create Next.js project with TypeScript and Tailwind CSS
npx create-next-app@latest powerca-website --typescript --tailwind --app --src-dir --import-alias "@/*"

# Navigate to project directory
cd powerca-website
```

### Step 2: Install Core Dependencies
```bash
# Install UI and styling dependencies
npm install @radix-ui/react-accordion @radix-ui/react-alert-dialog @radix-ui/react-avatar @radix-ui/react-checkbox @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-label @radix-ui/react-navigation-menu @radix-ui/react-popover @radix-ui/react-radio-group @radix-ui/react-select @radix-ui/react-separator @radix-ui/react-slider @radix-ui/react-switch @radix-ui/react-tabs @radix-ui/react-toast @radix-ui/react-tooltip

# Install Shadcn/ui utilities
npm install class-variance-authority clsx tailwind-merge tailwindcss-animate lucide-react

# Install animation libraries
npm install framer-motion @formkit/auto-animate

# Install form handling
npm install react-hook-form @hookform/resolvers zod

# Install state management
npm install zustand immer

# Install date/time utilities
npm install date-fns react-day-picker

# Install additional utilities
npm install @tanstack/react-query axios sharp
```

### Step 3: Install Backend Dependencies
```bash
# Install Prisma and database dependencies
npm install @prisma/client
npm install -D prisma

# Install authentication
npm install next-auth @auth/prisma-adapter

# Install email service
npm install resend react-email @react-email/components

# Install payment gateway
npm install razorpay

# Install API utilities
npm install @t3-oss/env-nextjs dotenv bcryptjs jsonwebtoken

# Install development dependencies
npm install -D @types/bcryptjs @types/jsonwebtoken
```

### Step 4: Setup Shadcn/ui
```bash
# Initialize Shadcn/ui (choose default options, New York style, Zinc color)
npx shadcn-ui@latest init

# Add essential components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add form
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add select
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add navigation-menu
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add calendar
npx shadcn-ui@latest add checkbox
npx shadcn-ui@latest add radio-group
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add skeleton
npx shadcn-ui@latest add slider
npx shadcn-ui@latest add switch
npx shadcn-ui@latest add textarea
npx shadcn-ui@latest add tooltip
npx shadcn-ui@latest add alert
npx shadcn-ui@latest add accordion
npx shadcn-ui@latest add sheet
npx shadcn-ui@latest add progress
```

### Step 5: Initialize Prisma
```bash
# Initialize Prisma with PostgreSQL
npx prisma init --datasource-provider postgresql
```

### Step 6: Create Project Structure
Please create the following folder structure:
```
powerca-website/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── (marketing)/
│   │   │   ├── about/
│   │   │   │   └── page.tsx
│   │   │   ├── features/
│   │   │   │   └── page.tsx
│   │   │   ├── pricing/
│   │   │   │   └── page.tsx
│   │   │   ├── blog/
│   │   │   │   └── page.tsx
│   │   │   └── contact/
│   │   │       └── page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/
│   │   │   │       └── route.ts
│   │   │   ├── booking/
│   │   │   │   └── route.ts
│   │   │   ├── payment/
│   │   │   │   ├── create-order/
│   │   │   │   │   └── route.ts
│   │   │   │   └── verify/
│   │   │   │       └── route.ts
│   │   │   └── email/
│   │   │       └── route.ts
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/
│   │   │   └── (shadcn components)
│   │   ├── layout/
│   │   │   ├── header.tsx
│   │   │   ├── footer.tsx
│   │   │   ├── mobile-nav.tsx
│   │   │   └── navigation.tsx
│   │   ├── sections/
│   │   │   ├── hero.tsx
│   │   │   ├── features.tsx
│   │   │   ├── pricing.tsx
│   │   │   ├── testimonials.tsx
│   │   │   ├── cta.tsx
│   │   │   └── stats.tsx
│   │   ├── booking/
│   │   │   ├── booking-form.tsx
│   │   │   ├── calendar.tsx
│   │   │   └── time-slots.tsx
│   │   ├── payment/
│   │   │   ├── payment-modal.tsx
│   │   │   └── pricing-card.tsx
│   │   └── animations/
│   │       ├── fade-in.tsx
│   │       ├── slide-in.tsx
│   │       └── animated-counter.tsx
│   ├── lib/
│   │   ├── auth.ts
│   │   ├── db.ts
│   │   ├── razorpay.ts
│   │   ├── email.ts
│   │   ├── utils.ts
│   │   └── validations/
│   │       ├── auth.ts
│   │       ├── booking.ts
│   │       └── payment.ts
│   ├── hooks/
│   │   ├── use-scroll.ts
│   │   ├── use-animation.ts
│   │   ├── use-booking.ts
│   │   └── use-payment.ts
│   ├── store/
│   │   ├── auth-store.ts
│   │   ├── booking-store.ts
│   │   └── ui-store.ts
│   ├── types/
│   │   ├── index.ts
│   │   ├── auth.ts
│   │   ├── booking.ts
│   │   └── payment.ts
│   ├── styles/
│   │   ├── animations.css
│   │   └── components.css
│   └── config/
│       ├── site.ts
│       ├── navigation.ts
│       └── features.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── public/
│   ├── images/
│   ├── icons/
│   └── fonts/
├── emails/
│   ├── welcome.tsx
│   ├── booking-confirmation.tsx
│   └── payment-receipt.tsx
├── .env.local
├── .env.example
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

### Step 7: Create Environment Variables
Create a `.env.local` file with the following variables:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/powerca_db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Razorpay
RAZORPAY_KEY_ID="your-razorpay-key-id"
RAZORPAY_KEY_SECRET="your-razorpay-key-secret"
RAZORPAY_WEBHOOK_SECRET="your-webhook-secret"

# Email (Resend)
RESEND_API_KEY="your-resend-api-key"
EMAIL_FROM="noreply@powerca.in"

# Google Analytics
NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX"

# App URLs
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Step 8: Configure Tailwind CSS
Update `tailwind.config.ts` with PowerCA brand colors and custom animations:
```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#2563EB",
          50: "#EFF6FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          300: "#93C5FD",
          400: "#60A5FA",
          500: "#3B82F6",
          600: "#2563EB",
          700: "#1D4ED8",
          800: "#1E40AF",
          900: "#1E3A8A",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#10B981",
          50: "#F0FDF4",
          100: "#DCFCE7",
          200: "#BBF7D0",
          300: "#86EFAC",
          400: "#4ADE80",
          500: "#22C55E",
          600: "#16A34A",
          700: "#15803D",
          800: "#166534",
          900: "#14532D",
          foreground: "#FFFFFF",
        },
        accent: {
          DEFAULT: "#F59E0B",
          50: "#FFFBEB",
          100: "#FEF3C7",
          200: "#FDE68A",
          300: "#FCD34D",
          400: "#FBBF24",
          500: "#F59E0B",
          600: "#D97706",
          700: "#B45309",
          800: "#92400E",
          900: "#78350F",
          foreground: "#FFFFFF",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-in-up": {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "slide-in-down": {
          "0%": { transform: "translateY(-20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "slide-in-left": {
          "0%": { transform: "translateX(-20px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(20px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "pulse-glow": {
          "0%, 100%": { 
            boxShadow: "0 0 0 0 rgba(37, 99, 235, 0.4)"
          },
          "50%": { 
            boxShadow: "0 0 0 10px rgba(37, 99, 235, 0)"
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        "slide-in-up": "slide-in-up 0.5s ease-out",
        "slide-in-down": "slide-in-down 0.5s ease-out",
        "slide-in-left": "slide-in-left 0.5s ease-out",
        "slide-in-right": "slide-in-right 0.5s ease-out",
        "pulse-glow": "pulse-glow 2s infinite",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        heading: ["Poppins", "sans-serif"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
```

### Step 9: Setup Prisma Schema
Create the initial Prisma schema in `prisma/schema.prisma`:
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  password      String?
  firmName      String?
  firmSize      String?
  phone         String?
  role          Role      @default(USER)
  emailVerified DateTime?
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  bookings      Booking[]
  payments      Payment[]
  sessions      Session[]
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Booking {
  id          String   @id @default(cuid())
  userId      String
  date        DateTime
  time        String
  type        String
  status      BookingStatus @default(PENDING)
  notes       String?
  meetingLink String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  user        User     @relation(fields: [userId], references: [id])
}

model Payment {
  id            String   @id @default(cuid())
  userId        String
  orderId       String   @unique
  paymentId     String?  @unique
  amount        Float
  currency      String   @default("INR")
  status        PaymentStatus @default(PENDING)
  plan          String
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  user          User     @relation(fields: [userId], references: [id])
}

enum Role {
  USER
  ADMIN
}

enum BookingStatus {
  PENDING
  CONFIRMED
  CANCELLED
  COMPLETED
}

enum PaymentStatus {
  PENDING
  SUCCESS
  FAILED
  REFUNDED
}
```

### Step 10: Initialize Database
```bash
# Create the database tables
npx prisma db push

# Generate Prisma Client
npx prisma generate

# Optional: Create seed data
npx prisma db seed
```

### Step 11: Setup NextAuth Configuration
Create `src/lib/auth.ts`:
```typescript
import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Add your authentication logic here
        return null
      }
    })
  ],
  pages: {
    signIn: "/login",
    signUp: "/register",
  },
  session: {
    strategy: "jwt"
  },
  callbacks: {
    // Add callbacks here
  }
}
```

### Step 12: Install Development Tools (Optional)
```bash
# Install development dependencies
npm install -D @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-config-prettier prettier prettier-plugin-tailwindcss

# Install testing libraries (optional)
npm install -D @testing-library/react @testing-library/jest-dom jest jest-environment-jsdom

# Install Storybook (optional)
npx storybook@latest init
```

### Step 13: Setup Git Repository
```bash
# Initialize git repository
git init

# Create .gitignore if not exists
echo "node_modules
.next
.env.local
.env
.DS_Store
*.log
.vercel
prisma/*.db
prisma/*.db-journal" > .gitignore

# Initial commit
git add .
git commit -m "Initial setup: PowerCA website with Next.js, Tailwind, Prisma, and Razorpay"
```

### Step 14: Run Development Server
```bash
# Start the development server
npm run dev
```

## Additional Configuration Files Needed

### 1. Create `src/lib/db.ts`:
```typescript
import { PrismaClient } from '@prisma/client'

declare global {
  var prisma: PrismaClient | undefined
}

export const prisma = global.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') global.prisma = prisma
```

### 2. Create `src/lib/razorpay.ts`:
```typescript
import Razorpay from 'razorpay'

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})
```

### 3. Create `src/config/site.ts`:
```typescript
export const siteConfig = {
  name: "PowerCA",
  description: "Practice Management Software for Chartered Accountants",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://powerca.in",
  ogImage: "/og-image.jpg",
  links: {
    twitter: "https://twitter.com/powerca",
    linkedin: "https://linkedin.com/company/powerca",
  },
}
```

## Verification Checklist
After setup, verify:
- [ ] Next.js app runs without errors
- [ ] Tailwind CSS is working (check styling)
- [ ] Shadcn/ui components render correctly
- [ ] Database connection is established
- [ ] Environment variables are loaded
- [ ] TypeScript has no errors

## Next Steps
1. Implement authentication flow
2. Create the homepage with animations
3. Set up demo booking system
4. Integrate Razorpay payment
5. Configure email templates
6. Add analytics tracking
7. Implement SEO optimization
8. Set up CI/CD pipeline

Please execute these steps and let me know if you encounter any issues. I'll help you resolve them and continue with the implementation.