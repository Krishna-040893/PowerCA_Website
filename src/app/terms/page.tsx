import {TermsConditionsContent  } from '@/components/terms-conditions-content'

export default function TermsPage() {
  return <TermsConditionsContent />
}

export const metadata = {
  title: 'Terms and Conditions - PowerCA',
  description: 'Review the terms and conditions for using the PowerCA software license.',
}

// Enable static generation for this page
export const dynamic = 'force-static'
export const revalidate = 86400 // Revalidate once per day
