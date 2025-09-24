# PowerCA Authentication Implementation Guide
## NextAuth + PostgreSQL + Prisma

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Database Schema](#database-schema)
3. [Installation & Setup](#installation-setup)
4. [Authentication Configuration](#authentication-configuration)
5. [Custom Authentication Pages](#custom-authentication-pages)
6. [API Routes Implementation](#api-routes-implementation)
7. [Middleware & Protection](#middleware-protection)
8. [User Management Features](#user-management-features)
9. [Security Implementation](#security-implementation)
10. [Testing & Deployment](#testing-deployment)

---

## 1. Architecture Overview

### Technology Stack
- **NextAuth.js v5** (Auth.js) - Authentication framework
- **PostgreSQL** - User data storage
- **Prisma** - ORM for database operations
- **Argon2/BCrypt** - Password hashing
- **Resend** - Email service for verification/reset
- **Redis** (optional) - Session storage for scale
- **Zod** - Validation schemas

### Authentication Flow
```mermaid
graph TD
    A[User Access] --> B{Authenticated?}
    B -->|No| C[Login/Register Page]
    B -->|Yes| D[Dashboard]
    C --> E[Credentials/OAuth]
    E --> F[Verify CA Details]
    F --> G[Create Session]
    G --> D
    D --> H[Access Protected Routes]
```

---

## 2. Database Schema

### Complete Prisma Schema for Authentication

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============= AUTHENTICATION MODELS =============
model User {
  id                String    @id @default(cuid())
  email             String    @unique
  emailVerified     DateTime?
  password          String?   // Hashed password for credentials auth
  name              String?
  image             String?
  role              UserRole  @default(USER)
  status            UserStatus @default(PENDING_VERIFICATION)
  
  // Professional Information (CA Specific)
  caNumber          String?   @unique
  icaiMemberId      String?   @unique
  copNumber         String?   // Certificate of Practice
  firmName          String?
  firmType          FirmType?
  designation       Designation?
  experience        Int?      // Years of experience
  specialization    String[]  // Array of specializations
  
  // Contact Information
  phone             String?   @unique
  phoneVerified     DateTime?
  alternateEmail    String?
  address           Json?     // Structured address object
  
  // Compliance Information
  gstNumber         String?
  panNumber         String?   @unique
  aadhaarHash      String?   // Hashed for security
  
  // Subscription & Billing
  customerId        String?   @unique // Razorpay customer ID
  turnover          Decimal?  @db.Decimal(15, 2)
  
  // Security & Preferences
  twoFactorEnabled  Boolean   @default(false)
  twoFactorSecret   String?   // Encrypted
  loginAttempts     Int       @default(0)
  lockedUntil       DateTime?
  lastLoginAt       DateTime?
  lastLoginIp       String?
  preferences       Json?     // User preferences object
  
  // Relations
  accounts          Account[]
  sessions          Session[]
  verificationTokens VerificationToken[]
  passwordResets    PasswordReset[]
  loginHistory      LoginHistory[]
  auditLogs         AuditLog[]
  firm              Firm?     @relation(fields: [firmId], references: [id])
  firmId            String?
  invitations       Invitation[] @relation("InvitedBy")
  receivedInvitations Invitation[] @relation("InvitedUser")
  
  // Timestamps
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  deletedAt         DateTime? // Soft delete
  
  @@index([email])
  @@index([caNumber])
  @@index([phone])
  @@index([firmId])
  @@index([status])
}

// NextAuth Account model (for OAuth)
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?
  
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([provider, providerAccountId])
  @@index([userId])
}

// NextAuth Session model
model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  ipAddress    String?
  userAgent    String?
  
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([expires])
}

// Email Verification Tokens
model VerificationToken {
  id         String   @id @default(cuid())
  identifier String   // Email or phone
  token      String   @unique
  type       TokenType
  expires    DateTime
  used       Boolean  @default(false)
  userId     String?
  
  user       User?    @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([identifier, token])
  @@index([token])
  @@index([expires])
}

// Password Reset Tokens
model PasswordReset {
  id         String   @id @default(cuid())
  userId     String
  token      String   @unique
  expires    DateTime
  used       Boolean  @default(false)
  ipAddress  String?
  
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  createdAt  DateTime @default(now())
  
  @@index([token])
  @@index([userId])
  @@index([expires])
}

// Login History for Security
model LoginHistory {
  id          String   @id @default(cuid())
  userId      String
  ipAddress   String
  userAgent   String?
  location    String?  // Derived from IP
  success     Boolean
  failReason  String?
  
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  createdAt   DateTime @default(now())
  
  @@index([userId])
  @@index([createdAt])
}

// Audit Log for Compliance
model AuditLog {
  id          String   @id @default(cuid())
  userId      String?
  action      String
  entity      String
  entityId    String?
  oldValues   Json?
  newValues   Json?
  ipAddress   String?
  userAgent   String?
  
  user        User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
  
  createdAt   DateTime @default(now())
  
  @@index([userId])
  @@index([entity, entityId])
  @@index([createdAt])
}

// Firm/Organization Model
model Firm {
  id              String    @id @default(cuid())
  name            String
  registrationNo  String    @unique
  type            FirmType
  
  // Firm Details
  email           String    @unique
  phone           String
  website         String?
  address         Json
  gstNumber       String    @unique
  panNumber       String    @unique
  
  // Subscription
  subscriptionId  String?
  maxUsers        Int       @default(5)
  maxClients      Int       @default(100)
  storageLimit    Int       @default(10) // GB
  
  // Relations
  users           User[]
  invitations     Invitation[]
  
  // Timestamps
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  @@index([registrationNo])
}

// Team Invitations
model Invitation {
  id              String    @id @default(cuid())
  email           String
  role            UserRole
  token           String    @unique
  expires         DateTime
  accepted        Boolean   @default(false)
  
  // Relations
  invitedBy       User      @relation("InvitedBy", fields: [invitedById], references: [id])
  invitedById     String
  invitedUser     User?     @relation("InvitedUser", fields: [invitedUserId], references: [id])
  invitedUserId   String?
  firm            Firm      @relation(fields: [firmId], references: [id])
  firmId          String
  
  createdAt       DateTime  @default(now())
  
  @@index([email])
  @@index([token])
  @@index([firmId])
}

// ============= ENUMS =============
enum UserRole {
  SUPER_ADMIN    // System admin
  FIRM_OWNER     // Firm owner/partner
  PARTNER        // Partner in firm
  MANAGER        // Manager level
  ACCOUNTANT     // Staff accountant
  ARTICLE        // Article assistant
  USER           // Basic user
  GUEST          // Limited access
}

enum UserStatus {
  PENDING_VERIFICATION
  ACTIVE
  SUSPENDED
  DEACTIVATED
  BLOCKED
}

enum FirmType {
  PROPRIETORSHIP
  PARTNERSHIP
  LLP
  COMPANY
  OTHER
}

enum Designation {
  PARTNER
  DIRECTOR
  MANAGER
  SENIOR_ASSOCIATE
  ASSOCIATE
  ARTICLE_ASSISTANT
  INTERN
  OTHER
}

enum TokenType {
  EMAIL_VERIFICATION
  PHONE_VERIFICATION
  PASSWORD_RESET
  TWO_FACTOR
  INVITATION
}
```

---

## 3. Installation & Setup

### Step 1: Install Dependencies

```bash
# Core authentication packages
npm install next-auth@beta @auth/prisma-adapter
npm install @prisma/client prisma

# Password hashing
npm install bcryptjs
npm install -D @types/bcryptjs

# Validation
npm install zod react-hook-form @hookform/resolvers

# Email service
npm install resend react-email @react-email/components

# Security extras
npm install jsonwebtoken speakeasy qrcode
npm install -D @types/jsonwebtoken @types/speakeasy @types/qrcode

# Rate limiting
npm install rate-limiter-flexible

# Optional: Session store
npm install ioredis
```

### Step 2: Environment Configuration

```env
# .env.local

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/powerca_db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# OAuth Providers (optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
MICROSOFT_CLIENT_ID=""
MICROSOFT_CLIENT_SECRET=""

# Email Service
RESEND_API_KEY=""
EMAIL_FROM="noreply@powerca.in"

# Security
JWT_SECRET="separate-jwt-secret-for-custom-tokens"
ENCRYPTION_KEY="32-character-encryption-key"

# Razorpay (for customer creation)
RAZORPAY_KEY_ID=""
RAZORPAY_KEY_SECRET=""

# App URLs
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Step 3: Database Setup

```bash
# Initialize Prisma
npx prisma init

# Create migration
npx prisma migrate dev --name init-auth

# Generate Prisma Client
npx prisma generate

# Seed initial data (optional)
npx prisma db seed
```

---

## 4. Authentication Configuration

### NextAuth Configuration

```typescript
// lib/auth.config.ts
import { NextAuthConfig } from 'next-auth';

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/login',
    signUp: '/register',
    error: '/auth/error',
    verifyRequest: '/auth/verify',
    newUser: '/onboarding'
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      const isAuthRoute = nextUrl.pathname.startsWith('/auth');
      const isApiRoute = nextUrl.pathname.startsWith('/api');
      
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect to login
      } else if (isLoggedIn && isAuthRoute) {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }
      
      return true;
    },
  },
  providers: [], // Configured in auth.ts
};
```

### Main Auth Configuration

```typescript
// lib/auth.ts
import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/db';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { authConfig } from './auth.config';
import { UserRole, UserStatus } from '@prisma/client';
import { createRazorpayCustomer } from './razorpay';
import { sendVerificationEmail } from './email';
import { generateVerificationToken } from './tokens';

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { 
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          include: { firm: true }
        });

        if (!user || !user.password) {
          throw new Error('Invalid credentials');
        }

        // Check if account is locked
        if (user.lockedUntil && user.lockedUntil > new Date()) {
          throw new Error('Account locked. Please try again later.');
        }

        // Verify password
        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isValid) {
          // Increment failed login attempts
          await prisma.user.update({
            where: { id: user.id },
            data: { 
              loginAttempts: { increment: 1 },
              // Lock account after 5 failed attempts
              lockedUntil: user.loginAttempts >= 4 
                ? new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
                : null
            }
          });
          throw new Error('Invalid credentials');
        }

        // Check user status
        if (user.status === UserStatus.BLOCKED) {
          throw new Error('Account blocked. Contact support.');
        }

        if (user.status === UserStatus.SUSPENDED) {
          throw new Error('Account suspended. Contact support.');
        }

        // Reset login attempts on successful login
        await prisma.user.update({
          where: { id: user.id },
          data: { 
            loginAttempts: 0,
            lockedUntil: null,
            lastLoginAt: new Date(),
            lastLoginIp: credentials.ip as string || null
          }
        });

        // Log successful login
        await prisma.loginHistory.create({
          data: {
            userId: user.id,
            ipAddress: credentials.ip as string || 'unknown',
            userAgent: credentials.userAgent as string || null,
            success: true
          }
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          status: user.status,
          firmId: user.firmId,
          emailVerified: user.emailVerified,
          caNumber: user.caNumber,
          image: user.image
        };
      }
    })
  ],
  
  callbacks: {
    async signIn({ user, account, profile }) {
      // For OAuth sign-ins
      if (account?.provider !== 'credentials') {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! }
        });

        if (!existingUser) {
          // Create Razorpay customer for new OAuth users
          const customer = await createRazorpayCustomer({
            email: user.email!,
            name: user.name || undefined
          });

          // Create user with additional fields
          await prisma.user.update({
            where: { email: user.email! },
            data: {
              customerId: customer.id,
              status: UserStatus.ACTIVE,
              emailVerified: new Date()
            }
          });
        }
      }

      return true;
    },

    async jwt({ token, user, account, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role as UserRole;
        token.status = user.status as UserStatus;
        token.firmId = user.firmId;
        token.caNumber = user.caNumber;
      }

      // Handle session updates
      if (trigger === 'update' && session) {
        // Update token with new session data
        return { ...token, ...session.user };
      }

      // Refresh user data periodically
      if (token.id && trigger === 'update') {
        const freshUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: {
            role: true,
            status: true,
            firmId: true,
            caNumber: true
          }
        });

        if (freshUser) {
          token.role = freshUser.role;
          token.status = freshUser.status;
          token.firmId = freshUser.firmId;
          token.caNumber = freshUser.caNumber;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.status = token.status as UserStatus;
        session.user.firmId = token.firmId as string;
        session.user.caNumber = token.caNumber as string;
      }

      return session;
    }
  },

  events: {
    async signIn({ user, account, isNewUser }) {
      // Send welcome email for new users
      if (isNewUser) {
        await sendVerificationEmail(user.email!, user.name || 'User');
      }
    },
    
    async signOut({ session }) {
      // Clean up any session data
      console.log('User signed out:', session?.user?.email);
    }
  }
});
```

---

## 5. Custom Authentication Pages

### Registration Page

```typescript
// app/(auth)/register/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  caNumber: z.string().optional(),
  firmName: z.string().optional(),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number').optional(),
  agreeToTerms: z.boolean().refine(val => val === true, 'You must agree to terms')
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Registration failed');
      }

      toast.success('Registration successful! Please check your email to verify your account.');
      router.push('/login?registered=true');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your PowerCA account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Start your 14-day free trial
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                {...register('email')}
                type="email"
                autoComplete="email"
                required
                className="mt-1"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                {...register('name')}
                type="text"
                autoComplete="name"
                required
                className="mt-1"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                {...register('password')}
                type="password"
                autoComplete="new-password"
                required
                className="mt-1"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                {...register('confirmPassword')}
                type="password"
                autoComplete="new-password"
                required
                className="mt-1"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="caNumber">CA Membership Number (Optional)</Label>
              <Input
                {...register('caNumber')}
                type="text"
                placeholder="e.g., 123456"
                className="mt-1"
              />
              {errors.caNumber && (
                <p className="mt-1 text-sm text-red-600">{errors.caNumber.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="firmName">Firm Name (Optional)</Label>
              <Input
                {...register('firmName')}
                type="text"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone Number (Optional)</Label>
              <Input
                {...register('phone')}
                type="tel"
                placeholder="10-digit mobile number"
                className="mt-1"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>

            <div className="flex items-center">
              <input
                {...register('agreeToTerms')}
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="agreeToTerms" className="ml-2 block text-sm text-gray-900">
                I agree to the{' '}
                <a href="/terms" className="text-primary-600 hover:text-primary-500">
                  Terms and Conditions
                </a>{' '}
                and{' '}
                <a href="/privacy" className="text-primary-600 hover:text-primary-500">
                  Privacy Policy
                </a>
              </label>
            </div>
            {errors.agreeToTerms && (
              <p className="mt-1 text-sm text-red-600">{errors.agreeToTerms.message}</p>
            )}
          </div>

          <div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </Button>
          </div>

          <div className="text-center">
            <span className="text-sm text-gray-600">
              Already have an account?{' '}
              <a href="/login" className="font-medium text-primary-600 hover:text-primary-500">
                Sign in
              </a>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
```

---

## 6. API Routes Implementation

### Registration API Route

```typescript
// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { sendVerificationEmail } from '@/lib/email';
import { generateVerificationToken } from '@/lib/tokens';
import { createRazorpayCustomer } from '@/lib/razorpay';
import { UserStatus } from '@prisma/client';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  caNumber: z.string().optional(),
  firmName: z.string().optional(),
  phone: z.string().optional()
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Check CA number uniqueness if provided
    if (validatedData.caNumber) {
      const existingCA = await prisma.user.findUnique({
        where: { caNumber: validatedData.caNumber }
      });

      if (existingCA) {
        return NextResponse.json(
          { error: 'CA Number already registered' },
          { status: 400 }
        );
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    // Create Razorpay customer
    const razorpayCustomer = await createRazorpayCustomer({
      email: validatedData.email,
      name: validatedData.name,
      contact: validatedData.phone
    });

    // Create user
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        name: validatedData.name,
        caNumber: validatedData.caNumber,
        firmName: validatedData.firmName,
        phone: validatedData.phone,
        customerId: razorpayCustomer.id,
        status: UserStatus.PENDING_VERIFICATION
      }
    });

    // Generate verification token
    const token = await generateVerificationToken(user.email);

    // Send verification email
    await sendVerificationEmail(user.email, user.name, token);

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_REGISTERED',
        entity: 'User',
        entityId: user.id,
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown'
      }
    });

    return NextResponse.json({
      message: 'Registration successful. Please verify your email.',
      userId: user.id
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}
```

### Email Verification Route

```typescript
// app/api/auth/verify-email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { UserStatus } from '@prisma/client';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json(
      { error: 'Token is required' },
      { status: 400 }
    );
  }

  try {
    // Find the verification token
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
      include: { user: true }
    });

    if (!verificationToken) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 400 }
      );
    }

    if (verificationToken.expires < new Date()) {
      return NextResponse.json(
        { error: 'Token has expired' },
        { status: 400 }
      );
    }

    if (verificationToken.used) {
      return NextResponse.json(
        { error: 'Token has already been used' },
        { status: 400 }
      );
    }

    // Update user status and mark email as verified
    await prisma.user.update({
      where: { id: verificationToken.userId! },
      data: {
        emailVerified: new Date(),
        status: UserStatus.ACTIVE
      }
    });

    // Mark token as used
    await prisma.verificationToken.update({
      where: { id: verificationToken.id },
      data: { used: true }
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: verificationToken.userId!,
        action: 'EMAIL_VERIFIED',
        entity: 'User',
        entityId: verificationToken.userId!
      }
    });

    // Redirect to login with success message
    return NextResponse.redirect(
      new URL('/login?verified=true', req.url)
    );
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    );
  }
}
```

---

## 7. Middleware & Protection

### Middleware for Route Protection

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export default auth((req) => {
  const { auth, nextUrl } = req;
  const isLoggedIn = !!auth;
  const isAuthRoute = nextUrl.pathname.startsWith('/auth');
  const isPublicRoute = PUBLIC_ROUTES.includes(nextUrl.pathname);
  const isApiAuthRoute = nextUrl.pathname.startsWith('/api/auth');
  const isProtectedApiRoute = nextUrl.pathname.startsWith('/api') && !isApiAuthRoute;

  // Protect dashboard routes
  if (nextUrl.pathname.startsWith('/dashboard')) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/login', nextUrl));
    }

    // Check if email is verified
    if (!auth.user.emailVerified) {
      return NextResponse.redirect(new URL('/auth/verify-email', nextUrl));
    }

    // Check user status
    if (auth.user.status !== 'ACTIVE') {
      return NextResponse.redirect(new URL('/auth/suspended', nextUrl));
    }
  }

  // Protect API routes
  if (isProtectedApiRoute && !isLoggedIn) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Redirect logged-in users away from auth pages
  if (isLoggedIn && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};

const PUBLIC_ROUTES = [
  '/',
  '/about',
  '/pricing',
  '/features',
  '/contact',
  '/blog',
  '/terms',
  '/privacy',
  '/login',
  '/register',
  '/forgot-password'
];
```

---

## 8. User Management Features

### Password Reset Flow

```typescript
// lib/password-reset.ts
import { prisma } from '@/lib/db';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { sendPasswordResetEmail } from '@/lib/email';

export async function initiatePasswordReset(email: string) {
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    // Don't reveal if user exists
    return { success: true };
  }

  // Generate reset token
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 3600000); // 1 hour

  // Save reset token
  await prisma.passwordReset.create({
    data: {
      userId: user.id,
      token,
      expires
    }
  });

  // Send reset email
  await sendPasswordResetEmail(user.email, user.name || 'User', token);

  return { success: true };
}

export async function resetPassword(token: string, newPassword: string) {
  const resetToken = await prisma.passwordReset.findUnique({
    where: { token },
    include: { user: true }
  });

  if (!resetToken || resetToken.used || resetToken.expires < new Date()) {
    throw new Error('Invalid or expired token');
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 12);

  // Update user password
  await prisma.user.update({
    where: { id: resetToken.userId },
    data: { password: hashedPassword }
  });

  // Mark token as used
  await prisma.passwordReset.update({
    where: { id: resetToken.id },
    data: { used: true }
  });

  // Create audit log
  await prisma.auditLog.create({
    data: {
      userId: resetToken.userId,
      action: 'PASSWORD_RESET',
      entity: 'User',
      entityId: resetToken.userId
    }
  });

  return { success: true };
}
```

### Two-Factor Authentication

```typescript
// lib/two-factor.ts
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import { prisma } from '@/lib/db';

export async function enableTwoFactor(userId: string) {
  // Generate secret
  const secret = speakeasy.generateSecret({
    name: `PowerCA (${user.email})`,
    length: 32
  });

  // Save encrypted secret
  await prisma.user.update({
    where: { id: userId },
    data: {
      twoFactorSecret: encrypt(secret.base32), // Implement encryption
      twoFactorEnabled: false // Will be enabled after verification
    }
  });

  // Generate QR code
  const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url!);

  return {
    secret: secret.base32,
    qrCode: qrCodeUrl
  };
}

export async function verifyTwoFactorToken(userId: string, token: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user?.twoFactorSecret) {
    return false;
  }

  const secret = decrypt(user.twoFactorSecret); // Implement decryption

  const verified = speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 2
  });

  if (verified && !user.twoFactorEnabled) {
    // Enable 2FA on first successful verification
    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: true }
    });
  }

  return verified;
}
```

---

## 9. Security Implementation

### Rate Limiting

```typescript
// lib/rate-limit.ts
import { RateLimiterMemory } from 'rate-limiter-flexible';

