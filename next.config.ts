import type { NextConfig } from "next";
import { withSentryConfig } from '@sentry/nextjs';

// Bundle analyzer configuration
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

// Content Security Policy for different environments with reporting
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://checkout.razorpay.com https://*.razorpay.com https://sdk.cashfree.com https://*.cashfree.com https://www.googletagmanager.com https://www.google-analytics.com https://vercel.live https://*.vercel.live https://browser.sentry-cdn.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' data: https://fonts.gstatic.com https://r2cdn.perplexity.ai;
  img-src 'self' data: https: blob:;
  connect-src 'self' https://*.supabase.co https://api.razorpay.com https://*.razorpay.com https://api.cashfree.com https://*.cashfree.com https://cashfreelogo.cashfree.com wss://*.supabase.co https://www.google-analytics.com https://analytics.google.com https://vercel.live https://*.vercel.live https://*.sentry.io https://sentry.io;
  frame-src 'self' https://api.razorpay.com https://*.razorpay.com https://*.cashfree.com https://vercel.live https://www.google.com https://*.google.com;
  media-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self' https://*.cashfree.com https://api.razorpay.com https://*.razorpay.com;
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
  // Enable compression
  compress: true,

  // Compiler optimizations
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Secure headers
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: '/:path*',
        headers: securityHeaders,
      },
      {
        // Additional security for API routes with CORS support
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0'
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*'
          },
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, X-Requested-With'
          },
          {
            key: 'Access-Control-Max-Age',
            value: '86400'
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
      {
        protocol: 'https',
        hostname: 'razorpay.com',
      },
      {
        protocol: 'https',
        hostname: 'cashfreelogo.cashfree.com',
      },
      {
        protocol: 'https',
        hostname: 'merchant.cashfree.com',
      },
    ],
    // Configure allowed quality values for Next.js 16+ compatibility
    qualities: [75, 85, 90, 100],
  },
};

// Wrap with Sentry config for error tracking
const sentryWebpackPluginOptions = {
  // Additional config options for the Sentry Webpack plugin
  silent: true, // Suppresses all logs
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Auth token is required for uploading source maps
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Hides source maps from generated client bundles
  hideSourceMaps: true,

  // Transpiles SDK to be compatible with IE11
  transpileClientSDK: false,

  // Tunneling to prevent ad-blockers from blocking Sentry
  tunnelRoute: '/monitoring/tunnel',

  // Disables automatic instrumentation of Vercel Cron Monitors
  automaticVercelMonitors: false,
};

// Apply bundle analyzer and Sentry config
let finalConfig = nextConfig;

// Wrap with bundle analyzer
finalConfig = withBundleAnalyzer(finalConfig);

// Wrap with Sentry if DSN is provided
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  finalConfig = withSentryConfig(finalConfig, sentryWebpackPluginOptions);
}

export default finalConfig;
