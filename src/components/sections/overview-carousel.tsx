'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'

type Poster = {
  src: string
  alt: string
  title: string
  description?: string
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
}

// The strip renders the posters three times over so it can wrap around without
// the seam ever being visible.
const REPEAT = 3
const SCROLL_SPEED = 0.6 // px per frame, right to left
const NUDGE_STEP = 14 // px per frame while a control button is catching up

function ArrowIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  )
}

function ExpandIcon() {
  return (
    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 9V5a1 1 0 011-1h4M20 9V5a1 1 0 00-1-1h-4M4 15v4a1 1 0 001 1h4M20 15v4a1 1 0 01-1 1h-4" />
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

export function OverviewCarousel() {
  const trackRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<number | null>(null)
  const pendingRef = useRef(0)
  const pausedRef = useRef(false)

  const [posters, setPosters] = useState<Poster[]>(fallbackPosters)
  const [activeIndex, setActiveIndex] = useState(0)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [mounted, setMounted] = useState(false)

  // The enlarged view is portalled to <body>, so it can only render client-side.
  useEffect(() => setMounted(true), [])

  // Swap in the posters managed from the admin portal once they arrive. The
  // bundled fallback stays on screen if none are published or the fetch fails,
  // so the section never renders empty.
  useEffect(() => {
    let cancelled = false

    const loadPosters = async () => {
      try {
        const response = await fetch('/api/posters')
        if (!response.ok) return

        const data = await response.json()
        const uploaded: ApiPoster[] = data?.posters ?? []

        if (!cancelled && uploaded.length > 0) {
          setPosters(uploaded.map((poster) => ({
            src: poster.image_url,
            title: poster.title,
            alt: poster.alt_text || poster.title,
            description: poster.alt_text || undefined,
          })))
        }
      } catch {
        // Keep the fallback posters on screen.
      }
    }

    loadPosters()

    return () => {
      cancelled = true
    }
  }, [])

  const closeLightbox = useCallback(() => setLightboxIndex(null), [])

  const stepLightbox = useCallback((direction: -1 | 1) => {
    setLightboxIndex((current) => {
      if (current === null) return current
      return (current + direction + posters.length) % posters.length
    })
  }, [posters.length])

  // While the enlarged view is open, hold the strip still, lock the page behind
  // it and let the keyboard drive it.
  useEffect(() => {
    if (lightboxIndex === null) return

    pausedRef.current = true
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
      pausedRef.current = false
    }
  }, [lightboxIndex, closeLightbox, stepLightbox])

  // Whichever card sits nearest the middle of the strip is the featured one.
  const updateActive = useCallback(() => {
    const track = trackRef.current
    if (!track) return

    const middle = track.scrollLeft + track.clientWidth / 2
    const cards = Array.from(track.querySelectorAll<HTMLElement>('[data-poster-card]'))

    let nearest = 0
    let smallest = Number.POSITIVE_INFINITY

    cards.forEach((card) => {
      const centre = card.offsetLeft + card.offsetWidth / 2
      const distance = Math.abs(centre - middle)
      if (distance < smallest) {
        smallest = distance
        nearest = Number(card.dataset.index ?? 0)
      }
    })

    setActiveIndex(nearest)
  }, [])

  // Continuous right-to-left drift, wrapping seamlessly between repeats.
  useEffect(() => {
    const track = trackRef.current
    if (!track || posters.length === 0) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const setWidth = track.scrollWidth / REPEAT

    // Start in the middle copy so there is room to scroll either way.
    track.scrollLeft = setWidth
    updateActive()

    const step = () => {
      const width = track.scrollWidth / REPEAT

      if (pendingRef.current !== 0) {
        const move = Math.sign(pendingRef.current) * Math.min(Math.abs(pendingRef.current), NUDGE_STEP)
        track.scrollLeft += move
        pendingRef.current -= move
      } else if (!pausedRef.current && !prefersReducedMotion) {
        track.scrollLeft += SCROLL_SPEED
      }

      // Keep the viewport inside the middle copy.
      if (track.scrollLeft >= width * 2) {
        track.scrollLeft -= width
      } else if (track.scrollLeft <= 0) {
        track.scrollLeft += width
      }

      updateActive()
      frameRef.current = requestAnimationFrame(step)
    }

    frameRef.current = requestAnimationFrame(step)

    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
    }
  }, [posters, updateActive])

  const nudge = (direction: -1 | 1) => {
    const track = trackRef.current
    if (!track) return

    const card = track.querySelector<HTMLElement>('[data-poster-card]')
    const distance = card ? card.offsetWidth + 24 : 240
    pendingRef.current += direction * distance
  }

  const setPaused = (value: boolean) => {
    pausedRef.current = value
  }

  // Repeat the posters so the strip can loop without a visible jump.
  const strip = Array.from({ length: REPEAT }).flatMap((_, copy) =>
    posters.map((poster, index) => ({ poster, key: `${copy}-${poster.src}-${index}` }))
  )

  const captionIndex = hoveredIndex ?? activeIndex
  const caption = posters[captionIndex % posters.length]

  return (
    <div
      className="relative"
      role="group"
      aria-roledescription="carousel"
      aria-label="PowerCA posters"
    >
      {/* Title and description of the featured (or hovered) poster. The image's
          alt text already carries this for screen readers, so this block is
          hidden from them to avoid it being announced twice. */}
      <div
        className="min-h-[72px] sm:min-h-[80px] flex flex-col items-center justify-start gap-2 mb-5 sm:mb-6 px-4"
        aria-hidden="true"
      >
        <p
          key={caption?.title}
          className="text-sm sm:text-base font-bold tracking-normal uppercase text-center transition-opacity duration-300"
          style={{ color: '#001525' }}
        >
          {caption?.title}
        </p>
        {caption?.description && (
          <p
            key={caption.description}
            className="max-w-4xl text-sm sm:text-base leading-relaxed text-gray-600 text-center transition-opacity duration-300"
          >
            {caption.description}
          </p>
        )}
      </div>

      {/* Strip */}
      <div
        ref={trackRef}
        className="flex items-center gap-14 sm:gap-16 md:gap-20 overflow-x-hidden py-16 sm:py-20"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => {
          setPaused(false)
          setHoveredIndex(null)
        }}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={() => setPaused(false)}
      >
        {strip.map(({ poster, key }, position) => {
          const posterIndex = position % posters.length
          const isFeatured = hoveredIndex === null
            ? activeIndex === position
            : hoveredIndex === posterIndex

          return (
            // The card keeps a fixed width and a square box at all times. The
            // featured state is a transform and a filter only, so nothing here
            // ever reflows the strip or changes the section's height.
            <button
              key={key}
              type="button"
              data-poster-card
              data-index={position}
              onMouseEnter={() => setHoveredIndex(posterIndex)}
              onTouchStart={() => setHoveredIndex(posterIndex)}
              onClick={() => setLightboxIndex(posterIndex)}
              aria-label={`View ${poster.title} at full size`}
              className={`group relative shrink-0 w-[150px] sm:w-[190px] md:w-[220px] aspect-square rounded-xl overflow-hidden cursor-pointer transition-[transform,filter,opacity,box-shadow] duration-500 ease-out will-change-transform ring-2 ${
                isFeatured
                  ? 'grayscale-0 opacity-100 scale-[1.35] z-10 shadow-lg ring-[#155dfc]'
                  : 'grayscale opacity-60 scale-100 ring-transparent hover:opacity-90'
              }`}
            >
              <Image
                src={poster.src}
                alt={poster.alt}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 150px, 220px"
                loading="lazy"
                quality={85}
              />

              {/* Expand affordance, shown on the poster being looked at */}
              <span
                className={`absolute inset-0 flex items-center justify-center bg-[#001525]/45 transition-opacity duration-300 ${
                  isFeatured ? 'opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100' : 'opacity-0'
                }`}
              >
                <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white flex items-center justify-center text-blue-600 shadow-md">
                  <ExpandIcon />
                </span>
              </span>
            </button>
          )
        })}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3 mt-6">
        <button
          type="button"
          onClick={() => nudge(-1)}
          aria-label="Scroll posters left"
          className="w-11 h-11 sm:w-12 sm:h-12 rounded-full border-2 bg-white/80 flex items-center justify-center text-blue-600 transition-all duration-200 hover:bg-blue-600 hover:text-white hover:border-blue-600 cursor-pointer"
          style={{ borderColor: '#B6C9F3' }}
        >
          <span className="rotate-180 flex"><ArrowIcon /></span>
        </button>
        <button
          type="button"
          onClick={() => nudge(1)}
          aria-label="Scroll posters right"
          className="w-11 h-11 sm:w-12 sm:h-12 rounded-full border-2 bg-white/80 flex items-center justify-center text-blue-600 transition-all duration-200 hover:bg-blue-600 hover:text-white hover:border-blue-600 cursor-pointer"
          style={{ borderColor: '#B6C9F3' }}
        >
          <ArrowIcon />
        </button>
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
