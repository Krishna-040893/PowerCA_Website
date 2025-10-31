'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {Search, Calendar, User, ArrowRight, AlertCircle, SlidersHorizontal, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import {Button  } from '@/components/ui/button'
import {Input  } from '@/components/ui/input'
import { blogPosts as staticBlogPosts } from '@/data/blog-posts'

const POSTS_PER_PAGE = 6

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
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(false)

  // Fetch blog posts from database and merge with static posts
  useEffect(() => {
    async function fetchBlogPosts() {
      try {
        const response = await fetch('/api/blog/posts')
        const data = await response.json()

        // Merge database posts with static posts
        // Database posts come first (newest), then static posts
        const databasePosts = data.posts || []
        const allPosts = [...databasePosts, ...staticBlogPosts]

        setBlogPosts(allPosts)
      } catch (error) {
        console.error('Error fetching blog posts:', error)
        // Fallback to static posts on error
        setBlogPosts(staticBlogPosts)
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
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden mx-3 sm:mx-4 md:mx-6 lg:mx-12">
        <div
          className="relative bg-cover bg-center bg-no-repeat rounded-2xl px-4 sm:px-6 md:px-8 lg:px-12 py-8 sm:py-10 md:py-12 lg:py-16"
          style={{
            backgroundImage: `url('/images/blog-bg.jpg')`
          }}
        >
          <div className="container mx-auto px-2 sm:px-4 max-w-6xl relative">
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 sm:gap-3 bg-blue-50 border border-blue-200 rounded-full px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 mb-6 sm:mb-8">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-blue-700 text-xs sm:text-sm font-medium">News, Guides & Best Practices</span>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-900 mb-4 sm:mb-6 px-2">
              The Power CA
              <br />
              <span className="text-blue-600">Blog</span>

            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 max-w-4xl mx-auto mb-8 sm:mb-10 md:mb-12 px-2">
              Your go-to space for best practices, productivity ideas, and the latest updates in audit and practice management.
            </p>
          </div>

          {/* Search Bar */}
          <div className="flex gap-2 sm:gap-3 md:gap-4 max-w-4xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 sm:left-4 md:left-5 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 pointer-events-none" />
              <Input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-12 sm:h-14 md:h-16 rounded-xl sm:rounded-2xl bg-white/90 border border-gray-300 shadow-sm pl-10 sm:pl-12 md:pl-14 pr-3 sm:pr-4 md:pr-6 text-sm sm:text-base md:text-lg text-gray-800 placeholder:text-sm sm:placeholder:text-base md:placeholder:text-lg placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
              />
            </div>
            <div className="relative flex items-center">
              <button
                type="button"
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 text-white flex items-center justify-center shadow-[0_12px_28px_rgba(20,79,237,0.35)] hover:shadow-[0_16px_32px_rgba(20,79,237,0.45)] hover:scale-105 active:scale-95 transition-all duration-200"
                aria-label="Toggle filters"
              >
                <SlidersHorizontal className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
              </button>

              {showFilterDropdown && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md max-h-[90vh] overflow-y-auto">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-semibold text-gray-900">Filter Options</h3>
                        <button
                          onClick={() => setShowFilterDropdown(false)}
                          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>

                    {/* Category Filter */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <select
                        value={activeCategory}
                        onChange={(e) => setActiveCategory(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      >
                        {categoryOptions.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Author Filter */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Author</label>
                      <select
                        value={selectedAuthor}
                        onChange={(e) => setSelectedAuthor(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      >
                        {authorOptions.map((author) => (
                          <option key={author.id} value={author.id}>
                            {author.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Date Filter */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                      <select
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      >
                        {dateOptions.map((dateFilter) => (
                          <option key={dateFilter.id} value={dateFilter.id}>
                            {dateFilter.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Clear Filters Button */}
                    <button
                      onClick={() => {
                        setActiveCategory('all')
                        setSelectedAuthor('all')
                        setSelectedDate('all')
                        setSearchTerm('')
                        setShowFilterDropdown(false)
                      }}
                      className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Clear All Filters
                    </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-0">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Categories */}
          <div className="mb-12 pt-20 pb-5">
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-6 sm:mb-8 text-center leading-normal px-2">
              Explore Trending Topics
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
                      className={`rounded-full px-3 py-1.5 sm:px-6 sm:py-2 text-xs sm:text-sm transition-all whitespace-nowrap ${
                        activeCategory === category.id
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-8">
              {currentPosts.map((post) => {
              const postContent = (
                <>
                  <div className={`aspect-video relative overflow-hidden ${
                    post.isBreaking
                      ? 'bg-gradient-to-br from-red-500 to-orange-600'
                      : 'bg-gradient-to-br from-blue-500 to-blue-600'
                  }`}>
                    {post.image && (
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    {post.isBreaking && (
                      <div className="absolute top-4 right-4 bg-yellow-400 text-red-900 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 animate-pulse">
                        <AlertCircle className="w-3 h-3" />
                        BREAKING
                      </div>
                    )}
                    <div className="absolute bottom-4 left-4">
                      <span className={`${
                        post.isBreaking ? 'bg-red-600/90' : 'bg-blue-600/90'
                      } text-white text-xs font-medium px-3 py-1 rounded-full`}>
                        {categoryNameLookup.get(post.category) || formatCategoryName(post.category)}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    {post.subtitle && (
                      <p className="text-gray-700 mb-3 text-base font-medium line-clamp-1">
                        {post.subtitle}
                      </p>
                    )}
                    <p className="text-gray-600 mb-4 line-clamp-2 text-sm">
                      {post.excerpt}
                    </p>

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            post.isBreaking
                              ? 'bg-gradient-to-r from-red-400 to-orange-600'
                              : 'bg-gradient-to-r from-blue-400 to-blue-600'
                          }`}>
                            <User className="w-4 h-4 text-white" />
                          </div>
                          <span className="font-medium">{post.author}</span>
                        </div>
                      </div>
                      <span className="text-blue-600 font-medium">{post.readTime}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-500">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">{post.date}</span>
                      </div>
                      <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 p-0">
                        Read More
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </>
              )

              return post.link ? (
                <Link href={post.link} key={post.id}>
                  <article className={`bg-white rounded-2xl shadow-sm border overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer ${
                    post.isBreaking ? 'border-red-200 ring-2 ring-red-100' : 'border-gray-100'
                  }`}>
                    {postContent}
                  </article>
                </Link>
              ) : (
                <article
                  key={post.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group"
                >
                  {postContent}
                </article>
              )
            })}
            </div>
          )}

          {/* Pagination */}
          {!loading && filteredPosts.length > 0 && totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-8 px-4">
              {/* Results Info */}
              <div className="text-sm text-gray-600 order-2 sm:order-1">
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
                  className={`px-2 sm:px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-blue-500'
                  }`}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Previous</span>
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {getPageNumbers().map((page, index) => (
                    page === '...' ? (
                      <span key={`ellipsis-${index}`} className="px-2 py-2 text-gray-400">
                        ...
                      </span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page as number)}
                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg text-sm font-medium transition-all ${
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
                  className={`px-2 sm:px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${
                    currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-blue-500'
                  }`}
                  aria-label="Next page"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="w-4 h-4" />
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