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
    <section className="py-10 bg-white overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold mb-2" style={{ color: '#001525' }}>Trusted by</h2>
          <p className="text-xl text-blue-600 font-semibold">Chartered Accountants</p>
        </div>

        {/* Scrolling Logos Container */}
        <div className="relative">
          <div className="flex items-center space-x-16 animate-scroll">
            {/* First set of logos */}
            {logos.map((logo, index) => (
              <div key={`first-${index}`} className="flex-shrink-0 flex items-center justify-center min-w-[320px]">
                <Image
                  src={logo.src}
                  alt={logo.name}
                  width={logo.width}
                  height={logo.height}
                  className="h-12 w-auto object-contain filter opacity-70 hover:opacity-100 transition-opacity duration-300"
                  priority={index < 2}
                />
              </div>
            ))}

            {/* Duplicate set for seamless loop */}
            {logos.map((logo, index) => (
              <div key={`second-${index}`} className="flex-shrink-0 flex items-center justify-center min-w-[320px]">
                <Image
                  src={logo.src}
                  alt={logo.name}
                  width={logo.width}
                  height={logo.height}
                  className="h-12 w-auto object-contain filter opacity-70 hover:opacity-100 transition-opacity duration-300"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-scroll {
          animation: scroll 25s linear infinite;
        }

        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  )
}