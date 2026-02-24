// Server Component for static privacy policy content

import { BackButton } from '@/components/ui/back-button'

export function PrivacyPolicyContent() {
  return (
    <div className="relative min-h-screen">
      {/* Background Pattern */}
      <div className="fixed inset-0 pointer-events-none">
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
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle, #1BAF69 1.5px, transparent 1.5px)`,
            backgroundSize: '30px 30px',
            backgroundPosition: '0 0, 15px 15px'
          }}
        />
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

      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 sm:px-12 py-20">
        <div className="w-full bg-white rounded-2xl p-8 md:p-12 space-y-6 max-h-[85vh] overflow-y-auto">
          <header className="text-center space-y-3">
            <p className="text-sm font-medium uppercase tracking-widest text-blue-500">
              PowerCA Legal
            </p>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Privacy Policy
            </h1>
          </header>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">1. Introduction</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              This Privacy Policy describes how <strong>TBS TECHNOLOGIES PRIVATE LIMITED</strong> (&quot;Company&quot;, &quot;Power CA&quot;, &quot;We&quot;) collects, uses, processes, stores, and protects personal data of subscribers and website users.
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">This Policy is issued in compliance with:</p>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 ml-4">
              <li>Digital Personal Data Protection Act, 2023 (India)</li>
              <li>Information Technology Act, 2000</li>
              <li>Applicable IT Rules</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">2. Data Fiduciary Details</h2>
            <div className="text-sm text-gray-600 leading-relaxed space-y-1">
              <p>Data Fiduciary:</p>
              <p><strong>TBS TECHNOLOGIES PRIVATE LIMITED</strong></p>
              <p>Registered Office: 2<sup>nd</sup> Floor, Muneer Complex, 130, Palani Road, Udumalpet, Tiruppur District, Tamil Nadu, India, Pin: 642126.</p>
              <p>Email: <a href="mailto:contact@powerca.in" className="text-blue-600 hover:underline">contact@powerca.in</a></p>
              <p>Grievance Officer: Karthikeyan R</p>
              <p>Email: <a href="mailto:tbstechudt@gmail.com" className="text-blue-600 hover:underline">tbstechudt@gmail.com</a></p>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">3. Categories of Personal Data Collected</h2>

            <div className="space-y-2">
              <h3 className="text-base font-semibold text-gray-800">3.1 Account &amp; Contact Information</h3>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 ml-4">
                <li>Name</li>
                <li>Firm Name</li>
                <li>Email address</li>
                <li>Phone number</li>
                <li>Address</li>
                <li>GSTIN (if applicable)</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-semibold text-gray-800">3.2 Billing &amp; Transaction Data</h3>
              <p className="text-sm text-gray-600 leading-relaxed">Processed via Razorpay, including:</p>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 ml-4">
                <li>Transaction ID</li>
                <li>Payment status</li>
                <li>Invoice details</li>
              </ul>
              <p className="text-sm text-gray-600 leading-relaxed font-medium">Power CA does not store card details.</p>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-semibold text-gray-800">3.3 License &amp; Device Tracking Data</h3>
              <p className="text-sm text-gray-600 leading-relaxed">For license enforcement and anti-piracy:</p>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 ml-4">
                <li>Device ID (hashed)</li>
                <li>Installation fingerprint</li>
                <li>IP address (approximate)</li>
                <li>OS version</li>
                <li>License activation logs</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-semibold text-gray-800">3.4 Support Communications</h3>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 ml-4">
                <li>Ticket submissions</li>
                <li>Email correspondence</li>
                <li>Diagnostic logs voluntarily shared</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-semibold text-gray-800">3.5 Website Usage Data</h3>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 ml-4">
                <li>Cookies</li>
                <li>Analytics data</li>
                <li>Browser metadata</li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">4. Purpose of Processing</h2>
            <p className="text-sm text-gray-600 leading-relaxed">Personal data is processed for:</p>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 ml-4">
              <li>Subscription management</li>
              <li>License validation &amp; fraud prevention</li>
              <li>Customer support</li>
              <li>Regulatory compliance</li>
              <li>Invoice generation</li>
              <li>Product improvement</li>
              <li>Security monitoring</li>
              <li>Marketing communications (with consent)</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">5. Legal Basis for Processing</h2>
            <p className="text-sm text-gray-600 leading-relaxed">Processing is based on:</p>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 ml-4">
              <li>Consent</li>
              <li>Contractual necessity</li>
              <li>Legal obligations</li>
              <li>Legitimate business interest (fraud detection, IP protection)</li>
            </ul>
          </section>

          <section className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">6. Data Sharing</h2>
            <p className="text-sm text-gray-600 leading-relaxed">Personal data may be shared with:</p>

            <div className="space-y-2">
              <h3 className="text-base font-semibold text-gray-800">6.1 Payment Processor</h3>
              <p className="text-sm text-gray-600 leading-relaxed">Razorpay Software Private Limited for payment processing.</p>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-semibold text-gray-800">6.2 Hosting &amp; Infrastructure Providers</h3>
              <p className="text-sm text-gray-600 leading-relaxed">Cloud service providers (if applicable).</p>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-semibold text-gray-800">6.3 Legal Authorities</h3>
              <p className="text-sm text-gray-600 leading-relaxed">Where required by law or court order.</p>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed">All service providers are contractually bound to maintain confidentiality.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">7. Data Retention</h2>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-2 ml-4">
              <li><strong>Account Data:</strong> Retained during subscription and up to 3 years post-termination.</li>
              <li><strong>Financial Records:</strong> As required under Indian tax laws.</li>
              <li><strong>License Logs:</strong> Retained for anti-piracy enforcement up to 5 years.</li>
              <li><strong>Marketing Data:</strong> Until consent withdrawal.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">8. Data Security</h2>
            <p className="text-sm text-gray-600 leading-relaxed">We implement:</p>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 ml-4">
              <li>Encryption of sensitive transmissions</li>
              <li>Secure authentication mechanisms</li>
              <li>Access controls</li>
              <li>Periodic system review</li>
              <li>License-key encryption</li>
            </ul>
            <p className="text-sm text-gray-600 leading-relaxed">
              No system is completely immune from risk; however, reasonable safeguards are implemented.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">9. Data Principal Rights (Under DPDP Act)</h2>
            <p className="text-sm text-gray-600 leading-relaxed">You have the right to:</p>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 ml-4">
              <li>Access personal data</li>
              <li>Seek correction</li>
              <li>Request erasure (subject to legal retention requirements)</li>
              <li>Withdraw consent</li>
              <li>Nominate a representative</li>
              <li>File grievance</li>
            </ul>
            <p className="text-sm text-gray-600 leading-relaxed">
              Requests may be sent to: <a href="mailto:tbstechudt@gmail.com" className="text-blue-600 hover:underline">tbstechudt@gmail.com</a>
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">Response Timeline: Within 15 business days.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">10. Children&apos;s Data</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              The Software and website are intended for professionals and not persons below 18 years of age.
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">We do not knowingly collect children&apos;s personal data.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">11. Cross-Border Transfer</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Certain data may be stored or processed outside India via cloud or infrastructure providers in compliance with applicable law.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">12. Cookies</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Website cookies are used for analytics and session management. Users may disable cookies through browser settings.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">13. Policy Updates</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Material updates will be notified on the website. Continued usage constitutes acceptance.
            </p>
          </section>

          {/* Back Button */}
          <div className="flex justify-center pt-4">
            <BackButton />
          </div>
        </div>
      </div>
    </div>
  )
}
