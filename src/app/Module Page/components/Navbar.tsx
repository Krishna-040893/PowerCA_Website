import imgPowerCaLogoOnly035Scaled1 from "../imports/ModulePage.tsx";

export function Navbar() {
  const navItems = ["Home", "About Us", "Modules", "Pricing", "Blog", "Contact"];

  return (
    <nav className="bg-white shadow-sm py-5 px-12 flex items-center justify-between relative top-[42px] mx-auto max-w-[1920px]">
      <div className="h-[50px] w-[201px] relative">
        <img 
          src="/api/placeholder/201/50" 
          alt="Power CA Logo" 
          className="h-full w-full object-contain"
        />
      </div>
      
      <div className="flex items-center gap-8">
        {navItems.map((item, index) => (
          <span 
            key={item}
            className={`text-lg font-medium cursor-pointer ${
              item === "About Us" ? "text-[#306bea]" : "text-[#666d80]"
            }`}
          >
            {item}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <button className="px-5 py-2 text-[#001525] font-medium rounded-full border border-transparent hover:bg-gray-50">
          Sign In
        </button>
        <button className="px-5 py-2 bg-[#306bea] text-white font-medium rounded-full hover:bg-[#2557d6]">
          Book Demo
        </button>
      </div>
    </nav>
  );
}