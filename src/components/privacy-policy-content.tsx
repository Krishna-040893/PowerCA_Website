// Server Component for static privacy policy content

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

      <div className="relative z-10 w-full px-6 sm:px-12 lg:px-[144px] py-20">
        <div className="w-full bg-white rounded-2xl p-8 md:p-12 space-y-10">
          <header className="text-center space-y-3">
            <p className="text-sm font-medium uppercase tracking-widest text-blue-500">
              PowerCA Legal
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              Privacy Policy
            </h1>
            <p className="text-gray-500">
              We take your privacy seriously and are committed to protecting your personal information.
            </p>
          </header>

          <section className="space-y-4">
            <p className="text-gray-600 leading-relaxed">
              This Privacy Policy explains how we collect, use, and share information when you visit our website –{' '}
              <a href="https://powerca.in/" className="text-blue-600 hover:underline">
                https://powerca.in/
              </a>.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">Information We Collect</h2>
            <p className="text-gray-600 leading-relaxed">
              When you visit our website, we may collect certain information about you, including:
            </p>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Personal Information</h3>
                <p className="text-gray-600 leading-relaxed">
                  Details you provide when you fill out a form, raise tickets, send us a message, chat with us,
                  or sign up for our newsletter, such as your name, email address, phone number, and any other
                  contact information you choose to share.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Device Information</h3>
                <p className="text-gray-600 leading-relaxed">
                  Technical information about the device you use to access our website, including IP address,
                  browser type and version, and operating system.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Usage Information</h3>
                <p className="text-gray-600 leading-relaxed">
                  Insights into how you interact with our website, such as the pages you visit, links you click,
                  and the amount of time spent on each page.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">How We Use Your Information</h2>
            <p className="text-gray-600 leading-relaxed">
              We use the information we collect to provide and improve our services, communicate with you, and
              personalize your experience on our website. Specifically, we may use your information to:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li>Respond to your inquiries and requests</li>
              <li>Respond to and close tickets for customer support</li>
              <li>Send newsletters, updates, and marketing communications</li>
              <li>Analyze how our website is used and make improvements</li>
              <li>Prevent fraudulent activity and protect our legal rights</li>
            </ul>
            <p className="text-gray-600 leading-relaxed">
              We may also share your information with trusted third-party service providers who assist us with
              operations such as email marketing and analytics. These providers are required to use your
              information only for the services they deliver on our behalf and to protect it in accordance with
              this Privacy Policy.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">Cookies and Tracking Technologies</h2>
            <p className="text-gray-600 leading-relaxed">
              We may use cookies and other tracking technologies to understand how you use our website and to
              personalize your experience. Cookies are small text files stored on your device. You can manage
              cookie preferences in your browser settings, but disabling cookies may limit certain features of
              our website.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">Your Choices</h2>
            <p className="text-gray-600 leading-relaxed">
              You can opt out of receiving marketing communications by clicking the “unsubscribe” link in our
              emails or by contacting us. You may also request access to, correction of, or deletion of the
              personal information we hold about you by using the contact information below.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">Children&apos;s Privacy</h2>
            <p className="text-gray-600 leading-relaxed">
              Our website is not intended for children under the age of 13, and we do not knowingly collect
              personal information from them. If you believe we have collected information from a child under 13,
              please contact us immediately so we can remove it.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">Updates to This Privacy Policy</h2>
            <p className="text-gray-600 leading-relaxed">
              We may update this Privacy Policy from time to time to reflect changes in our data practices. We
              will notify you of any material changes by posting a notice on our website or by contacting you
              directly. Continued use of our website after such changes means you accept the updated policy.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">Contact Us</h2>
            <p className="text-gray-600 leading-relaxed">
              If you have any questions or concerns about this Privacy Policy or our data practices, please
              contact us at{' '}
              <a href="mailto:contact@powerca.in" className="text-blue-600 hover:underline">
                contact@powerca.in
              </a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
