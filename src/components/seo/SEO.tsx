import Head from 'next/head'
import {useRouter  } from 'next/router'
import DOMPurify from 'isomorphic-dompurify'

// JSON-LD schema type for flexible schema objects
type JSONLDSchema = Record<string, unknown>

interface SEOProps {
  title?: string
  description?: string
  keywords?: string
  image?: string
  article?: boolean
  author?: string
  publishedAt?: string
  modifiedAt?: string
  type?: 'website' | 'article' | 'product'
  noindex?: boolean
  canonical?: string
  schema?: JSONLDSchema
}

const DEFAULT_SEO = {
  title: 'PowerCA - Practice Management Software for Chartered Accountants',
  description: 'Simplify your practice, amplify your growth. The all-in-one practice management software designed for Chartered Accountants. Save 10+ hours weekly, ensure 100% compliance.',
  keywords: 'CA practice management software, chartered accountant software India, tax compliance software, accounting software India, CA firm management, practice management solution',
  image: '/images/og-image.jpg',
  type: 'website' as const
}

export default function SEO({
  title,
  description,
  keywords,
  image,
  article = false,
  author,
  publishedAt,
  modifiedAt,
  type = 'website',
  noindex = false,
  canonical,
  schema
}: SEOProps) {
  const router = useRouter()

  const seo = {
    title: title ? `${title} | PowerCA` : DEFAULT_SEO.title,
    description: description || DEFAULT_SEO.description,
    keywords: keywords || DEFAULT_SEO.keywords,
    image: image || DEFAULT_SEO.image,
    url: `https://powerca.in${router.asPath}`,
    type: article ? 'article' : type
  }

  // Generate structured data
  const generateSchema = () => {
    const baseSchema: { '@context': string; '@graph': Array<Record<string, unknown>> } = {
      '@context': 'https://schema.org',
      '@graph': [
        // Organization Schema
        {
          '@type': 'Organization',
          '@id': 'https://powerca.in/#organization',
          'name': 'TBS Technologies [P] Limited',
          'alternateName': 'PowerCA',
          'url': 'https://powerca.in',
          'logo': {
            '@type': 'ImageObject',
            'url': 'https://powerca.in/images/power-ca-logo.png',
            'width': 200,
            'height': 75
          },
          'address': {
            '@type': 'PostalAddress',
            'streetAddress': 'No. 130, II Floor, Muneer Complex, Palani Road',
            'addressLocality': 'Udumalpet',
            'addressRegion': 'Tamil Nadu',
            'postalCode': '642126',
            'addressCountry': 'IN'
          },
          'contactPoint': [
            {
              '@type': 'ContactPoint',
              'telephone': '+91-9842224635',
              'contactType': 'customer service',
              'areaServed': 'IN',
              'availableLanguage': ['English', 'Hindi', 'Tamil']
            },
            {
              '@type': 'ContactPoint',
              'email': 'contact@powerca.in',
              'contactType': 'customer service'
            }
          ],
          'sameAs': [
            'https://www.linkedin.com/company/powerca',
            'https://twitter.com/powerca'
          ]
        },
        // WebSite Schema
        {
          '@type': 'WebSite',
          '@id': 'https://powerca.in/#website',
          'url': 'https://powerca.in',
          'name': 'PowerCA - Practice Management Software',
          'description': DEFAULT_SEO.description,
          'publisher': {
            '@id': 'https://powerca.in/#organization'
          },
          'potentialAction': [
            {
              '@type': 'SearchAction',
              'target': {
                '@type': 'EntryPoint',
                'urlTemplate': 'https://powerca.in/search?q={search_term_string}'
              },
              'query-input': 'required name=search_term_string'
            }
          ]
        },
        // SoftwareApplication Schema
        {
          '@type': 'SoftwareApplication',
          '@id': 'https://powerca.in/#software',
          'name': 'PowerCA',
          'description': 'Complete practice management solution for Chartered Accountants, Company Secretaries, and Cost Accountants',
          'url': 'https://powerca.in',
          'applicationCategory': 'BusinessApplication',
          'operatingSystem': 'Windows, Web Browser',
          'offers': {
            '@type': 'Offer',
            'price': '22000',
            'priceCurrency': 'INR',
            'description': 'PowerCA Implementation with first year subscription FREE'
          },
          'author': {
            '@id': 'https://powerca.in/#organization'
          },
          'aggregateRating': {
            '@type': 'AggregateRating',
            'ratingValue': '4.8',
            'reviewCount': '150',
            'bestRating': '5',
            'worstRating': '1'
          },
          'featureList': [
            'Job Card Management',
            'Client Management',
            'Billing & Invoicing',
            'Tax Compliance',
            'Document Management',
            'Staff Management',
            'Financial Reporting',
            'CRM Integration'
          ]
        }
      ]
    }

    // Add custom schema if provided
    if (schema) {
      baseSchema['@graph'].push(schema)
    }

    // Add Article schema for blog posts
    if (article && publishedAt) {
      baseSchema['@graph'].push({
        '@type': 'Article',
        'headline': title,
        'description': description,
        'image': image || DEFAULT_SEO.image,
        'datePublished': publishedAt,
        'dateModified': modifiedAt || publishedAt,
        'author': {
          '@type': 'Person',
          'name': author || 'PowerCA Team'
        },
        'publisher': {
          '@type': 'Organization',
          '@id': 'https://powerca.in/#organization'
        }
      })
    }

    return baseSchema
  }

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <meta name="keywords" content={seo.keywords} />
      <meta name="author" content="TBS Technologies [P] Limited" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="robots" content={noindex ? 'noindex,nofollow' : 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1'} />

      {/* Canonical URL */}
      <link rel="canonical" href={canonical || seo.url} />

      {/* Open Graph Tags */}
      <meta property="og:type" content={seo.type} />
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:image" content={seo.image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={seo.title} />
      <meta property="og:url" content={seo.url} />
      <meta property="og:site_name" content="PowerCA" />
      <meta property="og:locale" content="en_IN" />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content={seo.image} />
      <meta name="twitter:site" content="@powerca" />
      <meta name="twitter:creator" content="@powerca" />

      {/* Article specific meta tags */}
      {article && (
        <>
          <meta property="article:published_time" content={publishedAt} />
          {modifiedAt && <meta property="article:modified_time" content={modifiedAt} />}
          {author && <meta property="article:author" content={author} />}
          <meta property="article:section" content="Technology" />
          <meta property="article:tag" content="CA Software,Practice Management,Accounting" />
        </>
      )}

      {/* Favicon and Icons */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/manifest.json" />
      <meta name="theme-color" content="#155dfc" />
      <meta name="msapplication-TileColor" content="#155dfc" />

      {/* Language and Location */}
      <meta name="geo.region" content="IN" />
      <meta name="geo.country" content="India" />
      <meta name="geo.placename" content="India" />
      <meta name="language" content="English" />
      <link rel="alternate" hrefLang="en-in" href={seo.url} />
      <link rel="alternate" hrefLang="en" href={seo.url} />

      {/* Structured Data - Sanitized for security */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: DOMPurify.sanitize(JSON.stringify(generateSchema()))
        }}
      />

      {/* DNS Prefetch for external domains */}
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//www.google-analytics.com" />
      <link rel="dns-prefetch" href="//googletagmanager.com" />

      {/* Preconnect for critical resources */}
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
    </Head>
  )
}