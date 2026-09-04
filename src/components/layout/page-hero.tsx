import type { CSSProperties, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Reveal } from '@/components/ui/reveal'

interface PageHeroProps {
  /** Small uppercase pill above the headline. */
  badge?: { icon?: ReactNode; label: string }
  /** First line of the headline, in ink. */
  title: ReactNode
  /** Second line of the headline, set in blue below the title. */
  accent?: string
  /** Colour for the accent line, when a page runs its own theme. */
  accentClassName?: string
  description?: ReactNode
  /** Buttons or links shown under the description. */
  children?: ReactNode
  /** Background photo for the rounded panel; a soft tint is used without one. */
  backgroundImage?: string
  /** Paint the panel yourself — a gradient, say — instead of a photo. */
  backgroundStyle?: CSSProperties
  /** Decoration drawn inside the panel, behind the copy. */
  backgroundOverlay?: ReactNode
  className?: string
}

/**
 * The hero every public page shares, first designed for the About page: a
 * rounded, inset background panel with a centred pill, two-line headline and
 * a narrow description.
 */
export function PageHero({
  badge,
  title,
  accent,
  accentClassName,
  description,
  children,
  backgroundImage,
  backgroundStyle,
  backgroundOverlay,
  className,
}: PageHeroProps) {
  return (
    <section
      className={cn(
        'relative py-7 sm:py-10 md:py-12 lg:py-[60px] flex items-center justify-center overflow-hidden bg-white bg-dot-pattern',
        className
      )}
    >
      {/* Background panel, inset so its rounded corners stay visible. */}
      <div className="absolute inset-0 px-3 sm:px-4 md:px-6 lg:px-6">
        <div
          className={cn(
            'w-full h-full rounded-2xl overflow-hidden relative',
            !backgroundImage && !backgroundStyle && 'bg-gradient-to-b from-[#F1F7FD] to-[#F8FBFC]'
          )}
          style={
            backgroundImage
              ? {
                  backgroundImage: `url('${backgroundImage}')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                }
              : backgroundStyle
          }
        >
          {backgroundOverlay}
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-6 relative z-10">
        <Reveal className="max-w-6xl mx-auto text-center">
          {badge && (
            <div className="mb-5 sm:mb-7">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200/80 bg-white/80 px-3 sm:px-4 py-1.5 text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.12em] sm:tracking-[0.14em] text-gray-500 shadow-[0_1px_2px_rgba(16,24,40,0.04)] backdrop-blur-sm">
                {badge.icon}
                {badge.label}
              </span>
            </div>
          )}

          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] xl:text-[46px] font-semibold tracking-tight text-[#001525] leading-[1.2] mb-4 sm:mb-5 lg:mb-6 px-2 font-inter">
            {title}
            {accent && (
              <span className={cn('mt-3 sm:mt-4 block text-blue-600', accentClassName)}>{accent}</span>
            )}
          </h1>

          {description && (
            <p
              className={cn(
                'mx-auto max-w-5xl text-[15px] sm:text-[17px] leading-relaxed text-gray-500 font-inter px-2',
                // Only pay for the gap when something follows the copy.
                children && 'mb-6 sm:mb-8 lg:mb-10'
              )}
            >
              {description}
            </p>
          )}

          {children}
        </Reveal>
      </div>
    </section>
  )
}

/** The soft pill button the hero CTAs use. */
export const heroButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-full border border-white/80 bg-gradient-to-b from-white to-gray-100 px-6 py-3 text-sm sm:text-base font-medium text-[#001525] shadow-[0_1px_2px_rgba(16,24,40,0.06),0_10px_24px_-10px_rgba(16,24,40,0.35)] transition-shadow duration-200 hover:shadow-[0_1px_2px_rgba(16,24,40,0.08),0_16px_32px_-10px_rgba(16,24,40,0.45)] font-inter'
