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