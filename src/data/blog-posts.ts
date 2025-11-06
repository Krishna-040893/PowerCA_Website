export type BlogPost = {
  id: string
  title: string
  excerpt: string
  author: string
  date: string
  category: string
  readTime: string
  image: string
  link: string
  isBreaking?: boolean
}

export const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'BREAKING: Tax Audit Report Due Date Extended to October 31, 2025',
    excerpt:
      'CBDT extends tax audit report filing deadline from September 30 to October 31, 2025 for AY 2025-26. Get complete details of the notification.',
    author: 'PowerCA Team',
    date: 'September 25, 2025',
    category: 'breaking-news',
    readTime: '5 min read',
    image: '/images/tax-audit-deadline-extended-feature.png',
    link: '/blog/tax-audit-deadline-extended-october-31-2025',
    isBreaking: true,
  },
  {
    id: '2',
    title: 'TDS Compliance Checklist 2025-26: Complete Guide for CAs',
    excerpt:
      'Comprehensive TDS compliance checklist for FY 2025-26. Due dates, rates, forms, penalties, and best practices for error-free TDS compliance.',
    author: 'PowerCA Team',
    date: 'September 24, 2025',
    category: 'compliance',
    readTime: '15 min read',
    image: '/images/tds-compliance-checklist-feature.png',
    link: '/blog/tds-compliance-checklist-complete-guide',
  },
  {
    id: '3',
    title: 'Why Every CA Firm Needs Practice Management Software in 2025',
    excerpt:
      'Discover how practice management software transforms CA firms. Increase efficiency by 40%, reduce errors, automate compliance, and scale your practice.',
    author: 'PowerCA Team',
    date: 'September 23, 2025',
    category: 'technology',
    readTime: '12 min read',
    image: '/images/practice-management-software-feature.png',
    link: '/blog/why-cas-need-practice-management-software',
  },
  {
    id: '4',
    title: 'New vs Old Tax Regime: Which is Better for You in 2025-26?',
    excerpt:
      'Detailed comparison of New vs Old tax regime for FY 2025-26. Calculate which regime saves more tax based on your income and deductions.',
    author: 'PowerCA Team',
    date: 'September 22, 2025',
    category: 'tax-planning',
    readTime: '10 min read',
    image: '/images/new-vs-old-tax-regime-feature.png',
    link: '/blog/new-vs-old-tax-regime-which-is-better',
  },
  {
    id: '5',
    title: 'How to File GST Returns in 2025: Complete Guide for CAs',
    excerpt:
      'Step-by-step guide on filing GST returns in 2025. Learn about GSTR-1, GSTR-3B, deadlines, late fees, and common mistakes to avoid.',
    author: 'PowerCA Team',
    date: 'September 20, 2025',
    category: 'compliance',
    readTime: '12 min read',
    image: '/images/hero-background.png',
    link: '/blog/how-to-file-gst-returns-2025',
  },
]
