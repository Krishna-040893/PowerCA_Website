// Server Component for static Terms and Conditions content

export function TermsConditionsContent() {
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
              Terms and Conditions
            </h1>
            <p className="text-gray-500">Thank you for choosing Power CA.</p>
          </header>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">License Grant</h2>
            <p className="text-gray-600 leading-relaxed">
              We grant you a limited, non-exclusive, non-transferable license to use the software for your own
              or business purposes. The software is licensed, not sold, and we retain all rights to the software.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">Ownership</h2>
            <p className="text-gray-600 leading-relaxed">
              We own all rights, title, and interest in and to the software, including all intellectual property
              rights. You agree not to modify, adapt, translate, reverse engineer, decompile, disassemble, or
              otherwise attempt to discover the source code of the software.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">Use of the Software</h2>
            <p className="text-gray-600 leading-relaxed">
              You agree to use the software only for lawful purposes and in accordance with these terms and
              conditions. You agree not to use the software in any way that could damage or impair the software
              or its functionality, or interfere with any other party’s use of the software.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">Fees and Payment</h2>
            <p className="text-gray-600 leading-relaxed">
              You agree to pay all fees associated with your use of the software, as set forth in the pricing
              and payment terms provided to you at the time of purchase. Failure to pay such fees may result in
              termination of your license to use the software.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">Termination</h2>
            <p className="text-gray-600 leading-relaxed">
              We may terminate your license to use the software at any time if you breach any of these terms and
              conditions. Upon termination, you must immediately cease all use of the software and destroy all
              copies of the software in your possession.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">Warranty Disclaimer</h2>
            <p className="text-gray-600 leading-relaxed">
              We make no warranties or representations regarding the software, including without limitation its
              quality, reliability, suitability, or fitness for a particular purpose. The software is provided
              “as is” and we expressly disclaim all warranties, whether express or implied, including any
              warranties of merchantability or fitness for a particular purpose.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">Limitation of Liability</h2>
            <p className="text-gray-600 leading-relaxed">
              In no event shall we be liable for any direct, indirect, incidental, special, or consequential
              damages arising out of or in connection with your use of the software, even if we have been
              advised of the possibility of such damages. Our total liability to you for any and all claims
              shall be limited to the amount paid by you for the software.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">Indemnification</h2>
            <p className="text-gray-600 leading-relaxed">
              You agree to indemnify and hold us harmless from any and all claims, damages, liabilities, costs,
              and expenses (including legal fees) arising out of or in connection with your use of the software
              or any breach of these terms and conditions.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">Governing Law</h2>
            <p className="text-gray-600 leading-relaxed">
              These terms and conditions shall be governed by and construed in accordance with the laws of the
              jurisdiction in India, without giving effect to any principles of conflicts of law.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">Entire Agreement</h2>
            <p className="text-gray-600 leading-relaxed">
              These terms and conditions constitute the entire agreement between you and us with respect to the
              software and supersede all prior or contemporaneous communications and proposals, whether oral or
              written, between you and us.
            </p>
          </section>

          <section className="border-t pt-6">
            <p className="text-gray-600 leading-relaxed">
              By using Power CA, you acknowledge that you have read, understood, and agree to be bound by these
              terms and conditions. If you do not agree to these terms and conditions, you may not use the
              software.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
