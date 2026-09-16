import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

const DOTS = {
  indigo: 'bg-indigo-500',
  emerald: 'bg-emerald-500',
  violet: 'bg-violet-500',
  amber: 'bg-amber-400',
  orange: 'bg-orange-400',
  red: 'bg-red-500',
  gray: 'bg-gray-400',
} as const

export type StatTone = keyof typeof DOTS

export interface Stat {
  label: string
  value: ReactNode
  /** Colour of the status dot beside the label. */
  tone?: StatTone
  /** Small supporting line under the number. */
  hint?: ReactNode
}

/**
 * A row of minimal KPI tiles: a status dot and label over a large number, on
 * a neutral bordered card. Shared by the admin pages and the user dashboards.
 */
export function StatCards({ stats, className }: { stats: Stat[]; className?: string }) {
  return (
    <div
      className={cn(
        'grid grid-cols-2 gap-3 sm:grid-cols-[repeat(auto-fill,minmax(170px,1fr))]',
        className
      )}
    >
      {stats.map((stat, index) => (
        <div
          key={index}
          className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
        >
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', DOTS[stat.tone ?? 'indigo'])} />
            <span className="truncate">{stat.label}</span>
          </div>
          <div className="mt-1.5 text-2xl font-semibold leading-none tracking-tight text-gray-900">
            {stat.value}
          </div>
          {stat.hint && <p className="mt-1.5 truncate text-xs text-gray-500">{stat.hint}</p>}
        </div>
      ))}
    </div>
  )
}
