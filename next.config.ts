import type { NextConfig } from "next";

// Content Security Policy for different environments with reporting
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://checkout.razorpay.com https://*.razorpay.com https://www.googletagmanager.com https://www.google-analytics.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' data: https://fonts.gstatic.com https://r2cdn.perplexity.ai;
  img-src 'self' data: https: blob:;
  connect-src 'self' https://*.supabase.co https://api.razorpay.com https://*.razorpay.com wss://*.supabase.co https://www.google-analytics.com https://analytics.google.com;
  frame-src 'self' https://api.razorpay.com https://*.razorpay.com;
  media-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
  report-uri /api/csp-report;
  report-to csp-endpoint;
`

const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  },
  {
    key: 'Content-Security-Policy',
    value: ContentSecurityPolicy.replace(/\s{2,}/g, ' ').trim()
  },
  {
    key: 'Cross-Origin-Embedder-Policy',
    value: 'unsafe-none' // Set to 'require-corp' for stronger isolation
  },
  {
    key: 'Cross-Origin-Opener-Policy',
    value: 'same-origin-allow-popups' // Allows Razorpay popups while maintaining security
  },
  {
    key: 'Cross-Origin-Resource-Policy',
    value: 'cross-origin' // Allows resources to be loaded cross-origin (needed for CDNs)
  },
  {
    key: 'Report-To',
    value: '{"group":"csp-endpoint","max_age":10886400,"endpoints":[{"url":"/api/csp-report"}],"include_subdomains":true}'
  }
]

const nextConfig: NextConfig = {
  // Secure headers
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: '/:path*',
        headers: securityHeaders,
      },
      {
        // Additional security for API routes
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0'
          }
        ]
      }
    ]
  },

  // Disable x-powered-by header
  poweredByHeader: false,

  // Enable strict mode for React
  reactStrictMode: true,

  // Disable source maps in production
  productionBrowserSourceMaps: false,

  // Image optimization settings - Restricted to trusted domains for security
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'powerca.in',
      },
      {
        protocol: 'https',
        hostname: 'www.powerca.in',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
};

export default nextConfig;
