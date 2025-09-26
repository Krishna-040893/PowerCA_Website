'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Calculator, RefreshCw, Download } from 'lucide-react'
import Link from 'next/link'

export default function IncomeTaxCalculatorPage() {
  const [regime, setRegime] = useState<'old' | 'new'>('new')
  const [age, setAge] = useState<'below60' | '60to80' | 'above80'>('below60')
  const [income, setIncome] = useState<string>('')

  // Deductions for Old Regime
  const [section80C, setSection80C] = useState<string>('')
  const [section80D, setSection80D] = useState<string>('')
  const [section80G, setSection80G] = useState<string>('')
  const [homeLoanInterest, setHomeLoanInterest] = useState<string>('')
  const [otherDeductions, setOtherDeductions] = useState<string>('')

  // Standard Deduction
  const [standardDeduction] = useState(75000) // FY 2024-25

  const [results, setResults] = useState({
    grossIncome: 0,
    deductions: 0,
    taxableIncome: 0,
    taxAmount: 0,
    surcharge: 0,
    educationCess: 0,
    totalTax: 0,
    netIncome: 0,
    effectiveRate: 0,
    monthlyTax: 0
  })

  const calculateTax = () => {
    const grossIncome = parseFloat(income) || 0

    let totalDeductions = 0
    let taxableIncome = grossIncome

    if (regime === 'new') {
      // New Regime - Standard deduction only
      totalDeductions = Math.min(standardDeduction, grossIncome)
      taxableIncome = grossIncome - totalDeductions
    } else {
      // Old Regime - All deductions
      const sec80C = Math.min(parseFloat(section80C) || 0, 150000)
      const sec80D = Math.min(parseFloat(section80D) || 0, 100000)
      const sec80G = parseFloat(section80G) || 0
      const homeLoan = Math.min(parseFloat(homeLoanInterest) || 0, 200000)
      const others = parseFloat(otherDeductions) || 0

      totalDeductions = standardDeduction + sec80C + sec80D + sec80G + homeLoan + others
      taxableIncome = Math.max(0, grossIncome - totalDeductions)
    }

    // Calculate tax based on regime and age
    let tax = 0

    if (regime === 'new') {
      // New Tax Regime (FY 2024-25)
      if (taxableIncome <= 300000) {
        tax = 0
      } else if (taxableIncome <= 700000) {
        tax = (taxableIncome - 300000) * 0.05
      } else if (taxableIncome <= 1000000) {
        tax = 20000 + (taxableIncome - 700000) * 0.10
      } else if (taxableIncome <= 1200000) {
        tax = 50000 + (taxableIncome - 1000000) * 0.15
      } else if (taxableIncome <= 1500000) {
        tax = 80000 + (taxableIncome - 1200000) * 0.20
      } else {
        tax = 140000 + (taxableIncome - 1500000) * 0.30
      }
    } else {
      // Old Tax Regime with age-based slabs
      let basicExemption = 250000
      if (age === '60to80') basicExemption = 300000
      if (age === 'above80') basicExemption = 500000

      if (taxableIncome <= basicExemption) {
        tax = 0
      } else if (taxableIncome <= 500000) {
        tax = (taxableIncome - basicExemption) * 0.05
      } else if (taxableIncome <= 1000000) {
        tax = (500000 - basicExemption) * 0.05 + (taxableIncome - 500000) * 0.20
      } else {
        tax = (500000 - basicExemption) * 0.05 + 500000 * 0.20 + (taxableIncome - 1000000) * 0.30
      }
    }

    // Rebate u/s 87A
    if (regime === 'new' && taxableIncome <= 700000) {
      tax = 0 // Full rebate
    } else if (regime === 'old' && taxableIncome <= 500000) {
      tax = Math.max(0, tax - 12500)
    }

    // Surcharge
    let surcharge = 0
    if (taxableIncome > 5000000 && taxableIncome <= 10000000) {
      surcharge = tax * 0.10
    } else if (taxableIncome > 10000000 && taxableIncome <= 20000000) {
      surcharge = tax * 0.15
    } else if (taxableIncome > 20000000 && taxableIncome <= 50000000) {
      surcharge = tax * 0.25
    } else if (taxableIncome > 50000000) {
      surcharge = tax * 0.37
    }

    // Education Cess (4%)
    const educationCess = (tax + surcharge) * 0.04
    const totalTax = tax + surcharge + educationCess
    const netIncome = grossIncome - totalTax
    const effectiveRate = grossIncome > 0 ? (totalTax / grossIncome) * 100 : 0
    const monthlyTax = totalTax / 12

    setResults({
      grossIncome: Math.round(grossIncome * 100) / 100,
      deductions: Math.round(totalDeductions * 100) / 100,
      taxableIncome: Math.round(taxableIncome * 100) / 100,
      taxAmount: Math.round(tax * 100) / 100,
      surcharge: Math.round(surcharge * 100) / 100,
      educationCess: Math.round(educationCess * 100) / 100,
      totalTax: Math.round(totalTax * 100) / 100,
      netIncome: Math.round(netIncome * 100) / 100,
      effectiveRate: Math.round(effectiveRate * 100) / 100,
      monthlyTax: Math.round(monthlyTax * 100) / 100
    })
  }

  const resetCalculator = () => {
    setIncome('')
    setSection80C('')
    setSection80D('')
    setSection80G('')
    setHomeLoanInterest('')
    setOtherDeductions('')
    setRegime('new')
    setAge('below60')
    setResults({
      grossIncome: 0,
      deductions: 0,
      taxableIncome: 0,
      taxAmount: 0,
      surcharge: 0,
      educationCess: 0,
      totalTax: 0,
      netIncome: 0,
      effectiveRate: 0,
      monthlyTax: 0
    })
  }

  const downloadResults = () => {
    const content = `Income Tax Calculation Results (FY 2024-25)
==========================================
Tax Regime: ${regime === 'new' ? 'New Tax Regime' : 'Old Tax Regime'}
Age Group: ${age === 'below60' ? 'Below 60 years' : age === '60to80' ? '60-80 years' : 'Above 80 years'}

Income Details:
--------------
Gross Annual Income: ₹${results.grossIncome.toLocaleString('en-IN')}
Total Deductions: ₹${results.deductions.toLocaleString('en-IN')}
Taxable Income: ₹${results.taxableIncome.toLocaleString('en-IN')}

Tax Calculation:
---------------
Income Tax: ₹${results.taxAmount.toLocaleString('en-IN')}
Surcharge: ₹${results.surcharge.toLocaleString('en-IN')}
Education Cess (4%): ₹${results.educationCess.toLocaleString('en-IN')}
Total Tax Payable: ₹${results.totalTax.toLocaleString('en-IN')}

Summary:
--------
Net Income (After Tax): ₹${results.netIncome.toLocaleString('en-IN')}
Effective Tax Rate: ${results.effectiveRate}%
Monthly Tax (TDS): ₹${results.monthlyTax.toLocaleString('en-IN')}

Generated by PowerCA Income Tax Calculator
https://powerca.in/tools/income-tax-calculator`

    const blob = new Blob([content], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `income-tax-calculation-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="container mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Income Tax Calculator India 2024-25
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Calculate your income tax for FY 2024-25 (AY 2025-26). Compare New vs Old tax regime instantly.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Calculator Input */}
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <Calculator className="h-6 w-6 text-blue-600" />
              Income Tax Calculator
            </h2>

            <div className="space-y-6">
              {/* Tax Regime Selection */}
              <div>
                <Label className="text-base font-semibold mb-3 block">Select Tax Regime</Label>
                <RadioGroup value={regime} onValueChange={(value: 'old' | 'new') => setRegime(value)}>
                  <div className="flex items-center space-x-2 mb-2">
                    <RadioGroupItem value="new" id="new" />
                    <Label htmlFor="new" className="cursor-pointer">
                      New Tax Regime (Lower rates, Limited deductions)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="old" id="old" />
                    <Label htmlFor="old" className="cursor-pointer">
                      Old Tax Regime (Higher rates, More deductions)
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Age Group */}
              <div>
                <Label htmlFor="age" className="text-base font-semibold mb-2 block">
                  Age Group
                </Label>
                <Select value={age} onValueChange={(value: 'below60' | '60to80' | 'above80') => setAge(value)}>
                  <SelectTrigger id="age">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="below60">Below 60 years</SelectItem>
                    <SelectItem value="60to80">60 to 80 years (Senior Citizen)</SelectItem>
                    <SelectItem value="above80">Above 80 years (Super Senior)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Annual Income */}
              <div>
                <Label htmlFor="income" className="text-base font-semibold mb-2 block">
                  Gross Annual Income
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                  <Input
                    id="income"
                    type="number"
                    value={income}
                    onChange={(e) => setIncome(e.target.value)}
                    placeholder="Enter annual income"
                    className="pl-8"
                  />
                </div>
              </div>

              {/* Deductions (Only for Old Regime) */}
              {regime === 'old' && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900">Deductions (Old Regime)</h3>

                  <div>
                    <Label htmlFor="80c" className="text-sm">
                      Section 80C (Max ₹1,50,000)
                    </Label>
                    <Input
                      id="80c"
                      type="number"
                      value={section80C}
                      onChange={(e) => setSection80C(e.target.value)}
                      placeholder="PF, PPF, LIC, ELSS, etc."
                    />
                  </div>

                  <div>
                    <Label htmlFor="80d" className="text-sm">
                      Section 80D - Medical Insurance (Max ₹1,00,000)
                    </Label>
                    <Input
                      id="80d"
                      type="number"
                      value={section80D}
                      onChange={(e) => setSection80D(e.target.value)}
                      placeholder="Health insurance premium"
                    />
                  </div>

                  <div>
                    <Label htmlFor="home-loan" className="text-sm">
                      Home Loan Interest (Max ₹2,00,000)
                    </Label>
                    <Input
                      id="home-loan"
                      type="number"
                      value={homeLoanInterest}
                      onChange={(e) => setHomeLoanInterest(e.target.value)}
                      placeholder="Section 24"
                    />
                  </div>

                  <div>
                    <Label htmlFor="other" className="text-sm">
                      Other Deductions
                    </Label>
                    <Input
                      id="other"
                      type="number"
                      value={otherDeductions}
                      onChange={(e) => setOtherDeductions(e.target.value)}
                      placeholder="80G, 80E, etc."
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button onClick={calculateTax} className="flex-1">
                  <Calculator className="h-4 w-4 mr-2" />
                  Calculate Tax
                </Button>
                <Button onClick={resetCalculator} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </div>
            </div>
          </Card>

          {/* Results */}
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-6">Tax Calculation Results</h2>

            <div className="space-y-4">
              <div className="flex justify-between py-3 border-b">
                <span className="text-gray-600">Gross Annual Income</span>
                <span className="font-semibold text-lg">₹{results.grossIncome.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between py-3 border-b">
                <span className="text-gray-600">Total Deductions</span>
                <span className="font-semibold text-lg">₹{results.deductions.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between py-3 border-b">
                <span className="text-gray-600">Taxable Income</span>
                <span className="font-semibold text-lg">₹{results.taxableIncome.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between py-3 border-b">
                <span className="text-gray-600">Income Tax</span>
                <span className="font-semibold text-lg">₹{results.taxAmount.toLocaleString('en-IN')}</span>
              </div>

              {results.surcharge > 0 && (
                <div className="flex justify-between py-3 border-b">
                  <span className="text-gray-600">Surcharge</span>
                  <span className="font-semibold text-lg">₹{results.surcharge.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between py-3 border-b">
                <span className="text-gray-600">Education Cess (4%)</span>
                <span className="font-semibold text-lg">₹{results.educationCess.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between py-4 bg-red-50 px-4 rounded-lg">
                <span className="font-semibold text-gray-900">Total Tax Payable</span>
                <span className="font-bold text-2xl text-red-600">₹{results.totalTax.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between py-4 bg-green-50 px-4 rounded-lg">
                <span className="font-semibold text-gray-900">Net Income (After Tax)</span>
                <span className="font-bold text-2xl text-green-600">₹{results.netIncome.toLocaleString('en-IN')}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Effective Tax Rate</p>
                  <p className="text-xl font-bold text-blue-600">{results.effectiveRate}%</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600">Monthly TDS</p>
                  <p className="text-xl font-bold text-purple-600">₹{results.monthlyTax.toLocaleString('en-IN')}</p>
                </div>
              </div>

              {results.totalTax > 0 && (
                <Button onClick={downloadResults} variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download Calculation
                </Button>
              )}
            </div>

            {/* CTA */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-3">
                Need comprehensive tax planning and compliance management?
              </p>
              <Link href="/book-demo">
                <Button className="w-full">
                  Try PowerCA Free for 30 Days
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        {/* Info Section */}
        <div className="mt-12 max-w-4xl mx-auto">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Tax Saving Tips</h3>
            <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-600">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">New Tax Regime Benefits:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Lower tax rates</li>
                  <li>Standard deduction of ₹75,000</li>
                  <li>Tax rebate up to ₹7 lakh income</li>
                  <li>Simpler compliance</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Old Regime Benefits:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Section 80C deduction up to ₹1.5 lakh</li>
                  <li>Home loan interest deduction</li>
                  <li>Medical insurance benefits</li>
                  <li>Better for high deductions</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}