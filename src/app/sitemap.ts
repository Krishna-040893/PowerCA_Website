import {MetadataRoute  } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://powerca.in'
  const lastModified = new Date()

  // Define all static routes with their priorities and change frequencies
  const routes = [
    // Main pages - High priority
    {
      url: `${baseUrl}`,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/modules`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },

    // Features and services - Medium priority
    {
      url: `${baseUrl}/features`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/book-demo`,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/checkout`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },

    // Affiliate program
    {
      url: `${baseUrl}/affiliate-program`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/affiliate-program/register`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },

    // Authentication pages - Lower priority
    {
      url: `${baseUrl}/login`,
      lastModified,
      changeFrequency: 'yearly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/register`,
      lastModified,
      changeFrequency: 'yearly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/register/student`,
      lastModified,
      changeFrequency: 'yearly' as const,
      priority: 0.5,
    },

    // Blog and resources
    {
      url: `${baseUrl}/blog`,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },

    // Legal pages - Low priority
    {
      url: `${baseUrl}/privacy`,
      lastModified,
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified,
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },

    // Success and status pages
    {
      url: `${baseUrl}/payment-success`,
      lastModified,
      changeFrequency: 'yearly' as const,
      priority: 0.2,
    },
    {
      url: `${baseUrl}/payment-failed`,
      lastModified,
      changeFrequency: 'yearly' as const,
      priority: 0.1,
    },
  ]

  // Add city-specific pages for local SEO
  const cities = [
    'mumbai', 'delhi', 'bangalore', 'chennai', 'kolkata', 'pune',
    'hyderabad', 'ahmedabad', 'jaipur', 'lucknow', 'kanpur', 'nagpur',
    'indore', 'thane', 'bhopal', 'visakhapatnam', 'pimpri-chinchwad',
    'patna', 'vadodara', 'ghaziabad', 'ludhiana', 'agra', 'nashik'
  ]

  const cityRoutes = cities.map(city => ({
    url: `${baseUrl}/ca-software-${city}`,
    lastModified,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  // Add feature-specific landing pages
  const features = [
    'job-card-management',
    'client-management',
    'billing-invoicing',
    'tax-compliance',
    'document-management',
    'staff-management',
    'financial-reporting',
    'crm-integration'
  ]

  const featureRoutes = features.map(feature => ({
    url: `${baseUrl}/features/${feature}`,
    lastModified,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  // Add comparison pages
  const competitors = [
    'tally', 'zoho-books', 'erpca', 'marg-erp',
    'busy-accounting', 'quickbooks', 'sage'
  ]

  const comparisonRoutes = competitors.map(competitor => ({
    url: `${baseUrl}/vs/${competitor}`,
    lastModified,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  // Add use case pages
  const useCases = [
    'small-ca-firms',
    'large-ca-practices',
    'gst-practitioners',
    'tax-consultants',
    'company-secretaries',
    'cost-accountants',
    'audit-firms',
    'accounting-firms'
  ]

  const useCaseRoutes = useCases.map(useCase => ({
    url: `${baseUrl}/use-cases/${useCase}`,
    lastModified,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  // Add resource/tool pages
  const tools = [
    'gst-calculator',
    'income-tax-calculator',
    'tds-calculator',
    'advance-tax-calculator',
    'salary-calculator',
    'emi-calculator',
    'depreciation-calculator'
  ]

  const toolRoutes = tools.map(tool => ({
    url: `${baseUrl}/tools/${tool}`,
    lastModified,
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }))

  // Combine all routes
  return [
    ...routes,
    ...cityRoutes,
    ...featureRoutes,
    ...comparisonRoutes,
    ...useCaseRoutes,
    ...toolRoutes
  ]
}