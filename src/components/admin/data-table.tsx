'use client'

import * as React from 'react'
import { ArrowDown, ArrowUp, ChevronDown, CircleX, EllipsisVertical, ListFilter, Search, X } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

/*
 * The admin data-table kit: a search box with page actions on the right, a
 * row of filter chips, a flat bordered table and icon row actions. Pages use
 * only the pieces their table actually has.
 */

/** Put on the <Table> itself: flat rows, hairline dividers, roomy cells. */
export const dataTableClass = cn(
  'border-t border-gray-200 text-sm',
  '[&_thead_tr]:border-b [&_thead_tr]:border-gray-200 [&_thead_tr:hover]:bg-transparent',
  '[&_th]:h-14 [&_th]:px-4 [&_th]:text-sm [&_th]:font-medium [&_th]:text-gray-700 [&_th]:whitespace-nowrap',
  '[&_tbody_tr]:border-b [&_tbody_tr]:border-gray-200 [&_tbody_tr:hover]:bg-gray-50/70',
  '[&_td]:h-14 [&_td]:px-4 [&_td]:py-2.5 [&_td]:text-sm [&_td]:text-gray-900'
)

/** Square checkbox that fills near-black when ticked. */
export const dataTableCheckboxClass =
  'h-[18px] w-[18px] rounded-[3px] border-2 border-gray-600 data-[state=checked]:border-gray-900 data-[state=checked]:bg-gray-900 data-[state=checked]:text-white'

/** White panel the toolbar, filters, table and pagination sit in. */
export function DataTablePanel({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-xl border border-gray-200 bg-white px-3 py-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)] sm:px-5 sm:py-5',
        className
      )}
      {...props}
    />
  )
}

interface SearchFieldProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

/** The admin search box: magnifier inside a tall rounded field. */
export function SearchField({ value, onChange, placeholder = 'Search', className }: SearchFieldProps) {
  return (
    <label
      className={cn(
        'relative flex h-12 w-full items-center rounded-xl border border-gray-200 bg-white transition-colors focus-within:border-gray-400',
        className
      )}
    >
      <Search className="pointer-events-none absolute left-4 h-5 w-5 text-gray-600" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-full w-full rounded-xl bg-transparent pl-12 pr-10 text-sm text-gray-900 placeholder:text-gray-400 outline-none"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="absolute right-3 rounded-full p-0.5 text-gray-400 transition-colors hover:text-gray-700"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </label>
  )
}

interface DataTableToolbarProps {
  searchValue?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
  /** Buttons on the right, e.g. <ToolbarButton>. */
  actions?: React.ReactNode
  className?: string
}

/** Search on the left, page actions on the right. */
export function DataTableToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search',
  actions,
  className,
}: DataTableToolbarProps) {
  return (
    <div className={cn('flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between', className)}>
      {onSearchChange ? (
        <SearchField
          value={searchValue ?? ''}
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
          className="sm:max-w-md"
        />
      ) : (
        <span />
      )}

      {actions && <div className="flex flex-wrap items-center gap-3 sm:justify-end">{actions}</div>}
    </div>
  )
}

export type AdminButtonVariant = 'primary' | 'outline' | 'danger'

/**
 * The admin button look as a class string, for elements that can't be a
 * <ToolbarButton> — AlertDialogAction/Cancel, or a Link.
 */
export function adminButtonClass(variant: AdminButtonVariant = 'outline', className?: string) {
  return cn(
    'inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-5 text-xs font-medium uppercase tracking-wide shadow-none transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:h-4 [&_svg]:w-4',
    variant === 'primary' && 'border border-[#262626] bg-[#262626] text-white hover:bg-black',
    variant === 'outline' && 'border border-gray-900 bg-white text-gray-900 hover:bg-gray-50',
    variant === 'danger' && 'border border-red-600 bg-red-600 text-white hover:bg-red-700',
    className
  )
}

interface ToolbarButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** 'primary' is the dark filled button, 'outline' the bordered one. */
  variant?: AdminButtonVariant
}

/** Uppercase admin button. Works as an asChild target for dialog triggers. */
export const ToolbarButton = React.forwardRef<HTMLButtonElement, ToolbarButtonProps>(
  ({ variant = 'outline', className, type = 'button', ...props }, ref) => (
    <button ref={ref} type={type} className={adminButtonClass(variant, className)} {...props} />
  )
)
ToolbarButton.displayName = 'ToolbarButton'

