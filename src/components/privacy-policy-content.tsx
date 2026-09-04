// Server Component for static privacy policy content

import { BackButton } from '@/components/ui/back-button'

export function PrivacyPolicyContent() {
  return (
    <div className="min-h-screen bg-white bg-dot-pattern">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-7 sm:py-10 md:py-12 lg:py-[60px]">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 sm:p-8 md:p-10 space-y-8 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-12px_rgba(16,24,40,0.10)]">
          <header className="text-center space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">
              Power CA Legal
            </p>
            <h1 className="text-2xl sm:text-4xl lg:text-[40px] font-normal tracking-tight leading-[1.15] text-[#001525] font-inter">
              Privacy Policy
            </h1>
          </header>

          <section className="space-y-4">
            <h2 className="text-lg sm:text-xl font-semibold leading-snug text-[#001525] font-inter">1. Introduction</h2>
            <p className="text-[15px] leading-relaxed text-gray-500 font-inter">
              This Privacy Policy describes how <strong>TBS TECHNOLOGIES PRIVATE LIMITED</strong> (&quot;Company&quot;, &quot;Power CA&quot;, &quot;We&quot;) collects, uses, processes, stores, and protects personal data of subscribers and website users.
            </p>
            <p className="text-[15px] leading-relaxed text-gray-500 font-inter">This Policy is issued in compliance with:</p>
            <ul className="list-disc list-inside text-[15px] leading-relaxed text-gray-500 space-y-1.5 ml-4">
              <li>Digital Personal Data Protection Act, 2023 (India)</li>
              <li>Information Technology Act, 2000</li>
              <li>Applicable IT Rules</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg sm:text-xl font-semibold leading-snug text-[#001525] font-inter">2. Data Fiduciary Details</h2>
            <div className="text-[15px] leading-relaxed text-gray-500 space-y-1">
              <p>Data Fiduciary:</p>
              <p><strong>TBS TECHNOLOGIES PRIVATE LIMITED</strong></p>
              <p>Registered Office: 2<sup>nd</sup> Floor, Muneer Complex, 130, Palani Road, Udumalpet, Tiruppur District, Tamil Nadu, India, Pin: 642126.</p>
              <p>Email: <a href="mailto:contact@powerca.in" className="text-blue-600 hover:underline">contact@powerca.in</a></p>
              <p>Grievance Officer: Karthikeyan R</p>
              <p>Email: <a href="mailto:tbstechudt@gmail.com" className="text-blue-600 hover:underline">tbstechudt@gmail.com</a></p>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-lg sm:text-xl font-semibold leading-snug text-[#001525] font-inter">3. Categories of Personal Data Collected</h2>

            <div className="space-y-2">
              <h3 className="text-base font-semibold text-gray-800">3.1 Account &amp; Contact Information</h3>
              <ul className="list-disc list-inside text-[15px] leading-relaxed text-gray-500 space-y-1.5 ml-4">
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
              <p className="text-[15px] leading-relaxed text-gray-500 font-inter">Processed via Razorpay, including:</p>
              <ul className="list-disc list-inside text-[15px] leading-relaxed text-gray-500 space-y-1.5 ml-4">
                <li>Transaction ID</li>
                <li>Payment status</li>
                <li>Invoice details</li>
              </ul>
              <p className="text-sm text-gray-600 leading-relaxed font-medium">Power CA does not store card details.</p>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-semibold text-gray-800">3.3 License &amp; Device Tracking Data</h3>
              <p className="text-[15px] leading-relaxed text-gray-500 font-inter">For license enforcement and anti-piracy:</p>
              <ul className="list-disc list-inside text-[15px] leading-relaxed text-gray-500 space-y-1.5 ml-4">
                <li>Device ID (hashed)</li>
                <li>Installation fingerprint</li>
                <li>IP address (approximate)</li>
                <li>OS version</li>
                <li>License activation logs</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-semibold text-gray-800">3.4 Support Communications</h3>
              <ul className="list-disc list-inside text-[15px] leading-relaxed text-gray-500 space-y-1.5 ml-4">
                <li>Ticket submissions</li>
                <li>Email correspondence</li>
                <li>Diagnostic logs voluntarily shared</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-semibold text-gray-800">3.5 Website Usage Data</h3>
              <ul className="list-disc list-inside text-[15px] leading-relaxed text-gray-500 space-y-1.5 ml-4">
                <li>Cookies</li>
                <li>Analytics data</li>
                <li>Browser metadata</li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg sm:text-xl font-semibold leading-snug text-[#001525] font-inter">4. Purpose of Processing</h2>
            <p className="text-[15px] leading-relaxed text-gray-500 font-inter">Personal data is processed for:</p>
            <ul className="list-disc list-inside text-[15px] leading-relaxed text-gray-500 space-y-1.5 ml-4">
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
            <h2 className="text-lg sm:text-xl font-semibold leading-snug text-[#001525] font-inter">5. Legal Basis for Processing</h2>
            <p className="text-[15px] leading-relaxed text-gray-500 font-inter">Processing is based on:</p>
            <ul className="list-disc list-inside text-[15px] leading-relaxed text-gray-500 space-y-1.5 ml-4">
              <li>Consent</li>
              <li>Contractual necessity</li>
              <li>Legal obligations</li>
              <li>Legitimate business interest (fraud detection, IP protection)</li>
            </ul>
          </section>

          <section className="space-y-6">
            <h2 className="text-lg sm:text-xl font-semibold leading-snug text-[#001525] font-inter">6. Data Sharing</h2>
            <p className="text-[15px] leading-relaxed text-gray-500 font-inter">Personal data may be shared with:</p>

            <div className="space-y-2">
              <h3 className="text-base font-semibold text-gray-800">6.1 Payment Processor</h3>
              <p className="text-[15px] leading-relaxed text-gray-500 font-inter">Razorpay Software Private Limited for payment processing.</p>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-semibold text-gray-800">6.2 Hosting &amp; Infrastructure Providers</h3>
              <p className="text-[15px] leading-relaxed text-gray-500 font-inter">Cloud service providers (if applicable).</p>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-semibold text-gray-800">6.3 Legal Authorities</h3>
              <p className="text-[15px] leading-relaxed text-gray-500 font-inter">Where required by law or court order.</p>
            </div>

            <p className="text-[15px] leading-relaxed text-gray-500 font-inter">All service providers are contractually bound to maintain confidentiality.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg sm:text-xl font-semibold leading-snug text-[#001525] font-inter">7. Data Retention</h2>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-2 ml-4">
              <li><strong>Account Data:</strong> Retained during subscription and up to 3 years post-termination.</li>
              <li><strong>Financial Records:</strong> As required under Indian tax laws.</li>
              <li><strong>License Logs:</strong> Retained for anti-piracy enforcement up to 5 years.</li>
              <li><strong>Marketing Data:</strong> Until consent withdrawal.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg sm:text-xl font-semibold leading-snug text-[#001525] font-inter">8. Data Security</h2>
            <p className="text-[15px] leading-relaxed text-gray-500 font-inter">We implement:</p>
            <ul className="list-disc list-inside text-[15px] leading-relaxed text-gray-500 space-y-1.5 ml-4">
              <li>Encryption of sensitive transmissions</li>
              <li>Secure authentication mechanisms</li>
              <li>Access controls</li>
              <li>Periodic system review</li>
              <li>License-key encryption</li>
            </ul>
            <p className="text-[15px] leading-relaxed text-gray-500 font-inter">
              No system is completely immune from risk; however, reasonable safeguards are implemented.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg sm:text-xl font-semibold leading-snug text-[#001525] font-inter">9. Data Principal Rights (Under DPDP Act)</h2>
            <p className="text-[15px] leading-relaxed text-gray-500 font-inter">You have the right to:</p>
            <ul className="list-disc list-inside text-[15px] leading-relaxed text-gray-500 space-y-1.5 ml-4">
              <li>Access personal data</li>
              <li>Seek correction</li>
              <li>Request erasure (subject to legal retention requirements)</li>
              <li>Withdraw consent</li>
              <li>Nominate a representative</li>
              <li>File grievance</li>
            </ul>
            <p className="text-[15px] leading-relaxed text-gray-500 font-inter">
              Requests may be sent to: <a href="mailto:tbstechudt@gmail.com" className="text-blue-600 hover:underline">tbstechudt@gmail.com</a>
            </p>
            <p className="text-[15px] leading-relaxed text-gray-500 font-inter">Response Timeline: Within 15 business days.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg sm:text-xl font-semibold leading-snug text-[#001525] font-inter">10. Children&apos;s Data</h2>
            <p className="text-[15px] leading-relaxed text-gray-500 font-inter">
              The Software and website are intended for professionals and not persons below 18 years of age.
            </p>
            <p className="text-[15px] leading-relaxed text-gray-500 font-inter">We do not knowingly collect children&apos;s personal data.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg sm:text-xl font-semibold leading-snug text-[#001525] font-inter">11. Cross-Border Transfer</h2>
            <p className="text-[15px] leading-relaxed text-gray-500 font-inter">
              Certain data may be stored or processed outside India via cloud or infrastructure providers in compliance with applicable law.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg sm:text-xl font-semibold leading-snug text-[#001525] font-inter">12. Cookies</h2>
            <p className="text-[15px] leading-relaxed text-gray-500 font-inter">
              Website cookies are used for analytics and session management. Users may disable cookies through browser settings.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg sm:text-xl font-semibold leading-snug text-[#001525] font-inter">13. Policy Updates</h2>
            <p className="text-[15px] leading-relaxed text-gray-500 font-inter">
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
