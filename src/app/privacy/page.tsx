import {PrivacyPolicyContent  } from '@/components/privacy-policy-content'

export default function PrivacyPage() {
  return <PrivacyPolicyContent />
}

export const metadata = {
  title: 'Privacy Policy - Power CA',
  description: 'Understand how Power CA collects, uses, and shares information when you visit powerca.in.',
}

// Enable static generation for this page
export const dynamic = 'force-static'
export const revalidate = 86400 // Revalidate once per day
