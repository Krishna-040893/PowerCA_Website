export interface BookingFormData {
  date: Date
  time: string
  type: 'demo' | 'consultation' | 'support'
  notes?: string
}

export interface TimeSlot {
  time: string
  available: boolean
}

export interface Booking {
  id?: string
  name: string
  email: string
  phone: string
  firmName?: string
  consultationType?: string
  message?: string
  date?: string
  time?: string
  status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  created_at?: string
  updated_at?: string
}

export interface BookingEmailData extends Booking {
  formattedDate?: string
  confirmationNumber?: string
}