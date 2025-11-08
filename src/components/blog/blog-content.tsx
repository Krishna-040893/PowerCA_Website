'use client'

import DOMPurify from 'isomorphic-dompurify'
import './blog-content.css'

interface BlogContentProps {
  content: string
}

export function BlogContent({ content }: BlogContentProps) {
  // Sanitize HTML content to prevent XSS attacks
  const sanitizedContent = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'a', 'img', 'blockquote', 'code', 'pre', 'span',
      'div', 'table', 'thead', 'tbody', 'tr', 'td', 'th'
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
  })

  return (
    <div
      className="blog-content"
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  )
}
