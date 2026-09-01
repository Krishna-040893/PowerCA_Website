'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import Link from 'next/link'

type Poster = {
  src: string
  alt: string
  title: string
  description?: string
  category?: string
}

// Fallback slides shipped with the site, used until posters are uploaded from
// the admin portal (and if the posters request ever fails). Alt text carries
// the slide copy so the content stays available to search engines and screen
// readers even though the text lives inside the image.
const fallbackPosters: Poster[] = [
  {
    src: '/images/posters/01-cover.png',
    title: 'Run your practice from one screen',
    alt: 'PowerCA practice management software - run your entire CA practice from one screen. Six modules that replace the spreadsheets, shared folders and follow-up calls.',
  },
  {
    src: '/images/posters/02-job-card-management.png',
    title: 'Job Card Management',
    alt: 'Job Card Management module - comprehensive job management with an intuitive job dashboard, advanced search across jobs and seamless edit functions.',
  },
  {
    src: '/images/posters/03-clients-module.png',
    title: 'Clients Module',
    alt: 'Clients Module - centralized client management with detailed client profiles, document storage and full communication history.',
  },
  {
    src: '/images/posters/04-billing-module.png',
    title: 'Billing Module',
    alt: 'Billing Module - streamline invoicing with automated invoicing, payment tracking and GST compliance.',
  },
  {
    src: '/images/posters/05-financial-statements.png',
    title: 'Financial Statements',
    alt: 'Financial Statements module - generate balance sheets, P&L reports and accurate financial statements with real-time data sync.',
  },
  {
    src: '/images/posters/06-costing-module.png',
    title: 'Costing Module',
    alt: 'Costing Module - project cost tracking, profitability analysis and resource allocation with detailed cost analytics.',
  },
  {
    src: '/images/posters/07-crm-module.png',
    title: 'CRM Module',
    alt: 'CRM Module - build stronger client relationships with lead tracking, structured follow-ups and engagement analytics.',
  },
  {
    src: '/images/posters/08-call-to-action.png',
    title: 'Book a demo',
    alt: 'Ready to power your practice? Book a live demo and see all six PowerCA modules working end to end at powerca.in.',
  },
]

type ApiPoster = {
  id: string
  title: string
  alt_text: string
  image_url: string
  category: string | null
}

const ADVANCE_MS = 4500

function ArrowIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  )
}

function ExpandIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 9V5a1 1 0 011-1h4M20 9V5a1 1 0 00-1-1h-4M4 15v4a1 1 0 001 1h4M20 15v4a1 1 0 01-1 1h-4" />
    </svg>
  )
}

function FilterIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5h16M7 12h10M10 19h4" />
    </svg>
  )
}

function ChevronIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 9l6 6 6-6" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

function DownloadIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v12m0 0 4-4m-4 4-4-4m-5 7v2a1 1 0 001 1h16a1 1 0 001-1v-2" />
    </svg>
  )
}

