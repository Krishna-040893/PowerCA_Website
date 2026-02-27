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
          <h2 className="text-2xl font-bold mb-2" style={{ color: '#001525' }}>Trusted by</h2>
          <p className="text-xl text-blue-600 font-semibold">Chartered Accountants</p>
        </div>

        {/* Static Logos Grid */}
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 lg:gap-16">
          {logos.map((logo, index) => (
            <div key={index} className="flex items-center justify-center px-4">
              <Image
                src={logo.src}
                alt={logo.name}
                width={logo.width}
                height={logo.height}
                className="h-12 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity duration-300"
                priority={index < 2}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}