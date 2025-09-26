import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, Calendar, Clock, User, CheckCircle, AlertCircle, FileText, Download, Shield, Calculator, XCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export const metadata: Metadata = {
  title: 'TDS Compliance Checklist 2025-26: Complete Guide for CAs | PowerCA',
  description: 'Comprehensive TDS compliance checklist for FY 2025-26. Due dates, rates, forms, penalties, and best practices for error-free TDS compliance.',
  keywords: 'TDS compliance checklist, TDS due dates 2025-26, TDS return filing, Form 26Q, Form 24Q, TDS rates FY 2025-26, TDS penalties',
  openGraph: {
    title: 'Complete TDS Compliance Checklist for FY 2025-26',
    description: 'Master TDS compliance with this comprehensive checklist covering all aspects of TDS for CAs.',
    type: 'article',
    publishedTime: '2025-09-24T00:00:00.000Z',
    authors: ['PowerCA Team'],
  },
}

export default function TDSComplianceChecklistPage() {
  return (
    <article className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="container mx-auto px-6 py-12">
          <Link href="/blog">
            <Button variant="ghost" className="text-white hover:bg-white/10 mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Button>
          </Link>

          <div className="max-w-4xl">
            <div className="flex items-center gap-4 text-sm mb-4">
              <span className="bg-white/20 px-3 py-1 rounded-full">TDS Compliance</span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                September 24, 2025
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                15 min read
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Ultimate TDS Compliance Checklist for FY 2025-26
            </h1>

            <p className="text-xl text-purple-100">
              A comprehensive checklist covering all aspects of TDS compliance - from deduction to deposit, return filing to certificates.
            </p>

            <div className="flex items-center gap-2 mt-6">
              <User className="h-5 w-5" />
              <span>By PowerCA Compliance Team</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="prose prose-lg max-w-none">
              {/* Quick Overview */}
              <Alert className="mb-8 border-purple-200 bg-purple-50">
                <Shield className="h-5 w-5 text-purple-600" />
                <AlertTitle className="text-purple-900 font-bold">Complete TDS Compliance Framework</AlertTitle>
                <AlertDescription className="text-purple-800 mt-2">
                  This checklist covers all aspects of TDS compliance including deduction, deposit, return filing,
                  certificate issuance, and reconciliation for FY 2025-26.
                </AlertDescription>
              </Alert>

              <h2 className="text-2xl font-bold mt-8 mb-4">1. TDS Deduction Checklist</h2>

              <Card className="p-6 mb-6">
                <h3 className="font-semibold text-lg mb-4">Before Making Payment</h3>
                <div className="space-y-3">
                  <label className="flex items-start gap-3">
                    <input type="checkbox" className="rounded mt-1" />
                    <div>
                      <p className="font-medium">Verify PAN of Payee</p>
                      <p className="text-sm text-gray-600">Obtain PAN or apply 20% TDS if not provided</p>
                    </div>
                  </label>
                  <label className="flex items-start gap-3">
                    <input type="checkbox" className="rounded mt-1" />
                    <div>
                      <p className="font-medium">Check TDS Applicability</p>
                      <p className="text-sm text-gray-600">Confirm if payment attracts TDS and identify correct section</p>
                    </div>
                  </label>
                  <label className="flex items-start gap-3">
                    <input type="checkbox" className="rounded mt-1" />
                    <div>
                      <p className="font-medium">Determine Threshold Limits</p>
                      <p className="text-sm text-gray-600">Check if payment exceeds threshold for TDS deduction</p>
                    </div>
                  </label>
                  <label className="flex items-start gap-3">
                    <input type="checkbox" className="rounded mt-1" />
                    <div>
                      <p className="font-medium">Verify Exemption Certificates</p>
                      <p className="text-sm text-gray-600">Check for valid 197 certificates for lower/nil deduction</p>
                    </div>
                  </label>
                  <label className="flex items-start gap-3">
                    <input type="checkbox" className="rounded mt-1" />
                    <div>
                      <p className="font-medium">Calculate Correct TDS Rate</p>
                      <p className="text-sm text-gray-600">Apply appropriate rate based on nature of payment and payee status</p>
                    </div>
                  </label>
                </div>
              </Card>

              <h2 className="text-2xl font-bold mt-8 mb-4">2. Major TDS Sections & Rates (FY 2025-26)</h2>

              <div className="overflow-x-auto mb-6">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border px-4 py-2 text-left">Section</th>
                      <th className="border px-4 py-2 text-left">Nature of Payment</th>
                      <th className="border px-4 py-2">Rate</th>
                      <th className="border px-4 py-2">Threshold</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border px-4 py-2 font-medium">192</td>
                      <td className="border px-4 py-2">Salary</td>
                      <td className="border px-4 py-2 text-center">As per slab</td>
                      <td className="border px-4 py-2 text-center">Basic exemption</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border px-4 py-2 font-medium">192A</td>
                      <td className="border px-4 py-2">Premature EPF withdrawal</td>
                      <td className="border px-4 py-2 text-center">10%</td>
                      <td className="border px-4 py-2 text-center">₹50,000</td>
                    </tr>
                    <tr>
                      <td className="border px-4 py-2 font-medium">193</td>
                      <td className="border px-4 py-2">Interest on securities</td>
                      <td className="border px-4 py-2 text-center">10%</td>
                      <td className="border px-4 py-2 text-center">₹5,000</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border px-4 py-2 font-medium">194</td>
                      <td className="border px-4 py-2">Dividend</td>
                      <td className="border px-4 py-2 text-center">10%</td>
                      <td className="border px-4 py-2 text-center">₹5,000</td>
                    </tr>
                    <tr>
                      <td className="border px-4 py-2 font-medium">194A</td>
                      <td className="border px-4 py-2">Interest (other than securities)</td>
                      <td className="border px-4 py-2 text-center">10%</td>
                      <td className="border px-4 py-2 text-center">₹5,000/₹40,000*</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border px-4 py-2 font-medium">194C</td>
                      <td className="border px-4 py-2">Payment to contractors</td>
                      <td className="border px-4 py-2 text-center">1%/2%</td>
                      <td className="border px-4 py-2 text-center">₹30,000/₹1,00,000</td>
                    </tr>
                    <tr>
                      <td className="border px-4 py-2 font-medium">194D</td>
                      <td className="border px-4 py-2">Insurance commission</td>
                      <td className="border px-4 py-2 text-center">5%</td>
                      <td className="border px-4 py-2 text-center">₹15,000</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border px-4 py-2 font-medium">194H</td>
                      <td className="border px-4 py-2">Commission/Brokerage</td>
                      <td className="border px-4 py-2 text-center">5%</td>
                      <td className="border px-4 py-2 text-center">₹15,000</td>
                    </tr>
                    <tr>
                      <td className="border px-4 py-2 font-medium">194I</td>
                      <td className="border px-4 py-2">Rent (Land/Building)</td>
                      <td className="border px-4 py-2 text-center">10%</td>
                      <td className="border px-4 py-2 text-center">₹2,40,000</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border px-4 py-2 font-medium">194I</td>
                      <td className="border px-4 py-2">Rent (P&M)</td>
                      <td className="border px-4 py-2 text-center">2%</td>
                      <td className="border px-4 py-2 text-center">₹2,40,000</td>
                    </tr>
                    <tr>
                      <td className="border px-4 py-2 font-medium">194J</td>
                      <td className="border px-4 py-2">Professional fees</td>
                      <td className="border px-4 py-2 text-center">10%</td>
                      <td className="border px-4 py-2 text-center">₹30,000</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border px-4 py-2 font-medium">194Q</td>
                      <td className="border px-4 py-2">Purchase of goods</td>
                      <td className="border px-4 py-2 text-center">0.1%</td>
                      <td className="border px-4 py-2 text-center">₹50 lakhs</td>
                    </tr>
                  </tbody>
                </table>
                <p className="text-sm text-gray-600 mt-2">*₹40,000 for senior citizens | Rates for residents, non-residents may differ</p>
              </div>

              <Alert className="mb-6 border-yellow-200 bg-yellow-50">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <AlertDescription>
                  <strong>Note:</strong> If PAN is not furnished, TDS rate is higher of: (a) Rates specified above,
                  (b) 20%, or (c) Rates in force.
                </AlertDescription>
              </Alert>

              <h2 className="text-2xl font-bold mt-8 mb-4">3. TDS Deposit Checklist</h2>

              <Card className="p-6 mb-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Due Dates for TDS Deposit
                </h3>

                <div className="space-y-4">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-semibold">Government Deductors</h4>
                    <p className="text-sm text-gray-600">Same day (without challan) through book entry</p>
                  </div>

                  <div className="border-l-4 border-green-500 pl-4">
                    <h4 className="font-semibold">Other Deductors</h4>
                    <ul className="text-sm text-gray-600 space-y-1 mt-2">
                      <li>• <strong>7th of next month:</strong> For all deductions</li>
                      <li>• <strong>30th April:</strong> For March deductions</li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-purple-500 pl-4">
                    <h4 className="font-semibold">Section 192 (Salary)</h4>
                    <p className="text-sm text-gray-600">Same as above, except for March - 30th April</p>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span>Generate Challan 281 on TRACES portal</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span>Verify TAN details in challan</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span>Select correct assessment year</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span>Choose appropriate payment type (200/400)</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span>Make payment through authorized bank</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span>Download challan receipt with CIN</span>
                  </label>
                </div>
              </Card>

              <h2 className="text-2xl font-bold mt-8 mb-4">4. TDS Return Filing Schedule</h2>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <Card className="p-4">
                  <h4 className="font-semibold mb-3">Form 24Q (Salary TDS)</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Q1 (Apr-Jun):</span>
                      <span className="font-medium">31st July</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Q2 (Jul-Sep):</span>
                      <span className="font-medium">31st October</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Q3 (Oct-Dec):</span>
                      <span className="font-medium">31st January</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Q4 (Jan-Mar):</span>
                      <span className="font-medium">31st May</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <h4 className="font-semibold mb-3">Form 26Q (Non-Salary TDS)</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Q1 (Apr-Jun):</span>
                      <span className="font-medium">31st July</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Q2 (Jul-Sep):</span>
                      <span className="font-medium">31st October</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Q3 (Oct-Dec):</span>
                      <span className="font-medium">31st January</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Q4 (Jan-Mar):</span>
                      <span className="font-medium">31st May</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <h4 className="font-semibold mb-3">Form 27Q (NRI Payments)</h4>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-600">Same due dates as Form 26Q</p>
                    <p className="text-xs text-gray-500">For TDS on payments to non-residents</p>
                  </div>
                </Card>

                <Card className="p-4">
                  <h4 className="font-semibold mb-3">Form 27EQ (TCS)</h4>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-600">Same due dates as Form 26Q</p>
                    <p className="text-xs text-gray-500">For Tax Collection at Source</p>
                  </div>
                </Card>
              </div>

              <h2 className="text-2xl font-bold mt-8 mb-4">5. TDS Return Filing Checklist</h2>

              <Card className="p-6 mb-6">
                <h3 className="font-semibold text-lg mb-4">Pre-Filing Requirements</h3>
                <div className="space-y-3">
                  <label className="flex items-start gap-3">
                    <input type="checkbox" className="rounded mt-1" />
                    <div>
                      <p className="font-medium">Update TAN Registration</p>
                      <p className="text-sm text-gray-600">Ensure TAN details are updated on TRACES</p>
                    </div>
                  </label>
                  <label className="flex items-start gap-3">
                    <input type="checkbox" className="rounded mt-1" />
                    <div>
                      <p className="font-medium">Reconcile Challan Details</p>
                      <p className="text-sm text-gray-600">Match Book of Accounts with Challan Status</p>
                    </div>
                  </label>
                  <label className="flex items-start gap-3">
                    <input type="checkbox" className="rounded mt-1" />
                    <div>
                      <p className="font-medium">Validate PAN Details</p>
                      <p className="text-sm text-gray-600">Verify all deductee PANs on Income Tax portal</p>
                    </div>
                  </label>
                  <label className="flex items-start gap-3">
                    <input type="checkbox" className="rounded mt-1" />
                    <div>
                      <p className="font-medium">Prepare Deductee-wise Annexures</p>
                      <p className="text-sm text-gray-600">Compile transaction details for each deductee</p>
                    </div>
                  </label>
                  <label className="flex items-start gap-3">
                    <input type="checkbox" className="rounded mt-1" />
                    <div>
                      <p className="font-medium">Download Previous Quarter FVU</p>
                      <p className="text-sm text-gray-600">For reference and consistency check</p>
                    </div>
                  </label>
                </div>
              </Card>

              <h2 className="text-2xl font-bold mt-8 mb-4">6. TDS Certificate Issuance</h2>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <Card className="p-4 bg-blue-50">
                  <h4 className="font-semibold mb-3 text-blue-900">Form 16 (Salary)</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                      <span><strong>Due Date:</strong> 15th June</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                      <span><strong>Part A:</strong> From TRACES</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                      <span><strong>Part B:</strong> Salary details</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                      <span>Digital signature mandatory</span>
                    </li>
                  </ul>
                </Card>

                <Card className="p-4 bg-green-50">
                  <h4 className="font-semibold mb-3 text-green-900">Form 16A (Non-Salary)</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span><strong>Due:</strong> Within 15 days of due date of return</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span>Download from TRACES</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span>Quarterly issuance</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span>Digital/Manual signature</span>
                    </li>
                  </ul>
                </Card>
              </div>

              <h2 className="text-2xl font-bold mt-8 mb-4">7. Common TDS Compliance Errors to Avoid</h2>

              <div className="space-y-4 mb-6">
                <Alert className="border-red-200 bg-red-50">
                  <XCircle className="h-5 w-5 text-red-600" />
                  <AlertTitle className="text-red-900">Critical Errors</AlertTitle>
                  <AlertDescription className="mt-2">
                    <ul className="space-y-1 text-sm text-red-800">
                      <li>• Wrong section selection leading to incorrect TDS rate</li>
                      <li>• PAN mismatch resulting in demand notices</li>
                      <li>• Late deposit attracting interest and penalty</li>
                      <li>• Incorrect challan-deductee mapping</li>
                    </ul>
                  </AlertDescription>
                </Alert>

                <Alert className="border-yellow-200 bg-yellow-50">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <AlertTitle className="text-yellow-900">Common Mistakes</AlertTitle>
                  <AlertDescription className="mt-2">
                    <ul className="space-y-1 text-sm text-yellow-800">
                      <li>• Not considering threshold limits on cumulative basis</li>
                      <li>• Missing to deduct TDS on reimbursements forming part of income</li>
                      <li>• Ignoring GST component while calculating TDS</li>
                      <li>• Not obtaining/verifying lower deduction certificates</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </div>

              <h2 className="text-2xl font-bold mt-8 mb-4">8. Penalties for Non-Compliance</h2>

              <Card className="p-6 mb-6 bg-red-50">
                <h3 className="font-semibold text-lg mb-4 text-red-900">Penalty Provisions</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <span className="font-bold text-red-600">234E:</span>
                    <div>
                      <p className="font-medium">Late Filing Fee</p>
                      <p className="text-gray-600">₹200 per day until return is filed</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="font-bold text-red-600">201(1A):</span>
                    <div>
                      <p className="font-medium">Interest for Late Deposit</p>
                      <p className="text-gray-600">1% per month from deduction date to deposit date</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="font-bold text-red-600">221:</span>
                    <div>
                      <p className="font-medium">Penalty for Non-Payment</p>
                      <p className="text-gray-600">Equal to tax amount not deposited</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="font-bold text-red-600">271H:</span>
                    <div>
                      <p className="font-medium">Incorrect Information</p>
                      <p className="text-gray-600">₹10,000 to ₹1,00,000</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="font-bold text-red-600">276B:</span>
                    <div>
                      <p className="font-medium">Prosecution</p>
                      <p className="text-gray-600">Rigorous imprisonment 3 months to 7 years</p>
                    </div>
                  </div>
                </div>
              </Card>

              <h2 className="text-2xl font-bold mt-8 mb-4">9. Month-wise TDS Compliance Calendar</h2>

              <Card className="p-6 mb-6">
                <h3 className="font-semibold text-lg mb-4">Recurring Monthly Tasks</h3>
                <div className="space-y-4">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-semibold">7th of Every Month</h4>
                    <ul className="text-sm text-gray-600 space-y-1 mt-1">
                      <li>• Deposit TDS deducted in previous month</li>
                      <li>• Generate and save challan copies</li>
                      <li>• Update TDS register</li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-green-500 pl-4">
                    <h4 className="font-semibold">Quarterly (Jul 31, Oct 31, Jan 31, May 31)</h4>
                    <ul className="text-sm text-gray-600 space-y-1 mt-1">
                      <li>• File TDS returns (24Q, 26Q, 27Q)</li>
                      <li>• Download and validate FVU file</li>
                      <li>• Process correction statements if required</li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-purple-500 pl-4">
                    <h4 className="font-semibold">Annual Tasks</h4>
                    <ul className="text-sm text-gray-600 space-y-1 mt-1">
                      <li>• <strong>May 31:</strong> File Q4 returns with Form 16 annexure</li>
                      <li>• <strong>June 15:</strong> Issue Form 16 to employees</li>
                      <li>• <strong>June 30:</strong> Issue Form 16A for Q4</li>
                    </ul>
                  </div>
                </div>
              </Card>

              <h2 className="text-2xl font-bold mt-8 mb-4">10. Best Practices for TDS Compliance</h2>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <Card className="p-4">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Documentation
                  </h4>
                  <ul className="text-sm space-y-1 text-gray-600">
                    <li>• Maintain TDS registers</li>
                    <li>• Keep PAN cards copies</li>
                    <li>• File all certificates</li>
                    <li>• Save challan receipts</li>
                  </ul>
                </Card>

                <Card className="p-4">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Technology
                  </h4>
                  <ul className="text-sm space-y-1 text-gray-600">
                    <li>• Use TDS software</li>
                    <li>• Automate calculations</li>
                    <li>• Set payment reminders</li>
                    <li>• Regular TRACES sync</li>
                  </ul>
                </Card>

                <Card className="p-4">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Reconciliation
                  </h4>
                  <ul className="text-sm space-y-1 text-gray-600">
                    <li>• Monthly 26AS check</li>
                    <li>• Quarterly Form 16A</li>
                    <li>• Annual tax audit</li>
                    <li>• Vendor confirmations</li>
                  </ul>
                </Card>

                <Card className="p-4">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Compliance
                  </h4>
                  <ul className="text-sm space-y-1 text-gray-600">
                    <li>• Update on law changes</li>
                    <li>• Regular training</li>
                    <li>• Internal audits</li>
                    <li>• Expert consultation</li>
                  </ul>
                </Card>
              </div>

              <Alert className="mb-6">
                <Shield className="h-5 w-5" />
                <AlertTitle>Pro Tip for CAs</AlertTitle>
                <AlertDescription>
                  Create a master TDS compliance calendar at the beginning of each financial year with all due dates,
                  and set automated reminders 3 days before each deadline. This prevents last-minute rush and penalties.
                </AlertDescription>
              </Alert>

              <h2 className="text-2xl font-bold mt-8 mb-4">Conclusion</h2>

              <p>
                TDS compliance is a critical aspect of tax administration that requires meticulous attention to detail
                and adherence to timelines. This comprehensive checklist covers all essential aspects of TDS compliance
                for FY 2025-26, from deduction to deposit, return filing to certificate issuance.
              </p>

              <p className="mt-4">
                By following this checklist systematically, CAs can ensure error-free TDS compliance for their clients,
                avoid penalties, and maintain a good compliance rating. Remember, the key to successful TDS management
                lies in proper planning, timely execution, and regular monitoring of compliance status.
              </p>

              <p className="mt-4 font-semibold">
                Stay updated with the latest TDS provisions and use technology to automate routine compliance tasks,
                allowing you to focus on providing value-added services to your clients.
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Quick Links */}
              <Card className="p-6 bg-purple-50 border-purple-200">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Quick Navigation
                </h3>
                <nav className="space-y-2 text-sm">
                  <a href="#" className="block text-purple-700 hover:text-purple-900">→ TDS Deduction Checklist</a>
                  <a href="#" className="block text-purple-700 hover:text-purple-900">→ TDS Rates Table</a>
                  <a href="#" className="block text-purple-700 hover:text-purple-900">→ Deposit Due Dates</a>
                  <a href="#" className="block text-purple-700 hover:text-purple-900">→ Return Filing Schedule</a>
                  <a href="#" className="block text-purple-700 hover:text-purple-900">→ Penalties & Interest</a>
                  <a href="#" className="block text-purple-700 hover:text-purple-900">→ Best Practices</a>
                </nav>
              </Card>

              {/* Important Dates */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Next Due Dates</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">TDS Deposit (Sep):</span>
                    <span className="font-semibold">Oct 7</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Q2 Return (26Q):</span>
                    <span className="font-semibold">Oct 31</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Q2 Return (24Q):</span>
                    <span className="font-semibold">Oct 31</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Form 16A (Q2):</span>
                    <span className="font-semibold">Nov 15</span>
                  </div>
                </div>
              </Card>

              {/* TDS Calculator */}
              <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50">
                <Calculator className="h-8 w-8 text-purple-600 mb-3" />
                <h3 className="font-semibold mb-2">TDS Calculator</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Calculate TDS instantly for any payment type
                </p>
                <Link href="/tools/tds-calculator">
                  <Button className="w-full">Open Calculator</Button>
                </Link>
              </Card>

              {/* Download Resources */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Free Downloads
                </h3>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start text-sm">
                    📄 TDS Rate Chart PDF
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-sm">
                    📋 Compliance Checklist
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-sm">
                    📅 TDS Calendar 2025-26
                  </Button>
                </div>
              </Card>

              {/* Related Tools */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Related Tools</h3>
                <div className="space-y-2">
                  <Link href="/tools/advance-tax-calculator" className="block text-blue-600 hover:underline text-sm">
                    → Advance Tax Calculator
                  </Link>
                  <Link href="/tools/income-tax-calculator" className="block text-blue-600 hover:underline text-sm">
                    → Income Tax Calculator
                  </Link>
                  <Link href="/tools/gst-calculator" className="block text-blue-600 hover:underline text-sm">
                    → GST Calculator
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}