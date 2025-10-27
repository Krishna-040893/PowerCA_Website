'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { AdminPageWrapper } from '@/components/admin/admin-page-wrapper'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Loader2, RefreshCw, Plus, Edit, Trash2, FileText, Eye, Upload, X } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { createClient } from '@supabase/supabase-js'
import { RichTextEditor } from '@/components/admin/rich-text-editor'

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
}

export default function AdminBlogPage() {
  const { isAuthenticated, isLoading: authLoading, adminUser } = useAdminAuth()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
      const { data, error } = await supabase.storage
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
      const { data, error } = await supabase.storage
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
        subtitle: (post as any).subtitle || '',
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
      console.log('Loading post data:', {
        documents: (post as any).documents,
        key_dates: (post as any).key_dates,
        sidebar_summary: (post as any).sidebar_summary
      })
      setDocuments((post as any).documents || [])
      setKeyDates((post as any).key_dates || [])
      setSidebarItems((post as any).sidebar_summary?.items || [{label: 'Previous Deadline', value: ''}, {label: 'New Deadline', value: ''}])
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

      console.log('Saving blog post with data:', {
        documents,
        keyDates,
        sidebarItems,
        documentsString: JSON.stringify(documents),
        keyDatesString: JSON.stringify(keyDates)
      })

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
      title="Blog Management"
      description="Create and manage blog posts"
      actions={
        <div className="flex gap-2">
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
          >
            <Plus className="mr-2 h-4 w-4" />
            New Blog Post
          </Button>
        </div>
      }
    >
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Posts</p>
                <p className="text-3xl font-bold text-gray-900">{posts.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Published</p>
                <p className="text-3xl font-bold text-green-600">
                  {posts.filter(p => p.is_published).length}
                </p>
              </div>
              <Eye className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Drafts</p>
                <p className="text-3xl font-bold text-orange-600">
                  {posts.filter(p => !p.is_published).length}
                </p>
              </div>
              <Edit className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Blog Posts Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Blog Posts</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary-600" />
              <p className="mt-2 text-gray-600">Loading blog posts...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No blog posts found. Create your first one!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>TITLE</TableHead>
                    <TableHead>CATEGORY</TableHead>
                    <TableHead>STATUS</TableHead>
                    <TableHead>PUBLISHED</TableHead>
                    <TableHead>ACTIONS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {posts.map((post) => (
                    <TableRow key={post.id}>
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
                            <Badge className="bg-green-500">Published</Badge>
                          ) : (
                            <Badge variant="secondary">Draft</Badge>
                          )}
                          {post.is_breaking && (
                            <Badge className="bg-red-500">Breaking</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {post.published_at
                          ? format(new Date(post.published_at), 'MMM dd, yyyy')
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
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[90vw] sm:max-w-5xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle>
              {editingPost ? 'Edit Blog Post' : 'Create New Blog Post'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title *</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter blog title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Subtitle *</label>
              <Input
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                placeholder="Brief description under the title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Excerpt *</label>
              <Textarea
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                placeholder="Brief description of the blog post"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Content *</label>
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
              <label className="block text-sm font-medium mb-2">Featured Image</label>

              {imagePreview ? (
                <div className="relative w-full h-48 border-2 border-gray-300 rounded-lg overflow-hidden">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
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
                  <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-10 h-10 mb-3 text-gray-400" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF, WebP (MAX. 10MB)</p>
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
              <label className="block text-sm font-medium mb-3">Attach Documents *</label>
              <p className="text-xs text-gray-500 mb-3">Add downloadable resources like PDFs, checklists, or forms</p>
              {documents.map((doc, index) => (
                <div key={index} className="flex flex-col gap-2 mb-4 p-3 border rounded-lg bg-gray-50">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Document title * (e.g., CBDT Notification PDF)"
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
    </AdminPageWrapper>
  )
}
