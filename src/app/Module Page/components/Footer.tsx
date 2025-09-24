import { MapPin, Mail, Phone, ChevronDown } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export function Footer() {
  return (
    <footer className="bg-[#001525] text-white relative">
      <div className="px-[144px] pt-[60px] pb-[30px]">
        <div className="flex gap-[144px] mb-[40px]">
          {/* Company Info */}
          <div className="flex flex-col gap-6">
            <div className="h-[59px] w-[201px]">
              <ImageWithFallback 
                src="/api/placeholder/201/59"
                alt="Power CA Logo"
                className="h-full w-full object-cover"
              />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <MapPin size={24} />
                <span className="text-lg">No. 130, II Floor, Muneer Complex, Palani Road, Udumalpet.</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={24} />
                <span className="text-lg">contact@powerca.in | support@powerca.in</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={24} />
                <span className="text-lg">+91 9842224635 | +91 9629514635</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-4">
              {[1, 2, 3, 4].map((item) => (
                <div 
                  key={item}
                  className="w-8 h-8 bg-white rounded-full flex items-center justify-center"
                >
                  <div className="w-4 h-4 bg-[#001525]"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="flex-1 flex justify-between">
            {/* Quick Links */}
            <div>
              <h3 className="text-[28px] font-medium mb-6">Quick Links</h3>
              <ul className="space-y-4 text-lg">
                <li className="text-white">Home</li>
                <li className="text-white">About US</li>
                <li className="text-[#f4f7fd]">Modules</li>
                <li className="text-[#f4f7fd]">Pricing</li>
                <li className="text-white">Blog</li>
                <li className="text-white">Contact us</li>
              </ul>
            </div>

            {/* Your Account */}
            <div>
              <h3 className="text-[28px] font-medium mb-6">Your Account</h3>
              <ul className="space-y-4 text-lg text-white">
                <li>Login</li>
                <li>Register</li>
                <li>Account</li>
                <li>Power CA Software</li>
              </ul>
            </div>

            {/* Newsletter & Blogs */}
            <div>
              <h3 className="text-[28px] font-medium mb-6">Subscribe to Our Newsletter</h3>
              <div className="flex gap-[10px] mb-6">
                <div className="bg-white rounded-xl px-[10px] py-[10px] flex items-center gap-2 w-[253px]">
                  <Mail size={28} className="text-[#306bea]" />
                  <span className="text-[#57656c] text-lg">Subscribe Now</span>
                </div>
                <button className="bg-[#306bea] text-white px-[10px] py-[10px] rounded-xl font-medium">
                  SUBSCRIBE
                </button>
              </div>

              <h3 className="text-[28px] font-medium mb-6">Blogs</h3>
              <div className="flex gap-[10px]">
                {[1, 2, 3].map((item) => (
                  <div 
                    key={item}
                    className="w-[110px] h-[110px] bg-gray-300 rounded-2xl"
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-[#B6C9F3] pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-lg">
              <span>Copyright © 2025 TBS Technologies [P] Limited.</span>
              <span>All rights reserved</span>
            </div>
            <div className="flex items-center gap-2 text-lg">
              <span>Privacy Policy</span>
              <div className="w-1 h-1 bg-white rounded-full"></div>
              <span>Terms and Conditions</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to top button */}
      <div className="absolute right-1/2 top-[384px] transform translate-x-1/2 -translate-y-1/2">
        <button className="bg-white rounded-full p-4 shadow-lg">
          <ChevronDown size={28} className="text-[#001525] rotate-180" />
        </button>
      </div>
    </footer>
  );
}