"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Filter, X } from "lucide-react"

interface BookingFiltersProps {
  onFilterChange: (filters: {
    status?: string
    dateFrom?: string
    dateTo?: string
    search?: string
  }) => void
}

export function BookingFilters({ onFilterChange }: BookingFiltersProps) {
  const [filters, setFilters] = useState({
    status: "",
    dateFrom: "",
    dateTo: "", 
    search: ""
  })

  const [isExpanded, setIsExpanded] = useState(false)

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const clearFilters = () => {
    const clearedFilters = {
      status: "",
      dateFrom: "",
      dateTo: "",
      search: ""
    }
    setFilters(clearedFilters)
    onFilterChange(clearedFilters)
  }

  const hasActiveFilters = Object.values(filters).some(value => value !== "")

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Search and Toggle */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex-1 max-w-md relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search bookings..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="flex items-center space-x-2"
                >
                  <X className="w-4 h-4" />
                  <span>Clear</span>
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center space-x-2"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </Button>
            </div>
          </div>

          {/* Expanded Filters */}
          {isExpanded && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={filters.status} 
                  onValueChange={(value) => handleFilterChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateFrom">Date From</Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateTo">Date To</Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange("dateTo", e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              {filters.status && (
                <div className="flex items-center space-x-1 bg-primary-100 text-primary-800 px-2 py-1 rounded-full text-sm">
                  <span>Status: {filters.status}</span>
                  <button
                    onClick={() => handleFilterChange("status", "")}
                    className="ml-1 hover:bg-primary-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              {filters.dateFrom && (
                <div className="flex items-center space-x-1 bg-primary-100 text-primary-800 px-2 py-1 rounded-full text-sm">
                  <span>From: {filters.dateFrom}</span>
                  <button
                    onClick={() => handleFilterChange("dateFrom", "")}
                    className="ml-1 hover:bg-primary-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              {filters.dateTo && (
                <div className="flex items-center space-x-1 bg-primary-100 text-primary-800 px-2 py-1 rounded-full text-sm">
                  <span>To: {filters.dateTo}</span>
                  <button
                    onClick={() => handleFilterChange("dateTo", "")}
                    className="ml-1 hover:bg-primary-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}