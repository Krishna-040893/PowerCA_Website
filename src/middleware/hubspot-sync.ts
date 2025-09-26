import {hubspotService  } from '@/lib/hubspot-service'

interface User {
  id?: string
  email: string
  firstName?: string
  lastName?: string
  phone?: string
  firmName?: string
  caNumber?: string
  firmSize?: string
  planType?: string
  status?: string
  affiliateId?: string
  createdAt?: Date | string
}

interface Demo {
  id?: string
  email: string
  firmName: string
  contactName: string
  scheduledTime: string | Date
  requirements?: string
  demoType?: string
}

interface Payment {
  id?: string
  email: string
  amount: number
  planName: string
  status: string
  date?: string | Date
  billingCycle?: string
  paymentMethod?: string
  userId?: string
}

interface Activity {
  type: string
  userEmail: string
  metadata?: Record<string, unknown>
}

export const syncMiddleware = {
  // Call after user registration
  async afterUserCreate(user: User) {
    try {
      await hubspotService.syncUserToHubSpot({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        firmName: user.firmName,
        caNumber: user.caNumber,
        firmSize: user.firmSize,
        planType: user.planType,
        status: user.status || 'lead',
        affiliateId: user.affiliateId,
      })
    } catch (error) {
      console.error('Failed to sync user to HubSpot:', error)
    }
  },

  // Call after demo scheduling
  async afterDemoScheduled(demoData: Demo) {
    try {
      // First, try to find the contact in HubSpot
      const contact = await hubspotService.searchContactByEmail(demoData.email)

      await hubspotService.syncDemoToHubSpot({
        email: demoData.email,
        firmName: demoData.firmName,
        contactName: demoData.contactName,
        contactId: contact?.id,
        scheduledTime: typeof demoData.scheduledTime === 'string'
          ? demoData.scheduledTime
          : demoData.scheduledTime.toISOString(),
        requirements: demoData.requirements,
        demoType: demoData.demoType
      })

      await hubspotService.trackEvent('demo_scheduled', {
        email: demoData.email,
        demo_date: demoData.scheduledTime,
        firm_name: demoData.firmName
      })
    } catch (error) {
      console.error('Failed to sync demo to HubSpot:', error)
    }
  },

  // Call after payment completed
  async afterPaymentCompleted(payment: Payment) {
    try {
      // Find contact in HubSpot
      const contact = await hubspotService.searchContactByEmail(payment.email)

      await hubspotService.syncPaymentToHubSpot({
        email: payment.email,
        contactId: contact?.id || '',
        planName: payment.planName,
        amount: payment.amount,
        status: payment.status,
        date: typeof payment.date === 'string'
          ? payment.date
          : payment.date?.toISOString() || new Date().toISOString(),
        billingCycle: payment.billingCycle,
        paymentMethod: payment.paymentMethod,
      })

      await hubspotService.trackEvent('payment_completed', {
        email: payment.email,
        amount: payment.amount,
        plan: payment.planName
      })
    } catch (error) {
      console.error('Failed to sync payment to HubSpot:', error)
    }
  },

  // Call on trial start
  async afterTrialStarted(user: User) {
    try {
      await hubspotService.syncUserToHubSpot({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        firmName: user.firmName,
        caNumber: user.caNumber,
        firmSize: user.firmSize,
        planType: user.planType,
        status: 'opportunity',
        affiliateId: user.affiliateId,
        trialStartDate: new Date().toISOString(),
      })

      await hubspotService.trackEvent('trial_started', {
        email: user.email,
        trial_start: new Date().toISOString()
      })
    } catch (error) {
      console.error('Failed to sync trial start to HubSpot:', error)
    }
  },

  // Call on user activity
  async trackUserActivity(activity: Activity) {
    try {
      await hubspotService.trackEvent(activity.type, {
        email: activity.userEmail,
        ...activity.metadata
      })
    } catch (error) {
      console.error('Failed to track activity in HubSpot:', error)
    }
  },

  // Update user properties
  async updateUserProperties(email: string, properties: Record<string, unknown>) {
    try {
      const userData = {
        email,
        ...properties
      } as Parameters<typeof hubspotService.syncUserToHubSpot>[0]

      await hubspotService.syncUserToHubSpot(userData)
    } catch (error) {
      console.error('Failed to update user properties in HubSpot:', error)
    }
  }
}