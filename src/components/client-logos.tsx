'use client'

import Image from 'next/image'

export function ClientLogos() {
  const logos = [
    { name: 'TS Maniam & Associates', src: '/images/client-logos/ts-maniam.png', width: 280, height: 60 },
    { name: 'Karthikeyan & Jayaram', src: '/images/client-logos/karthikeyan-jayaram.png', width: 280, height: 60 },
    { name: 'GKM', src: '/images/client-logos/gkm.png', width: 120, height: 60 },
    { name: 'TN Ramadoss & Co', src: '/images/client-logos/tn-ramadoss.png', width: 200, height: 60 }
  ]

  return (
    <section className="py-4 sm:py-5 md:py-6 lg:py-8 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold" style={{ color: '#001525' }}>
            Trusted by <span className="text-blue-600">Chartered Accountants</span>
          </h2>
        </div>

        {/* Mobile - Continuous carousel */}
        <div className="lg:hidden relative -mx-4 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          <div className="flex w-max items-center animate-logo-marquee motion-reduce:animate-none">
            {[...logos, ...logos].map((logo, index) => (
              <div key={index} className="flex shrink-0 items-center justify-center px-6">
                <Image
                  src={logo.src}
                  alt={index < logos.length ? logo.name : ''}
                  width={logo.width}
                  height={logo.height}
                  className="h-12 w-auto max-w-none object-contain opacity-70"
                  priority={index < 2}
                  aria-hidden={index >= logos.length}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Desktop - Static grid */}
        <div className="hidden lg:flex flex-wrap items-center justify-center gap-8 md:gap-12 lg:gap-16">
          {logos.map((logo, index) => (
            <div key={index} className="flex items-center justify-center px-4">
              <Image
                src={logo.src}
                alt={logo.name}
                width={logo.width}
                height={logo.height}
                className="h-12 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity duration-300"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
