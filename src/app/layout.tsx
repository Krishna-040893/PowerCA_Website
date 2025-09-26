import type { Metadata, Viewport } from 'next'
import './globals.css'
import {Toaster  } from '@/components/ui/sonner'
import {SessionProvider  } from '@/components/providers/session-provider'
import {ConditionalLayoutWrapper  } from '@/components/layout/conditional-layout-wrapper'
import {GoogleAnalytics  } from '@/components/google-analytics'
import {GoogleTagManager, GoogleTagManagerNoscript  } from '@/components/google-tag-manager'
import { GlobalErrorBoundary } from '@/components/error-boundary'
import { MonitoringProvider } from '@/components/monitoring-provider'
import { BrowserCheck } from '@/components/browser-check'

// Force dynamic rendering for all pages due to session usage
export const dynamic = 'force-dynamic'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: '#155dfc',
}

export const metadata: Metadata = {
  metadataBase: new URL('https://powerca.in'),
  title: 'PowerCA - Practice Management Software for Chartered Accountants',
  description: 'Simplify your practice, amplify your growth. The all-in-one practice management software designed for Chartered Accountants. Save 10+ hours weekly, ensure 100% compliance.',
  keywords: 'CA practice management, chartered accountant software, tax compliance software, accounting software India, CA firm management',
  verification: {
    google: 'your-google-search-console-verification-code', // Replace with actual code
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png' },
    ],
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: 'PowerCA - Practice Management Software for CAs',
    description: 'Transform your CA practice with PowerCA. Save time, ensure compliance, and grow your firm.',
    url: 'https://powerca.in',
    siteName: 'PowerCA',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'PowerCA - Practice Management Software for Chartered Accountants',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PowerCA - Practice Management Software for CAs',
    description: 'Transform your CA practice with PowerCA. Save time, ensure compliance, and grow your firm.',
    images: ['/og-image.jpg'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="font-sans antialiased"
      >
        <GlobalErrorBoundary>
          <BrowserCheck />
          <GoogleTagManager />
          <GoogleTagManagerNoscript />
          <GoogleAnalytics />
          <SessionProvider>
            <MonitoringProvider>
              <ConditionalLayoutWrapper>
                {children}
              </ConditionalLayoutWrapper>
              <Toaster />
            </MonitoringProvider>
          </SessionProvider>
        </GlobalErrorBoundary>
      </body>
    </html>
  )
}
