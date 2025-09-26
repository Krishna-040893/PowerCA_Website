import {DefaultSession, DefaultUser  } from 'next-auth'
import {DefaultJWT  } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      firmName?: string
      role: 'admin' | 'subscriber' | 'affiliate' | 'Admin' | 'Affiliate'
      userType?: string
      isVerified?: boolean
      needsAffiliateSetup?: boolean
    } & DefaultSession['user']
  }

  interface User extends DefaultUser {
    id: string
    email: string
    name: string
    firmName?: string
    role: 'admin' | 'subscriber' | 'affiliate'
    userType?: string
    isVerified?: boolean
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string
    email: string
    name: string
    firmName?: string
    role: 'admin' | 'subscriber' | 'affiliate'
    userType?: string
    isVerified?: boolean
  }
}