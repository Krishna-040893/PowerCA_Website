'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { AdminPageWrapper } from '@/components/admin/admin-page-wrapper'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Loader2, RefreshCw, Plus, Trash2, Upload, X, ArrowUp, ArrowDown, Eye, EyeOff, Pencil, Search, List, LayoutGrid, Grid3x3 } from 'lucide-react'
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
import { toast } from 'sonner'

interface Poster {
  id: string
  title: string
  alt_text: string
  image_url: string
  display_order: number
  is_published: boolean
  created_at: string
}

export default function AdminPostersPage() {
  const { isAuthenticated, isLoading: authLoading, adminUser } = useAdminAuth()
  const [posters, setPosters] = useState<Poster[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [editing, setEditing] = useState<Poster | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editAltText, setEditAltText] = useState('')
  const [isSavingEdit, setIsSavingEdit] = useState(false)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'hidden'>('all')
  const [view, setView] = useState<'list' | 'large' | 'small'>('large')

  const [title, setTitle] = useState('')
  const [altText, setAltText] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const fetchPosters = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/posters')
      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Failed to load posters')
        return
      }

      setPosters(data.posters ?? [])
    } catch {
      toast.error('Failed to load posters')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      fetchPosters()
    }
  }, [isAuthenticated, fetchPosters])

  // Release the object URL created for the upload preview.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const resetForm = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setTitle('')
    setAltText('')
    setFile(null)
    setPreviewUrl(null)
  }

  const handleFileChange = (selected: File | null) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)

    if (!selected) {
      setFile(null)
      setPreviewUrl(null)
      return
    }

    setFile(selected)
    setPreviewUrl(URL.createObjectURL(selected))
  }

  const handleUpload = async () => {
    if (!file) {
      toast.error('Choose a poster image first')
      return
    }
    if (!title.trim()) {
      toast.error('Enter a title')
      return
    }
    if (!altText.trim()) {
      toast.error('Enter alt text so the poster is accessible')
      return
    }

    setIsSaving(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('title', title.trim())
      formData.append('altText', altText.trim())

      const response = await fetch('/api/admin/posters', { method: 'POST', body: formData })
      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Failed to upload poster')
        return
      }

      toast.success('Poster added')
      resetForm()
      setIsDialogOpen(false)
      fetchPosters()
    } catch {
      toast.error('Failed to upload poster')
    } finally {
      setIsSaving(false)
    }
  }

  const updatePoster = async (id: string, changes: Record<string, unknown>): Promise<boolean> => {
    setBusyId(id)
    try {
      const response = await fetch('/api/admin/posters', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...changes }),
      })
      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Failed to update poster')
        return false
      }

      fetchPosters()
      return true
    } catch {
      toast.error('Failed to update poster')
      return false
    } finally {
      setBusyId(null)
    }
  }

  const openEdit = (poster: Poster) => {
    setEditing(poster)
    setEditTitle(poster.title)
    setEditAltText(poster.alt_text)
  }

  const handleSaveEdit = async () => {
    if (!editing) return
    if (!editTitle.trim()) {
      toast.error('Enter a title')
      return
    }
    if (!editAltText.trim()) {
      toast.error('Enter alt text so the poster is accessible')
      return
    }

    setIsSavingEdit(true)
    const ok = await updatePoster(editing.id, {
      title: editTitle.trim(),
      altText: editAltText.trim(),
    })
    setIsSavingEdit(false)

    if (ok) {
      toast.success('Poster updated')
      setEditing(null)
    }
  }

  const handleDelete = async (id: string) => {
    setBusyId(id)
    try {
      const response = await fetch(`/api/admin/posters?id=${id}`, { method: 'DELETE' })
      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Failed to delete poster')
        return
      }

      toast.success('Poster deleted')
      fetchPosters()
    } catch {
      toast.error('Failed to delete poster')
    } finally {
      setBusyId(null)
    }
  }

  // Swap display_order with the neighbouring poster to move it up or down.
  const movePoster = async (index: number, direction: -1 | 1) => {
    const target = posters[index + direction]
    const current = posters[index]
    if (!target || !current) return

    setBusyId(current.id)
    try {
      await Promise.all([
        fetch('/api/admin/posters', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: current.id, displayOrder: target.display_order }),
        }),
        fetch('/api/admin/posters', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: target.id, displayOrder: current.display_order }),
        }),
      ])
      fetchPosters()
    } catch {
      toast.error('Failed to reorder posters')
    } finally {
      setBusyId(null)
    }
  }

  // Filtering only changes what is shown. Reordering still works against the
  // real position in the full list, so arrows behave correctly while filtered.
  const search = query.trim().toLowerCase()
  const visiblePosters = posters.filter((poster) => {
    const matchesSearch =
      !search ||
      poster.title.toLowerCase().includes(search) ||
      poster.alt_text.toLowerCase().includes(search)
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'published' ? poster.is_published : !poster.is_published)
    return matchesSearch && matchesStatus
  })

  const gridClass =
    view === 'list'
      ? 'flex flex-col gap-3'
      : view === 'small'
        ? 'grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6'
        : 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3'

  const renderActions = (poster: Poster, realIndex: number) => (
    <div className="flex items-center gap-1 flex-wrap">
      <Button
        size="sm"
        variant="outline"
        disabled={realIndex === 0 || busyId === poster.id}
        onClick={() => movePoster(realIndex, -1)}
        aria-label="Move earlier"
      >
        <ArrowUp className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={realIndex === posters.length - 1 || busyId === poster.id}
        onClick={() => movePoster(realIndex, 1)}
        aria-label="Move later"
      >
        <ArrowDown className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={busyId === poster.id}
        onClick={() => updatePoster(poster.id, { isPublished: !poster.is_published })}
        aria-label={poster.is_published ? 'Hide from homepage' : 'Show on homepage'}
      >
        {poster.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={busyId === poster.id}
        onClick={() => openEdit(poster)}
        aria-label="Edit title and description"
      >
        <Pencil className="h-4 w-4" />
      </Button>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            size="sm"
            variant="outline"
            disabled={busyId === poster.id}
            className="text-red-600 hover:text-red-700 ml-auto"
            aria-label="Delete poster"
          >
            {busyId === poster.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this poster?</AlertDialogTitle>
            <AlertDialogDescription>
              {poster.title} will be removed from the homepage carousel and its image deleted from storage. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => handleDelete(poster.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )

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
      title="Homepage Posters"
      description="Posters shown in the PowerCA at a Glance carousel on the homepage"
      stats={[
        { label: 'Total', value: posters.length, color: 'bg-blue-100 text-blue-800' },
        { label: 'Published', value: posters.filter(p => p.is_published).length, color: 'bg-green-100 text-green-800' },
        { label: 'Hidden', value: posters.filter(p => !p.is_published).length, color: 'bg-gray-100 text-gray-800' },
      ]}
      actions={
        <div className="flex gap-2 flex-wrap items-center">
          <Button size="sm" variant="outline" onClick={fetchPosters} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Poster
          </Button>
        </div>
      }
    >
      {/* Search, status filter and view switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search posters by title or description"
            className="pl-9 pr-9"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center rounded-lg border p-0.5 bg-white">
            {([
              ['all', 'All'],
              ['published', 'Live'],
              ['hidden', 'Hidden'],
            ] as const).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setStatusFilter(value)}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors cursor-pointer ${
                  statusFilter === value ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex items-center rounded-lg border p-0.5 bg-white">
            {([
              ['list', List, 'List view'],
              ['large', LayoutGrid, 'Large thumbnails'],
              ['small', Grid3x3, 'Small thumbnails'],
            ] as const).map(([value, Icon, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setView(value)}
                aria-label={label}
                aria-pressed={view === value}
                title={label}
                className={`p-2 rounded-md transition-colors cursor-pointer ${
                  view === value ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      ) : posters.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Upload className="mx-auto h-10 w-10 text-gray-400 mb-4" />
            <p className="text-gray-600 mb-1">No posters yet</p>
            <p className="text-sm text-gray-500 mb-6">
              Until you add one, the homepage shows the built-in PowerCA overview slides.
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add your first poster
            </Button>
          </CardContent>
        </Card>
      ) : visiblePosters.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Search className="mx-auto h-10 w-10 text-gray-400 mb-4" />
            <p className="text-gray-600 mb-1">No posters match your filters</p>
            <p className="text-sm text-gray-500 mb-6">Try a different search term or status.</p>
            <Button
              variant="outline"
              onClick={() => { setQuery(''); setStatusFilter('all') }}
            >
              Clear filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className={gridClass}>
          {visiblePosters.map((poster) => {
            const realIndex = posters.findIndex((p) => p.id === poster.id)

            if (view === 'list') {
              return (
                <Card key={poster.id} className={poster.is_published ? '' : 'opacity-60'}>
                  <CardContent className="p-3 sm:p-4 flex flex-col sm:flex-row gap-4">
                    <div className="relative w-full sm:w-32 md:w-40 shrink-0 aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <Image
                        src={poster.image_url}
                        alt={poster.alt_text}
                        fill
                        className="object-cover"
                        sizes="160px"
                      />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="font-semibold text-sm sm:text-base text-gray-900">{poster.title}</p>
                        <Badge className={poster.is_published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {poster.is_published ? 'Live' : 'Hidden'}
                        </Badge>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-500 line-clamp-3 mb-3">{poster.alt_text}</p>
                      <div className="mt-auto">{renderActions(poster, realIndex)}</div>
                    </div>
                  </CardContent>
                </Card>
              )
            }

            const compact = view === 'small'

            return (
              <Card key={poster.id} className={poster.is_published ? '' : 'opacity-60'}>
                <CardContent className={compact ? 'p-2.5' : 'p-4'}>
                  <div className={`relative w-full aspect-square rounded-lg overflow-hidden bg-gray-100 ${compact ? 'mb-2' : 'mb-3'}`}>
                    <Image
                      src={poster.image_url}
                      alt={poster.alt_text}
                      fill
                      className="object-cover"
                      sizes={compact
                        ? '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 17vw'
                        : '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'}
                    />
                  </div>

                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className={`font-semibold text-gray-900 line-clamp-2 ${compact ? 'text-xs' : 'text-sm'}`}>{poster.title}</p>
                    {!compact && (
                      <Badge className={poster.is_published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {poster.is_published ? 'Live' : 'Hidden'}
                      </Badge>
                    )}
                  </div>
                  {!compact && <p className="text-xs text-gray-500 line-clamp-2 mb-4">{poster.alt_text}</p>}

                  {renderActions(poster, realIndex)}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) resetForm()
        }}
      >
        <DialogContent className="bg-white max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Poster</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Poster image</label>
              {previewUrl ? (
                <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-gray-100">
                  {/* Local object URL preview, so a plain img is correct here. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previewUrl} alt="Poster preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleFileChange(null)}
                    className="absolute top-2 right-2 bg-white rounded-full p-1.5 shadow cursor-pointer"
                    aria-label="Remove selected image"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <Input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
                />
              )}
              <p className="text-xs text-gray-500 mt-1.5">
                PNG, JPEG or WebP, up to 5 MB. Square images (1200 x 1200) match the existing slides.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Billing Module"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Alt text</label>
              <Textarea
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                placeholder="Describe what the poster says, so search engines and screen readers can read it."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>
                Cancel
              </Button>
              <Button onClick={handleUpload} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Add Poster
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit an existing poster's wording. The image itself is not replaced -
          delete and re-add for that. */}
      <Dialog open={editing !== null} onOpenChange={(open) => { if (!open) setEditing(null) }}>
        <DialogContent className="bg-white max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Poster</DialogTitle>
          </DialogHeader>

          {editing && (
            <div className="space-y-4">
              <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-gray-100 max-h-56">
                <Image
                  src={editing.image_url}
                  alt={editing.alt_text}
                  fill
                  className="object-contain"
                  sizes="480px"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
                <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description / alt text</label>
                <Textarea
                  value={editAltText}
                  onChange={(e) => setEditAltText(e.target.value)}
                  rows={4}
                />
                <p className="text-xs text-gray-500 mt-1.5">
                  Shown under the title on the homepage carousel, and read by search engines and screen readers.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setEditing(null)} disabled={isSavingEdit}>
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit} disabled={isSavingEdit}>
                  {isSavingEdit ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminPageWrapper>
  )
}
