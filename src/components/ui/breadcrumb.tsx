import * as React from 'react'
import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface BreadcrumbItem {
  label: string
  href?: string
  current?: boolean
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
  showHome?: boolean
}

export function Breadcrumb({ items, className, showHome = true }: BreadcrumbProps) {
  // Generate schema.org structured data
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      ...(showHome ? [{
        '@type': 'ListItem',
        'position': 1,
        'name': 'Home',
        'item': 'https://powerca.in'
      }] : []),
      ...items.map((item, index) => ({
        '@type': 'ListItem',
        'position': showHome ? index + 2 : index + 1,
        'name': item.label,
        ...(item.href && !item.current ? { 'item': `https://powerca.in${item.href}` } : {})
      }))
    ]
  }

  return (
    <>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />

      <nav aria-label='Breadcrumb' className={cn('flex items-center space-x-1 text-sm', className)}>
        {showHome && (
          <>
            <Link
              href="/"
              className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
            {items.length > 0 && (
              <ChevronRight className="h-4 w-4 text-gray-400" />
            )}
          </>
        )}

        {items.map((item, index) => (
          <React.Fragment key={index}>
            {index > 0 && (
              <ChevronRight className="h-4 w-4 text-gray-400" />
            )}
            {item.current ? (
              <span className="text-gray-900 font-medium" aria-current="page">
                {item.label}
              </span>
            ) : item.href ? (
              <Link
                href={item.href}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-500">{item.label}</span>
            )}
          </React.Fragment>
        ))}
      </nav>
    </>
  )
}

// Simplified breadcrumb for minimal use cases
export function SimpleBreadcrumb({ items }: { items: string[] }) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-600">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <span>/</span>}
          <span>{item}</span>
        </React.Fragment>
      ))}
    </div>
  )
}