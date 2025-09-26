import {TermsConditionsContent  } from '@/components/terms-conditions-content'

export default function TermsPage() {
  return <TermsConditionsContent />
}

export const metadata = {
  title: 'Terms and Conditions - PowerCA',
  description: 'Read the terms and conditions for using PowerCA practice management platform.',
}

// Enable static generation for this page
export const dynamic = 'force-static'
export const revalidate = 86400 // Revalidate once per day