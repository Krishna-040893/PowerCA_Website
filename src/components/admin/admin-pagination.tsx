import { ChevronLeft, ChevronRight } from 'lucide-react'

interface AdminPaginationProps {
  currentPage: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  itemName?: string // e.g., "bookings", "registrations", "referrals"
}

export function AdminPagination({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  itemName = 'items'
}: AdminPaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems)

  // Don't show pagination if there's only one page or no items
  if (totalItems === 0) {
    return null
  }

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        pages.push(1)
        pages.push('...')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      }
    }

    return pages
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2">
      {/* Results Info */}
      <div className="text-sm text-gray-600 order-2 sm:order-1">
        Showing <span className="font-semibold text-gray-900">{startIndex + 1}</span> to{' '}
        <span className="font-semibold text-gray-900">{endIndex}</span> of{' '}
        <span className="font-semibold text-gray-900">{totalItems}</span> {itemName}
      </div>

      {/* Pagination Buttons - Only show if more than one page */}
      {totalPages > 1 && (
        <div className="flex items-center gap-2 order-1 sm:order-2">
          {/* Previous Button */}
          <button
            onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
            disabled={currentPage === 1}
            className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${
              currentPage === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white border-2 border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-500'
            }`}
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Previous</span>
          </button>

          {/* Page Numbers */}
          <div className="flex items-center gap-1">
            {getPageNumbers().map((page, index) =>
              page === '...' ? (
                <span key={`ellipsis-${index}`} className="px-2 py-2 text-gray-400">
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => onPageChange(page as number)}
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg text-sm font-bold transition-all ${
                    currentPage === page
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                      : 'bg-white border-2 border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-500'
                  }`}
                >
                  {page}
                </button>
              )
            )}
          </div>

          {/* Next Button */}
          <button
            onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${
              currentPage === totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white border-2 border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-500'
            }`}
            aria-label="Next page"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
