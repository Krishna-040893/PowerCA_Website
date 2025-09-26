import { Client } from '@hubspot/api-client'
import { FilterOperatorEnum } from '@hubspot/api-client/lib/codegen/crm/contacts/models/Filter'

interface UserData {
  email: string
  firstName?: string
  lastName?: string
  phone?: string
  firmName?: string
  caNumber?: string
  firmSize?: string
  planType?: string
  trialStartDate?: string
  demoDate?: string
  status?: string
  affiliateId?: string
  totalPaid?: number
  lastLogin?: string
  featuresUsed?: string[]
}

interface DemoData {
  email: string
  firmName: string
  contactName: string
  contactId?: string
  scheduledTime: string
  demoType?: string
  requirements?: string
}

interface PaymentData {
  email: string
  contactId: string
  planName: string
  amount: number
  status: string
  date: string
  billingCycle?: string
  paymentMethod?: string
  totalLifetimeValue?: number
  monthlyRevenue?: number
  firstPurchaseDate?: string
}

class HubSpotService {
  private client: Client

  constructor() {
    const accessToken = process.env.HUBSPOT_PRIVATE_APP_TOKEN
    if (!accessToken) {
      console.warn('HubSpot Private App Token not configured - set HUBSPOT_PRIVATE_APP_TOKEN in environment')
    }
    this.client = new Client({
      accessToken: accessToken || ''
    })
  }

  async syncUserToHubSpot(userData: UserData) {
    try {
      if (!process.env.HUBSPOT_PRIVATE_APP_TOKEN) {
        console.warn('HubSpot integration not configured')
        return null
      }

      const contactProperties = {
        email: userData.email,
        firstname: userData.firstName || '',
        lastname: userData.lastName || '',
        phone: userData.phone || '',
        company: userData.firmName || '',

        // Note: Custom properties need to be created in HubSpot first
        // Uncomment these after creating the properties in your HubSpot account
        // ca_membership_number: userData.caNumber || '',
        // firm_size: userData.firmSize || '',
        // plan_type: userData.planType || '',
        // trial_start_date: userData.trialStartDate || '',
        // demo_scheduled: userData.demoDate || '',
        // lifecycle_stage: userData.status || 'lead',
        // affiliate_source: userData.affiliateId || '',
        // total_revenue: userData.totalPaid?.toString() || '0',
        // last_login: userData.lastLogin || '',
        // features_used: userData.featuresUsed?.join(';') || '',
      }

      try {
        // First, try to find existing contact
        const searchResult = await this.client.crm.contacts.searchApi.doSearch({
          filterGroups: [{
            filters: [{
              propertyName: 'email',
              operator: FilterOperatorEnum.Eq,
              value: userData.email
            }]
          }],
          properties: ['email', 'firstname', 'lastname'],
          limit: 1,
          after: '0'
        })

        if (searchResult.results && searchResult.results.length > 0) {
          // Update existing contact
          const contactId = searchResult.results[0].id
          const updatedContact = await this.client.crm.contacts.basicApi.update(
            contactId,
            { properties: contactProperties }
          )
          return updatedContact
        } else {
          // Create new contact
          const newContact = await this.client.crm.contacts.basicApi.create({
            properties: contactProperties
          })
          return newContact
        }
      } catch (apiError: unknown) {
        if (apiError && typeof apiError === 'object' && 'code' in apiError && apiError.code === 409) {
          // Contact already exists, try to update
          const searchResult = await this.client.crm.contacts.searchApi.doSearch({
            filterGroups: [{
              filters: [{
                propertyName: 'email',
                operator: FilterOperatorEnum.Eq,
                value: userData.email
              }]
            }],
            properties: ['email'],
            limit: 1,
            after: '0'
          })

          if (searchResult.results && searchResult.results.length > 0) {
            const contactId = searchResult.results[0].id
            const updatedContact = await this.client.crm.contacts.basicApi.update(
              contactId,
              { properties: contactProperties }
            )
            return updatedContact
          }
        }
        throw apiError
      }
    } catch {
      // Don't break the app if HubSpot fails
      return null
    }
  }

