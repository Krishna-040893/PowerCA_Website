import {Metadata  } from 'next'
import BlogPageClient from './blog-client'

export const metadata: Metadata = {
  title: 'Blog - PowerCA',
  description: 'Your go-to space for best practices, productivity ideas, and the latest updates in audit and practice management.',
}

export default function BlogPage() {
  return <BlogPageClient />
}