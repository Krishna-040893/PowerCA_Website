import {MetadataRoute  } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://powerca.in'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/*',
          '/api/*',
          '/dashboard/*',
          '/affiliate/*',
          '/account-setup',
          '/setup',
          '/test-*',
          '/payment-success',
          '/payment-failed',
          '/email-preview',
          '/*?*utm_*',  // Block UTM parameters
          '/*?*fbclid*', // Block Facebook click IDs
          '/*?*gclid*',  // Block Google click IDs
          '/admin-login',
          '/affiliate/dashboard',
          '/affiliate/account',
          '/affiliate/apply',
          '/affiliate/profile/create',
          '/affiliate/referral-dashboard'
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/admin/*',
          '/api/*',
          '/dashboard/*',
          '/affiliate/*',
          '/account-setup',
          '/setup',
          '/test-*',
          '/payment-success',
          '/payment-failed',
          '/email-preview',
          '/admin-login'
        ],
        crawlDelay: 1
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: [
          '/admin/*',
          '/api/*',
          '/dashboard/*',
          '/affiliate/*',
          '/account-setup',
          '/setup',
          '/test-*',
          '/payment-success',
          '/payment-failed',
          '/email-preview',
          '/admin-login'
        ],
        crawlDelay: 2
      },
      // Block aggressive crawlers
      {
        userAgent: 'SemrushBot',
        disallow: '/',
      },
      {
        userAgent: 'AhrefsBot',
        disallow: '/',
      },
      {
        userAgent: 'MJ12bot',
        disallow: '/',
      },
      {
        userAgent: 'DotBot',
        disallow: '/',
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl
  }
}