  async syncDemoToHubSpot(demoData: DemoData) {
    try {
      if (!process.env.HUBSPOT_PRIVATE_APP_TOKEN) {
        return null
      }

      // Create engagement (meeting) in HubSpot
      const engagement = await this.client.crm.objects.meetings.basicApi.create({
        properties: {
          hs_meeting_title: `Power CA Demo - ${demoData.firmName}`,
          hs_meeting_body: `Demo scheduled for ${demoData.firmName}\nContact: ${demoData.contactName}\nRequirements: ${demoData.requirements || 'N/A'}`,
          hs_meeting_start_time: new Date(demoData.scheduledTime).getTime().toString(),
          hs_meeting_end_time: (new Date(demoData.scheduledTime).getTime() + 3600000).toString(), // 1 hour
        }
      })

      // Associate with contact if ID provided
      // TODO: Fix HubSpot association API call
      if (demoData.contactId) {
        // await this.client.crm.objects.meetings.associationsApi.create(
        //   engagement.id,
        //   'contacts',
        //   demoData.contactId,
        //   [{
        //     associationCategory: 'HUBSPOT_DEFINED',
        //     associationTypeId: 202 // meeting_to_contact association
        //   }]
        // )
      }

      // Track custom event
      await this.trackEvent('demo_scheduled', {
        email: demoData.email,
        demo_date: demoData.scheduledTime,
        demo_type: demoData.demoType || 'standard'
      })

      return engagement
    } catch {
      return null
    }
  }

  async syncPaymentToHubSpot(paymentData: PaymentData) {
    try {
      if (!process.env.HUBSPOT_PRIVATE_APP_TOKEN) {
        return null
      }

      // Create deal in HubSpot
      const deal = await this.client.crm.deals.basicApi.create({
        properties: {
          dealname: `Power CA - ${paymentData.planName}`,
          amount: paymentData.amount.toString(),
          pipeline: 'default',
          dealstage: paymentData.status === 'completed' ? 'closedwon' : 'appointmentscheduled',
          closedate: new Date(paymentData.date).getTime().toString(),
          plan_type: paymentData.planName,
          billing_cycle: paymentData.billingCycle || 'monthly',
          payment_method: paymentData.paymentMethod || '',
        }
      })

      // Update contact's revenue properties
      if (paymentData.contactId) {
        await this.client.crm.contacts.basicApi.update(paymentData.contactId, {
          properties: {
            total_revenue: paymentData.totalLifetimeValue?.toString() || '0',
            current_mrr: paymentData.monthlyRevenue?.toString() || '0',
            customer_since: paymentData.firstPurchaseDate || new Date().toISOString(),
          }
        })
      }

      return deal
    } catch {
      return null
    }
  }

  async getLeadInsights(email: string) {
    try {
      if (!process.env.HUBSPOT_PRIVATE_APP_TOKEN) {
        return null
      }

      const contact = await this.client.crm.contacts.searchApi.doSearch({
        filterGroups: [{
          filters: [{
            propertyName: 'email',
            operator: FilterOperatorEnum.Eq,
            value: email
          }]
        }],
        properties: [
          'hubspotscore', // Lead score
          'hs_email_open_count',
          'hs_email_click_count',
          'num_notes',
          'num_contacted_notes',
          'hs_analytics_num_page_views',
          'hs_analytics_num_visits',
          'hs_analytics_last_visit_timestamp'
        ],
        limit: 1,
        after: '0'
      })

      return contact.results[0] || null
    } catch {
      return null
    }
  }

  async trackEvent(eventName: string, properties: Record<string, unknown>) {
    try {
      if (!process.env.NEXT_PUBLIC_HUBSPOT_PORTAL_ID) {
        return null
      }

      const response = await fetch(`https://track.hubspot.com/v1/event`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          portalId: process.env.NEXT_PUBLIC_HUBSPOT_PORTAL_ID,
          eventName,
          properties,
          timestamp: Date.now()
        })
      })

      return response.json()
    } catch {
      return null
    }
  }

  async searchContactByEmail(email: string) {
    try {
      if (!process.env.HUBSPOT_PRIVATE_APP_TOKEN) {
        return null
      }

      const searchResult = await this.client.crm.contacts.searchApi.doSearch({
        filterGroups: [{
          filters: [{
            propertyName: 'email',
            operator: FilterOperatorEnum.Eq,
            value: email
          }]
        }],
        properties: ['email', 'firstname', 'lastname'],
        limit: 1,
        after: '0'
      })

      return searchResult.results[0] || null
    } catch {
      return null
    }
  }
}

export const hubspotService = new HubSpotService()