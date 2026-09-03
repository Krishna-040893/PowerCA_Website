import {RefundPolicyContent  } from '@/components/refund-policy-content'

export default function RefundPolicyPage() {
  return <RefundPolicyContent />
}

export const metadata = {
  title: 'Refund Policy - Power CA',
  description: 'Power CA has a strict no returns or refunds policy. Review the terms before downloading or activating the software.',
}

// Enable static generation for this page
export const dynamic = 'force-static'
export const revalidate = 86400 // Revalidate once per day
