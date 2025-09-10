"use client"

import { motion } from "framer-motion"
import Image from "next/image"

const trustedCompanies = [
  { name: "GKM", logo: "/images/clients/gkm-Logo-V2.png" },
  { name: "Karthikeyan Jayaram", logo: "/images/clients/karthikeyan-Jayaram-01-01-1.png" },
  { name: "TSMA", logo: "/images/clients/TSMA-Logo.png" },
  { name: "Logo Black", logo: "/images/clients/logo-old Black.png" },
]

export function SocialProof() {
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <p className="text-sm font-medium text-gray-600 uppercase tracking-wider">
            Trusted by Chartered Accountants
          </p>
        </div>
        
        <div className="relative">
          {/* Logo Grid */}
          <div className="flex justify-center">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 items-center">
              {trustedCompanies.map((company, index) => (
                <motion.div
                  key={company.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="flex items-center justify-center"
                >
                  <div className="relative group">
                    <div className="bg-white rounded-lg p-6 shadow-md transition-all duration-300 group-hover:shadow-xl group-hover:scale-105">
                      <Image
                        src={company.logo}
                        alt={company.name}
                        width={150}
                        height={80}
                        className="h-16 w-auto object-contain"
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}