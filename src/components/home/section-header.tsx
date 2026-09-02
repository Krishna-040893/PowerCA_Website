import Link from 'next/link'
import type { ReactNode } from 'react'

interface SectionHeaderProps {
  /** Regular-weight opening of the headline. */
  title: string
  /** Emphasised tail of the headline, set in bold. */
  emphasis?: string
  /** Punctuation after the emphasis, kept regular weight. */
  trailing?: string
  description?: ReactNode
  cta?: { href: string; label: string }
}

/**
 * The centred header every homepage section below the hero shares: a headline
 * whose closing phrase carries the weight, a narrow description and an
 * optional soft-pill call to action.
 */
export function SectionHeader({
  title,
  emphasis,
  trailing,
  description,
  cta,
}: SectionHeaderProps) {
  return (
    <div className="mx-auto max-w-6xl text-center">
      <h2 className="text-2xl sm:text-4xl lg:text-[40px] font-normal tracking-tight leading-[1.15] text-[#001525] font-inter">
        {title}
        {emphasis && <> <span className="font-semibold">{emphasis}</span></>}
        {trailing}
      </h2>

      {description && (
        <p className="mx-auto mt-4 sm:mt-5 max-w-5xl text-[15px] sm:text-[17px] leading-relaxed text-gray-500 font-inter">
          {description}
        </p>
      )}

      {cta && (
        <div className="mt-6 sm:mt-8 mb-6 sm:mb-8 flex justify-center">
          <Link
            href={cta.href}
            className="group inline-flex items-center gap-2 rounded-full border border-white/80 bg-gradient-to-b from-white to-gray-100 px-6 py-3 text-sm sm:text-base font-medium text-[#001525] shadow-[0_1px_2px_rgba(16,24,40,0.06),0_10px_24px_-10px_rgba(16,24,40,0.35)] transition-shadow duration-200 hover:shadow-[0_1px_2px_rgba(16,24,40,0.08),0_16px_32px_-10px_rgba(16,24,40,0.45)] font-inter"
          >
            {cta.label}
            <svg
              className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      )}
    </div>
  )
}
