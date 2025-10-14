// Server Component for static refund policy content

export function RefundPolicyContent() {
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
              No Returns or Refund Policy
            </h1>
            <p className="text-gray-500">Effective September 1, 2025</p>
          </header>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">No Returns or Refunds</h2>
            <p className="text-gray-600 leading-relaxed">
              We do not accept returns or offer refunds for Power CA. Once the software has been downloaded,
              installed, or licensed, it cannot be returned for a refund.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">Evaluate Before You Purchase</h2>
            <p className="text-gray-600 leading-relaxed">
              We provide a demo of our software to allow you to evaluate the features and functionality
              before making a purchase. We strongly recommend that you use these demos to make an informed
              decision before purchasing the full version of our software.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">Need Help?</h2>
            <p className="text-gray-600 leading-relaxed">
              If you encounter any technical issues or problems with our software, please contact our support
              team for assistance. We will make every reasonable effort to help you resolve the issue and ensure
              that our software is working as intended.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">Policy Updates</h2>
            <p className="text-gray-600 leading-relaxed">
              We reserve the right to modify or update this policy at any time without prior notice. Your
              continued use of our software after any such changes will constitute your acceptance of the
              updated policy.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">Acknowledgment</h2>
            <p className="text-gray-600 leading-relaxed">
              By downloading, installing, or activating Power CA, you acknowledge that you have read,
              understand, and agree to be bound by this No Returns or Refund Policy. If you do not agree to
              this policy, you may not use our software.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
