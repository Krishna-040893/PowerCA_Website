'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { XCircle, RefreshCw, Phone, Mail, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function PaymentFailedPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card className="shadow-xl border-red-200">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <XCircle className="w-20 h-20 text-red-600 mx-auto" />
            </div>
            <CardTitle className="text-3xl text-red-800">
              Payment Failed
            </CardTitle>
            <CardDescription className="text-lg mt-2">
              Your transaction could not be completed
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="bg-red-50 rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-3">What went wrong?</h3>
              <p className="text-gray-700 mb-4">
                Your payment could not be processed. This might have happened due to:
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">•</span>
                  Insufficient funds in your account
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">•</span>
                  Card details entered incorrectly
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">•</span>
                  Transaction declined by your bank
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">•</span>
                  Network connectivity issues
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">What can you do?</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="bg-blue-100 rounded-full p-1 mr-3 mt-0.5">
                    <RefreshCw className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Try again</p>
                    <p className="text-sm text-gray-600">
                      Check your payment details and retry the transaction
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="bg-blue-100 rounded-full p-1 mr-3 mt-0.5">
                    <Phone className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Contact your bank</p>
                    <p className="text-sm text-gray-600">
                      Verify if there are any restrictions on your card
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="bg-blue-100 rounded-full p-1 mr-3 mt-0.5">
                    <Mail className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Get help from us</p>
                    <p className="text-sm text-gray-600">
                      Our support team can assist you with the payment
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Need assistance?</strong> We're here to help!
                Call us at <a href="tel:+919876543210" className="underline">+91 98765 43210</a> or
                email <a href="mailto:support@powerca.in" className="underline">support@powerca.in</a>
              </p>
            </div>

            <div className="bg-yellow-50 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> No amount has been deducted from your account. 
                If you see any charge, it will be automatically refunded within 3-5 business days.
              </p>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-3">
            <Button 
              className="w-full bg-primary-600 hover:bg-primary-700"
              onClick={() => router.push('/checkout')}
            >
              <RefreshCw className="mr-2 w-4 h-4" />
              Try Payment Again
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              asChild
            >
              <Link href="/">
                <ArrowLeft className="mr-2 w-4 h-4" />
                Back to Home
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}