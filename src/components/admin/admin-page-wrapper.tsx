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
      <div className="space-y-4 sm:space-y-6">
        {/* Page Header - Mobile optimized */}
        {(title || description || actions || stats) && (
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
              {/* Left Column - Title & Description */}
              <div className="text-center sm:text-left">
                {title && (
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{title}</h1>
                )}
                {description && (
                  <p className="mt-1 text-xs sm:text-sm text-gray-600">{description}</p>
                )}
              </div>

              {/* Center Column - Stats */}
              {stats && stats.length > 0 && (
                <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
                  {stats.map((stat, index) => (
                    <div
                      key={index}
                      className="flex flex-col items-center"
                    >
                      <span className="text-xs font-medium text-gray-500">
                        {stat.label}
                      </span>
                      <span
                        className={`text-lg sm:text-xl font-bold mt-0.5 ${
                          stat.color ? stat.color.replace('bg-', 'text-').replace('-100', '-700') : 'text-blue-700'
                        }`}
                      >
                        {stat.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {!stats && <div className="hidden sm:block" />}

              {/* Right Column - Actions */}
              <div className="flex items-center justify-center sm:justify-end space-x-2 sm:space-x-3">
                {actions}
              </div>
            </div>
          </div>
        )}

        {/* Page Content */}
        {children}
      </div>
    </AdminSidebarLayout>
  )
}