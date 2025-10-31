'use client'

import {AdminSidebarLayout  } from './admin-sidebar-layout'

interface AdminPageWrapperProps {
  children: React.ReactNode
  title?: string
  description?: string
  actions?: React.ReactNode
}

export function AdminPageWrapper({
  children,
  title,
  description,
  actions
}: AdminPageWrapperProps) {
  return (
    <AdminSidebarLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Page Header - Mobile optimized */}
        {(title || description || actions) && (
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
              <div className="flex-1">
                {title && (
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{title}</h1>
                )}
                {description && (
                  <p className="mt-1 text-xs sm:text-sm text-gray-600">{description}</p>
                )}
              </div>
              {actions && (
                <div className="flex items-center space-x-2 sm:space-x-3">
                  {actions}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Page Content */}
        {children}
      </div>
    </AdminSidebarLayout>
  )
}