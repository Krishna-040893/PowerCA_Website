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
      <div className="space-y-5 px-1 py-2 sm:px-3 sm:py-4 font-inter">
        {(title || description || actions) && (
          <header className="space-y-4 rounded-xl border border-gray-200 bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)] sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                {title && (
                  <h1 className="text-lg font-semibold text-gray-900 sm:text-xl">{title}</h1>
                )}
                {description && (
                  <p className="mt-0.5 text-sm text-gray-500">{description}</p>
                )}
              </div>

              {actions && (
                <div className="flex flex-wrap items-center gap-2">
                  {actions}
                </div>
              )}
            </div>
          </header>
        )}

        {children}
      </div>
    </AdminSidebarLayout>
  )
}
