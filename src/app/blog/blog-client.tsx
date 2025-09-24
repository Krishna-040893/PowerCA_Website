"use client"

import { useState } from "react"
import { Search, Calendar, User, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const categories = [
  { id: 'all', name: 'All Categories', active: true },
  { id: 'best-practices', name: 'Best Practices', active: false },
  { id: 'compliance', name: 'Compliance', active: false },
  { id: 'technology', name: 'Technology', active: false },
  { id: 'industry-news', name: 'Industry News', active: false },
  { id: 'tips', name: 'Tips & Tricks', active: false },
]

const blogPosts = [
  {
    id: 1,
    title: "Essential Audit Practices for CA Firms in 2024",
    excerpt: "Discover the latest audit methodologies and compliance requirements that every CA firm should implement to stay competitive.",
    author: "Priya Sharma",
    date: "March 15, 2024",
    category: "best-practices",
    readTime: "5 min read",
    image: "/images/hero-background.png"
  },
  {
    id: 2,
    title: "Digital Transformation in Accounting: A Complete Guide",
    excerpt: "Learn how to modernize your accounting practice with digital tools and automated workflows for improved efficiency.",
    author: "Rajesh Kumar",
    date: "March 12, 2024",
    category: "technology",
    readTime: "8 min read",
    image: "/images/hero-background.png"
  },
  {
    id: 3,
    title: "New GST Compliance Requirements: What CAs Need to Know",
    excerpt: "Stay updated with the latest GST compliance changes and how they impact your clients' business operations.",
    author: "Anita Patel",
    date: "March 10, 2024",
    category: "compliance",
    readTime: "6 min read",
    image: "/images/hero-background.png"
  },
  {
    id: 4,
    title: "Time Management Strategies for Busy CA Practices",
    excerpt: "Proven techniques to optimize your time, increase productivity, and maintain work-life balance in your CA practice.",
    author: "Vikram Singh",
    date: "March 8, 2024",
    category: "tips",
    readTime: "4 min read",
    image: "/images/hero-background.png"
  },
  {
    id: 5,
    title: "Industry Trends: The Future of Chartered Accountancy",
    excerpt: "Explore emerging trends in the CA profession and how to prepare your practice for future opportunities.",
    author: "Meera Reddy",
    date: "March 5, 2024",
    category: "industry-news",
    readTime: "7 min read",
    image: "/images/hero-background.png"
  },
  {
    id: 6,
    title: "Client Communication Best Practices for CAs",
    excerpt: "Effective strategies to improve client relationships and communication throughout the audit process.",
    author: "Amit Gupta",
    date: "March 3, 2024",
    category: "best-practices",
    readTime: "5 min read",
    image: "/images/hero-background.png"
  }
]

const authors = [
  { id: 'all', name: 'All Authors' },
  { id: 'priya-sharma', name: 'Priya Sharma' },
  { id: 'rajesh-kumar', name: 'Rajesh Kumar' },
  { id: 'anita-patel', name: 'Anita Patel' },
  { id: 'vikram-singh', name: 'Vikram Singh' },
  { id: 'meera-reddy', name: 'Meera Reddy' },
  { id: 'amit-gupta', name: 'Amit Gupta' },
]

const dateFilters = [
  { id: 'all', name: 'All Dates' },
  { id: 'march-2024', name: 'March 2024' },
  { id: 'february-2024', name: 'February 2024' },
  { id: 'january-2024', name: 'January 2024' },
]

export default function BlogPageClient() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeCategory, setActiveCategory] = useState("all")
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  const [selectedAuthor, setSelectedAuthor] = useState("all")
  const [selectedDate, setSelectedDate] = useState("all")

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = activeCategory === "all" || post.category === activeCategory
    const matchesAuthor = selectedAuthor === "all" || post.author.toLowerCase().replace(' ', '-') === selectedAuthor
    const matchesDate = selectedDate === "all" || post.date.toLowerCase().includes(selectedDate.replace('-2024', '').replace('-', ' '))
    return matchesSearch && matchesCategory && matchesAuthor && matchesDate
  })

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden mx-12">
        <div
          className="relative bg-cover bg-center bg-no-repeat rounded-2xl px-12 py-16"
          style={{
            backgroundImage: `url('/images/blog-bg.jpg')`
          }}
        >
          <div className="container mx-auto px-4 max-w-6xl relative">
          <div className="text-center mb-12">
            {/* Badge */}
            <div className="inline-flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-full px-6 py-3 mb-8">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-blue-700 text-sm font-medium">News, Guides & Best Practices</span>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-gray-900 mb-6">
              The Power CA Blog
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-gray-600 max-w-4xl mx-auto mb-12">
              Your go-to space for best practices, productivity ideas, and the latest updates in audit and practice management.
            </p>
          </div>

          {/* Search Bar */}
          <div className="flex gap-4 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Search you want"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-6 pr-12 py-4 text-gray-700 bg-white border-2 border-gray-200 rounded-full h-16 text-lg placeholder:text-gray-400 focus:border-blue-500 focus:ring-0"
              />
              <Search className="absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
            </div>
            <div className="relative">
              <Button
                size="lg"
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 h-16 min-w-16"
              >
                <img
                  src="/images/filter-icon.png"
                  alt="Filter"
                  className="w-8 h-8"
                />
              </Button>

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
                        {categories.map((category) => (
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
                        {authors.map((author) => (
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
                        {dateFilters.map((dateFilter) => (
                          <option key={dateFilter.id} value={dateFilter.id}>
                            {dateFilter.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Clear Filters Button */}
                    <button
                      onClick={() => {
                        setActiveCategory("all")
                        setSelectedAuthor("all")
                        setSelectedDate("all")
                        setSearchTerm("")
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
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Explore Trending Topics
            </h2>
            <div className="flex flex-wrap gap-3 justify-center">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={activeCategory === category.id ? "default" : "outline"}
                  onClick={() => setActiveCategory(category.id)}
                  className={`rounded-full px-6 py-2 transition-all ${
                    activeCategory === category.id
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Blog Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
            {filteredPosts.map((post) => (
              <article
                key={post.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group"
              >
                <div className="aspect-video bg-gradient-to-br from-blue-500 to-blue-600 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <span className="bg-blue-600/90 text-white text-xs font-medium px-3 py-1 rounded-full">
                      {categories.find(cat => cat.id === post.category)?.name || 'General'}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-2 text-sm">
                    {post.excerpt}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
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
              </article>
            ))}
          </div>

          {filteredPosts.length === 0 && (
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