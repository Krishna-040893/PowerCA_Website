import { User } from '@prisma/client'

export type SafeUser = Omit<User, 'password'>

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  name?: string
  firmName?: string
  firmSize?: string
  phone?: string
}