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

<<<<<<< HEAD
        // Check for default admin login
        if (credentials.email === 'admin' && credentials.password === 'admin123') {
          return {
            id: 'admin-default',
            email: 'admin@powerca.in',
            name: 'Admin',
            username: 'admin',
            role: 'admin',
            userType: 'Admin',
            isVerified: true
          }
        }

        // Check if Supabase is configured
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        if (!supabaseUrl || supabaseUrl === 'your-supabase-project-url' || !supabaseUrl.startsWith('http')) {
          // If database not configured, only allow admin login
          throw new Error('Database not configured. Only admin login available.')
=======
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
>>>>>>> a0ca34adb227776b18a3475234c2ee4188ffbe00
        }

        try {
          const supabase = createAdminClient()
<<<<<<< HEAD

          console.log('Attempting login for:', credentials.email)

          // Check if user exists in registrations table first
          const { data: user, error } = await supabase
            .from('registrations')
=======
          
          // Check if user exists
          const { data: user, error } = await supabase
            .from('users')
>>>>>>> a0ca34adb227776b18a3475234c2ee4188ffbe00
            .select('*')
            .eq('email', credentials.email)
            .single()

<<<<<<< HEAD
          if (error) {
            console.log('Database error:', error.message, error.code)
            if (error.code === 'PGRST116') {
              console.log('No user found with email:', credentials.email)
            }
            throw new Error('Invalid email or password')
          }

          if (!user) {
            console.log('User not found in database')
            throw new Error('Invalid email or password')
          }

          console.log('User found:', user.email, 'Role:', user.role)

          // Check if user is active (if field exists)
          if (user.is_active === false) {
            throw new Error('Your account has been deactivated')
=======
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
>>>>>>> a0ca34adb227776b18a3475234c2ee4188ffbe00
          }

          // Verify password
          const passwordMatch = await bcrypt.compare(credentials.password, user.password)
          
          if (!passwordMatch) {
            throw new Error('Invalid password')
          }

<<<<<<< HEAD
          // Update last login
          await supabase
            .from('registrations')
            .update({
              last_login: new Date().toISOString(),
              login_count: (user.login_count || 0) + 1
            })
            .eq('id', user.id)

          // Check if user needs to complete affiliate setup
          const needsAffiliateSetup = user.role === 'Affiliate' && !user.affiliate_details_completed

=======
>>>>>>> a0ca34adb227776b18a3475234c2ee4188ffbe00
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            firmName: user.firm_name,
<<<<<<< HEAD
            role: user.role || 'subscriber', // Default to subscriber role
            userType: user.user_type,
            isVerified: user.is_verified,
            needsAffiliateSetup: needsAffiliateSetup || false
          }
        } catch (error) {
          console.error('Auth error:', error)
          if (error instanceof Error) {
            throw error
          }
          throw new Error('Authentication failed')
=======
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
>>>>>>> a0ca34adb227776b18a3475234c2ee4188ffbe00
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
<<<<<<< HEAD
        token.userType = user.userType
        token.isVerified = user.isVerified
        token.needsAffiliateSetup = user.needsAffiliateSetup
=======
>>>>>>> a0ca34adb227776b18a3475234c2ee4188ffbe00
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
<<<<<<< HEAD
        session.user.userType = token.userType as string
        session.user.isVerified = token.isVerified as boolean
        session.user.needsAffiliateSetup = token.needsAffiliateSetup as boolean
=======
>>>>>>> a0ca34adb227776b18a3475234c2ee4188ffbe00
      }
      return session
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
}