export function OverviewCarousel() {
  const [allPosters, setAllPosters] = useState<Poster[]>(fallbackPosters)
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [filterOpen, setFilterOpen] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isHovering, setIsHovering] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [mounted, setMounted] = useState(false)
  const reducedMotion = useRef(false)
  const barRef = useRef<HTMLSpanElement>(null)
  const filterRef = useRef<HTMLDivElement>(null)
  const pausedRef = useRef(false)

  // The enlarged view is portalled to <body>, so it can only render client-side.
  useEffect(() => {
    setMounted(true)
    reducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  // Swap in the posters managed from the admin portal once they arrive. The
  // bundled set stays as a fallback if none are published or the fetch fails,
  // but is never shown while the request is still in flight.
  useEffect(() => {
    let cancelled = false

    const loadPosters = async () => {
      try {
        const response = await fetch('/api/posters')
        if (!response.ok) return

        const data = await response.json()
        const uploaded: ApiPoster[] = data?.posters ?? []
        const preferred: string = data?.defaultCategory || 'all'

        if (cancelled) return

        if (uploaded.length > 0) {
          setAllPosters(uploaded.map((poster) => ({
            src: poster.image_url,
            title: poster.title,
            alt: poster.alt_text || poster.title,
            description: poster.alt_text || undefined,
            category: poster.category || undefined,
          })))
          setActiveIndex(0)

          // Only honour the preference if that category still has posters.
          if (preferred !== 'all' && uploaded.some((poster) => poster.category === preferred)) {
            setActiveCategory(preferred)
          }
        }
      } catch {
        // Keep the bundled posters on screen.
      } finally {
        if (!cancelled) setLoaded(true)
      }
    }

    loadPosters()

    return () => {
      cancelled = true
    }
  }, [])

  const categories = Array.from(
    new Set(allPosters.map((poster) => poster.category).filter((c): c is string => Boolean(c)))
  )

  const posters = activeCategory === 'all'
    ? allPosters
    : allPosters.filter((poster) => poster.category === activeCategory)

  const step = useCallback((direction: -1 | 1) => {
    setActiveIndex((current) => (current + direction + posters.length) % posters.length)
  }, [posters.length])

  // Hovering the gallery, or opening the enlarged view, holds the progress bar
  // where it is. Kept in a ref so it never restarts the animation frame loop.
  useEffect(() => {
    pausedRef.current = isHovering || lightboxIndex !== null
  }, [isHovering, lightboxIndex])

  // The progress bar drives the rotation: it fills over ADVANCE_MS and advances
  // when it reaches the end. Written straight to the element's transform, so
  // filling the bar costs no React renders.
  useEffect(() => {
    if (!loaded || posters.length < 2 || reducedMotion.current) return

    let elapsed = 0
    let last = performance.now()
    let frame = 0

    const tick = (now: number) => {
      const delta = now - last
      last = now
      if (!pausedRef.current) elapsed += delta

      const progress = Math.min(1, elapsed / ADVANCE_MS)
      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${progress})`
      }

      if (progress >= 1) {
        step(1)
        return
      }

      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [loaded, activeIndex, posters.length, step])

  // Close the filter on an outside click or Escape.
  useEffect(() => {
    if (!filterOpen) return

    const onPointerDown = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setFilterOpen(false)
      }
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setFilterOpen(false)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [filterOpen])

  // Start again from the first poster whenever the filter changes.
  useEffect(() => {
    setActiveIndex(0)
  }, [activeCategory])

  const closeLightbox = useCallback(() => setLightboxIndex(null), [])

  const stepLightbox = useCallback((direction: -1 | 1) => {
    setLightboxIndex((current) => {
      if (current === null) return current
      return (current + direction + posters.length) % posters.length
    })
  }, [posters.length])

  // While the enlarged view is open, lock the page behind it and let the
  // keyboard drive it.
  useEffect(() => {
    if (lightboxIndex === null) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeLightbox()
      if (event.key === 'ArrowRight') stepLightbox(1)
      if (event.key === 'ArrowLeft') stepLightbox(-1)
    }

    window.addEventListener('keydown', onKeyDown)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [lightboxIndex, closeLightbox, stepLightbox])

  const caption = posters[activeIndex]

  const downloadPoster = useCallback(async () => {
    if (!caption) return

    const fileName = `${caption.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'powerca-poster'}.png`

    try {
      const response = await fetch(caption.src)
      if (!response.ok) throw new Error('Unable to download poster')

      const image = await response.blob()
      const objectUrl = URL.createObjectURL(image)
      const link = document.createElement('a')
      link.href = objectUrl
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(objectUrl)
    } catch {
      // Local images can still be downloaded directly if fetching a remote
      // image is blocked by its host's CORS policy.
      const link = document.createElement('a')
      link.href = caption.src
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      link.remove()
    }
  }, [caption])

  // The next few posters, shown as thumbnails beside the featured one. Never
  // wrap into the selected poster (or a duplicate) when a category has fewer
  // than seven posters.
  const upcoming = Array.from({ length: Math.min(6, Math.max(0, posters.length - 1)) }, (_, offset) => {
    const index = (activeIndex + offset + 1) % posters.length
    return { poster: posters[index], index }
  })

  return (
    <div
      className="relative"
      role="group"
      aria-roledescription="carousel"
      aria-label="PowerCA posters"
    >
      {/* Category filter. Only shown once posters carry categories. */}
      {loaded && categories.length > 0 && (
        <div className="flex justify-center mb-6 sm:mb-8">
          <div className="relative" ref={filterRef}>
            <button
              type="button"
              onClick={() => setFilterOpen((open) => !open)}
              aria-haspopup="listbox"
              aria-expanded={filterOpen}
              className="inline-flex items-center gap-2 h-11 pl-4 pr-3 rounded-full border-2 bg-white/80 text-sm font-medium text-[#001525] hover:bg-white transition-colors duration-200 cursor-pointer"
              style={{ borderColor: '#B6C9F3' }}
            >
              <FilterIcon />
              {activeCategory === 'all' ? 'All posters' : activeCategory}
              <ChevronIcon className={`w-4 h-4 transition-transform duration-200 ${filterOpen ? 'rotate-180' : ''}`} />
            </button>

            {filterOpen && (
              <ul
                role="listbox"
                className="absolute left-1/2 -translate-x-1/2 top-full z-30 mt-2 min-w-[220px] max-h-64 overflow-auto rounded-xl border border-gray-200 bg-white py-1 shadow-lg"
              >
                {['all', ...categories].map((name) => {
                  const count = name === 'all'
                    ? allPosters.length
                    : allPosters.filter((poster) => poster.category === name).length
                  const selected = activeCategory === name

                  return (
                    <li key={name}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={selected}
                        onClick={() => {
                          setActiveCategory(name)
                          // The new list is shorter than the old one more often
                          // than not, so start it from the top rather than an
                          // index that may no longer exist.
                          setActiveIndex(0)
                          setFilterOpen(false)
                        }}
                        className={`flex w-full items-center justify-between gap-4 px-4 py-2.5 text-left text-sm cursor-pointer transition-colors ${
                          selected ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-[#001525] hover:bg-gray-50'
                        }`}
                      >
                        <span>{name === 'all' ? 'All posters' : name}</span>
                        <span className="text-xs text-gray-400 tabular-nums">{count}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Featured poster on the left, upcoming ones as shorter thumbnails on
          the right, with the controls tucked underneath them. */}
      <div
        className={`transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onFocusCapture={() => setIsHovering(true)}
        onBlurCapture={() => setIsHovering(false)}
      >
        <div className="flex flex-col md:flex-row gap-3 sm:gap-4 md:h-[420px] lg:h-[460px]">
          {/* Featured, with its progress bar underneath */}
          <div className="w-full md:w-[400px] lg:w-[440px] md:h-full shrink-0 flex flex-col gap-3">
            {/* The poster opens the enlarged view; the call to action sits on
                top of it, so the two are siblings rather than nested. */}
            <div className="group relative w-full aspect-square md:aspect-auto md:flex-1 md:min-h-0 rounded-2xl overflow-hidden shadow-md ring-[3px] ring-[#155dfc]">
              {caption && (
                <Image
                  key={caption.src}
                  src={caption.src}
                  alt={caption.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 460px"
                  quality={90}
                />
              )}

              <button
                type="button"
                onClick={() => setLightboxIndex(activeIndex)}
                aria-label={`View ${caption?.title ?? 'poster'} at full size`}
                className="absolute inset-0 w-full h-full cursor-pointer"
              >
                <span className="absolute inset-0 bg-[#001525]/35 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-300" />
              </button>

              <button
                type="button"
                onClick={() => void downloadPoster()}
                aria-label={`Download ${caption?.title ?? 'poster'}`}
                title="Download poster"
                className="absolute right-3 bottom-3 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-blue-600 shadow-md transition-colors hover:bg-blue-600 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer"
              >
                <DownloadIcon />
              </button>

              {/* Expand cue above the call to action. The wrapper ignores
                  pointer events so clicks fall through to the poster button;
                  only the link itself is clickable. */}
              <span className="absolute inset-0 z-10 hidden md:flex flex-col items-center justify-center gap-3 pointer-events-none opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100 transition-opacity duration-300">
                <span className="flex w-11 h-11 rounded-full bg-white items-center justify-center text-blue-600 shadow-md">
                  <ExpandIcon />
                </span>
                <Link
                  href="/book-demo"
                  className="pointer-events-auto inline-flex items-center justify-center h-10 px-4 bg-white text-[#001525] font-medium rounded-full shadow-md hover:bg-blue-600 hover:text-white transition-colors duration-200 cursor-pointer text-xs sm:text-sm whitespace-nowrap"
                >
                  Book a Demo
                  <span className="ml-2"><ArrowIcon className="w-4 h-4" /></span>
                </Link>
              </span>

              {/* On phones there is no hover, so the call to action sits inside
                  the poster along its bottom edge. Tapping the poster itself
                  already opens the enlarged view, so no expand button here. */}
              <div className="md:hidden absolute inset-x-0 bottom-0 z-10 flex justify-center p-3 bg-gradient-to-t from-[#001525]/70 via-[#001525]/40 to-transparent">
                <Link
                  href="/book-demo"
                  className="inline-flex items-center justify-center h-9 px-4 bg-white text-[#001525] font-medium rounded-full shadow-md cursor-pointer text-xs whitespace-nowrap"
                >
                  Book a Demo
                  <span className="ml-1.5"><ArrowIcon className="w-3.5 h-3.5" /></span>
                </Link>
              </div>
            </div>

            {/* How long until the next poster takes over */}
            <span
              className="block w-full h-1.5 rounded-full bg-[#001525]/10 overflow-hidden pointer-events-none shrink-0"
              aria-hidden="true"
            >
              <span
                ref={barRef}
                className="block h-full rounded-full origin-left will-change-transform"
                style={{ backgroundColor: '#155dfc', transform: 'scaleX(0)' }}
              />
            </span>
          </div>

          {/* Upcoming thumbnails, then the selected poster's copy beside the
              controls */}
          <div className="flex-1 min-w-0 flex flex-col">
            <div className="flex gap-2 sm:gap-3 md:gap-4">
              {upcoming.map(({ poster, index }, slot) => (
                <button
                  key={`${poster.src}-${index}`}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Show ${poster.title}`}
                  className={`group relative flex-1 min-w-0 aspect-square rounded-2xl overflow-hidden shadow-sm cursor-pointer transition-all duration-500 grayscale hover:grayscale-0 opacity-80 hover:opacity-100 ${
                    slot === 4 ? 'hidden lg:block' : slot === 5 ? 'hidden xl:block' : ''
                  }`}
                >
                  <Image
                    src={poster.src}
                    alt={poster.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 45vw, 220px"
                    loading="lazy"
                    quality={85}
                  />
                </button>
              ))}
            </div>

            {/* Copy on the left, controls on the right. The image's alt text
                already carries the copy for screen readers, so the visible
                block is hidden from them to avoid it being announced twice. */}
            <div className="flex flex-col gap-5 pt-12">
              <div className="flex-1 min-w-0" aria-hidden="true">
                <p
                  key={caption?.title}
                  className="text-sm sm:text-base font-bold tracking-normal uppercase transition-opacity duration-300 text-[#001525] md:text-[#155dfc]"
                >
                  {loaded ? caption?.title : ''}
                </p>
                {loaded && caption?.description && (
                  <p
                    key={caption.description}
                    className="mt-2 text-sm sm:text-base leading-relaxed text-gray-600 transition-opacity duration-300"
                  >
                    {caption.description}
                  </p>
                )}
              </div>

              <div className="shrink-0 flex items-center gap-3 self-center sm:self-start">
                <button
                  type="button"
                  onClick={() => step(-1)}
                  aria-label="Previous poster"
                  className="w-11 h-11 rounded-full border-2 bg-white/80 flex items-center justify-center text-blue-600 transition-all duration-200 hover:bg-blue-600 hover:text-white hover:border-blue-600 cursor-pointer"
                  style={{ borderColor: '#B6C9F3' }}
                >
                  <span className="rotate-180 flex"><ArrowIcon /></span>
                </button>
                <p
                  className="text-sm sm:text-base font-semibold tabular-nums select-none min-w-[3.5rem] text-center"
                  style={{ color: '#001525' }}
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {loaded ? (
                    <>
                      {activeIndex + 1}
                      <span className="text-gray-400 mx-1">/</span>
                      {posters.length}
                    </>
                  ) : null}
                </p>
                <button
                  type="button"
                  onClick={() => step(1)}
                  aria-label="Next poster"
                  className="w-11 h-11 rounded-full border-2 bg-white/80 flex items-center justify-center text-blue-600 transition-all duration-200 hover:bg-blue-600 hover:text-white hover:border-blue-600 cursor-pointer"
                  style={{ borderColor: '#B6C9F3' }}
                >
                  <ArrowIcon />
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Enlarged, readable view of a single poster. Rendered into <body> so it
          sits above the sticky header rather than inside this section. */}
      {mounted && lightboxIndex !== null && posters[lightboxIndex] && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${posters[lightboxIndex].title} - full size`}
          className="fixed inset-0 z-[10000] flex flex-col items-center justify-center p-4 sm:p-6 bg-[#001525]/90"
          onClick={closeLightbox}
        >
          <button
            type="button"
            onClick={closeLightbox}
            aria-label="Close"
            className="absolute top-4 right-4 sm:top-6 sm:right-6 w-11 h-11 rounded-full bg-white/10 border-2 border-white/25 flex items-center justify-center text-white transition-colors duration-200 hover:bg-white hover:text-[#001525] cursor-pointer"
          >
            <CloseIcon />
          </button>

          {/* Stop clicks on the poster itself from closing the view */}
          <div className="relative max-w-[min(92vw,900px)]" onClick={(e) => e.stopPropagation()}>
            <Image
              src={posters[lightboxIndex].src}
              alt={posters[lightboxIndex].alt}
              width={1200}
              height={1200}
              className="w-auto max-h-[76vh] h-auto rounded-xl shadow-2xl"
              sizes="(max-width: 900px) 92vw, 900px"
              quality={90}
              priority
            />
            <p className="mt-4 text-center text-sm sm:text-base font-semibold text-white">
              {posters[lightboxIndex].title}
            </p>
          </div>

          {posters.length > 1 && (
            <div className="flex items-center gap-3 mt-5" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => stepLightbox(-1)}
                aria-label="Previous poster"
                className="w-11 h-11 rounded-full bg-white/10 border-2 border-white/25 flex items-center justify-center text-white transition-colors duration-200 hover:bg-white hover:text-[#001525] cursor-pointer"
              >
                <span className="rotate-180 flex"><ArrowIcon /></span>
              </button>
              <span className="text-sm text-white/70 tabular-nums">
                {lightboxIndex + 1} / {posters.length}
              </span>
              <button
                type="button"
                onClick={() => stepLightbox(1)}
                aria-label="Next poster"
                className="w-11 h-11 rounded-full bg-white/10 border-2 border-white/25 flex items-center justify-center text-white transition-colors duration-200 hover:bg-white hover:text-[#001525] cursor-pointer"
              >
                <ArrowIcon />
              </button>
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  )
}
