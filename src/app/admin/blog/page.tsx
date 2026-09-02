'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { AdminPageWrapper } from '@/components/admin/admin-page-wrapper'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Loader2, RefreshCw, Plus, Edit, Trash2, FileText, Upload, X } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { createClient } from '@supabase/supabase-js'
import { RichTextEditor } from '@/components/admin/rich-text-editor'
import { AdminPagination } from '@/components/admin/admin-pagination'

interface BlogPost {
  id: string
  title: string
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
  updated_at: string
  subtitle?: string
  documents?: Array<{title: string, url: string}>
  key_dates?: Array<{label: string, date: string}>
  sidebar_summary?: {items: Array<{label: string, value: string}>}
}

export default function AdminBlogPage() {
  const { isAuthenticated, isLoading: authLoading, adminUser } = useAdminAuth()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 10
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isDeleting, setIsDeleting] = useState(false)
  const [isHeaderVisible, setIsHeaderVisible] = useState(true)

  const formatCategory = (category: string) => {
    return category
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    excerpt: '',
    content: '',
    author: 'PowerCA Team',
    category: 'general',
    readTime: '5 min read',
    imageUrl: '',
    isBreaking: false,
    isPublished: true
  })

  // Rich content fields (simplified)
  const [documents, setDocuments] = useState<Array<{title: string, url: string, file?: File, uploading?: boolean}>>([])
  const [keyDates, setKeyDates] = useState<Array<{label: string, date: string}>>([])
  const [sidebarItems, setSidebarItems] = useState<Array<{label: string, value: string}>>([
    {label: 'Previous Deadline', value: ''},
    {label: 'New Deadline', value: ''}
  ])

  const fetchPosts = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/blog', {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch blog posts: ${response.statusText}`)
      }

      const data = await response.json()
      setPosts(data.posts || [])
    } catch (err) {
      console.error('Error fetching blog posts:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
      toast.error('Failed to fetch blog posts')
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (isAuthenticated) {
      fetchPosts()
    }
  }, [isAuthenticated, fetchPosts])

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!validTypes.includes(file.type)) {
      toast.error('Please select a valid image file (JPEG, PNG, GIF, or WebP)')
      return
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB')
      return
    }

    setImageFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview(null)
    setFormData({ ...formData, imageUrl: '' })
  }

  const uploadImageToSupabase = async (file: File): Promise<string | null> => {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseAnonKey) {
        toast.error('Supabase configuration missing')
        return null
      }

      const supabase = createClient(supabaseUrl, supabaseAnonKey)

      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `${fileName}`

      setUploadingImage(true)

      // Upload to Supabase Storage
      const { error } = await supabase.storage
        .from('blog-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Upload error:', error)
        toast.error('Failed to upload image')
        return null
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('blog-images')
        .getPublicUrl(filePath)

      return publicUrl
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Failed to upload image')
      return null
    } finally {
      setUploadingImage(false)
    }
  }

  const uploadDocumentToSupabase = async (file: File, index: number): Promise<string | null> => {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseAnonKey) {
        toast.error('Supabase configuration missing')
        return null
      }

      const supabase = createClient(supabaseUrl, supabaseAnonKey)

      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `${fileName}`

      // Set uploading state for this specific document
      const newDocs = [...documents]
      newDocs[index].uploading = true
      setDocuments(newDocs)

      // Upload to Supabase Storage
      const { error } = await supabase.storage
        .from('blog-documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Upload error:', error)
        toast.error('Failed to upload document')
        return null
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('blog-documents')
        .getPublicUrl(filePath)

      return publicUrl
    } catch (error) {
      console.error('Error uploading document:', error)
      toast.error('Failed to upload document')
      return null
    } finally {
      // Clear uploading state
      const newDocs = [...documents]
      newDocs[index].uploading = false
      setDocuments(newDocs)
    }
  }

  const handleDocumentSelect = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain'
    ]
    if (!validTypes.includes(file.type)) {
      toast.error('Please select a valid document file (PDF, DOC, DOCX, XLS, XLSX, or TXT)')
      return
    }

    // Validate file size (20MB)
    if (file.size > 20 * 1024 * 1024) {
      toast.error('Document size must be less than 20MB')
      return
    }

    // Upload the document immediately
    const publicUrl = await uploadDocumentToSupabase(file, index)

    if (publicUrl) {
      const newDocs = [...documents]
      newDocs[index].url = publicUrl
      newDocs[index].file = file
      setDocuments(newDocs)
      toast.success('Document uploaded successfully')
    }
  }

  const handleOpenDialog = (post?: BlogPost) => {
    if (post) {
      setEditingPost(post)
      setFormData({
        title: post.title,
        subtitle: post.subtitle || '',
        excerpt: post.excerpt,
        content: post.content,
        author: post.author,
        category: post.category,
        readTime: post.read_time,
        imageUrl: post.image_url || '',
        isBreaking: post.is_breaking,
        isPublished: post.is_published
      })
      setImagePreview(post.image_url)
      setImageFile(null)
      // Load rich content
      setDocuments(post.documents || [])
      setKeyDates(post.key_dates || [])
      setSidebarItems(post.sidebar_summary?.items || [{label: 'Previous Deadline', value: ''}, {label: 'New Deadline', value: ''}])
    } else {
      setEditingPost(null)
      setFormData({
        title: '',
        subtitle: '',
        excerpt: '',
        content: '',
        author: 'PowerCA Team',
        category: 'general',
        readTime: '5 min read',
        imageUrl: '',
        isBreaking: false,
        isPublished: true
      })
      setImagePreview(null)
      setImageFile(null)
      setDocuments([])
      setKeyDates([])
      setSidebarItems([{label: 'Previous Deadline', value: ''}, {label: 'New Deadline', value: ''}])
    }
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formData.title || !formData.excerpt || !formData.content) {
      toast.error('Please fill in all required fields')
      return
    }

    setSaving(true)

    try {
      let imageUrl = formData.imageUrl

      // Upload image if a new file is selected
      if (imageFile) {
        const uploadedUrl = await uploadImageToSupabase(imageFile)
        if (uploadedUrl) {
          imageUrl = uploadedUrl
        } else {
          toast.error('Failed to upload image')
          setSaving(false)
          return
        }
      }

      const url = '/api/admin/blog'
      const method = editingPost ? 'PUT' : 'POST'
      const body = editingPost
        ? {
            id: editingPost.id,
            ...formData,
            imageUrl,
            documents: JSON.stringify(documents),
            keyDates: JSON.stringify(keyDates),
            sidebarSummary: JSON.stringify({items: sidebarItems.filter(item => item.label || item.value)})
          }
        : {
            ...formData,
            imageUrl,
            documents: JSON.stringify(documents),
            keyDates: JSON.stringify(keyDates),
            sidebarSummary: JSON.stringify({items: sidebarItems.filter(item => item.label || item.value)})
          }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body)
      })

      if (!response.ok) {
        throw new Error('Failed to save blog post')
      }

      toast.success(editingPost ? 'Blog post updated' : 'Blog post created')
      setIsDialogOpen(false)
      setImageFile(null)
      setImagePreview(null)
      fetchPosts()
    } catch (err) {
      console.error('Error saving blog post:', err)
      toast.error('Failed to save blog post')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/blog?id=${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to delete blog post')
      }

      toast.success('Blog post deleted')
      fetchPosts()
    } catch (err) {
      console.error('Error deleting blog post:', err)
      toast.error('Failed to delete blog post')
    }
  }

  // Selection handlers for bulk delete
  const currentPageItems = posts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const allCurrentPageSelected = currentPageItems.length > 0 &&
    currentPageItems.every(item => selectedIds.has(item.id))

  const handleSelectAll = (checked: boolean | 'indeterminate') => {
    if (checked === true) {
      const currentPageIds = currentPageItems.map(p => p.id)
      setSelectedIds(new Set(currentPageIds))
    } else {
      setSelectedIds(new Set())
    }
  }

  const handleSelectOne = (id: string, checked: boolean | 'indeterminate') => {
    const newSelected = new Set(selectedIds)
    if (checked === true) {
      newSelected.add(id)
    } else {
      newSelected.delete(id)
    }
    setSelectedIds(newSelected)
  }

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return

    setIsDeleting(true)
    try {
      const response = await fetch('/api/admin/blog', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ ids: Array.from(selectedIds) })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete blog posts')
      }

      toast.success(`Successfully deleted ${selectedIds.size} blog post(s)`)
      setSelectedIds(new Set())
      fetchPosts()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete blog posts')
    } finally {
      setIsDeleting(false)
    }
  }

  // Track scroll position for showing/hiding footer action bar
  useEffect(() => {
    const scrollContainer = document.querySelector('main.overflow-y-auto')

    const handleScroll = () => {
      if (scrollContainer) {
        const scrollTop = scrollContainer.scrollTop
        setIsHeaderVisible(scrollTop < 100)
      }
    }

    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll, { passive: true })
      handleScroll()
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', handleScroll)
      }
    }
  }, [])

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    )
  }

  if (!isAuthenticated || !adminUser) {
    return null
  }

  return (
    <AdminPageWrapper
      title="Blog Posts"
      description="Create and manage blog posts"
      stats={[
        { label: 'Total', value: posts.length, color: 'bg-blue-100 text-blue-800' },
        { label: 'Published', value: posts.filter(p => p.is_published).length, color: 'bg-green-100 text-green-800' },
        { label: 'Drafts', value: posts.filter(p => !p.is_published).length, color: 'bg-gray-100 text-gray-800' }
      ]}
      actions={
        <div className="flex gap-2 flex-wrap items-center">
          {selectedIds.size > 0 ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {isDeleting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="mr-2 h-4 w-4" />
                  )}
                  Delete ({selectedIds.size})
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-white">
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Blog Posts</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete {selectedIds.size} blog post(s)?
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteSelected}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : null}
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPosts}
            disabled={loading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => handleOpenDialog()}
            style={{ backgroundColor: '#2563eb' }}
            className="hover:opacity-90 text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Blog Post
          </Button>
        </div>
      }
    >
      {/* Blog Posts Table - Enhanced */}
      <Card className="shadow-sm border border-gray-100">
        <CardContent className="pt-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary-600" />
              <p className="mt-2 text-gray-600">Loading blog posts...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No Blog Posts Yet</h3>
              <p className="text-gray-500">Create your first blog post to get started</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={allCurrentPageSelected}
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all"
                        className="border-gray-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 data-[state=checked]:text-white"
                      />
                    </TableHead>
                    <TableHead className="text-base font-bold">Title</TableHead>
                    <TableHead className="text-base font-bold">Category</TableHead>
                    <TableHead className="text-base font-bold">Status</TableHead>
                    <TableHead className="text-base font-bold">Published</TableHead>
                    <TableHead className="text-base font-bold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {posts
                    .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                    .map((post) => (
                    <TableRow key={post.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.has(post.id)}
                          onCheckedChange={(checked) => handleSelectOne(post.id, checked)}
                          aria-label={`Select ${post.title}`}
                          className="border-gray-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 data-[state=checked]:text-white"
                        />
                      </TableCell>
                      <TableCell className="font-medium max-w-md">
                        <div>
                          <p className="font-semibold">{post.title}</p>
                          <p className="text-xs text-gray-500">{post.slug}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{formatCategory(post.category)}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {post.is_published ? (
                            <Badge className="bg-green-500 text-white">Published</Badge>
                          ) : (
                            <Badge variant="secondary">Draft</Badge>
                          )}
                          {post.is_breaking && (
                            <Badge className="bg-red-500 text-white">Breaking</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {post.published_at
                          ? format(new Date(post.published_at), 'dd/MM/yyyy')
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenDialog(post)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(post.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card View - Professional Design */}
            <div className="md:hidden space-y-3">
                {/* Mobile Select All */}
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <Checkbox
                    checked={allCurrentPageSelected}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all"
                    className="border-gray-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 data-[state=checked]:text-white"
                  />
                  <span className="text-sm text-gray-600">Select all on this page</span>
                </div>
                {posts
                  .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                  .map((post) => (
                  <Card key={post.id} className={`border shadow-sm hover:shadow-md transition-shadow ${selectedIds.has(post.id) ? 'border-blue-500 bg-blue-50/30' : 'border-gray-200'}`}>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        {/* Checkbox and Title */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <Checkbox
                              checked={selectedIds.has(post.id)}
                              onCheckedChange={(checked) => handleSelectOne(post.id, checked)}
                              aria-label={`Select ${post.title}`}
                              className="border-gray-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 data-[state=checked]:text-white"
                            />
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                <FileText className="h-4 w-4 text-blue-600" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-semibold text-sm text-gray-900 line-clamp-2">{post.title}</p>
                                <p className="text-xs text-gray-500 truncate">{post.slug}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-1 flex-shrink-0">
                            {post.is_published ? (
                              <Badge className="bg-green-500 text-white text-xs">Published</Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs">Draft</Badge>
                            )}
                            {post.is_breaking && (
                              <Badge className="bg-red-500 text-white text-xs">Breaking</Badge>
                            )}
                          </div>
                        </div>

                        {/* Category and Date */}
                        <div className="bg-gray-50 rounded-lg p-2.5">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs text-gray-500">Category</p>
                              <Badge variant="outline" className="text-xs mt-1">{formatCategory(post.category)}</Badge>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-500">Published</p>
                              <p className="text-xs font-medium text-gray-900 mt-1">
                                {post.published_at
                                  ? format(new Date(post.published_at), 'dd/MM/yyyy')
                                  : '-'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-2 border-t border-gray-100">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenDialog(post)}
                            className="flex-1 bg-gradient-to-r from-blue-50 to-blue-50 hover:from-blue-100 hover:to-blue-100 border-blue-200 text-blue-700 font-medium"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(post.id)}
                            className="px-3 border-red-200 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>

            {/* Pagination */}
            <AdminPagination
              currentPage={currentPage}
              totalItems={posts.length}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setCurrentPage}
              itemName="posts"
            />
          </>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[90vw] sm:max-w-5xl max-h-[90vh] overflow-y-auto bg-white p-10 sm:p-10">
          <DialogHeader className="mb-4">
            <DialogTitle>
              {editingPost ? 'Edit Blog Post' : 'Create New Blog Post'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title <span className="text-red-500">*</span></label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter blog title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Subtitle <span className="text-red-500">*</span></label>
              <Input
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                placeholder="Brief description under the title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Excerpt <span className="text-red-500">*</span></label>
              <Textarea
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                placeholder="Brief description of the blog post"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Content <span className="text-red-500">*</span></label>
              <RichTextEditor
                value={formData.content}
                onChange={(value) => setFormData({ ...formData, content: value })}
                placeholder="Write your blog content here..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Author</label>
                <Input
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  placeholder="Author name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <Input
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., technology, compliance"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Read Time</label>
              <Input
                value={formData.readTime}
                onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                placeholder="e.g., 5 min read"
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium mb-1">Featured Image</label>
              {/* The article hero crops to 21:9, so ask for that shape here. */}
              <p className="text-xs text-gray-500 mb-2">
                Recommended 1920 x 820 px (21:9). Other sizes are cropped to this shape from the centre.
              </p>

              {imagePreview ? (
                <div className="relative w-full aspect-[21/9] border-2 border-gray-300 rounded-lg overflow-hidden">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    disabled={uploadingImage}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="w-full">
                  <label className="flex flex-col items-center justify-center w-full aspect-[21/9] border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-10 h-10 mb-3 text-gray-400" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF, WebP (MAX. 10MB) &middot; 1920 x 820 px recommended</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      onChange={handleImageSelect}
                      disabled={uploadingImage}
                    />
                  </label>
                </div>
              )}

              {uploadingImage && (
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Uploading image...</span>
                </div>
              )}
            </div>

            {/* Documents Section */}
            <div className="border-t pt-4">
              <label className="block text-sm font-medium mb-3">Attach Documents</label>
              <p className="text-xs text-gray-500 mb-3">Add downloadable resources like PDFs, checklists, or forms</p>
              {documents.map((doc, index) => (
                <div key={index} className="flex flex-col gap-2 mb-4 p-3 border rounded-lg bg-gray-50">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Document title (e.g., CBDT Notification PDF)"
                      value={doc.title}
                      onChange={(e) => {
                        const newDocs = [...documents]
                        newDocs[index].title = e.target.value
                        setDocuments(newDocs)
                      }}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setDocuments(documents.filter((_, i) => i !== index))}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="flex-1">
                      <div className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed rounded-md cursor-pointer hover:bg-gray-100 transition-colors">
                        {doc.uploading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-sm">Uploading...</span>
                          </>
                        ) : doc.url ? (
                          <>
                            <FileText className="w-4 h-4 text-green-600" />
                            <span className="text-sm text-green-600 truncate max-w-[200px]">
                              {doc.file?.name || 'Document uploaded'}
                            </span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            <span className="text-sm">Choose file or drag & drop</span>
                          </>
                        )}
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain"
                        onChange={(e) => handleDocumentSelect(e, index)}
                        disabled={doc.uploading}
                      />
                    </label>
                    {doc.url && (
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline"
                      >
                        View
                      </a>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">PDF, DOC, DOCX, XLS, XLSX, TXT (MAX. 20MB)</p>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDocuments([...documents, {title: '', url: ''}])}
                className="mt-2"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Document
              </Button>
            </div>

            <div className="flex gap-4 border-t pt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">Publish immediately</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isBreaking}
                  onChange={(e) => setFormData({ ...formData, isBreaking: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">Mark as breaking news</span>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={saving}
                className="border-gray-300 hover:bg-gray-100 hover:text-gray-900"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  editingPost ? 'Update Post' : 'Create Post'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

        {/* Fixed Bottom Action Bar - Shows when items selected AND header is not visible */}
        {selectedIds.size > 0 && !isHeaderVisible && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-300 shadow-[0_-4px_20px_rgba(0,0,0,0.15)] p-4 z-[9999] lg:left-64">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">
                  {selectedIds.size} item{selectedIds.size > 1 ? 's' : ''} selected
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedIds(new Set())}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Clear
                </Button>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="sm"
                    disabled={isDeleting}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {isDeleting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="mr-2 h-4 w-4" />
                    )}
                    Delete ({selectedIds.size})
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-white">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Blog Posts</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete {selectedIds.size} blog post(s)?
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteSelected}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        )}
    </AdminPageWrapper>
  )
}
