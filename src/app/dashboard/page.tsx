import {getServerSession  } from 'next-auth'
import {authOptions  } from '@/lib/auth'
import {redirect  } from 'next/navigation'
import {Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {Button  } from '@/components/ui/button'
import {BarChart3, Users,
  FileText,
  Calendar, TrendingUp, Clock, CheckCircle,
  AlertCircle,
  Building2,
  LogOut
 } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">PowerCA Dashboard</h1>
                <p className="text-sm text-muted-foreground">Welcome back, {session.user?.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/api/auth/signout">
                <Button variant="outline" size="sm">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Banner */}
        <Card className="mb-8 bg-gradient-to-r from-blue-600 to-blue-700 text-white border-0">
          <CardHeader>
            <CardTitle className="text-2xl">Welcome to PowerCA</CardTitle>
            <CardDescription className="text-blue-100">
              Your complete practice management solution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="bg-white text-blue-600 hover:bg-blue-50">
                Get Started
              </Button>
              <Button variant="outline" className="text-white border-white hover:bg-blue-800">
                View Tutorial
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Clients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">0</div>
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                <TrendingUp className="h-3 w-3 inline mr-1 text-green-600" />
                Start adding clients
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">0</div>
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Upload your first document
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Upcoming Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">0</div>
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                No tasks scheduled
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Compliance Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">100%</div>
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                All up to date
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and features</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <Button variant="outline" className="h-auto flex-col py-4">
                  <Users className="h-6 w-6 mb-2" />
                  <span className="text-sm">Add Client</span>
                </Button>
                <Button variant="outline" className="h-auto flex-col py-4">
                  <FileText className="h-6 w-6 mb-2" />
                  <span className="text-sm">Upload Document</span>
                </Button>
                <Button variant="outline" className="h-auto flex-col py-4">
                  <Calendar className="h-6 w-6 mb-2" />
                  <span className="text-sm">Schedule Task</span>
                </Button>
                <Button variant="outline" className="h-auto flex-col py-4">
                  <BarChart3 className="h-6 w-6 mb-2" />
                  <span className="text-sm">View Reports</span>
                </Button>
                <Button variant="outline" className="h-auto flex-col py-4">
                  <Clock className="h-6 w-6 mb-2" />
                  <span className="text-sm">Time Tracking</span>
                </Button>
                <Button variant="outline" className="h-auto flex-col py-4">
                  <AlertCircle className="h-6 w-6 mb-2" />
                  <span className="text-sm">Compliance</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="font-medium">Account Created</p>
                    <p className="text-xs text-muted-foreground">Just now</p>
                  </div>
                </div>
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No other activity yet</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Info Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{session.user?.name || 'Not set'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{session.user?.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Firm</p>
                <p className="font-medium">{session.user?.firmName || 'Not set'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Role</p>
                <p className="font-medium capitalize">{session.user?.role || 'User'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Account Status</p>
                <p className="font-medium text-green-600">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}