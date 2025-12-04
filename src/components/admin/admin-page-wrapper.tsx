'use client'

import {AdminSidebarLayout  } from './admin-sidebar-layout'

interface StatItem {
  label: string
  value: number | string
  color?: string
}

interface AdminPageWrapperProps {
  children: React.ReactNode
  title?: string
  description?: string
  actions?: React.ReactNode
  stats?: StatItem[]
}

export function AdminPageWrapper({
  children,
  title,
  description,
  actions,
  stats
}: AdminPageWrapperProps) {
  return (
    <AdminSidebarLayout>
      <div className="space-y-2">
        {/* Page Header - Mobile optimized */}
        {(title || description || actions || stats) && (
          <div className="bg-white rounded-lg shadow-sm p-2 sm:p-3">
            {/* Header Row - Title & Actions */}
            <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 ${stats && stats.length > 0 ? 'mb-2' : ''}`}>
              {/* Title & Description */}
              <div className="text-center sm:text-left">
                {title && (
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900">{title}</h1>
                )}
                {description && (
                  <p className="text-xs text-gray-600">{description}</p>
                )}
              </div>

              {/* Actions */}
              {actions && (
                <div className="flex items-center justify-center sm:justify-end space-x-2">
                  {actions}
                </div>
              )}
            </div>

            {/* Stats Row - All in one line */}
            {stats && stats.length > 0 && (
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-semibold ${
                      stat.color || 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {stat.label}: {stat.value}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Page Content */}
        {children}
      </div>
    </AdminSidebarLayout>
  )
}