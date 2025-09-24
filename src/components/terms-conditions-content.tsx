"use client"

import { motion } from "framer-motion"

export function TermsConditionsContent() {
  return (
    <div className="relative min-h-screen">
      {/* Background Pattern */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `
              linear-gradient(to right, #1D91EB 1px, transparent 1px),
              linear-gradient(to bottom, #1D91EB 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}
        />
        
        {/* Dot pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle, #1BAF69 1.5px, transparent 1.5px)`,
            backgroundSize: '30px 30px',
            backgroundPosition: '0 0, 15px 15px'
          }}
        />
        
        {/* Diagonal lines */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 35px,
              #1D91EB 35px,
              #1D91EB 36px
            )`
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Terms and Conditions
            </h1>
            <div className="text-gray-600">
              <p className="text-lg">Effective Date: January 1, 2025</p>
              <p className="text-lg">Last Updated: January 1, 2025</p>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 space-y-8">
            {/* Section 1: Agreement to Terms */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Agreement to Terms</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                These Terms and Conditions ("Terms", "Agreement") constitute a legally binding agreement between you (whether an individual or entity, "User", "you") and TBS Technologies ("Company", "we", "us"), concerning your access to and use of the PowerCA practice management platform ("Service", "Platform") available at https://powerca.in.
              </p>
              <p className="text-gray-600 leading-relaxed">
                By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any part of these terms, you do not have permission to access the Service.
              </p>
            </section>

            {/* Section 2: Definitions */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Definitions</h2>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li><strong>"Account"</strong>: Your registered account on PowerCA</li>
                <li><strong>"Authorized Users"</strong>: Individuals authorized by you to access your account</li>
                <li><strong>"Client Data"</strong>: Information about your clients that you input into the Service</li>
                <li><strong>"Content"</strong>: All data, text, files, documents uploaded to the Service</li>
                <li><strong>"Subscription"</strong>: Your selected pricing plan and service level</li>
                <li><strong>"Professional"</strong>: Chartered Accountants, Company Secretaries, Cost Accountants</li>
              </ul>
            </section>

            {/* Section 3: Account Registration */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Account Registration</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">3.1 Eligibility</h3>
                  <p className="text-gray-600 mb-3">To use PowerCA, you must:</p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                    <li>Be at least 18 years old</li>
                    <li>Be a registered professional (CA/CS/CMA) or authorized firm</li>
                    <li>Provide accurate and complete registration information</li>
                    <li>Have the legal authority to enter into this Agreement</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">3.2 Account Security</h3>
                  <p className="text-gray-600 mb-3">You are responsible for:</p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                    <li>Maintaining confidentiality of your account credentials</li>
                    <li>All activities that occur under your account</li>
                    <li>Notifying us immediately of unauthorized access</li>
                    <li>Ensuring Authorized Users comply with these Terms</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">3.3 Account Verification</h3>
                  <p className="text-gray-600 mb-3">We reserve the right to:</p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                    <li>Verify your professional credentials</li>
                    <li>Request additional documentation</li>
                    <li>Suspend accounts pending verification</li>
                    <li>Reject registrations that don't meet our criteria</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 4: Subscription and Billing */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Subscription and Billing</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">4.1 Implementation and Subscription</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                    <li><strong>One-time Implementation Fee</strong>: ₹22,000</li>
                    <li><strong>First Year</strong>: FREE (included with implementation)</li>
                    <li><strong>Annual Renewal</strong>: Starting from second year</li>
                    <li><strong>Features</strong>: Unlimited clients, all premium features</li>
                  </ul>
                  <p className="text-gray-600 mt-3">Details at: https://powerca.in/pricing</p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">4.2 Payment Terms</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                    <li><strong>Billing Cycle</strong>: Monthly, Quarterly, or Annual (prepaid)</li>
                    <li><strong>Payment Methods</strong>: Credit/Debit cards, Net Banking, UPI via Razorpay</li>
                    <li><strong>Auto-Renewal</strong>: Subscriptions auto-renew unless cancelled</li>
                    <li><strong>Price Changes</strong>: 30-day notice for price increases</li>
                    <li><strong>Taxes</strong>: All prices exclusive of applicable GST (currently 18%)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">4.3 Free Trial</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                    <li>14-day free trial for new users</li>
                    <li>No credit card required for trial</li>
                    <li>Full feature access during trial</li>
                    <li>Automatic conversion to free plan after trial unless upgraded</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">4.4 Refund Policy</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                    <li><strong>Monthly Plans</strong>: No refunds for partial months</li>
                    <li><strong>Annual Plans</strong>: Pro-rated refund within 30 days of payment</li>
                    <li><strong>Service Issues</strong>: Refunds for extended downtime per SLA</li>
                    <li><strong>No Refunds</strong>: For violations of Terms or account termination</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">4.5 Late Payments</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                    <li><strong>Grace Period</strong>: 7 days after payment due date</li>
                    <li><strong>Service Suspension</strong>: After grace period expiration</li>
                    <li><strong>Data Access</strong>: Read-only access for 30 days post-suspension</li>
                    <li><strong>Data Deletion</strong>: After 60 days of non-payment</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 5: Service Usage */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Service Usage</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">5.1 Permitted Use</h3>
                  <p className="text-gray-600 mb-3">You may use PowerCA to:</p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                    <li>Manage your professional practice</li>
                    <li>Store and organize client information</li>
                    <li>Generate invoices and reports</li>
                    <li>Collaborate with team members</li>
                    <li>Access from multiple devices</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">5.2 Prohibited Use</h3>
                  <p className="text-gray-600 mb-3">You may NOT:</p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                    <li>Share login credentials</li>
                    <li>Use for illegal or unauthorized purposes</li>
                    <li>Violate professional ethics or regulations</li>
                    <li>Attempt to breach security measures</li>
                    <li>Reverse engineer or copy the Service</li>
                    <li>Resell or sublicense the Service</li>
                    <li>Use automated systems to access the Service</li>
                    <li>Store or transmit malicious code</li>
                    <li>Violate intellectual property rights</li>
                    <li>Impersonate others or provide false information</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">5.3 Usage Limits</h3>
                  <p className="text-gray-600 mb-3">Based on your subscription:</p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                    <li>Storage limits apply (5GB to unlimited)</li>
                    <li>API call limits (1000/hour to unlimited)</li>
                    <li>Email sending limits</li>
                    <li>Concurrent user restrictions</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 6: Intellectual Property Rights */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Intellectual Property Rights</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">6.1 Our Property</h3>
                  <p className="text-gray-600 mb-3">We retain all rights to:</p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                    <li>PowerCA platform and software</li>
                    <li>Logos, trademarks, and branding</li>
                    <li>Documentation and training materials</li>
                    <li>Features and functionality</li>
                    <li>Underlying technology and algorithms</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">6.2 Your Property</h3>
                  <p className="text-gray-600 mb-3">You retain all rights to:</p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                    <li>Your Content and Client Data</li>
                    <li>Your firm's branding and materials</li>
                    <li>Documents you create using the Service</li>
                    <li>Custom templates and reports</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">6.3 License Grants</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                    <li><strong>To You</strong>: Limited, non-exclusive right to use the Service</li>
                    <li><strong>To Us</strong>: Limited right to use your Content to provide the Service</li>
                    <li><strong>Feedback</strong>: We may use your feedback without compensation</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 7: Data Protection and Privacy */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Data Protection and Privacy</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">7.1 Data Ownership</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                    <li>You own all Client Data and Content</li>
                    <li>We are data processors, you are data controller</li>
                    <li>You're responsible for consent and compliance</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">7.2 Data Security</h3>
                  <p className="text-gray-600 mb-3">We implement:</p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                    <li>256-bit SSL encryption</li>
                    <li>Daily automated backups</li>
                    <li>Role-based access controls</li>
                    <li>Regular security audits</li>
                    <li>VAPT testing annually</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">7.3 Data Portability</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                    <li>Export your data anytime in CSV/Excel format</li>
                    <li>API access for data retrieval</li>
                    <li>30-day post-cancellation access</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">7.4 Confidentiality</h3>
                  <p className="text-gray-600 mb-3">We will:</p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                    <li>Keep your data confidential</li>
                    <li>Not access except for support/maintenance</li>
                    <li>Not share with third parties without consent</li>
                    <li>Delete data upon request (subject to legal requirements)</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 8: Service Level Agreement (SLA) */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Service Level Agreement (SLA)</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">8.1 Uptime Commitment</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                    <li><strong>99.5% uptime</strong> (excluding planned maintenance)</li>
                    <li><strong>Planned Maintenance</strong>: Sundays 2:00-4:00 AM IST</li>
                    <li><strong>Emergency Maintenance</strong>: With immediate notice</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">8.2 Support Included</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                    <li><strong>Email Support</strong>: 24-48 hour response time</li>
                    <li><strong>Priority Support</strong>: 12-hour response for urgent issues</li>
                    <li><strong>Phone Support</strong>: Available during business hours</li>
                    <li><strong>24/7 Support</strong>: Emergency support available round the clock</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">8.3 Service Credits</h3>
                  <p className="text-gray-600 mb-3">For uptime below 99.5%:</p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                    <li>98-99.5%: 5% credit</li>
                    <li>95-98%: 10% credit</li>
                    <li>Below 95%: 25% credit</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 9: User Responsibilities */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. User Responsibilities</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">9.1 Professional Compliance</h3>
                  <p className="text-gray-600 mb-3">You must:</p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                    <li>Comply with ICAI/ICSI/ICMAI regulations</li>
                    <li>Maintain professional standards</li>
                    <li>Ensure client confidentiality</li>
                    <li>Follow applicable laws and regulations</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">9.2 Data Accuracy</h3>
                  <p className="text-gray-600 mb-3">You are responsible for:</p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                    <li>Accuracy of entered data</li>
                    <li>Regular data backups</li>
                    <li>Verifying calculations and reports</li>
                    <li>Maintaining audit trails</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">9.3 Security Obligations</h3>
                  <p className="text-gray-600 mb-3">You must:</p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                    <li>Use strong passwords (minimum 8 characters)</li>
                    <li>Enable two-factor authentication</li>
                    <li>Regularly review access logs</li>
                    <li>Report security incidents immediately</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 10: Third-Party Services */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Third-Party Services</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">10.1 Integrations</h3>
                  <p className="text-gray-600 mb-3">We integrate with:</p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                    <li>Razorpay (payments)</li>
                    <li>Google Workspace (productivity)</li>
                    <li>WhatsApp Business (communication)</li>
                    <li>Zoho (accounting)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">10.2 Third-Party Terms</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                    <li>You must comply with third-party terms</li>
                    <li>We're not liable for third-party services</li>
                    <li>Integration availability may change</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 11: Modifications and Updates */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Modifications and Updates</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">11.1 Service Updates</h3>
                  <p className="text-gray-600 mb-3">We may:</p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                    <li>Add new features</li>
                    <li>Modify existing features</li>
                    <li>Discontinue features with 30-day notice</li>
                    <li>Perform maintenance and upgrades</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">11.2 Terms Updates</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                    <li>Email notification for material changes</li>
                    <li>30-day notice period</li>
                    <li>Continued use constitutes acceptance</li>
                    <li>Right to terminate if you disagree</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 12: Termination */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Termination</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">12.1 By You</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                    <li>Cancel anytime from account settings</li>
                    <li>Effective at end of billing period</li>
                    <li>Download data before termination</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">12.2 By Us</h3>
                  <p className="text-gray-600 mb-3">We may terminate for:</p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                    <li>Terms violation</li>
                    <li>Non-payment</li>
                    <li>Illegal activities</li>
                    <li>Professional misconduct</li>
                    <li>Extended inactivity (12 months)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">12.3 Effect of Termination</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                    <li>Immediate access revocation</li>
                    <li>Data available for 30 days (download only)</li>
                    <li>No refund for Terms violations</li>
                    <li>Survival of certain clauses</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 13: Disclaimers */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Disclaimers</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">13.1 Service Disclaimer</h3>
                  <p className="text-gray-600 uppercase font-semibold">
                    THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">13.2 No Professional Advice</h3>
                  <p className="text-gray-600 mb-3">PowerCA is a tool only. We do not provide:</p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                    <li>Legal advice</li>
                    <li>Tax advice</li>
                    <li>Accounting advice</li>
                    <li>Professional services</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">13.3 User Discretion</h3>
                  <p className="text-gray-600 mb-3">You acknowledge that:</p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                    <li>Calculations should be verified</li>
                    <li>Compliance is your responsibility</li>
                    <li>Professional judgment required</li>
                    <li>We're not liable for professional errors</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 14: Limitation of Liability */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Limitation of Liability</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">14.1 Liability Cap</h3>
                  <p className="text-gray-600 uppercase font-semibold">
                    OUR MAXIMUM LIABILITY SHALL NOT EXCEED THE AMOUNT PAID BY YOU IN THE 12 MONTHS PRECEDING THE CLAIM.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">14.2 Excluded Damages</h3>
                  <p className="text-gray-600 mb-3 uppercase font-semibold">WE SHALL NOT BE LIABLE FOR:</p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                    <li>Indirect or consequential damages</li>
                    <li>Lost profits or revenue</li>
                    <li>Loss of data (beyond our control)</li>
                    <li>Professional liability claims</li>
                    <li>Third-party claims</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">14.3 Exceptions</h3>
                  <p className="text-gray-600 mb-3">Limitations don't apply to:</p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                    <li>Gross negligence or willful misconduct</li>
                    <li>Breach of confidentiality</li>
                    <li>Indemnification obligations</li>
                    <li>Violation of intellectual property rights</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 15: Indemnification */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">15. Indemnification</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">15.1 By You</h3>
                  <p className="text-gray-600 mb-3">You indemnify us against claims arising from:</p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                    <li>Your use of the Service</li>
                    <li>Violation of these Terms</li>
                    <li>Violation of laws or regulations</li>
                    <li>Infringement of third-party rights</li>
                    <li>Your Content or Client Data</li>
                    <li>Actions of Authorized Users</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">15.2 By Us</h3>
                  <p className="text-gray-600 mb-3">We indemnify you against claims that:</p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                    <li>Our Service infringes intellectual property rights</li>
                    <li>Subject to your compliance with Terms</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 16: Dispute Resolution */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">16. Dispute Resolution</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">16.1 Informal Resolution</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                    <li>First attempt: Direct negotiation (30 days)</li>
                    <li>Second attempt: Mediation</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">16.2 Arbitration</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                    <li><strong>Venue</strong>: Indian Arbitration and Conciliation Act, 2015</li>
                    <li><strong>Location</strong>: Coimbatore, Tamil Nadu</li>
                    <li><strong>Language</strong>: English</li>
                    <li><strong>Arbitrators</strong>: Single arbitrator</li>
                    <li><strong>Costs</strong>: Shared equally</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">16.3 Exceptions</h3>
                  <p className="text-gray-600 mb-3">Not subject to arbitration:</p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                    <li>Injunctive relief</li>
                    <li>Intellectual property disputes</li>
                    <li>Small claims court matters</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 17: Governing Law */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">17. Governing Law</h2>
              <p className="text-gray-600 mb-3">These Terms are governed by:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                <li>Laws of India</li>
                <li>State of Tamil Nadu</li>
                <li>Exclusive jurisdiction: Courts of Coimbatore</li>
                <li>Without regard to conflict of law principles</li>
              </ul>
            </section>

            {/* Section 18: Miscellaneous */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">18. Miscellaneous</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">18.1 Entire Agreement</h3>
                  <p className="text-gray-600">
                    These Terms constitute the entire agreement, superseding all prior agreements.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">18.2 Severability</h3>
                  <p className="text-gray-600">
                    If any provision is unenforceable, others remain in effect.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">18.3 Waiver</h3>
                  <p className="text-gray-600">
                    No waiver unless in writing and signed.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">18.4 Assignment</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                    <li><strong>By You</strong>: Not without our consent</li>
                    <li><strong>By Us</strong>: Upon notice to you</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">18.5 Force Majeure</h3>
                  <p className="text-gray-600">
                    Neither party liable for delays due to circumstances beyond reasonable control.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">18.6 Notices</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                    <li><strong>To You</strong>: Email address on account</li>
                    <li><strong>To Us</strong>: legal@powerca.in</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">18.7 Relationship</h3>
                  <p className="text-gray-600">
                    Nothing creates partnership, joint venture, or employment relationship.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 19: Specific Terms for Indian Users */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">19. Specific Terms for Indian Users</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">19.1 GST Compliance</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                    <li>GST registration required for invoices</li>
                    <li>Reverse charge mechanism where applicable</li>
                    <li>Compliance with GST laws</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">19.2 RBI Guidelines</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                    <li>Compliance with RBI payment guidelines</li>
                    <li>Foreign exchange regulations for international payments</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">19.3 Information Technology Act</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                    <li>Compliance with IT Act, 2000</li>
                    <li>Reasonable security practices</li>
                    <li>Grievance officer appointed</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 20: Contact Information */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">20. Contact Information</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">For Support:</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-600">Email: support@powerca.in</p>
                    <p className="text-gray-600">Phone: +91 [Support Number]</p>
                    <p className="text-gray-600">Hours: Monday-Friday, 9:00 AM - 6:00 PM IST</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">For Legal:</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-600">Email: legal@powerca.in</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Registered Office:</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-600">TBS Technologies</p>
                    <p className="text-gray-600">No. 130, II Floor, Muneer Complex</p>
                    <p className="text-gray-600">Palani Road, Udumalpet</p>
                    <p className="text-gray-600">Tamil Nadu - 642126, India</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Grievance Officer:</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-600">Name: [Officer Name]</p>
                    <p className="text-gray-600">Email: grievance@powerca.in</p>
                    <p className="text-gray-600">Response Time: 48 hours</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 22: Special Terms for Launch Offer */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">22. Special Terms for Launch Offer</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">22.1 Offer Validity</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                    <li>Available for limited time only</li>
                    <li>May be withdrawn without prior notice</li>
                    <li>Valid for new customers only</li>
                    <li>Non-transferable</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">22.2 Early Bird Benefits</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                    <li>FREE software license (₹1,00,000 value)</li>
                    <li>Locked-in benefits until March 2026</li>
                    <li>Priority support</li>
                    <li>Free upgrades during offer period</li>
                    <li>10% discount on first renewal</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">22.3 Conditions</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                    <li>Full payment required upon registration</li>
                    <li>Installation within 30 days of payment</li>
                    <li>Turnover declaration required for renewal</li>
                    <li>Continuous usage for benefits retention</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">22.4 Transition to Regular Pricing</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                    <li>Automatic transition in April 2026</li>
                    <li>First annual fee in February 2027</li>
                    <li>Based on FY 2025-26 turnover</li>
                    <li>Advance notice provided</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Acceptance */}
            <section className="border-t pt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Acceptance</h2>
              <p className="text-gray-600 uppercase font-semibold">
                BY CLICKING "I AGREE", CREATING AN ACCOUNT, OR USING THE SERVICE, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO BE BOUND BY THESE TERMS AND CONDITIONS.
              </p>
            </section>

            {/* Version History */}
            <section className="border-t pt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Version History</h2>
              <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                <li>v2.0 - January 1, 2025 - Comprehensive revision</li>
                <li>v1.0 - April 12, 2023 - Initial version</li>
              </ul>
            </section>

            {/* Quick Links */}
            <section className="border-t pt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Links</h2>
              <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                <li><a href="https://powerca.in/privacy" className="text-blue-600 hover:underline">Privacy Policy</a></li>
                <li><a href="https://powerca.in/cookies" className="text-blue-600 hover:underline">Cookie Policy</a></li>
                <li><a href="https://powerca.in/refunds" className="text-blue-600 hover:underline">Refund Policy</a></li>
                <li><a href="https://powerca.in/sla" className="text-blue-600 hover:underline">SLA Details</a></li>
                <li><a href="https://api.powerca.in/docs" className="text-blue-600 hover:underline">API Documentation</a></li>
              </ul>
            </section>

            {/* Footer Note */}
            <div className="border-t pt-8 mt-8">
              <p className="text-sm text-gray-500 italic text-center">
                Last reviewed by Legal Team: January 1, 2025
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}