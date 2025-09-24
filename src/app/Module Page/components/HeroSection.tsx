import { Network } from "lucide-react";

export function HeroSection() {
  return (
    <div className="relative bg-[#f4f7fd] rounded-2xl mx-[48px] mt-[132px] mb-[60px] h-[416px] border border-[#b6c9f3] overflow-hidden">
      {/* Grid Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%" className="absolute inset-0">
          <defs>
            <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#306BEA" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Gradient Blobs */}
      <div className="absolute top-[-200px] right-[-400px] w-[800px] h-[800px] opacity-20">
        <div className="w-full h-full rounded-full bg-gradient-radial from-[#306BEA] to-transparent"></div>
      </div>
      <div className="absolute top-[-100px] left-[-400px] w-[800px] h-[800px] opacity-20">
        <div className="w-full h-full rounded-full bg-gradient-radial from-[#306BEA] to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-12 text-center">
        <div className="bg-[rgba(48,107,234,0.1)] border border-[#306bea] rounded-full px-3 py-2 mb-7 flex items-center gap-2">
          <Network size={24} className="text-[#244b9b]" />
          <span className="text-[#244b9b] font-medium">Tailored Modules for Total Control</span>
        </div>
        
        <h1 className="text-6xl font-medium text-[#001525] max-w-[1368px] mb-7 leading-tight">
          Elevate Your Practice with Power CA Modules
        </h1>
        
        <p className="text-lg text-[#666d80] max-w-[1128px] leading-relaxed">
          Optimize your practice with powerful management tools that streamline operations and enhance client services.
        </p>
      </div>
    </div>
  );
}