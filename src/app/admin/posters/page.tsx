'use client'

import { useState, useEffect, useCallback, type DragEvent } from 'react'
import Image from 'next/image'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { AdminPageWrapper } from '@/components/admin/admin-page-wrapper'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Loader2, RefreshCw, Plus, Trash2, Upload, X, ArrowUp, ArrowDown, Eye, EyeOff, Pencil, Search, List, LayoutGrid, Grid3x3, ChevronDown, GripVertical } from 'lucide-react'
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

// Kept in step with the limits enforced in src/app/api/admin/posters/route.ts
const MAX_FILE_BYTES = 5 * 1024 * 1024
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp']

interface Poster {
  id: string
  title: string
  alt_text: string
  image_url: string
  category: string | null
  display_order: number
  is_published: boolean
  created_at: string
}

// A text field that also suggests categories already in use. Free text rather
// than a Select, because a new category has to be typeable.
function CategoryInput({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (next: string) => void
  options: string[]
}) {
  const [open, setOpen] = useState(false)
  // Focusing shows every category; the list only narrows once the admin types.
  const [typing, setTyping] = useState(false)

  const typed = value.trim().toLowerCase()
  const matches = typing && typed
    ? options.filter((option) => option.toLowerCase().includes(typed))
    : options

  return (
    <div className="relative">
      <Input
        value={value}
        onChange={(e) => {
          setTyping(true)
          setOpen(true)
          onChange(e.target.value)
        }}
        onFocus={() => {
          setTyping(false)
          setOpen(true)
        }}
        onBlur={() => setOpen(false)}
        placeholder="e.g. Modules"
        autoComplete="off"
        className="pr-9"
      />

      {options.length > 0 && (
        <button
          type="button"
          tabIndex={-1}
          aria-label={open ? 'Hide categories' : 'Show categories'}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            setTyping(false)
            setOpen((value) => !value)
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
        >
          <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      )}

      {open && matches.length > 0 && (
        <ul className="absolute left-0 right-0 top-full z-50 mt-1 max-h-48 overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
          {matches.map((option) => {
            const selected = option.toLowerCase() === typed

            return (
              <li key={option}>
                <button
                  type="button"
                  // Keeps the field focused so the click lands before the blur.
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onChange(option)
                    setOpen(false)
                  }}
                  className={`w-full px-3 py-2 text-left text-sm cursor-pointer ${
                    selected ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-900 hover:bg-blue-50'
                  }`}
                >
                  {option}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
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
  const [editCategory, setEditCategory] = useState('')
  const [isSavingEdit, setIsSavingEdit] = useState(false)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'hidden'>('all')
  const [view, setView] = useState<'list' | 'large' | 'small'>('large')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [renamingFrom, setRenamingFrom] = useState<string | null>(null)
  const [renameTo, setRenameTo] = useState('')
  const [renaming, setRenaming] = useState(false)
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  // The reorder dialog works on its own copy of the list, so dragging rows
  // around only touches the database once "Save New Order" is pressed.
  const [isReorderOpen, setIsReorderOpen] = useState(false)
  const [reorderList, setReorderList] = useState<Poster[]>([])
  const [reorderDragId, setReorderDragId] = useState<string | null>(null)
  const [reorderOverId, setReorderOverId] = useState<string | null>(null)
  const [isSavingOrder, setIsSavingOrder] = useState(false)

  const [title, setTitle] = useState('')
  const [altText, setAltText] = useState('')
  const [category, setCategory] = useState('')
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

  // Remove a category. The posters stay; they simply lose the tag.
  const deleteCategory = async (name: string) => {
    setRenaming(true)
    try {
      const response = await fetch(`/api/admin/posters/categories?name=${encodeURIComponent(name)}`, {
        method: 'DELETE',
      })
      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Failed to remove the category')
        return
      }

      toast.success(`Removed from ${data.cleared} poster${data.cleared === 1 ? '' : 's'}`)
      if (categoryFilter === name) setCategoryFilter('all')
      fetchPosters()
    } catch {
      toast.error('Failed to remove the category')
    } finally {
      setRenaming(false)
    }
  }

  // Rename a category everywhere it is used.
  const renameCategory = async () => {
    if (!renamingFrom) return

    const to = renameTo.trim()
    if (!to) {
      toast.error('Enter a new category name')
      return
    }

    setRenaming(true)
    try {
      const response = await fetch('/api/admin/posters/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: renamingFrom, to }),
      })
      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Failed to rename the category')
        return
      }

      toast.success(`Renamed to ${to} on ${data.renamed} poster${data.renamed === 1 ? '' : 's'}`)
      if (categoryFilter === renamingFrom) setCategoryFilter(to)
      setRenamingFrom(null)
      setRenameTo('')
      fetchPosters()
    } catch {
      toast.error('Failed to rename the category')
    } finally {
      setRenaming(false)
    }
  }

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
    setCategory('')
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

    // Check the file here as well as on the server, so the reason is obvious
    // straight away rather than after a round trip.
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error(`That file is a ${file.type || 'unknown type'}. Use a PNG, JPEG or WebP image.`)
      return
    }
    if (file.size > MAX_FILE_BYTES) {
      toast.error(`That image is ${(file.size / 1024 / 1024).toFixed(1)} MB. The limit is 5 MB.`)
      return
    }

    setIsSaving(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('title', title.trim())
      formData.append('altText', altText.trim())
      formData.append('category', category.trim())

      const response = await fetch('/api/admin/posters', { method: 'POST', body: formData })

      // A rejection from the platform (rather than our route) may not be JSON,
      // so fall back to the status rather than swallowing the reason.
      let data: { error?: string } = {}
      try {
        data = await response.json()
      } catch {
        if (!response.ok) {
          toast.error(`Upload rejected by the server (HTTP ${response.status}). The image may be too large.`)
          return
        }
      }

      if (!response.ok) {
        toast.error(data.error || `Upload failed (HTTP ${response.status})`)
        return
      }

      toast.success('Poster added')
      resetForm()
      setIsDialogOpen(false)
      fetchPosters()
    } catch (error) {
      const detail = error instanceof Error ? error.message : 'unknown error'
      toast.error(`Could not reach the server: ${detail}`)
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
    setEditCategory(poster.category ?? '')
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
      category: editCategory.trim(),
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

  // Move a poster into any position using the display-order values already
  // assigned to the list. This keeps drag-and-drop consistent with the arrow
  // controls and preserves the exact order in the homepage carousel.
  const reorderPoster = async (sourceId: string, destinationId: string) => {
    const sourceIndex = posters.findIndex((poster) => poster.id === sourceId)
    const destinationIndex = posters.findIndex((poster) => poster.id === destinationId)
    if (sourceIndex < 0 || destinationIndex < 0 || sourceIndex === destinationIndex) return

    const reordered = [...posters]
    const [moved] = reordered.splice(sourceIndex, 1)
    reordered.splice(destinationIndex, 0, moved)
    const orderSlots = posters.map((poster) => poster.display_order)
    const updates = reordered
      .map((poster, index) => ({ id: poster.id, displayOrder: orderSlots[index], currentOrder: poster.display_order }))
      .filter((update) => update.displayOrder !== update.currentOrder)

    setBusyId(sourceId)
    try {
      const responses = await Promise.all(updates.map((update) =>
        fetch('/api/admin/posters', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: update.id, displayOrder: update.displayOrder }),
        })
      ))

      if (responses.some((response) => !response.ok)) {
        throw new Error('Failed to reorder posters')
      }

      toast.success('Poster position updated')
      fetchPosters()
    } catch {
      toast.error('Failed to reorder posters')
    } finally {
      setBusyId(null)
    }
  }

  const handleDragStart = (event: DragEvent<HTMLDivElement>, posterId: string) => {
    if (busyId) {
      event.preventDefault()
      return
    }

    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', posterId)
    setDraggedId(posterId)
  }

  const handleDragOver = (event: DragEvent<HTMLDivElement>, posterId: string) => {
    if (!draggedId || draggedId === posterId || busyId) return
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    setDragOverId(posterId)
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>, destinationId: string) => {
    event.preventDefault()
    const sourceId = event.dataTransfer.getData('text/plain') || draggedId
    setDraggedId(null)
    setDragOverId(null)
    if (sourceId) void reorderPoster(sourceId, destinationId)
  }

  const handleDragEnd = () => {
    setDraggedId(null)
    setDragOverId(null)
  }

  // Open the reorder dialog with a snapshot of the current order.
  const openReorder = () => {
    setReorderList(posters)
    setReorderDragId(null)
    setReorderOverId(null)
    setIsReorderOpen(true)
  }

  // Move a row within the dialog's local copy only.
  const moveInReorderList = (sourceId: string, destinationId: string) => {
    setReorderList((current) => {
      const sourceIndex = current.findIndex((poster) => poster.id === sourceId)
      const destinationIndex = current.findIndex((poster) => poster.id === destinationId)
      if (sourceIndex < 0 || destinationIndex < 0 || sourceIndex === destinationIndex) return current

      const next = [...current]
      const [moved] = next.splice(sourceIndex, 1)
      next.splice(destinationIndex, 0, moved)
      return next
    })
  }

  // Write the dialog's order back, reusing the display-order slots the posters
  // already occupy so the homepage carousel keeps the same positions.
  const saveReorder = async () => {
    const orderSlots = posters.map((poster) => poster.display_order)
    const updates = reorderList
      .map((poster, index) => ({ id: poster.id, displayOrder: orderSlots[index], currentOrder: poster.display_order }))
      .filter((update) => update.displayOrder !== update.currentOrder)

    if (updates.length === 0) {
      setIsReorderOpen(false)
      return
    }

    setIsSavingOrder(true)
    try {
      const responses = await Promise.all(updates.map((update) =>
        fetch('/api/admin/posters', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: update.id, displayOrder: update.displayOrder }),
        })
      ))

      if (responses.some((response) => !response.ok)) {
        throw new Error('Failed to reorder posters')
      }

      toast.success('Poster order saved')
      setIsReorderOpen(false)
      fetchPosters()
    } catch {
      toast.error('Failed to reorder posters')
    } finally {
      setIsSavingOrder(false)
    }
  }

  // Filtering only changes what is shown. Reordering still works against the
  // real position in the full list, so arrows behave correctly while filtered.
  const existingCategories = Array.from(new Set(posters.map((p) => p.category).filter((c): c is string => Boolean(c)))).sort()

  const search = query.trim().toLowerCase()
  const visiblePosters = posters.filter((poster) => {
    const matchesSearch =
      !search ||
      poster.title.toLowerCase().includes(search) ||
      poster.alt_text.toLowerCase().includes(search)
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'published' ? poster.is_published : !poster.is_published)
    const matchesCategory =
      categoryFilter === 'all' ||
      (categoryFilter === 'none' ? !poster.category : poster.category === categoryFilter)
    return matchesSearch && matchesStatus && matchesCategory
  })

  const gridClass =
    view === 'list'
      ? 'flex flex-col gap-3'
      : view === 'small'
        ? 'grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6'
        : 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3'

  const renderActions = (poster: Poster, realIndex: number) => (
    <div className="flex items-center gap-1 flex-wrap">
      <span
        title="Drag this poster to a new position"
        className="inline-flex h-8 w-6 items-center justify-center text-gray-400 cursor-grab active:cursor-grabbing"
        aria-hidden="true"
      >
        <GripVertical className="h-4 w-4" />
      </span>
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
      description="Posters shown in the Power CA at a Glance carousel on the homepage"
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
          <Button
            size="sm"
            onClick={() => setIsDialogOpen(true)}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Poster
          </Button>
        </div>
      }
    >
      {/* Categories, renameable in place */}
      {existingCategories.length > 0 && (
        <Card className="mb-5 py-3">
          <CardContent className="py-0">
            <p className="text-sm font-semibold text-gray-900 mb-2">
              Categories
              <span className="font-normal text-gray-500"> — click to rename everywhere</span>
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {existingCategories.map((name) => {
                const count = posters.filter((poster) => poster.category === name).length

                if (renamingFrom === name) {
                  return (
                    <div key={name} className="flex items-center gap-2">
                      <Input
                        value={renameTo}
                        onChange={(e) => setRenameTo(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') renameCategory()
                          if (e.key === 'Escape') setRenamingFrom(null)
                        }}
                        autoFocus
                        className="h-9 w-44"
                      />
                      <Button
                        size="sm"
                        onClick={renameCategory}
                        disabled={renaming}
                        className="bg-blue-600 text-white hover:bg-blue-700"
                      >
                        {renaming ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setRenamingFrom(null)} disabled={renaming}>
                        Cancel
                      </Button>
                    </div>
                  )
                }

                return (
                  <div
                    key={name}
                    className="inline-flex items-center gap-2 rounded-full border bg-white pl-3 pr-2 py-1.5 text-sm text-gray-700"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setRenamingFrom(name)
                        setRenameTo(name)
                      }}
                      title={`Rename ${name}`}
                      className="inline-flex items-center gap-2 hover:text-blue-700 cursor-pointer"
                    >
                      {name}
                      <span className="text-xs text-gray-400 tabular-nums">{count}</span>
                      <Pencil className="h-3.5 w-3.5" />
                    </button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button
                          type="button"
                          disabled={renaming}
                          title={`Remove ${name}`}
                          aria-label={`Remove ${name}`}
                          className="text-gray-400 hover:text-red-600 cursor-pointer disabled:opacity-50"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-white">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove the {name} category?</AlertDialogTitle>
                          <AlertDialogDescription>
                            The {count} poster{count === 1 ? '' : 's'} using it will stay on the site and keep
                            their images — they simply lose this category, and the filter tab disappears.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700 text-white"
                            onClick={() => deleteCategory(name)}
                          >
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search, status filter and view switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-5">
        <div className="relative w-full lg:flex-1 lg:min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search posters"
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

        <div className="flex items-center gap-2 flex-wrap lg:ml-auto">
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

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            aria-label="Filter by category"
            className="h-9 rounded-lg border bg-white px-3 text-sm text-gray-700 cursor-pointer"
          >
            <option value="all">All categories</option>
            {existingCategories.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
            <option value="none">Uncategorised</option>
          </select>

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

          <Button variant="outline" onClick={openReorder} disabled={posters.length < 2} className="h-9 rounded-lg border bg-white px-3 text-sm font-normal text-gray-700 cursor-pointer">
            <GripVertical className="h-4 w-4 mr-2" />
            Reorder Posters
          </Button>
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
              Until you add one, the homepage shows the built-in Power CA overview slides.
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
        <>
          <p className="mb-3 text-sm text-gray-500">Drag a poster card and drop it on another card to set its position in the homepage carousel.</p>
          <div className={gridClass}>
          {visiblePosters.map((poster) => {
            const realIndex = posters.findIndex((p) => p.id === poster.id)
            const isDragged = draggedId === poster.id
            const isDropTarget = dragOverId === poster.id
            const dragClass = `${isDragged ? 'opacity-40' : ''} ${isDropTarget ? 'ring-2 ring-blue-600 ring-offset-2' : ''}`
            const dragEvents = {
              draggable: !busyId,
              onDragStart: (event: DragEvent<HTMLDivElement>) => handleDragStart(event, poster.id),
              onDragOver: (event: DragEvent<HTMLDivElement>) => handleDragOver(event, poster.id),
              onDragLeave: () => {
                if (dragOverId === poster.id) setDragOverId(null)
              },
              onDrop: (event: DragEvent<HTMLDivElement>) => handleDrop(event, poster.id),
              onDragEnd: handleDragEnd,
            }

            if (view === 'list') {
              return (
                <Card
                  key={poster.id}
                  {...dragEvents}
                  className={`${poster.is_published ? '' : 'opacity-60'} ${dragClass} cursor-grab active:cursor-grabbing transition-shadow`}
                >
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
              <Card
                key={poster.id}
                {...dragEvents}
                className={`${poster.is_published ? '' : 'opacity-60'} ${dragClass} cursor-grab active:cursor-grabbing transition-shadow`}
              >
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
        </>
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
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Category <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <CategoryInput value={category} onChange={setCategory} options={existingCategories} />
              <p className="text-xs text-gray-500 mt-1.5">
                Becomes a filter tab on the homepage. Reuse an existing name to group posters together.
              </p>
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
              <Button
                onClick={handleUpload}
                disabled={isSaving}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
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
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Category <span className="text-gray-400 font-normal">(optional)</span></label>
                <CategoryInput value={editCategory} onChange={setEditCategory} options={existingCategories} />
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
                <Button
                  onClick={handleSaveEdit}
                  disabled={isSavingEdit}
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
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

      {/* Reorder dialog: drag rows by the handle, then save the whole order. */}
      <Dialog open={isReorderOpen} onOpenChange={(open) => { if (!isSavingOrder) setIsReorderOpen(open) }}>
        <DialogContent className="bg-white max-w-lg">
          <DialogHeader>
            <DialogTitle>Reorder Content</DialogTitle>
          </DialogHeader>

          <div className="max-h-[420px] overflow-y-auto rounded-lg border divide-y">
            {reorderList.map((poster, index) => (
              <div
                key={poster.id}
                draggable={!isSavingOrder}
                onDragStart={(event) => {
                  if (isSavingOrder) {
                    event.preventDefault()
                    return
                  }
                  event.dataTransfer.effectAllowed = 'move'
                  event.dataTransfer.setData('text/plain', poster.id)
                  setReorderDragId(poster.id)
                }}
                onDragOver={(event) => {
                  if (!reorderDragId || reorderDragId === poster.id) return
                  event.preventDefault()
                  event.dataTransfer.dropEffect = 'move'
                  setReorderOverId(poster.id)
                }}
                onDragLeave={() => setReorderOverId((current) => (current === poster.id ? null : current))}
                onDrop={(event) => {
                  event.preventDefault()
                  const sourceId = event.dataTransfer.getData('text/plain') || reorderDragId
                  setReorderDragId(null)
                  setReorderOverId(null)
                  if (sourceId) moveInReorderList(sourceId, poster.id)
                }}
                onDragEnd={() => {
                  setReorderDragId(null)
                  setReorderOverId(null)
                }}
                className={`flex items-center gap-3 bg-white p-2 transition-colors ${
                  reorderDragId === poster.id ? 'opacity-50' : ''
                } ${reorderOverId === poster.id ? 'bg-blue-50' : ''}`}
              >
                <span
                  className="inline-flex h-9 w-8 shrink-0 items-center justify-center text-gray-400 cursor-grab active:cursor-grabbing"
                  title="Drag to a new position"
                  aria-hidden="true"
                >
                  <GripVertical className="h-4 w-4" />
                </span>

                <span className="w-6 shrink-0 text-right text-sm tabular-nums text-gray-500">
                  {index + 1}
                </span>

                <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded border bg-gray-50">
                  <Image
                    src={poster.image_url}
                    alt={poster.alt_text || poster.title}
                    fill
                    sizes="64px"
                    className="object-contain"
                  />
                </div>

                <span className="truncate text-sm text-gray-700">{poster.title}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button
              onClick={saveReorder}
              disabled={isSavingOrder}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              {isSavingOrder ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving
                </>
              ) : (
                'Save New Order'
              )}
            </Button>
            <Button variant="ghost" onClick={() => setIsReorderOpen(false)} disabled={isSavingOrder}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminPageWrapper>
  )
}
