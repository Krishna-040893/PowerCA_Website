// Server Component - no 'use client' needed for static content

export function PrivacyPolicyContent() {
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
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Privacy Policy
            </h1>
            <div className="text-gray-600">
              <p className="text-lg">Effective Date: September 1, 2025</p>
              <p className="text-lg">Last Updated: September 1, 2025</p>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 space-y-8">
            {/* Section 1: Introduction */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Welcome to PowerCA ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how PowerCA, operated by TBS Technologies ("Company"), collects, uses, discloses, and safeguards your information when you:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Visit our website at https://powerca.in</li>
                <li>Use our practice management software and services</li>
                <li>Engage with us in sales or marketing activities</li>
                <li>Contact our customer support</li>
              </ul>
              <p className="text-gray-600 leading-relaxed mt-4">
                Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access our services.
              </p>
            </section>

            {/* Section 2: Information We Collect */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">2.1 Information You Provide to Us</h3>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Account Information</h4>
                      <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                        <li>Full name and professional title</li>
                        <li>Email address and phone number</li>
                        <li>Firm/Company name and size</li>
                        <li>CA/CS/CMA registration number</li>
                        <li>GST number and PAN details (for billing)</li>
                        <li>Business address</li>
                        <li>Password (encrypted)</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Payment Information</h4>
                      <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                        <li>Billing name and address</li>
                        <li>Payment card details (processed securely via Razorpay)</li>
                        <li>Transaction history</li>
                        <li>Invoice information</li>
                      </ul>
                      <p className="text-sm text-gray-500 italic mt-2">Note: We do not store complete payment card information on our servers</p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Service Usage Data</h4>
                      <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                        <li>Client information you manage through our platform</li>
                        <li>Documents and files you upload</li>
                        <li>Task and project details</li>
                        <li>Communication logs within the platform</li>
                        <li>Support tickets and inquiries</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">2.2 Information Automatically Collected</h3>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Device and Technical Information</h4>
                      <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                        <li>IP address and approximate location</li>
                        <li>Browser type and version</li>
                        <li>Operating system</li>
                        <li>Device identifiers</li>
                        <li>Screen resolution</li>
                        <li>Time zone settings</li>
                        <li>Language preferences</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Usage and Analytics Data</h4>
                      <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                        <li>Pages visited and features used</li>
                        <li>Time spent on pages</li>
                        <li>Click patterns and navigation paths</li>
                        <li>Search queries within our platform</li>
                        <li>Feature usage statistics</li>
                        <li>Error logs and performance data</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">2.3 Information from Third Parties</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                    <li><strong>OAuth Providers:</strong> Profile information from Google/Microsoft when you sign in</li>
                    <li><strong>Payment Processors:</strong> Transaction confirmations from Razorpay</li>
                    <li><strong>Analytics Services:</strong> Aggregated data from Google Analytics</li>
                    <li><strong>Marketing Partners:</strong> Lead information from authorized partners</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 3: How We Use Your Information */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">3.1 Legal Basis for Processing (GDPR)</h3>
                  <p className="text-gray-600 mb-3">We process your personal information under the following legal bases:</p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                    <li><strong>Contractual Necessity:</strong> To provide our services and fulfill our agreement with you</li>
                    <li><strong>Legitimate Interests:</strong> To improve our services and communicate with you</li>
                    <li><strong>Legal Compliance:</strong> To comply with applicable laws and regulations</li>
                    <li><strong>Consent:</strong> For marketing communications and optional features</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">3.2 Purposes of Use</h3>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Service Delivery</h4>
                      <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                        <li>Create and manage your account</li>
                        <li>Provide access to our practice management tools</li>
                        <li>Process payments and manage subscriptions</li>
                        <li>Send service-related notifications</li>
                        <li>Provide customer support</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Improvement and Development</h4>
                      <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                        <li>Analyze usage patterns to improve features</li>
                        <li>Develop new functionalities</li>
                        <li>Conduct research and analytics</li>
                        <li>Fix bugs and technical issues</li>
                        <li>Personalize user experience</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Communication</h4>
                      <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                        <li>Send important updates about your account</li>
                        <li>Provide customer support responses</li>
                        <li>Send newsletters and product updates (with consent)</li>
                        <li>Notify about policy changes</li>
                        <li>Send billing and renewal reminders</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Legal and Security</h4>
                      <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                        <li>Comply with legal obligations</li>
                        <li>Prevent fraud and abuse</li>
                        <li>Enforce our terms of service</li>
                        <li>Protect rights and safety</li>
                        <li>Respond to legal requests</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 4: Information Sharing */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Information Sharing and Disclosure</h2>
              <p className="text-gray-600 mb-4">We do not sell, rent, or trade your personal information. We share information only in these circumstances:</p>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">4.1 Service Providers</h3>
                  <p className="text-gray-600 mb-3">We share information with trusted third-party vendors who assist us:</p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                    <li><strong>Razorpay:</strong> Payment processing (PCI-DSS compliant)</li>
                    <li><strong>Amazon Web Services:</strong> Cloud hosting and storage</li>
                    <li><strong>Google Workspace:</strong> Email and productivity tools</li>
                    <li><strong>Resend:</strong> Transactional email delivery</li>
                    <li><strong>Cloudflare:</strong> Content delivery and DDoS protection</li>
                    <li><strong>Sentry:</strong> Error tracking and monitoring</li>
                  </ul>
                  <p className="text-gray-600 mt-3">All service providers are contractually obligated to protect your information.</p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">4.2 Legal Requirements</h3>
                  <p className="text-gray-600 mb-3">We may disclose information if required by:</p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                    <li>Court orders or legal proceedings</li>
                    <li>Government or regulatory requests</li>
                    <li>Law enforcement investigations</li>
                    <li>Protection of our legal rights</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">4.3 Business Transfers</h3>
                  <p className="text-gray-600">
                    In case of merger, acquisition, or sale of assets, your information may be transferred with appropriate confidentiality agreements.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">4.4 Aggregated Information</h3>
                  <p className="text-gray-600">
                    We may share anonymized, aggregated data that cannot identify you personally for research and marketing purposes.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 5: Data Security */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Security</h2>
              <p className="text-gray-600 mb-4">We implement industry-standard security measures:</p>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">5.1 Technical Safeguards</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                    <li><strong>Encryption:</strong> SSL/TLS for data in transit, AES-256 for data at rest</li>
                    <li><strong>Access Controls:</strong> Role-based access with multi-factor authentication</li>
                    <li><strong>Infrastructure:</strong> Secure cloud hosting with regular security audits</li>
                    <li><strong>Monitoring:</strong> 24/7 security monitoring and intrusion detection</li>
                    <li><strong>Backups:</strong> Regular encrypted backups with disaster recovery</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">5.2 Organizational Measures</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                    <li>Employee confidentiality agreements</li>
                    <li>Regular security training</li>
                    <li>Limited access on need-to-know basis</li>
                    <li>Vendor security assessments</li>
                    <li>Incident response procedures</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">5.3 Payment Security</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                    <li>PCI-DSS compliance through Razorpay</li>
                    <li>Tokenization of payment information</li>
                    <li>No storage of card details on our servers</li>
                    <li>Secure payment gateway integration</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 6: Data Retention */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Data Retention</h2>
              <p className="text-gray-600 mb-4">We retain your information for as long as necessary to:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4 mb-4">
                <li>Provide our services</li>
                <li>Comply with legal obligations</li>
                <li>Resolve disputes</li>
                <li>Enforce agreements</li>
              </ul>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Specific Retention Periods:</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                  <li><strong>Account Data:</strong> Duration of account + 3 years</li>
                  <li><strong>Payment Records:</strong> 7 years (tax compliance)</li>
                  <li><strong>Support Tickets:</strong> 2 years after resolution</li>
                  <li><strong>Marketing Data:</strong> Until consent withdrawn</li>
                  <li><strong>Analytics Data:</strong> 26 months</li>
                  <li><strong>Backup Data:</strong> 90 days after deletion</li>
                </ul>
              </div>
            </section>

            {/* Section 7: Your Privacy Rights */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Your Privacy Rights</h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">7.1 Rights Under GDPR (European Users)</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                    <li><strong>Access:</strong> Request copies of your personal data</li>
                    <li><strong>Rectification:</strong> Correct inaccurate information</li>
                    <li><strong>Erasure:</strong> Request deletion (right to be forgotten)</li>
                    <li><strong>Restriction:</strong> Limit processing of your data</li>
                    <li><strong>Portability:</strong> Receive data in machine-readable format</li>
                    <li><strong>Objection:</strong> Object to certain processing</li>
                    <li><strong>Automated Decision-Making:</strong> Opt-out of automated processing</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">7.2 Rights Under Indian Data Protection Laws</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                    <li>Access and correction of personal information</li>
                    <li>Withdrawal of consent</li>
                    <li>Grievance redressal</li>
                    <li>Data portability (when applicable)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">7.3 How to Exercise Your Rights</h3>
                  <p className="text-gray-600 mb-2">Contact us at privacy@powerca.in with:</p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                    <li>Your specific request</li>
                    <li>Identity verification information</li>
                    <li>We will respond within 30 days</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 8: Cookie Policy */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Cookie Policy</h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">8.1 Types of Cookies We Use</h3>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Essential Cookies</h4>
                      <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                        <li>Session management</li>
                        <li>Security tokens</li>
                        <li>Load balancing</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Functional Cookies</h4>
                      <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                        <li>User preferences</li>
                        <li>Language settings</li>
                        <li>Theme selection</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Analytics Cookies</h4>
                      <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                        <li>Google Analytics (anonymized)</li>
                        <li>Performance monitoring</li>
                        <li>Feature usage tracking</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Marketing Cookies (with consent)</h4>
                      <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                        <li>Remarketing pixels</li>
                        <li>Conversion tracking</li>
                        <li>Campaign attribution</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">8.2 Managing Cookies</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                    <li>Browser settings to block/delete cookies</li>
                    <li>Opt-out at https://powerca.in/cookie-settings</li>
                    <li>Google Analytics opt-out browser extension</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 9: International Data Transfers */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. International Data Transfers</h2>
              <p className="text-gray-600 mb-3">Your information may be transferred to servers outside your country:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4 mb-3">
                <li>Our servers are primarily located in India and Singapore</li>
                <li>We use AWS global infrastructure</li>
              </ul>
              <p className="text-gray-600 mb-2">Transfers are protected by:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                <li>Standard Contractual Clauses</li>
                <li>Adequate security measures</li>
                <li>Encryption during transfer</li>
              </ul>
            </section>

            {/* Section 10: Children's Privacy */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Children's Privacy</h2>
              <p className="text-gray-600">
                Our services are not intended for children under 18. We do not knowingly collect information from minors.
                If you believe we have collected data from a child, contact us immediately at privacy@powerca.in.
              </p>
            </section>

            {/* Section 11: Third-Party Links */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Third-Party Links</h2>
              <p className="text-gray-600">
                Our service may contain links to third-party websites. We are not responsible for their privacy practices.
                Please review their privacy policies before providing information.
              </p>
            </section>

            {/* Section 12: Marketing Communications */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Marketing Communications</h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">12.1 Opt-In/Opt-Out</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                    <li>Marketing emails require explicit consent</li>
                    <li>Unsubscribe link in every marketing email</li>
                    <li>Manage preferences at https://powerca.in/preferences</li>
                    <li>Transactional emails cannot be opted out</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">12.2 Do Not Track</h3>
                  <p className="text-gray-600">We currently do not respond to Do Not Track browser signals.</p>
                </div>
              </div>
            </section>

            {/* Section 13: Updates to This Policy */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Updates to This Policy</h2>
              <p className="text-gray-600 mb-3">We may update this policy periodically. We will notify you of material changes via:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4 mb-3">
                <li>Email notification</li>
                <li>Website banner</li>
                <li>In-app notification</li>
              </ul>
              <p className="text-gray-600">Continued use after changes constitutes acceptance.</p>
            </section>

            {/* Section 14: Data Protection Officer */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Data Protection Officer</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-600"><strong>Name:</strong> Krishna</p>
                <p className="text-gray-600"><strong>Email:</strong> contact@powerca.in</p>
                <p className="text-gray-600"><strong>Phone:</strong> +91 9629514635</p>
              </div>
            </section>

            {/* Section 15: Contact Information */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">15. Contact Information</h2>
              <p className="text-gray-600 mb-3">For privacy-related inquiries:</p>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-600 font-semibold">PowerCA Privacy Team</p>
                <p className="text-gray-600">TBS Technologies</p>
                <p className="text-gray-600">No. 130, II Floor, Muneer Complex</p>
                <p className="text-gray-600">Palani Road, Udumalpet</p>
                <p className="text-gray-600">Tamil Nadu - 642126, India</p>
                <p className="text-gray-600 mt-2"><strong>Email:</strong> contact@powerca.in</p>
                <p className="text-gray-600"><strong>Phone:</strong> +91 9629514635</p>
                <p className="text-gray-600"><strong>Support:</strong> https://powerca.in/contact</p>
              </div>
            </section>

            {/* Section 16: Grievance Officer */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">16. Grievance Officer (For Indian Users)</h2>
              <p className="text-gray-600 mb-3">As per Information Technology Act, 2000:</p>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-600"><strong>Name:</strong> Krishna</p>
                <p className="text-gray-600"><strong>Email:</strong> contact@powerca.in</p>
                <p className="text-gray-600"><strong>Office Hours:</strong> Monday-Friday, 9:00 AM - 6:00 PM IST</p>
                <p className="text-gray-600"><strong>Response Time:</strong> Within 48 hours</p>
              </div>
            </section>

            {/* Section 17: Supervisory Authority */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">17. Supervisory Authority</h2>
              <p className="text-gray-600 mb-2">You have the right to lodge a complaint with a supervisory authority:</p>
              <p className="text-gray-600"><strong>For Indian Users:</strong> www.cert-in.org.in</p>
            </section>

            {/* Section 18: Accessibility */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">18. Accessibility</h2>
              <p className="text-gray-600 mb-2">This privacy policy is available in:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4 mb-3">
                <li>English (Primary)</li>
                <li>Hindi (Upon request)</li>
                <li>Regional languages (Upon request)</li>
              </ul>
              <p className="text-gray-600">For accessible formats, contact accessibility@powerca.in</p>
            </section>

            {/* Section 19: Definitions */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">19. Definitions</h2>
              <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                <li><strong>Personal Data:</strong> Information that can identify you</li>
                <li><strong>Processing:</strong> Any operation performed on personal data</li>
                <li><strong>Data Controller:</strong> TBS Technologies (PowerCA)</li>
                <li><strong>Data Processor:</strong> Third parties processing data on our behalf</li>
                <li><strong>Consent:</strong> Freely given, specific, informed agreement</li>
              </ul>
            </section>

            {/* Acknowledgment */}
            <section className="border-t pt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Acknowledgment</h2>
              <p className="text-gray-600">
                By using PowerCA services, you acknowledge that you have read and understood this Privacy Policy.
              </p>
            </section>

            {/* Footer Note */}
            <div className="border-t pt-8 mt-8">
              <p className="text-sm text-gray-500 italic text-center">
                This privacy policy is governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Coimbatore, Tamil Nadu.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}