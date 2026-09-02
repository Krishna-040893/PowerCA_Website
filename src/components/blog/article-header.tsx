import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface ArticleHeaderProps {
  category: string
  date: string
  readTime: string
  title: string
  description?: string
  author: string
  /** Shows the red BREAKING pill above the title. */
  isBreaking?: boolean
}

/**
 * The masthead every article shares: the back link in the left corner, with the
 * title and byline set as one block to its right.
 */
export function ArticleHeader({
  category,
  date,
  readTime,
  title,
  description,
  author,
  isBreaking,
}: ArticleHeaderProps) {
  return (
    // Same container as the article body below, so the rule and the header
    // block line up with the content columns.
    <div className="container mx-auto px-6 pt-8 sm:pt-10">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-12">
        <Link
          href="/blog"
          className="inline-flex shrink-0 items-center gap-2 text-sm text-gray-500 hover:text-[#001525] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Insights
        </Link>

        <div className="w-full lg:ml-auto lg:max-w-4xl">
          {isBreaking && (
            <span className="mb-4 inline-flex items-center rounded-full bg-red-600 px-3 py-1 text-[11px] font-semibold text-white">
              BREAKING NEWS
            </span>
          )}

          {/* The responsive text sizes carry their own line-height and are
              emitted after the leading utility, so the leading has to be
              restated at each breakpoint to win. */}
          <h1 className="text-2xl leading-[1.3] sm:text-3xl sm:leading-[1.3] lg:text-[40px] lg:leading-[1.3] font-semibold tracking-tight text-[#001525] font-inter">
            {title}
          </h1>

          {description && (
            <p className="mt-4 text-[15px] sm:text-[17px] leading-relaxed text-gray-500 font-inter">
              {description}
            </p>
          )}

          {/* Byline: author, category, date and read time */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-x-8 gap-y-4 text-sm">
            <span className="inline-flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600">
                {author.charAt(0).toUpperCase()}
              </span>
              <span className="font-medium text-[#001525]">{author}</span>
            </span>

            <span className="inline-flex items-center gap-2">
              <span className="text-xs uppercase tracking-wide text-gray-400">Category</span>
              <span className="text-[#001525]">{category}</span>
            </span>

            <span className="inline-flex items-center gap-2">
              <span className="text-xs uppercase tracking-wide text-gray-400">Date</span>
              <span className="text-[#001525]">{date}</span>
            </span>

            <span className="inline-flex items-center gap-2">
              <span className="text-xs uppercase tracking-wide text-gray-400">Read</span>
              <span className="text-[#001525]">{readTime}</span>
            </span>
          </div>
        </div>
      </div>

      <hr className="mt-8 sm:mt-10 border-gray-200" />
    </div>
  )
}
