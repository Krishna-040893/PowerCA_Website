'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {Search, Calendar, User, AlertCircle, SlidersHorizontal, Loader2, ChevronLeft, ChevronRight, X } from 'lucide-react'
import {Button  } from '@/components/ui/button'
import {Input  } from '@/components/ui/input'
import { PageHero } from '@/components/layout/page-hero'
import { Reveal } from '@/components/ui/reveal'

const POSTS_PER_PAGE = 8

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

const formatCategoryName = (category: string) =>
  category
    .replace(/-/g, ' ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

const formatMonthYear = (dateString: string) => {
  const date = new Date(dateString)

  if (Number.isNaN(date.getTime())) {
    return dateString
  }

  return date.toLocaleString('en-US', { month: 'long', year: 'numeric' })
}

interface BlogPost {
  id: string
  title: string
  subtitle?: string
  excerpt: string
  date: string
  author: string
  category: string
  readTime: string
  image?: string
  link?: string
  isBreaking?: boolean
}

export default function BlogPageClient() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  const [selectedAuthor, setSelectedAuthor] = useState('all')
  const [selectedDate, setSelectedDate] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const categoryScrollRef = useRef<HTMLDivElement>(null)
  const filterRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(false)

  const activeFilterCount =
    (activeCategory !== 'all' ? 1 : 0) +
    (selectedAuthor !== 'all' ? 1 : 0) +
    (selectedDate !== 'all' ? 1 : 0)

  // Close the filter panel on outside click or Escape
  useEffect(() => {
    if (!showFilterDropdown) return

    const handlePointerDown = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilterDropdown(false)
      }
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setShowFilterDropdown(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [showFilterDropdown])

  // Every post now comes from the admin portal; nothing is bundled with the site.
  useEffect(() => {
    async function fetchBlogPosts() {
      try {
        const response = await fetch('/api/blog/posts')
        const data = await response.json()

        setBlogPosts(data.posts || [])
      } catch (error) {
        console.error('Error fetching blog posts:', error)
        setBlogPosts([])
      } finally {
        setLoading(false)
      }
    }

    fetchBlogPosts()
  }, [])

  // Check scroll position and update arrow visibility
  const checkScrollPosition = () => {
    if (categoryScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = categoryScrollRef.current
      setShowLeftArrow(scrollLeft > 0)
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  // Scroll categories left or right
  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoryScrollRef.current) {
      const scrollAmount = 300
      const newScrollLeft = categoryScrollRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount)
      categoryScrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      })
    }
  }

  // Check scroll position on mount and when categories change
  useEffect(() => {
    checkScrollPosition()
    window.addEventListener('resize', checkScrollPosition)
    return () => window.removeEventListener('resize', checkScrollPosition)
  }, [blogPosts])

  const postsWithMeta = blogPosts.map((post) => {
    const monthYear = formatMonthYear(post.date)

    return {
      ...post,
      authorSlug: slugify(post.author),
      monthYear,
    }
  })

  const categoryOptions = [
    { id: 'all', name: 'All Categories' },
    ...Array.from(new Set(postsWithMeta.map((post) => post.category))).map((category) => ({
      id: category,
      name: formatCategoryName(category),
    })),
  ]

  const authorOptions = [
    { id: 'all', name: 'All Authors' },
    ...(Array.from(
      postsWithMeta.reduce(
        (map, post) => map.set(post.authorSlug, post.author),
        new Map<string, string>()
      )
    ) as [string, string][]).map(([id, name]) => ({ id, name })),
  ]

  const dateOptions = [
    { id: 'all', name: 'All Dates' },
    ...Array.from(new Set(postsWithMeta.map((post) => post.monthYear))).map((value) => ({
      id: value,
      name: value,
    })),
  ]

  const categoryNameLookup = new Map<string, string>(
    categoryOptions
      .filter((option) => option.id !== 'all')
      .map((option) => [option.id, option.name])
  )

  const filteredPosts = postsWithMeta.filter((post) => {
    const normalizedSearch = searchTerm.trim().toLowerCase()
    const matchesSearch =
      post.title.toLowerCase().includes(normalizedSearch) ||
      post.excerpt.toLowerCase().includes(normalizedSearch)
    const matchesCategory = activeCategory === 'all' || post.category === activeCategory
    const matchesAuthor = selectedAuthor === 'all' || post.authorSlug === selectedAuthor
    const matchesDate = selectedDate === 'all' || post.monthYear === selectedDate

    return matchesSearch && matchesCategory && matchesAuthor && matchesDate
  })

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, activeCategory, selectedAuthor, selectedDate])

  // Pagination calculations
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE)
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE
  const endIndex = startIndex + POSTS_PER_PAGE
  const currentPosts = filteredPosts.slice(startIndex, endIndex)

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        pages.push(1)
        pages.push('...')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      }
    }
    return pages
  }

  return (
    <div className="min-h-screen bg-[#F8FBFC]">
      {/* Hero Section */}
      <PageHero
        // The filter panel drops out of the hero, so it must not be clipped.
        className="overflow-visible"
        backgroundImage="/images/blog-bg.jpg"
        badge={{
          icon: (
            <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          ),
          label: 'News, Guides & Best Practices',
        }}
        title={
          <>
            The Power CA <span className="text-blue-600">Blog</span>
          </>
        }
        description="Your go-to space for best practices, productivity ideas, and the latest updates in audit and practice management."
      >
          {/* Search Bar */}
          <div ref={filterRef} className="relative max-w-2xl mx-auto">
            <div className="flex items-center h-11 sm:h-12 rounded-full bg-white border border-gray-200 shadow-sm focus-within:border-gray-300 transition-colors">
              <Search className="ml-4 w-4 h-4 text-gray-400 shrink-0 pointer-events-none" />
              <Input
                type="text"
                placeholder="Search articles"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 h-full min-w-0 border-0 bg-transparent px-3 text-sm sm:text-base text-gray-900 placeholder:text-gray-400 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="p-1 mr-1 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              <div className="w-px h-5 bg-gray-200" />

              <button
                type="button"
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                aria-expanded={showFilterDropdown}
                aria-label="Toggle filters"
                className={`flex items-center gap-1.5 h-full pl-3 pr-4 rounded-r-full text-sm transition-colors ${
                  showFilterDropdown || activeFilterCount > 0
                    ? 'text-blue-600'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="hidden sm:inline">Filter</span>
                {activeFilterCount > 0 && (
                  <span className="ml-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-blue-600 text-white text-[11px] leading-[18px] text-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>

            {showFilterDropdown && (
              <div className="absolute right-0 z-50 mt-2 w-full sm:w-80 rounded-2xl bg-white border border-gray-200 shadow-lg p-4 text-left">
                {[
                  { label: 'Category', value: activeCategory, onChange: setActiveCategory, options: categoryOptions },
                  { label: 'Author', value: selectedAuthor, onChange: setSelectedAuthor, options: authorOptions },
                  { label: 'Date', value: selectedDate, onChange: setSelectedDate, options: dateOptions },
                ].map((filter) => (
                  <div key={filter.label} className="mb-3 last:mb-0">
                    <label className="block text-[11px] font-medium uppercase tracking-wide text-gray-400 mb-1.5">
                      {filter.label}
                    </label>
                    <select
                      value={filter.value}
                      onChange={(e) => filter.onChange(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg bg-gray-50 border border-transparent text-sm text-gray-900 hover:bg-gray-100 focus:bg-white focus:border-gray-300 focus:outline-none transition-colors"
                    >
                      {filter.options.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.name}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}

                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveCategory('all')
                      setSelectedAuthor('all')
                      setSelectedDate('all')
                    }}
                    className="mt-4 w-full text-sm text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    Clear all
                  </button>
                )}
              </div>
            )}
          </div>
      </PageHero>

      {/* Content Section */}
      <section className="py-7 sm:py-10 md:py-12 lg:py-[60px]">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-6 max-w-7xl">
          {/* Categories */}
          <div className="mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-4xl lg:text-[40px] font-normal tracking-tight leading-[1.15] text-[#001525] font-inter mb-4 sm:mb-8 text-center px-2">
              Explore <span className="font-semibold">Trending Topics</span>
            </h2>
            <div className="relative flex items-center justify-center px-4 sm:px-8">
              {/* Left Arrow */}
              <button
                onClick={() => scrollCategories('left')}
                className={`absolute left-0 z-10 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white border-2 border-gray-300 shadow-lg flex items-center justify-center hover:bg-blue-50 hover:border-blue-500 transition-all ${
                  showLeftArrow ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
              </button>

              {/* Scrollable Categories */}
              <div
                ref={categoryScrollRef}
                onScroll={checkScrollPosition}
                className="overflow-x-auto scrollbar-hide scroll-smooth flex-1 mx-8 sm:mx-12"
              >
                <div className="flex gap-2 sm:gap-3 justify-start min-w-max px-2">
                  {categoryOptions.map((category) => (
                    <Button
                      key={category.id}
                      variant={activeCategory === category.id ? 'default' : 'outline'}
                      onClick={() => setActiveCategory(category.id)}
                      className={`rounded-full border px-4 py-2 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                        activeCategory === category.id
                          ? 'border-[#111418] bg-[#111418] text-white hover:bg-[#111418] hover:text-white'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-white hover:text-[#001525]'
                      }`}
                    >
                      {category.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Right Arrow */}
              <button
                onClick={() => scrollCategories('right')}
                className={`absolute right-0 z-10 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white border-2 border-gray-300 shadow-lg flex items-center justify-center hover:bg-blue-50 hover:border-blue-500 transition-all ${
                  showRightArrow ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                aria-label="Scroll right"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                <p className="text-gray-600 text-lg">Loading articles...</p>
              </div>
            </div>
          )}

          {/* Blog Posts Grid */}
          {!loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 pb-6 sm:pb-8">
              {currentPosts.map((post, index) => {
                const postContent = (
                  <>
                    <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-gray-100">
                      {post.image && (
                        <Image
                          src={post.image}
                          alt={post.title}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      )}
                      {post.isBreaking && (
                        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-red-600 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm">
                          <AlertCircle className="h-3 w-3" />
                          BREAKING
                        </span>
                      )}
                    </div>

                    <div className="mt-4 flex flex-1 flex-col">
                      <span className="w-fit rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                        {categoryNameLookup.get(post.category) || formatCategoryName(post.category)}
                      </span>

                      <h3 className="mt-3 text-lg sm:text-xl font-semibold leading-snug text-[#001525] transition-colors group-hover:text-blue-600 line-clamp-2 font-inter">
                        {post.title}
                      </h3>

                      <p className="mt-2 text-sm leading-relaxed text-gray-500 line-clamp-2 font-inter">
                        {post.excerpt}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500">
                        <span className="inline-flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5" />
                          <span className="font-medium text-gray-600">{post.author}</span>
                        </span>
                        <span className="h-1 w-1 rounded-full bg-gray-300" aria-hidden="true" />
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          {post.date}
                        </span>
                        <span className="h-1 w-1 rounded-full bg-gray-300" aria-hidden="true" />
                        <span>{post.readTime}</span>
                      </div>
                    </div>
                  </>
                )

                return post.link ? (
                  <Reveal key={post.id} delay={(index % 3) * 0.05} className="h-full">
                    <Link href={post.link} className="group flex h-full flex-col">
                      {postContent}
                    </Link>
                  </Reveal>
                ) : (
                  <Reveal key={post.id} delay={(index % 3) * 0.05} className="h-full">
                    <article className="group flex h-full flex-col">
                      {postContent}
                    </article>
                  </Reveal>
                )
              })}
            </div>
          )}

          {/* Pagination */}
          {!loading && filteredPosts.length > 0 && totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 py-6 sm:py-8 px-2 sm:px-4">
              {/* Results Info */}
              <div className="text-xs sm:text-sm text-gray-600 order-2 sm:order-1">
                Showing <span className="font-semibold text-gray-900">{startIndex + 1}</span> to{' '}
                <span className="font-semibold text-gray-900">{Math.min(endIndex, filteredPosts.length)}</span> of{' '}
                <span className="font-semibold text-gray-900">{filteredPosts.length}</span> articles
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center gap-1 sm:gap-2 order-1 sm:order-2">
                {/* Previous Button */}
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-1.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center gap-0.5 sm:gap-1 ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-blue-500'
                  }`}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Previous</span>
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-0.5 sm:gap-1">
                  {getPageNumbers().map((page, index) => (
                    page === '...' ? (
                      <span key={`ellipsis-${index}`} className="px-1 sm:px-2 py-1.5 sm:py-2 text-gray-400 text-xs sm:text-sm">
                        ...
                      </span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page as number)}
                        className={`w-7 h-7 sm:w-10 sm:h-10 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                          currentPage === page
                            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-blue-500'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  ))}
                </div>

                {/* Next Button */}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`px-1.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center gap-0.5 sm:gap-1 ${
                    currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-blue-500'
                  }`}
                  aria-label="Next page"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>
          )}

          {/* No Articles Found */}
          {!loading && filteredPosts.length === 0 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No articles found</h3>
              <p className="text-gray-600">Try adjusting your search or browse different categories.</p>
            </div>
          )}
        </div>
      </section>

    </div>
  )
}