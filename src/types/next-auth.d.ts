import { DefaultSession, DefaultUser } from 'next-auth'
import { JWT, DefaultJWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      firmName?: string
<<<<<<< HEAD
      role: 'admin' | 'subscriber' | 'affiliate' | 'Admin' | 'Affiliate'
      userType?: string
      isVerified?: boolean
      needsAffiliateSetup?: boolean
=======
      role: string
>>>>>>> a0ca34adb227776b18a3475234c2ee4188ffbe00
    } & DefaultSession['user']
  }

  interface User extends DefaultUser {
    id: string
    email: string
    name: string
    firmName?: string
<<<<<<< HEAD
    role: 'admin' | 'subscriber' | 'affiliate'
    userType?: string
    isVerified?: boolean
=======
    role: string
>>>>>>> a0ca34adb227776b18a3475234c2ee4188ffbe00
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string
    email: string
    name: string
    firmName?: string
<<<<<<< HEAD
    role: 'admin' | 'subscriber' | 'affiliate'
    userType?: string
    isVerified?: boolean
=======
    role: string
>>>>>>> a0ca34adb227776b18a3475234c2ee4188ffbe00
  }
}