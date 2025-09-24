"use client"

import { Card, CardContent } from "@/components/ui/card"
import { 
  Calendar, 
  Users, 
  Clock, 
  CheckCircle, 
  TrendingUp,
  CalendarDays
} from "lucide-react"
import { motion } from "framer-motion"

interface StatsProps {
  stats: {
    total: number
    pending: number
    confirmed: number
    completed: number
    today: number
    thisMonth: number
  }
  isLoading: boolean
}

export function AdminStats({ stats, isLoading }: StatsProps) {
  const statCards = [
    {
      title: "Total Bookings",
      value: stats.total,
      icon: Users,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600"
    },
    {
      title: "Pending Requests", 
      value: stats.pending,
      icon: Clock,
      color: "from-yellow-500 to-yellow-600",
      bgColor: "bg-yellow-50",
      iconColor: "text-yellow-600"
    },
    {
      title: "Confirmed Today",
      value: stats.today,
      icon: CalendarDays,
      color: "from-green-500 to-green-600", 
      bgColor: "bg-green-50",
      iconColor: "text-green-600"
    },
    {
      title: "Completed",
      value: stats.completed,
      icon: CheckCircle,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50", 
      iconColor: "text-purple-600"
    },
    {
      title: "This Month",
      value: stats.thisMonth,
      icon: TrendingUp,
      color: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-50",
      iconColor: "text-indigo-600"
    },
    {
      title: "Confirmed Bookings",
      value: stats.confirmed,
      icon: Calendar,
      color: "from-teal-500 to-teal-600",
      bgColor: "bg-teal-50",
      iconColor: "text-teal-600"
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <Card className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {isLoading ? (
                      <div className="h-8 w-12 bg-gray-200 animate-pulse rounded" />
                    ) : (
                      stat.value
                    )}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
              </div>
              
              {/* Background gradient */}
              <div 
                className={`absolute top-0 right-0 w-32 h-32 opacity-10 transform translate-x-16 -translate-y-8 rotate-12 bg-gradient-to-br ${stat.color} rounded-lg`}
              />
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}