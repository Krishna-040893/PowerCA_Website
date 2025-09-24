"use client"

import Image from "next/image"

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="mb-6">
              <div className="mb-4">
                <Image
                  src="/footer/Power CA Logo Only-05.png"
                  alt="Power CA"
                  width={200}
                  height={75}
                  className="h-16 w-auto"
                />
              </div>
            </div>

            <div className="space-y-4 text-sm text-gray-300">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 mt-0.5 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <p>No. 130, II Floor, Muneer Complex, Palani Road,</p>
                  <p>Udumalpet.</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div>
                  <p>contact@powerca.in | support@powerca.in</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <div>
                  <p>+91 9842224635 | +91 9629514635</p>
                </div>
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex space-x-4 mt-6">
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.163-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.748-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z"/>
                </svg>
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.97 2.59a1.5 1.5 0 00-1.94 0l-7.5 6.363A1.5 1.5 0 003 10.097V19.5A1.5 1.5 0 004.5 21h4.75a.25.25 0 00.25-.25V14h5v6.75c0 .138.112.25.25.25H19.5a1.5 1.5 0 001.5-1.5v-9.403a1.5 1.5 0 00-.53-1.144l-7.5-6.363z"/>
                </svg>
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li><a href="/" className="hover:text-blue-400 transition-colors">Home</a></li>
              <li><a href="/about" className="hover:text-blue-400 transition-colors">About US</a></li>
              <li><a href="/modules" className="hover:text-blue-400 transition-colors">Modules</a></li>
              <li><a href="/pricing" className="hover:text-blue-400 transition-colors">Pricing</a></li>
              <li><a href="/blog" className="hover:text-blue-400 transition-colors">Blog</a></li>
              <li><a href="/contact" className="hover:text-blue-400 transition-colors">Contact us</a></li>
            </ul>
          </div>

          {/* Your Account */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Your Account</h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li><a href="/login" className="hover:text-blue-400 transition-colors">Login</a></li>
              <li><a href="/register" className="hover:text-blue-400 transition-colors">Register</a></li>
              <li><a href="/account" className="hover:text-blue-400 transition-colors">Account</a></li>
              <li><a href="/software" className="hover:text-blue-400 transition-colors">Power CA Software</a></li>
            </ul>
          </div>

          {/* Newsletter & Blogs */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Subscribe to Our Newsletter</h3>

            {/* Newsletter Signup */}
            <div className="mb-8">
              <div className="flex">
                <input
                  type="email"
                  placeholder="Subscribe Now"
                  className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-l-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
                <button className="px-6 py-3 text-white rounded-r-lg transition-colors hover:opacity-90" style={{ backgroundColor: '#144fed' }}>
                  SUBSCRIBE
                </button>
              </div>
            </div>

            {/* Blogs Section */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Blogs</h4>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-orange-400 rounded-lg p-2 aspect-square flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-8 h-8 bg-white rounded-full mx-auto mb-1 flex items-center justify-center">
                      <span className="text-orange-400 text-xs font-bold">📊</span>
                    </div>
                    <span className="text-xs text-white">Blog 1</span>
                  </div>
                </div>
                <div className="bg-pink-400 rounded-lg p-2 aspect-square flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-8 h-8 bg-white rounded-full mx-auto mb-1 flex items-center justify-center">
                      <span className="text-pink-400 text-xs font-bold">💼</span>
                    </div>
                    <span className="text-xs text-white">Blog 2</span>
                  </div>
                </div>
                <div className="bg-green-400 rounded-lg p-2 aspect-square flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-8 h-8 bg-white rounded-full mx-auto mb-1 flex items-center justify-center">
                      <span className="text-green-400 text-xs font-bold">📈</span>
                    </div>
                    <span className="text-xs text-white">Blog 3</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col lg:flex-row justify-between items-center">
            <div className="text-sm text-gray-400 mb-4 lg:mb-0">
              Copyright © 2025 TBS Technologies [P] Limited. All rights reserved
            </div>

            {/* Back to Top Button */}
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors mb-4 lg:mb-0"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </button>

            <div className="flex space-x-6 text-sm text-gray-400">
              <a href="/privacy" className="hover:text-blue-400 transition-colors">Privacy Policy</a>
              <span>•</span>
              <a href="/terms" className="hover:text-blue-400 transition-colors">Terms and Conditions</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}