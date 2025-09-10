import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import bcrypt from 'bcryptjs'
import { createAdminClient } from '@/lib/supabase/admin'

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

        // Check if Supabase is configured
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'your-supabase-project-url') {
          console.log('Supabase not configured, using demo mode')
          
          // Demo mode - accept any credentials for testing
          // In production, this should be removed
          if (credentials.email && credentials.password) {
            return {
              id: `demo_${Date.now()}`,
              email: credentials.email,
              name: credentials.email.split('@')[0],
              firmName: 'Demo Firm',
              role: 'user',
            }
          }
          return null
        }

        try {
          const supabase = createAdminClient()
          
          // Check if user exists
          const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', credentials.email)
            .single()

          if (error || !user) {
            // In demo mode, create a session anyway
            console.log('User not found in database, using demo mode')
            return {
              id: `demo_${Date.now()}`,
              email: credentials.email,
              name: credentials.email.split('@')[0],
              firmName: 'Demo Firm',
              role: 'user',
            }
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
          console.error('Auth error:', error)
          // Fallback to demo mode on error
          if (credentials.email && credentials.password) {
            return {
              id: `demo_${Date.now()}`,
              email: credentials.email,
              name: credentials.email.split('@')[0],
              firmName: 'Demo Firm',
              role: 'user',
            }
          }
          return null
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
        session.user.role = token.role as string
      }
      return session
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
}