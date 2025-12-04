import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

export interface UserSubscription {
  id: string
  plan: string
  status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'TRIALING'
  current_period_start: string
  current_period_end: string
  created_at: string
}

export interface SubscriptionStatus {
  hasLaunchOffer: boolean
  canRenew: boolean
  subscription: UserSubscription | null
  isLoading: boolean
  daysUntilRenewal: number
}

export function useSubscription(): SubscriptionStatus {
  const { data: session } = useSession()
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>({
    hasLaunchOffer: false,
    canRenew: false,
    subscription: null,
    isLoading: true,
    daysUntilRenewal: 0
  })

  useEffect(() => {
    async function fetchSubscriptionStatus() {
      if (!session?.user?.id) {
        setSubscriptionStatus(prev => ({ ...prev, isLoading: false }))
        return
      }

      try {
        // Use API route instead of direct Supabase query to bypass RLS
        const response = await fetch('/api/subscriptions/status')

        if (!response.ok) {
          // Only log meaningful errors, not empty objects or network issues
          try {
            const errorData = await response.json()
            if (errorData?.error && errorData.error !== 'Internal server error') {
              console.error('Error fetching subscriptions:', errorData)
            }
          } catch {
            // JSON parsing failed, ignore
          }
          setSubscriptionStatus(prev => ({ ...prev, isLoading: false }))
          return
        }

        const { subscriptions } = await response.json()

        // Find Launch Offer subscription
        const launchOfferSub = subscriptions?.find((sub: UserSubscription) =>
          sub.plan === 'launch_offer' || sub.plan === 'first_year'
        )

        if (!launchOfferSub) {
          // No launch offer subscription found
          setSubscriptionStatus({
            hasLaunchOffer: false,
            canRenew: false,
            subscription: null,
            isLoading: false,
            daysUntilRenewal: 0
          })
          return
        }

        // Calculate if 11 months have passed since the launch offer started (changed from 12 months)
        const subscriptionStart = new Date(launchOfferSub.current_period_start || launchOfferSub.created_at)
        const elevenMonthsLater = new Date(subscriptionStart)
        elevenMonthsLater.setMonth(elevenMonthsLater.getMonth() + 11)

        const now = new Date()
        const canRenew = now >= elevenMonthsLater

        // Calculate days until renewal is possible
        const timeDiff = elevenMonthsLater.getTime() - now.getTime()
        const daysUntilRenewal = Math.ceil(timeDiff / (1000 * 3600 * 24))

        setSubscriptionStatus({
          hasLaunchOffer: true,
          canRenew: canRenew,
          subscription: launchOfferSub,
          isLoading: false,
          daysUntilRenewal: Math.max(0, daysUntilRenewal)
        })

      } catch (error) {
        console.error('Error in fetchSubscriptionStatus:', error)
        setSubscriptionStatus(prev => ({ ...prev, isLoading: false }))
      }
    }

    fetchSubscriptionStatus()
  }, [session?.user?.id])

  return subscriptionStatus
}