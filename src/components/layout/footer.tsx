import Image from 'next/image'
import Link from 'next/link'
import { NewsletterForm } from '@/components/layout/newsletter-form'

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Modules', href: '/modules' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact us', href: '/contact' },
]

const accountLinks = [
  { label: 'Login', href: '/login' },
  { label: 'Register', href: '/register' },
  { label: 'Account', href: '/account' },
]

const socialLinks = [
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/powerca24/',
    path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z',
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/power-ca-tbs25100',
    path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
  },
  {
    label: 'X',
    href: 'https://x.com/Powerca_24',
    path: 'M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z',
  },
  {
    label: 'YouTube',
    href: 'https://www.youtube.com/@powerCA-24',
    path: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
  },
]

export function Footer() {
  return (
    <footer className="bg-[#111418] text-white">
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-[144px] mx-auto pt-16 sm:pt-20 lg:pt-[100px] pb-10 sm:pb-12 lg:pb-16">
        {/* Three columns: navigation, brand and contact, address. */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
          {/* Navigation, with the account pages in a second column */}
          <nav className="flex flex-wrap gap-x-12 gap-y-8 text-sm text-gray-300">
            <div className="flex flex-col gap-3">
              <h3 className="mb-1 text-sm font-semibold text-white">Quick Links</h3>
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className="w-fit hover:text-white transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="flex flex-col gap-3">
              <h3 className="mb-1 text-sm font-semibold text-white">Your Account</h3>
              {accountLinks.map((link) => (
                <Link key={link.href} href={link.href} className="w-fit hover:text-white transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>

          {/* Brand, contact and social */}
          <div className="flex flex-col items-center text-center">
            <Link href="/" className="mb-5">
              <Image
                src="/footer/Power CA Logo Only-05.png"
                alt="Power CA"
                width={400}
                height={150}
                className="h-14 sm:h-16 w-auto"
              />
            </Link>

            <a href="mailto:contact@powerca.in" className="text-sm text-gray-300 hover:text-white transition-colors">
              contact@powerca.in
            </a>
            <a href="tel:+919842224635" className="mt-1 text-sm text-gray-300 hover:text-white transition-colors">
              +91 98422 24635 | +91 96295 14635
            </a>

            <div className="mt-6 flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1c2027] text-white transition-colors hover:bg-[#272c35]"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d={social.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Address */}
          <div className="text-center md:text-right">
            <h3 className="text-sm font-semibold text-white">Address</h3>
            <address className="mt-4 text-sm not-italic leading-relaxed text-gray-300">
              No. 130, II Floor, Muneer Complex,
              <br />
              Palani Road,
              <br />
              Udumalpet.
            </address>

            <div className="mt-8">
              <h3 className="text-sm font-semibold text-white">Subscribe to our newsletter</h3>
              <div className="mt-4">
                <NewsletterForm />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="mt-14 sm:mt-16 lg:mt-20 flex flex-col gap-4 text-xs sm:text-sm text-gray-400 md:grid md:grid-cols-3 md:items-center md:gap-6">
          <p className="text-center md:text-left">
            © {new Date().getFullYear()} TBS Technologies [P] Limited. All Rights Reserved.
          </p>

          <div className="flex items-center justify-center gap-4">
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms &amp; Conditions
            </Link>
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-white/50" aria-hidden="true" />
            <Link href="/refund-policy" className="hover:text-white transition-colors">
              Refund Policy
            </Link>
          </div>

          <div className="text-center md:text-right">
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