/** The row of filter chips under the toolbar, led by a filter icon. */
export function DataTableFilters({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-wrap items-center gap-3 py-4', className)}>
      <ListFilter className="mr-1 h-5 w-5 text-gray-700" aria-hidden="true" />
      {children}
    </div>
  )
}

const chipBase =
  'inline-flex h-8 items-center gap-2 whitespace-nowrap rounded-lg px-3 text-sm transition-colors'

/** A filter that is switched on: dark chip with a clear button. */
export function ActiveFilterChip({ label, onClear }: { label: React.ReactNode; onClear: () => void }) {
  return (
    <span className={cn(chipBase, 'bg-[#262626] pr-1.5 text-white')}>
      {label}
      <button
        type="button"
        onClick={onClear}
        className="rounded-full text-white/90 hover:text-white"
        aria-label="Clear filter"
      >
        <CircleX className="h-5 w-5" />
      </button>
    </span>
  )
}

interface FilterOption {
  value: string
  label: string
}

interface FilterMenuProps {
  /** Chip text while nothing is picked, e.g. "Status". */
  label: string
  value: string
  onValueChange: (value: string) => void
  options: FilterOption[]
  /** The value meaning "no filter". */
  allValue?: string
}

/**
 * A dropdown chip. Once an option is picked it turns into the dark active chip,
 * and clearing it goes back to `allValue`.
 */
export function FilterMenu({ label, value, onValueChange, options, allValue = 'all' }: FilterMenuProps) {
  if (value !== allValue) {
    const picked = options.find((option) => option.value === value)
    return <ActiveFilterChip label={picked?.label ?? value} onClear={() => onValueChange(allValue)} />
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className={cn(chipBase, 'border border-gray-200 bg-white text-gray-900 hover:bg-gray-50')}>
          {label}
          <ChevronDown className="h-3.5 w-3.5 text-gray-700" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[10rem] rounded-xl bg-white">
        <DropdownMenuRadioGroup value={value} onValueChange={onValueChange}>
          {options
            .filter((option) => option.value !== allValue)
            .map((option) => (
              <DropdownMenuRadioItem key={option.value} value={option.value}>
                {option.label}
              </DropdownMenuRadioItem>
            ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

interface SortableHeadProps {
  children: React.ReactNode
  /** Whether the table is currently sorted by this column. */
  active: boolean
  direction: 'asc' | 'desc'
  onSort: () => void
}

/** Header label with a sort arrow; put inside a <TableHead>. */
export function SortableHead({ children, active, direction, onSort }: SortableHeadProps) {
  const Arrow = active && direction === 'asc' ? ArrowUp : ArrowDown
  return (
    <button
      type="button"
      onClick={onSort}
      className={cn('inline-flex items-center gap-2 font-medium', active ? 'text-gray-900' : 'text-gray-700')}
    >
      {children}
      <Arrow className={cn('h-4 w-4', !active && 'opacity-40')} />
    </button>
  )
}

/** Round thumbnail before a name cell. */
export function RowThumb({ src, alt = '' }: { src: string; alt?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className="h-9 w-9 shrink-0 rounded-full border border-gray-200 object-cover" />
  )
}

interface RowIconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
}

/** Bare icon button for a row action (edit, view…). */
export const RowIconButton = React.forwardRef<HTMLButtonElement, RowIconButtonProps>(
  ({ label, className, type = 'button', children, ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-800 transition-colors hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-40 [&_svg]:h-[18px] [&_svg]:w-[18px]',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
)
RowIconButton.displayName = 'RowIconButton'

export interface RowMenuItem {
  label: string
  icon?: React.ReactNode
  onSelect: () => void
  destructive?: boolean
  disabled?: boolean
}

/** The ⋮ menu holding a row's secondary actions. */
export function RowMenu({ items, label = 'More actions' }: { items: RowMenuItem[]; label?: string }) {
  if (items.length === 0) return null
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <RowIconButton label={label}>
          <EllipsisVertical />
        </RowIconButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[10rem] rounded-xl bg-white">
        {items.map((item) => (
          <DropdownMenuItem
            key={item.label}
            onSelect={item.onSelect}
            disabled={item.disabled}
            className={cn('cursor-pointer', item.destructive && 'text-red-600 focus:text-red-600')}
          >
            {item.icon}
            {item.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/** Keeps a row's icon actions on one line. */
export function RowActions({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-1">{children}</div>
}
