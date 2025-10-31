import {NextAuthOptions  } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import bcrypt from 'bcryptjs'
import {createAdminClient  } from '@/lib/supabase/admin'
import {logger  } from '@/lib/logger'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        logger.debug('Authorize called', {
          hasPassword: !!credentials?.password,
          hasEmail: !!credentials?.email,
          hasUsername: !!credentials?.username,
        })

        if (!credentials?.password) {
          logger.warn('No password provided')
          throw new Error('Password is required')
        }

        // Must have either email (for users/affiliates) or username (for admin)
        if (!credentials?.email && !credentials?.username) {
          logger.warn('No email or username provided')
          throw new Error('Email or username is required')
        }

        // Ensure Supabase is configured
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'your-supabase-project-url') {
          logger.warn('Supabase is not configured properly')
          // In development, allow authentication without Supabase
          if (process.env.NODE_ENV === 'development') {
            // Continue to demo login handling below
          } else {
            throw new Error('Database is not configured')
          }
        }

        try {
          const supabase = createAdminClient()
          logger.debug('Supabase client created')

          // First, check if it's an admin login (username-based)
          if (credentials.username) {
            logger.debug('Looking up admin user')

            const { data: admin, error: adminError } = await supabase
              .from('admin_users')
              .select('*')
              .eq('username', credentials.username)
              .single()

            logger.debug('Admin lookup result', {
              found: !!admin,
              hasError: !!adminError
            })

            if (admin && !adminError) {
              logger.info('Admin user authenticated successfully')
              // Check if account is locked
              if (admin.locked_until) {
                const lockoutTime = new Date(admin.locked_until).getTime()
                if (lockoutTime > Date.now()) {
                  const minutesRemaining = Math.ceil((lockoutTime - Date.now()) / 60000)
                  throw new Error(`Account locked. Try again in ${minutesRemaining} minutes.`)
                } else {
                  // Unlock the account
                  await supabase
                    .from('admin_users')
                    .update({
                      locked_until: null,
                      login_attempts: 0
                    })
                    .eq('id', admin.id)
                }
              }

              // Check if account is active
              if (!admin.is_active) {
                throw new Error('Account is disabled')
              }

              // Verify password
              const passwordMatch = await bcrypt.compare(credentials.password, admin.password_hash)

              if (!passwordMatch) {
                // Increment login attempts
                const newAttempts = (admin.login_attempts || 0) + 1
                const updateData: { login_attempts: number; locked_until?: string } = {
                  login_attempts: newAttempts
                }

                // Lock account if max attempts reached (5 attempts)
                if (newAttempts >= 5) {
                  updateData.locked_until = new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes
                }

                await supabase
                  .from('admin_users')
                  .update(updateData)
                  .eq('id', admin.id)

                if (newAttempts >= 5) {
                  throw new Error('Too many failed attempts. Account locked for 30 minutes.')
                }

                throw new Error('Invalid username or password')
              }

              // Reset login attempts and update last login
              await supabase
                .from('admin_users')
                .update({
                  login_attempts: 0,
                  last_login: new Date().toISOString(),
                  locked_until: null
                })
                .eq('id', admin.id)

              return {
                id: admin.id,
                email: admin.email,
                name: admin.username,
                username: admin.username,
                role: 'admin',
              }
            }

            // If username provided but not found in admin_users
            throw new Error('Invalid username or password')
          }

          // Second, check if it's an affiliate in affiliate_registrations table
          // Allow login for all statuses (pending, approved, rejected) so affiliates can see their status
          if (credentials.email) {
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
          }

          // Third, check registration_forms table for regular users (if email provided)
          const { data: user, error } = await supabase
            .from('registration_forms')
            .select('*')
            .eq('email', credentials.email)
            .single()

          if (error || !user) {
            logger.debug('User not found in database')

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
          logger.error('Authentication failed', error)
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
    maxAge: 7 * 24 * 60 * 60, // 7 days (reduced from 30 for security)
    updateAge: 24 * 60 * 60, // Update session every 24 hours
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production'
        ? `__Secure-next-auth.session-token`
        : `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax', // Important for Vercel deployments
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  },
  useSecureCookies: process.env.NODE_ENV === 'production',
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
        token.username = user.username
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
        session.user.username = token.username as string
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