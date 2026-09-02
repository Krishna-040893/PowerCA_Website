import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, FileText, Download } from 'lucide-react'
import { ArticleHeader } from '@/components/blog/article-header'
import Image from 'next/image'

import { BlogContent } from '@/components/blog/blog-content'
import { createClient } from '@supabase/supabase-js'

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
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase configuration missing')
      return null
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Fetch published blog post by slug directly from the database
    const { data: post, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single()

    if (error || !post) {
      console.error('Blog post not found:', error)
      return null
    }

    return post as BlogPost
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

  return (
    <article className="min-h-screen bg-white">
      <ArticleHeader
        category={formatCategory(post.category)}
        date={formatDate(post.published_at || post.created_at)}
        readTime={post.read_time}
        title={post.title}
        description={post.subtitle}
        author={post.author}
        isBreaking={post.is_breaking}
      />

      {/* Hero image */}
      {post.image_url && (
        <div className="container mx-auto mt-8 px-6">
          {/* Wide and shallow, so the image spans the column without pushing
              the article far down the page. */}
          <div className="relative aspect-[16/9] sm:aspect-[21/9] overflow-hidden rounded-2xl bg-gray-100">
            <Image
              src={post.image_url}
              alt={post.title}
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
          </div>
        </div>
      )}

      {/* Body */}
      <div className="container mx-auto max-w-5xl px-6 py-10 sm:py-14">
        <p className="text-[15px] sm:text-[17px] leading-relaxed text-gray-600 font-inter">
          {post.excerpt}
        </p>

        <div className="mt-6">
          <BlogContent content={post.content} />
        </div>

        {/* Official Documents */}
        {post.documents && post.documents.filter(doc => doc.title && doc.url).length > 0 && (
          <div className="mt-10 rounded-2xl border border-gray-100 bg-white p-5 sm:p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-12px_rgba(16,24,40,0.10)]">
            <h2 className="flex items-center gap-2 text-base font-semibold text-[#001525]">
              <FileText className="h-4 w-4" />
              Official Documents
            </h2>
            <div className="mt-4 space-y-2">
              {post.documents
                .filter(doc => doc.title && doc.url)
                .map((doc, index) => (
                  <a
                    key={index}
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100"
                  >
                    <Download className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-700 group-hover:text-blue-800">
                      {doc.title}
                    </span>
                  </a>
                ))}
            </div>
          </div>
        )}

        <div className="mt-12 border-t border-gray-200 pt-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-[#001525] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to all articles
          </Link>
        </div>
      </div>
    </article>
  )
}
