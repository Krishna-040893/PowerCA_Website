// Server Component for static refund policy content

export function RefundPolicyContent() {
  return (
    <div className="min-h-screen bg-white bg-dot-pattern">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-7 sm:py-10 md:py-12 lg:py-[60px]">
        <div className="w-full bg-white rounded-2xl p-8 md:p-12 space-y-10">
          <header className="text-center space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">
              Power CA Legal
            </p>
            <h1 className="text-2xl sm:text-4xl lg:text-[40px] font-normal tracking-tight leading-[1.15] text-[#001525] font-inter">
              No Returns or Refund Policy
            </h1>
            <p className="text-gray-500">Effective September 1, 2025</p>
          </header>

          <section className="space-y-4">
            <h2 className="text-lg sm:text-xl font-semibold leading-snug text-[#001525] font-inter">No Returns or Refunds</h2>
            <p className="text-gray-500 leading-relaxed">
              We do not accept returns or offer refunds for Power CA. Once the software has been downloaded,
              installed, or licensed, it cannot be returned for a refund.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg sm:text-xl font-semibold leading-snug text-[#001525] font-inter">Evaluate Before You Purchase</h2>
            <p className="text-gray-500 leading-relaxed">
              We provide a demo of our software to allow you to evaluate the features and functionality
              before making a purchase. We strongly recommend that you use these demos to make an informed
              decision before purchasing the full version of our software.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg sm:text-xl font-semibold leading-snug text-[#001525] font-inter">Need Help?</h2>
            <p className="text-gray-500 leading-relaxed">
              If you encounter any technical issues or problems with our software, please contact our support
              team for assistance. We will make every reasonable effort to help you resolve the issue and ensure
              that our software is working as intended.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg sm:text-xl font-semibold leading-snug text-[#001525] font-inter">Policy Updates</h2>
            <p className="text-gray-500 leading-relaxed">
              We reserve the right to modify or update this policy at any time without prior notice. Your
              continued use of our software after any such changes will constitute your acceptance of the
              updated policy.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg sm:text-xl font-semibold leading-snug text-[#001525] font-inter">Acknowledgment</h2>
            <p className="text-gray-500 leading-relaxed">
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
