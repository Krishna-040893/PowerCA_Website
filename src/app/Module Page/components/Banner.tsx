import { X } from "lucide-react";

export function Banner() {
  return (
    <div className="bg-[#001525] text-white py-[10px] px-[144px] flex items-center justify-between relative">
      <div className="flex items-center gap-3">
        <div className="bg-[#f4f7fd] text-[#001525] px-2 py-1 rounded-full">
          <span className="text-xs font-medium">NEW</span>
        </div>
        <div className="text-center">
          <span className="text-sm font-medium">Special discount 75% for CAs – Till 31st Oct 2025</span>
          <span className="text-sm font-medium italic ml-4">(Be an Early Bird to Enjoy the Offer)</span>
        </div>
        <div className="bg-[#f4f7fd] text-[#001525] px-2 py-1 rounded-full">
          <span className="text-xs font-medium underline cursor-pointer">Click Here</span>
        </div>
      </div>
      <button className="p-1">
        <X size={16} />
      </button>
    </div>
  );
}