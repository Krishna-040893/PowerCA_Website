import { ChevronDown, ChevronFirst, ChevronLast, ChevronLeft, ChevronRight } from 'lucide-react'
import {cn  } from '@/lib/utils'

interface AdminPaginationProps {
  currentPage: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  /** Pass to show the "Rows per page" picker. */
  onItemsPerPageChange?: (itemsPerPage: number) => void
  pageSizeOptions?: number[]
  /** Kept for existing callers; the footer now reads "1-10 of 100". */
  itemName?: string
}

export function AdminPagination({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  pageSizeOptions = [10, 25, 50, 100],
}: AdminPaginationProps) {
  if (totalItems === 0) {
    return null
  }

  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage))
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems)

  // First two and last two pages, the current page's neighbours, and an
  // ellipsis over each gap: 1 2 … 9 10.
  const getPageNumbers = () => {
    const wanted = new Set([1, 2, totalPages - 1, totalPages, currentPage - 1, currentPage, currentPage + 1])
    const pages: (number | '...')[] = []
    for (let page = 1; page <= totalPages; page++) {
      if (!wanted.has(page)) continue
      const previous = pages[pages.length - 1]
      // A gap of one page shows that page rather than an ellipsis.
      if (typeof previous === 'number' && page - previous === 2) pages.push(page - 1)
      else if (typeof previous === 'number' && page - previous > 2) pages.push('...')
      pages.push(page)
    }
    return pages
  }

  const stepClass =
    'inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-700 transition-colors hover:bg-gray-100 disabled:pointer-events-none disabled:text-gray-300'

  return (
    <div className="flex flex-col gap-3 px-2 pt-4 text-xs text-gray-700 sm:flex-row sm:items-center sm:justify-between">
      {onItemsPerPageChange ? (
        <label className="flex items-center gap-3">
          Rows per page
          <span className="relative">
            <select
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className="h-8 appearance-none rounded-lg border border-gray-200 bg-white pl-3 pr-8 text-xs text-gray-900 outline-none focus:border-gray-400"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-700" />
          </span>
        </label>
      ) : (
        <span />
      )}

      <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
        <span>
          {startIndex + 1}-{endIndex} of {totalItems}
        </span>

        <nav className="flex items-center gap-0.5" aria-label="Pagination">
          <button onClick={() => onPageChange(1)} disabled={currentPage === 1} className={stepClass} aria-label="First page">
            <ChevronFirst className="h-4 w-4" />
          </button>
          <button
            onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
            disabled={currentPage === 1}
            className={stepClass}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {getPageNumbers().map((page, index) =>
            page === '...' ? (
              <span key={`ellipsis-${index}`} className="px-1.5 text-gray-400">
                …
              </span>
            ) : (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                aria-current={currentPage === page ? 'page' : undefined}
                className={cn(
                  'h-8 min-w-[28px] rounded-full px-1.5 transition-colors hover:bg-gray-100',
                  currentPage === page ? 'font-semibold text-gray-900' : 'text-gray-500'
                )}
              >
                {page}
              </button>
            )
          )}

          <button
            onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={stepClass}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className={stepClass}
            aria-label="Last page"
          >
            <ChevronLast className="h-4 w-4" />
          </button>
        </nav>
      </div>
    </div>
  )
}
