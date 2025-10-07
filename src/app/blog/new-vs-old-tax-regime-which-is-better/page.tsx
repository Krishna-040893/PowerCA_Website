import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, Calendar, Clock, User, Calculator, TrendingUp, AlertCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'New vs Old Tax Regime 2025-26: Which is Better for You? | PowerCA',
  description: 'Detailed comparison of New vs Old tax regime for FY 2025-26. Calculate which regime saves more tax based on your income, deductions, and investments.',
  keywords: 'new tax regime 2025, old tax regime, income tax slabs 2025-26, tax regime comparison, which tax regime is better, section 80C, standard deduction',
  openGraph: {
    title: 'New vs Old Tax Regime: Complete Comparison Guide 2025-26',
    description: 'Find out which tax regime saves you more money in FY 2025-26',
    type: 'article',
    publishedTime: '2025-09-22T00:00:00.000Z',
    authors: ['PowerCA Team'],
  },
}

export default function TaxRegimeComparisonPage() {
  return (
    <article className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 text-white">
        <div className="container mx-auto px-6 py-12">
          <Link href="/blog">
            <Button variant="ghost" className="text-white hover:bg-white/10 mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Button>
          </Link>

          <div className="max-w-4xl">
            <div className="flex items-center gap-4 text-sm mb-4">
              <span className="bg-white/20 px-3 py-1 rounded-full">Tax Planning</span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                September 22, 2025
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                10 min read
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              New vs Old Tax Regime: Which is Better for You in 2025-26?
            </h1>

            <p className="text-xl text-green-100">
              A comprehensive analysis of both tax regimes with real calculations to help you make the right choice for FY 2025-26.
            </p>

            <div className="flex items-center gap-2 mt-6">
              <User className="h-5 w-5" />
              <span>By PowerCA Tax Experts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 prose prose-lg max-w-none">
            <div className="bg-green-50 border-l-4 border-green-500 p-6 mb-8">
              <h3 className="text-lg font-semibold mb-2">Key Takeaway</h3>
              <p className="m-0">
                The new tax regime is now the default option from FY 2023-24, offering lower tax rates but no deductions.
                Your choice depends on your salary structure, investments, and loan commitments. This guide helps you decide.
              </p>
            </div>

            <h2 className="text-2xl font-semibold mt-8 mb-4 leading-normal">Understanding Both Tax Regimes</h2>

            <h3 className="text-xl font-semibold mt-6 mb-3">New Tax Regime (Default from FY 2023-24 onwards)</h3>

            <p>
              The new tax regime offers lower tax rates with a simplified structure but doesn't allow most deductions
              and exemptions under Chapter VI-A (except a few like employer's NPS contribution).
            </p>

            <div className="my-6">
              <h4 className="font-semibold mb-3">New Tax Regime Slabs (FY 2025-26)</h4>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border px-4 py-2 text-left">Income Slab</th>
                    <th className="border px-4 py-2">Tax Rate</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border px-4 py-2">Up to ₹3,00,000</td>
                    <td className="border px-4 py-2 text-center">Nil</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border px-4 py-2">₹3,00,001 - ₹7,00,000</td>
                    <td className="border px-4 py-2 text-center">5%</td>
                  </tr>
                  <tr>
                    <td className="border px-4 py-2">₹7,00,001 - ₹10,00,000</td>
                    <td className="border px-4 py-2 text-center">10%</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border px-4 py-2">₹10,00,001 - ₹12,00,000</td>
                    <td className="border px-4 py-2 text-center">15%</td>
                  </tr>
                  <tr>
                    <td className="border px-4 py-2">₹12,00,001 - ₹15,00,000</td>
                    <td className="border px-4 py-2 text-center">20%</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border px-4 py-2">Above ₹15,00,000</td>
                    <td className="border px-4 py-2 text-center">30%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg my-6">
              <p className="font-semibold mb-2">✅ Benefits of New Regime:</p>
              <ul className="space-y-1">
                <li>• Standard deduction of ₹75,000 (increased from ₹50,000)</li>
                <li>• Tax rebate under Section 87A up to ₹7,00,000 income (₹25,000 rebate)</li>
                <li>• Lower tax rates across all slabs</li>
                <li>• No need to maintain investment proofs</li>
                <li>• Simpler tax calculation</li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold mt-6 mb-3">Old Tax Regime</h3>

            <p>
              The old tax regime has higher tax rates but allows various deductions and exemptions,
              making it beneficial for those with significant investments and loan commitments.
            </p>

            <div className="my-6">
              <h4 className="font-semibold mb-3">Old Tax Regime Slabs (FY 2025-26)</h4>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border px-4 py-2 text-left">Income Slab</th>
                    <th className="border px-4 py-2">Tax Rate</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border px-4 py-2">Up to ₹2,50,000</td>
                    <td className="border px-4 py-2 text-center">Nil</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border px-4 py-2">₹2,50,001 - ₹5,00,000</td>
                    <td className="border px-4 py-2 text-center">5%</td>
                  </tr>
                  <tr>
                    <td className="border px-4 py-2">₹5,00,001 - ₹10,00,000</td>
                    <td className="border px-4 py-2 text-center">20%</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border px-4 py-2">Above ₹10,00,000</td>
                    <td className="border px-4 py-2 text-center">30%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg my-6">
              <p className="font-semibold mb-2">📋 Deductions Available in Old Regime:</p>
              <ul className="space-y-1">
                <li>• Section 80C: ₹1,50,000 (PF, PPF, ELSS, LIC, etc.)</li>
                <li>• Section 80D: Medical insurance premiums</li>
                <li>• Section 24(b): Home loan interest up to ₹2,00,000</li>
                <li>• Section 80E: Education loan interest</li>
                <li>• HRA exemption under Section 10(13A)</li>
                <li>• LTA under Section 10(5)</li>
                <li>• Standard deduction: ₹50,000</li>
              </ul>
            </div>

            <h2 className="text-2xl font-semibold mt-8 mb-4 leading-normal">Detailed Comparison with Examples</h2>

            <h3 className="text-xl font-semibold mt-6 mb-3">Example 1: Salaried Employee (₹10 Lakhs Annual Income)</h3>

            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="font-semibold mb-4">Scenario: Income ₹10,00,000 with typical deductions</p>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-green-700 mb-2">New Tax Regime</h4>
                  <ul className="space-y-1 text-sm">
                    <li>Gross Income: ₹10,00,000</li>
                    <li>Standard Deduction: -₹75,000</li>
                    <li>Taxable Income: ₹9,25,000</li>
                    <li className="font-semibold">Tax Calculation:</li>
                    <li>• Up to ₹3L: Nil</li>
                    <li>• ₹3-7L: ₹20,000</li>
                    <li>• ₹7-9.25L: ₹22,500</li>
                    <li className="font-semibold text-green-700">Total Tax: ₹42,500</li>
                    <li>Add Cess (4%): ₹1,700</li>
                    <li className="font-bold text-green-700">Net Tax: ₹44,200</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-blue-700 mb-2">Old Tax Regime</h4>
                  <ul className="space-y-1 text-sm">
                    <li>Gross Income: ₹10,00,000</li>
                    <li>Standard Deduction: -₹50,000</li>
                    <li>Section 80C: -₹1,50,000</li>
                    <li>Section 80D: -₹25,000</li>
                    <li>Taxable Income: ₹7,75,000</li>
                    <li className="font-semibold">Tax Calculation:</li>
                    <li>• Up to ₹2.5L: Nil</li>
                    <li>• ₹2.5-5L: ₹12,500</li>
                    <li>• ₹5-7.75L: ₹55,000</li>
                    <li className="font-semibold text-blue-700">Total Tax: ₹67,500</li>
                    <li>Add Cess (4%): ₹2,700</li>
                    <li className="font-bold text-blue-700">Net Tax: ₹70,200</li>
                  </ul>
                </div>
              </div>

              <div className="mt-4 p-3 bg-green-100 rounded">
                <p className="font-semibold text-green-800">
                  💰 Savings with New Regime: ₹26,000 per year
                </p>
              </div>
            </div>

            <h3 className="text-xl font-semibold mt-6 mb-3">Example 2: High Income with Home Loan (₹20 Lakhs)</h3>

            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="font-semibold mb-4">Scenario: Income ₹20,00,000 with home loan</p>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-green-700 mb-2">New Tax Regime</h4>
                  <ul className="space-y-1 text-sm">
                    <li>Gross Income: ₹20,00,000</li>
                    <li>Standard Deduction: -₹75,000</li>
                    <li>Taxable Income: ₹19,25,000</li>
                    <li className="font-semibold">Tax Calculation:</li>
                    <li>• Total Tax: ₹3,27,500</li>
                    <li>Add Cess (4%): ₹13,100</li>
                    <li className="font-bold text-green-700">Net Tax: ₹3,40,600</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-blue-700 mb-2">Old Tax Regime</h4>
                  <ul className="space-y-1 text-sm">
                    <li>Gross Income: ₹20,00,000</li>
                    <li>Standard Deduction: -₹50,000</li>
                    <li>Section 80C: -₹1,50,000</li>
                    <li>Home Loan Interest: -₹2,00,000</li>
                    <li>Section 80D: -₹50,000</li>
                    <li>Taxable Income: ₹15,50,000</li>
                    <li className="font-semibold">Tax Calculation:</li>
                    <li>• Total Tax: ₹3,37,500</li>
                    <li>Add Cess (4%): ₹13,500</li>
                    <li className="font-bold text-blue-700">Net Tax: ₹3,51,000</li>
                  </ul>
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-100 rounded">
                <p className="font-semibold text-blue-800">
                  💰 Old Regime still beneficial by: ₹10,400 (if maximizing deductions)
                </p>
              </div>
            </div>

            <h2 className="text-2xl font-semibold mt-8 mb-4 leading-normal">Who Should Choose Which Regime?</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="font-bold text-green-700 mb-3">Choose New Regime If:</h3>
                <ul className="space-y-2 text-sm">
                  <li>✅ Income below ₹7 lakhs (tax-free with rebate)</li>
                  <li>✅ Limited deductions ({'<'} ₹2.5 lakhs total)</li>
                  <li>✅ No home loan or major investments</li>
                  <li>✅ Young professionals starting careers</li>
                  <li>✅ Want simpler tax filing</li>
                  <li>✅ Don't want to lock money in tax-saving instruments</li>
                </ul>
              </Card>

              <Card className="p-6">
                <h3 className="font-bold text-blue-700 mb-3">Choose Old Regime If:</h3>
                <ul className="space-y-2 text-sm">
                  <li>✅ Have home loan EMIs</li>
                  <li>✅ High HRA (living in rented accommodation)</li>
                  <li>✅ Already investing ₹1.5L+ in 80C instruments</li>
                  <li>✅ Children's education fees (80C)</li>
                  <li>✅ High medical insurance premiums</li>
                  <li>✅ Total deductions exceed ₹3.5 lakhs</li>
                </ul>
              </Card>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 my-8">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-6 w-6 text-orange-600 mt-1" />
                <div>
                  <h4 className="font-semibold text-orange-900 mb-2">Important Points to Remember</h4>
                  <ul className="space-y-2 text-orange-800">
                    <li>• Once you opt for the new regime, you can switch back to old regime only once</li>
                    <li>• Salaried individuals can change regime every year</li>
                    <li>• Business income earners have restrictions on switching</li>
                    <li>• New regime is now default - you must opt for old regime explicitly</li>
                    <li>• Employer needs Form 10-IEA for old regime TDS calculation</li>
                  </ul>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-semibold mt-8 mb-4 leading-normal">Quick Decision Framework</h2>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-semibold mb-4">Calculate Your Break-Even Point:</h3>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="font-bold text-blue-600">Step 1:</span>
                  <p>List all your current deductions (80C, 80D, HRA, LTA, Home loan interest)</p>
                </div>

                <div className="flex items-start gap-3">
                  <span className="font-bold text-blue-600">Step 2:</span>
                  <p>If total deductions {'<'} ₹2.5 lakhs → New regime likely better</p>
                </div>

                <div className="flex items-start gap-3">
                  <span className="font-bold text-blue-600">Step 3:</span>
                  <p>If total deductions {'>'} ₹3.5 lakhs → Old regime likely better</p>
                </div>

                <div className="flex items-start gap-3">
                  <span className="font-bold text-blue-600">Step 4:</span>
                  <p>In between? Calculate tax under both and compare</p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-100 rounded">
                <p className="font-semibold">
                  💡 Pro Tip: Use our <Link href="/tools/income-tax-calculator" className="text-blue-600 underline">Income Tax Calculator</Link> to compare both regimes instantly!
                </p>
              </div>
            </div>

            <h2 className="text-2xl font-semibold mt-8 mb-4 leading-normal">Tax Planning Strategies</h2>

            <h3 className="text-xl font-semibold mt-6 mb-3">If You Choose New Regime:</h3>
            <ul className="space-y-2">
              <li>• Maximize employer benefits like meal vouchers, travel allowance</li>
              <li>• Invest in high-return instruments without tax-saving pressure</li>
              <li>• Focus on post-tax returns rather than tax deductions</li>
              <li>• Consider NPS for additional ₹50,000 deduction (allowed in new regime)</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">If You Choose Old Regime:</h3>
            <ul className="space-y-2">
              <li>• Maximize Section 80C limit through PPF, ELSS, Insurance</li>
              <li>• Claim full HRA exemption if living in rented accommodation</li>
              <li>• Utilize Section 80D for family health insurance</li>
              <li>• Plan home loan prepayments strategically</li>
              <li>• Keep all investment proofs organized for filing</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4 leading-normal">Conclusion</h2>

            <p>
              The choice between new and old tax regime depends entirely on your personal financial situation.
              While the new regime offers simplicity and lower tax rates, the old regime can still be beneficial
              for those with significant deductions and investments.
            </p>

            <p>
              As a general rule, if your total deductions exceed ₹3.5 lakhs, the old regime might save you more tax.
              However, with the increased standard deduction of ₹75,000 in the new regime and the higher rebate limit,
              many taxpayers, especially those with income up to ₹10-12 lakhs, might find the new regime more beneficial.
            </p>

            <p className="font-semibold">
              Remember: Tax planning is not just about choosing the right regime but also about overall financial planning.
              Consider your long-term financial goals, liquidity needs, and investment preferences when making this decision.
            </p>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Tax Calculator CTA */}
              <Card className="p-6 bg-gradient-to-br from-blue-50 to-green-50 border-blue-200">
                <Calculator className="h-8 w-8 text-blue-600 mb-3" />
                <h3 className="font-semibold mb-2">Calculate Your Tax Now</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Compare both regimes instantly with our smart calculator
                </p>
                <Link href="/tools/income-tax-calculator">
                  <Button className="w-full">Open Tax Calculator</Button>
                </Link>
              </Card>

              {/* Quick Reference */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Quick Reference</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-medium text-gray-700">New Regime Benefits:</p>
                    <p className="text-gray-600">• ₹75,000 standard deduction</p>
                    <p className="text-gray-600">• Lower tax rates</p>
                    <p className="text-gray-600">• ₹7L rebate limit</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Old Regime Benefits:</p>
                    <p className="text-gray-600">• All Chapter VI-A deductions</p>
                    <p className="text-gray-600">• HRA exemption</p>
                    <p className="text-gray-600">• Home loan benefits</p>
                  </div>
                </div>
              </Card>

              {/* Income Slabs Comparison */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Tax Saved by Income
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>₹5L income</span>
                    <span className="font-medium text-green-600">New better</span>
                  </div>
                  <div className="flex justify-between">
                    <span>₹7.5L income</span>
                    <span className="font-medium text-green-600">New better</span>
                  </div>
                  <div className="flex justify-between">
                    <span>₹10L income</span>
                    <span className="font-medium text-gray-600">Depends</span>
                  </div>
                  <div className="flex justify-between">
                    <span>₹15L income</span>
                    <span className="font-medium text-blue-600">Old if {'>'}3.5L deductions</span>
                  </div>
                </div>
              </Card>

              {/* Related Articles */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Related Articles</h3>
                <div className="space-y-2">
                  <Link href="/blog/how-to-file-gst-returns-2024" className="block text-blue-600 hover:underline text-sm">
                    → GST Return Filing Guide 2024
                  </Link>
                  <Link href="/blog/tds-compliance-checklist" className="block text-blue-600 hover:underline text-sm">
                    → TDS Compliance Checklist
                  </Link>
                  <Link href="#" className="block text-blue-600 hover:underline text-sm">
                    → Tax Saving Tips for Salaried
                  </Link>
                </div>
              </Card>

              {/* Newsletter */}
              <Card className="p-6 bg-blue-50 border-blue-200">
                <h3 className="font-semibold mb-2">Get Tax Updates</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Stay updated with latest tax laws and compliance requirements
                </p>
                <Link href="/book-demo">
                  <Button variant="outline" className="w-full">Subscribe</Button>
                </Link>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}