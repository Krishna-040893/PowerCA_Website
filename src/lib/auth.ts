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
          // In development, allow demo login without database
          if (process.env.NODE_ENV === 'development') {
            if (credentials.email === 'demo@powerca.in' && credentials.password === 'demo123') {
              return {
                id: 'demo-user',
                email: 'demo@powerca.in',
                name: 'Demo User',
                firmName: 'Demo Firm',
                role: 'user',
              }
            }

            // For any other dev credentials, create a demo user
            if (credentials.email.includes('@') && credentials.password.length >= 6) {
              return {
                id: 'dev-user-' + Date.now(),
                email: credentials.email,
                name: 'Development User',
                firmName: 'Dev Firm',
                role: 'user',
              }
            }
          }

          const supabase = createAdminClient()

          // Check if user exists
          const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', credentials.email)
            .single()

          if (error) {
            console.warn('Database error during auth:', error.message)
            if (process.env.NODE_ENV === 'development') {
              return null // Let it fail gracefully in development
            }
            throw new Error('User not found')
          }

          if (!user) {
            throw new Error('Invalid credentials')
          }

          // Verify password
          const passwordMatch = await bcrypt.compare(credentials.password, user.password)

          if (!passwordMatch) {
            throw new Error('Invalid password')
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            firmName: user.firm_name,
            role: user.role || 'user',
          }
        } catch (error) {
          console.error('Auth error details:', {
            error: error instanceof Error ? error.message : error,
            stack: error instanceof Error ? error.stack : undefined,
            env: process.env.NODE_ENV,
            supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'set' : 'not set',
            credentials: { email: credentials.email, hasPassword: !!credentials.password }
          })

          // Don't throw in development to prevent NextAuth errors
          if (process.env.NODE_ENV === 'development') {
            return null
          }
          throw new Error('Authentication failed')
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
    signIn: '/auth/login',
    signOut: '/auth/logout',
    error: '/auth/error',
    newUser: '/dashboard'
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.firmName = user.firmName
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.firmName = token.firmName as string
        session.user.role = token.role as 'admin' | 'subscriber' | 'affiliate' | 'Affiliate' | 'Admin'
      }
      return session
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
}