const rateLimiter = new RateLimiterMemory({
  points: 5, // Number of attempts
  duration: 60 * 15, // Per 15 minutes
  blockDuration: 60 * 30, // Block for 30 minutes
});

export async function checkRateLimit(identifier: string) {
  try {
    await rateLimiter.consume(identifier);
    return { success: true };
  } catch (rateLimiterRes) {
    const secs = Math.round(rateLimiterRes.msBeforeNext / 1000) || 1;
    return {
      success: false,
      retryAfter: secs
    };
  }
}
```

### Session Management

```typescript
// lib/session-manager.ts
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function getActiveSessions(userId: string) {
  return await prisma.session.findMany({
    where: {
      userId,
      expires: { gt: new Date() }
    },
    orderBy: { expires: 'desc' }
  });
}

export async function revokeSession(sessionToken: string) {
  await prisma.session.delete({
    where: { sessionToken }
  });
}

export async function revokeAllSessions(userId: string, exceptCurrent?: string) {
  const where = exceptCurrent
    ? { userId, sessionToken: { not: exceptCurrent } }
    : { userId };

  await prisma.session.deleteMany({ where });
}
```

---

## 10. Testing & Deployment

### Testing Strategy

```typescript
// __tests__/auth.test.ts
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { POST as registerHandler } from '@/app/api/auth/register/route';
import { prisma } from '@/lib/db';

