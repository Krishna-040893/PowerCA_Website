import Link from "next/link"
import Image from "next/image"
import { navigationConfig } from "@/config/navigation"
import { siteConfig } from "@/config/site"
import { Facebook, Twitter, Linkedin, Mail, Phone, MapPin, Server, Database, Shield, TrendingUp } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="mb-4">
              <Image
                src="/images/powerca-logo-horizontal.png"
                alt="PowerCA"
                width={200}
                height={58}
                className="h-14 w-auto brightness-0 invert"
              />
            </div>
            <p className="text-gray-400 mb-4">
              Practice Management Software designed specifically for Chartered Accountants. 
              Streamline your operations, ensure compliance, and grow your practice.
            </p>
            <div className="flex space-x-4">
              <a
                href={siteConfig.links.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary-400 transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href={siteConfig.links.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary-400 transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="hover:text-primary-400 transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Footer Navigation */}
          {navigationConfig.footerNav.map((section, index) => (
            <div key={index}>
              <h3 className="text-white font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex}>
                    <Link
                      href={item.href}
                      className="text-gray-400 hover:text-primary-400 transition-colors"
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <Phone className="w-4 h-4 mr-2 mt-1 flex-shrink-0" />
                <span className="text-gray-400">+91 98765 43210</span>
              </li>
              <li className="flex items-start">
                <Mail className="w-4 h-4 mr-2 mt-1 flex-shrink-0" />
                <span className="text-gray-400">support@powerca.in</span>
              </li>
              <li className="flex items-start">
                <MapPin className="w-4 h-4 mr-2 mt-1 flex-shrink-0" />
                <span className="text-gray-400">
                  Mumbai, Maharashtra<br />
                  India - 400001
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            <div className="flex items-center gap-2 bg-gray-800/50 px-3 py-2 rounded-lg">
              <Server className="w-4 h-4 text-primary-400" />
              <span className="text-sm text-gray-400">Client Server Application</span>
            </div>
            <div className="flex items-center gap-2 bg-gray-800/50 px-3 py-2 rounded-lg">
              <Database className="w-4 h-4 text-primary-400" />
              <span className="text-sm text-gray-400">Own Your Data</span>
            </div>
            <div className="flex items-center gap-2 bg-gray-800/50 px-3 py-2 rounded-lg">
              <Shield className="w-4 h-4 text-primary-400" />
              <span className="text-sm text-gray-400">Secure Application</span>
            </div>
            <div className="flex items-center gap-2 bg-gray-800/50 px-3 py-2 rounded-lg">
              <TrendingUp className="w-4 h-4 text-primary-400" />
              <span className="text-sm text-gray-400">Stop Revenue Leakage</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} PowerCA. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link
                href="/privacy"
                className="text-gray-400 hover:text-primary-400 text-sm transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-gray-400 hover:text-primary-400 text-sm transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href="/cookies"
                className="text-gray-400 hover:text-primary-400 text-sm transition-colors"
              >
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}