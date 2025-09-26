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
      <div className="p-8">
        {/* Page Header */}
        {(title || description || actions) && (
          <div className="mb-8">
            <div className="flex items-start justify-between">
              <div>
                {title && (
                  <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                )}
                {description && (
                  <p className="mt-1 text-sm text-gray-600">{description}</p>
                )}
              </div>
              {actions && (
                <div className="flex items-center space-x-3">
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