describe('Authentication', () => {
  beforeAll(async () => {
    // Setup test database
  });

  afterAll(async () => {
    // Cleanup
    await prisma.$disconnect();
  });

  describe('Registration', () => {
    it('should register a new user', async () => {
      const req = new Request('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'Test@1234',
          name: 'Test User'
        })
      });

      const response = await registerHandler(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toContain('successful');
    });

    it('should reject duplicate emails', async () => {
      // First registration
      await registerHandler(/* ... */);
      
      // Duplicate attempt
      const response = await registerHandler(/* ... */);
      
      expect(response.status).toBe(400);
    });
  });
});
```

### Deployment Checklist

```markdown
## Pre-Deployment

- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Email service configured
- [ ] OAuth providers configured (if using)
- [ ] Rate limiting configured
- [ ] Security headers added

## Security Checklist

- [ ] HTTPS enforced
- [ ] CSRF protection enabled
- [ ] Content Security Policy configured
- [ ] Password requirements enforced
- [ ] Account lockout mechanism tested
- [ ] Two-factor authentication tested
- [ ] Session management verified
- [ ] Audit logging functional

## Performance

- [ ] Database indexes created
- [ ] Connection pooling configured
- [ ] Redis configured for sessions (production)
- [ ] CDN configured for static assets

## Monitoring

- [ ] Error tracking (Sentry) configured
- [ ] Analytics configured
- [ ] Uptime monitoring set up
- [ ] Security monitoring enabled
```

---

## Summary

This implementation provides:

1. **Complete Authentication System** with registration, login, password reset, and 2FA
2. **CA-Specific Features** including professional verification fields
3. **Security Best Practices** including rate limiting, audit logging, and session management
4. **Scalable Architecture** ready for production deployment
5. **Comprehensive Testing** strategy for reliability

The system is designed to handle the specific needs of chartered accountants while maintaining high security standards and providing excellent user experience.