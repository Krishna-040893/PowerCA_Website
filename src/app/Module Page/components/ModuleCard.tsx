import { LucideIcon } from "lucide-react";

interface ModuleCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function ModuleCard({ icon: Icon, title, description }: ModuleCardProps) {
  return (
    <div className="bg-white border-3 border-[#b6c9f3] rounded-2xl p-6 h-full">
      <div className="bg-white border-2 border-[#b6c9f3] rounded-lg p-[10px] w-fit mb-5">
        <Icon size={44} className="text-[#306BEA]" />
      </div>
      
      <h3 className="text-[28px] font-medium text-[#001525] leading-[42px] mb-5">
        {title}
      </h3>
      
      <p className="text-lg text-[#666d80] leading-[30px] text-justify">
        {description}
      </p>
    </div>
  );
}