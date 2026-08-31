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
import { Loader2, RefreshCw, Plus, Trash2, Upload, X, ArrowUp, ArrowDown, Eye, EyeOff } from 'lucide-react'
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

  const updatePoster = async (id: string, changes: Record<string, unknown>) => {
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
        return
      }

      fetchPosters()
    } catch {
      toast.error('Failed to update poster')
    } finally {
      setBusyId(null)
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
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posters.map((poster, index) => (
            <Card key={poster.id} className={poster.is_published ? '' : 'opacity-60'}>
              <CardContent className="p-4">
                <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-gray-100 mb-3">
                  <Image
                    src={poster.image_url}
                    alt={poster.alt_text}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>

                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="font-semibold text-sm text-gray-900 line-clamp-2">{poster.title}</p>
                  <Badge className={poster.is_published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                    {poster.is_published ? 'Live' : 'Hidden'}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 line-clamp-2 mb-4">{poster.alt_text}</p>

                <div className="flex items-center gap-1 flex-wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={index === 0 || busyId === poster.id}
                    onClick={() => movePoster(index, -1)}
                    aria-label="Move earlier"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={index === posters.length - 1 || busyId === poster.id}
                    onClick={() => movePoster(index, 1)}
                    aria-label="Move later"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busyId === poster.id}
                    onClick={() => updatePoster(poster.id, { isPublished: !poster.is_published })}
                  >
                    {poster.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
              </CardContent>
            </Card>
          ))}
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
    </AdminPageWrapper>
  )
}
