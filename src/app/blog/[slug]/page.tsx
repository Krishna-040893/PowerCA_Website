import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Calendar, Clock, FileText, Download } from 'lucide-react'
import { BlogContent } from '@/components/blog/blog-content'

interface Document {
  title: string
  url: string
}

interface BlogPost {
  id: string
  title: string
  subtitle?: string
  slug: string
  excerpt: string
  content: string
  author: string
  category: string
  read_time: string
  image_url: string | null
  is_breaking: boolean
  is_published: boolean
  published_at: string | null
  created_at: string
  documents?: Document[]
}

async function getBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/blog/posts/${slug}`,
      {
        next: { revalidate: 60 }, // Revalidate every 60 seconds
      }
    )

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data.post
  } catch (error) {
    console.error('Error fetching blog post:', error)
    return null
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await getBlogPost(slug)

  if (!post) {
    return {
      title: 'Blog Post Not Found | PowerCA',
    }
  }

  return {
    title: `${post.title} | PowerCA Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.published_at || post.created_at,
      authors: [post.author],
      images: post.image_url ? [post.image_url] : [],
    },
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await getBlogPost(slug)

  if (!post) {
    notFound()
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatCategory = (category: string) => {
    return category
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const categoryColors: Record<string, string> = {
    'breaking-news': 'from-red-600 to-orange-600',
    compliance: 'from-purple-600 to-indigo-600',
    technology: 'from-blue-600 to-cyan-600',
    'tax-planning': 'from-green-600 to-emerald-600',
    general: 'from-gray-600 to-slate-600',
  }

  const gradientClass =
    categoryColors[post.category] || 'from-blue-600 to-indigo-600'

  return (
    <article className="min-h-screen bg-white">
      {/* Header */}
      <div className={`bg-gradient-to-r ${gradientClass} text-white`}>
        <div className="container mx-auto px-6 py-12">
          <Link href="/blog">
            <Button variant="ghost" className="text-white hover:bg-white/10 mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Button>
          </Link>

          <div className="max-w-4xl">
            <div className="flex items-center gap-4 text-sm mb-4 flex-wrap">
              <span className="bg-white/20 px-3 py-1 rounded-full">
                {formatCategory(post.category)}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(post.published_at || post.created_at)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {post.read_time}
              </span>
            </div>

            {post.is_breaking && (
              <div className="bg-yellow-400 text-red-900 px-4 py-2 rounded-lg mb-4 inline-block font-bold">
                🚨 BREAKING NEWS
              </div>
            )}

            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {post.title}
            </h1>

            {post.subtitle && (
              <p className="text-xl md:text-2xl text-white/90 mb-6">
                {post.subtitle}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content - 2/3 width */}
            <div className="lg:col-span-2">
              {/* Excerpt */}
              <div className="bg-blue-50 border-l-4 border-blue-600 p-6 mb-8">
                <p className="text-lg text-gray-700 font-medium">{post.excerpt}</p>
              </div>

              {/* Main Content */}
              <BlogContent content={post.content} />

              {/* Back to Blog CTA */}
              <div className="mt-12 pt-8 border-t border-gray-200">
                <Link href="/blog">
                  <Button size="lg" className="w-full sm:w-auto">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to All Articles
                  </Button>
                </Link>
              </div>
            </div>

            {/* Sidebar - 1/3 width */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-6">
                {/* Official Documents */}
                {post.documents && post.documents.filter(doc => doc.title && doc.url).length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Official Documents
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {post.documents
                        .filter(doc => doc.title && doc.url)
                        .map((doc, index) => (
                          <a
                            key={index}
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
                          >
                            <Download className="w-4 h-4 text-blue-600 group-hover:text-blue-700" />
                            <span className="text-sm text-blue-700 group-hover:text-blue-800 font-medium">
                              {doc.title}
                            </span>
                          </a>
                        ))}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}
