'use client'

import {useEffect, useState  } from 'react'
import {Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {Button  } from '@/components/ui/button'
import {AlertCircle, Package, Users, RefreshCw, Trash2, Eye  } from 'lucide-react'
import {isTestMode  } from '@/lib/payment-config'
import {Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
 } from '@/components/ui/dialog'
import {toast  } from 'sonner'

interface TestTransaction {
  id: string
  orderId: string
  paymentId: string
  customerName: string
  customerEmail: string
  amount: number
  status: string
  createdAt: string
  invoiceNumber?: string
  referralCode?: string
}

interface TestReferral {
  id: string
  affiliateCode: string
  customerEmail: string
  status: string
  createdAt: string
}

export default function TestDashboardPage() {
  const [transactions, setTransactions] = useState<TestTransaction[]>([])
  const [referrals, setReferrals] = useState<TestReferral[]>([])
  const [stats, setStats] = useState({
    totalTransactions: 0,
    successfulPayments: 0,
    totalRevenue: 0,
    totalReferrals: 0,
    emailsSent: 0,
    invoicesGenerated: 0
  })
  const [loading, setLoading] = useState(true)
  const [selectedTransaction, setSelectedTransaction] = useState<TestTransaction | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [showConfirmClear, setShowConfirmClear] = useState(false)

  useEffect(() => {
    if (!isTestMode()) {
      window.location.href = '/admin'
      return
    }
    fetchTestData()
  }, [])

  const fetchTestData = async () => {
    setLoading(true)
    try {
      // Fetch test payments
      const paymentRes = await fetch('/api/admin/test-payments')
      if (paymentRes.ok) {
        const paymentData = await paymentRes.json()
        setTransactions(paymentData.payments || [])

        // Calculate stats
        const successful = paymentData.payments?.filter((p: Record<string, unknown>) => p.status === 'success') || []
        const totalRev = successful.reduce((sum: number, p: Record<string, unknown>) => sum + (typeof p.amount === 'number' ? p.amount : 0), 0)

        setStats({
          totalTransactions: paymentData.payments?.length || 0,
          successfulPayments: successful.length,
          totalRevenue: totalRev,
          totalReferrals: paymentData.referrals?.length || 0,
          emailsSent: successful.length, // Assuming email sent for each successful payment
          invoicesGenerated: successful.length
        })
      }

      // Fetch test referrals
      const referralRes = await fetch('/api/admin/test-referrals')
      if (referralRes.ok) {
        const referralData = await referralRes.json()
        setReferrals(referralData.referrals || [])
      }
    } catch (error) {
      console.error('Error fetching test data:', error)
    } finally {
      setLoading(false)
    }
  }

  const clearTestData = async () => {
    try {
      const response = await fetch('/api/admin/clear-test-data', {
        method: 'POST'
      })

      if (response.ok) {
        toast.success('Test data cleared successfully')
        fetchTestData()
        setShowConfirmClear(false)
      } else {
        toast.error('Failed to clear test data')
      }
    } catch (error) {
      console.error('Error clearing test data:', error)
      toast.error('Error clearing test data')
    }
  }

  const viewTransactionDetails = (transaction: TestTransaction) => {
    setSelectedTransaction(transaction)
    setShowDetails(true)
  }

  if (!isTestMode()) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Test Mode Disabled</CardTitle>
            <CardDescription>
              This dashboard is only available when test mode is enabled.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold">🧪 Test Mode Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Monitor and manage test transactions and referrals
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={fetchTestData}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
            <Button
              onClick={() => setShowConfirmClear(true)}
              variant="destructive"
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Clear Test Data
            </Button>
          </div>
        </div>

        {/* Test Mode Banner */}
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="h-6 w-6 text-yellow-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-yellow-800">Test Mode Active</p>
            <p className="text-sm text-yellow-700">
              All transactions shown here are test payments. No real money has been processed.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTransactions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Successful Payments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.successfulPayments}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Test Revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalRevenue}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Referrals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReferrals}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Emails Sent</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.emailsSent}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Invoices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.invoicesGenerated}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Recent Test Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No test transactions yet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2">Order ID</th>
                    <th className="text-left py-2 px-2">Customer</th>
                    <th className="text-left py-2 px-2">Email</th>
                    <th className="text-left py-2 px-2">Amount</th>
                    <th className="text-left py-2 px-2">Status</th>
                    <th className="text-left py-2 px-2">Invoice</th>
                    <th className="text-left py-2 px-2">Date</th>
                    <th className="text-left py-2 px-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.slice(0, 10).map((transaction) => (
                    <tr key={transaction.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-2 font-mono text-xs">
                        {transaction.orderId}
                      </td>
                      <td className="py-2 px-2">{transaction.customerName}</td>
                      <td className="py-2 px-2">{transaction.customerEmail}</td>
                      <td className="py-2 px-2">₹{transaction.amount}</td>
                      <td className="py-2 px-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          transaction.status === 'success'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {transaction.status}
                        </span>
                      </td>
                      <td className="py-2 px-2">
                        {transaction.invoiceNumber || 'N/A'}
                      </td>
                      <td className="py-2 px-2">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-2 px-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => viewTransactionDetails(transaction)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Referrals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Recent Test Referrals
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : referrals.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No test referrals yet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2">Affiliate Code</th>
                    <th className="text-left py-2 px-2">Referred Email</th>
                    <th className="text-left py-2 px-2">Status</th>
                    <th className="text-left py-2 px-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {referrals.slice(0, 10).map((referral) => (
                    <tr key={referral.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-2 font-mono">{referral.affiliateCode}</td>
                      <td className="py-2 px-2">{referral.customerEmail}</td>
                      <td className="py-2 px-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          referral.status === 'converted'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {referral.status}
                        </span>
                      </td>
                      <td className="py-2 px-2">
                        {new Date(referral.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>
              Complete details of test transaction
            </DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-3 mt-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="font-semibold">Order ID:</div>
                <div className="font-mono">{selectedTransaction.orderId}</div>

                <div className="font-semibold">Payment ID:</div>
                <div className="font-mono">{selectedTransaction.paymentId}</div>

                <div className="font-semibold">Customer:</div>
                <div>{selectedTransaction.customerName}</div>

                <div className="font-semibold">Email:</div>
                <div>{selectedTransaction.customerEmail}</div>

                <div className="font-semibold">Amount:</div>
                <div>₹{selectedTransaction.amount}</div>

                <div className="font-semibold">Status:</div>
                <div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    selectedTransaction.status === 'success'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedTransaction.status}
                  </span>
                </div>

                {selectedTransaction.invoiceNumber && (
                  <>
                    <div className="font-semibold">Invoice:</div>
                    <div>{selectedTransaction.invoiceNumber}</div>
                  </>
                )}

                {selectedTransaction.referralCode && (
                  <>
                    <div className="font-semibold">Referral Code:</div>
                    <div>{selectedTransaction.referralCode}</div>
                  </>
                )}

                <div className="font-semibold">Date:</div>
                <div>{new Date(selectedTransaction.createdAt).toLocaleString()}</div>
              </div>

              <div className="pt-3 border-t">
                <div className="bg-yellow-50 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> This is a test transaction. No real payment was processed.
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Clear Confirmation Dialog */}
      <Dialog open={showConfirmClear} onOpenChange={setShowConfirmClear}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear Test Data</DialogTitle>
            <DialogDescription>
              Are you sure you want to clear all test data? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                This will permanently delete all test transactions and referrals from the database.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmClear(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={clearTestData}
            >
              Clear All Test Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}