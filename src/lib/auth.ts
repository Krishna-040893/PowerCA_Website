import {NextAuthOptions  } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import bcrypt from 'bcryptjs'
import {createAdminClient  } from '@/lib/supabase/admin'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials')
        }

        // Ensure Supabase is configured
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'your-supabase-project-url') {
          console.warn('Supabase is not configured properly')
          // In development, allow authentication without Supabase
          if (process.env.NODE_ENV === 'development') {
            // Continue to demo login handling below
          } else {
            throw new Error('Supabase is not configured')
          }
        }

        try {
          const supabase = createAdminClient()

          // First, check if it's an affiliate in affiliate_registrations table
          // Allow login for all statuses (pending, approved, rejected) so affiliates can see their status
          const { data: affiliate, error: affiliateError } = await supabase
            .from('affiliate_registrations')
            .select('*')
            .eq('email', credentials.email)
            .single()

          if (affiliate && !affiliateError) {
            // Check if affiliate has a password
            if (!affiliate.password) {
              throw new Error('Your account needs a password reset. Please contact support.')
            }

            // Verify password
            const passwordMatch = await bcrypt.compare(credentials.password, affiliate.password)

            if (!passwordMatch) {
              throw new Error('Invalid email or password')
            }

            return {
              id: affiliate.id,
              email: affiliate.email,
              name: affiliate.full_name,
              phone: affiliate.phone,
              firmName: affiliate.company_name || null,
              role: 'affiliate',
              status: affiliate.status, // Include status for UI to show pending/rejected pages
            }
          }

          // If not an affiliate, check registration_forms table for regular users
          const { data: user, error } = await supabase
            .from('registration_forms')
            .select('*')
            .eq('email', credentials.email)
            .single()

          if (error || !user) {
            console.warn('Database error during auth:', error?.message || 'User not found')

            // In development, allow demo login as fallback
            if (process.env.NODE_ENV === 'development') {
              if (credentials.email === 'demo@powerca.in' && credentials.password === 'demo123') {
                return {
                  id: 'demo-user',
                  email: 'demo@powerca.in',
                  name: 'Demo User',
                  firmName: 'Demo Firm',
                  role: 'subscriber',
                }
              }
            }

            throw new Error('Invalid email or password')
          }

          // Verify password
          const passwordMatch = await bcrypt.compare(credentials.password, user.password_hash)

          if (!passwordMatch) {
            throw new Error('Invalid email or password')
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            phone: user.phone,
            firmName: user.firm_name || null,
            role: user.role || 'subscriber',
          }
        } catch (error) {
          console.error('Auth error details:', {
            error: error instanceof Error ? error.message : error,
            stack: error instanceof Error ? error.stack : undefined,
            env: process.env.NODE_ENV,
            supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'set' : 'not set',
            credentials: { email: credentials.email, hasPassword: !!credentials.password }
          })

          // Re-throw the error to show in login UI
          throw error instanceof Error ? error : new Error('Authentication failed')
        }
      }
    }),
    // Google OAuth (optional - configure in production)
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      })
    ] : []),
  ],
  pages: {
    signIn: '/login',
    error: '/login',
    newUser: '/account'
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async signIn({ user }) {
      // Allow all sign-ins (role check is done in the login page)
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.phone = user.phone
        token.firmName = user.firmName
        token.role = user.role
        token.status = user.status
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.phone = token.phone as string
        session.user.firmName = token.firmName as string
        session.user.role = token.role as 'admin' | 'subscriber' | 'affiliate' | 'Affiliate' | 'Admin'
        session.user.status = token.status as 'pending' | 'approved' | 'rejected' | 'suspended' | undefined
      }
      return session
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
}