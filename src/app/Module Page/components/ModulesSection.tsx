import { ModuleCard } from "./ModuleCard";
import { 
  Building2, 
  Calendar, 
  CheckCircle, 
  FileText, 
  Users, 
  Calculator, 
  MessageSquare, 
  Key,
  User,
  FolderOpen,
  BarChart3,
  Briefcase,
  Book,
  DollarSign,
  FileCheck,
  Settings
} from "lucide-react";

const modules = [
  {
    icon: Building2,
    title: "Accounts",
    description: "Accounts Module is a simple and easy financial accounting process to maintain the office accounts with all transaction types like receipts, income and expenses and is integrated with the billing module."
  },
  {
    icon: Calendar,
    title: "Attendance", 
    description: "Attendance module is designed to integrate with the bio-metric devices at the office and provides flexible, customer definable options for attendance rules, leave rules, rule exceptions, staff hierarchy and approval process."
  },
  {
    icon: CheckCircle,
    title: "Attestation",
    description: "The Attestation module facilitates storage and retrieval of all the information relating to the certificates issued, documents used and working papers involved, related job info, staff involved along with the billing track."
  },
  {
    icon: FileText,
    title: "Billing",
    description: "Effective billing and collection must be a systematic and disciplined process for a practicing-chartered accountant's survival and success."
  },
  {
    icon: Users,
    title: "Client Profile",
    description: "Client Profile module helps to consolidate details of the client, multiple locations, Income Tax profile data, GST Profile data, the promoters profile data, statutory registrations, permanent documents and a lot more.."
  },
  {
    icon: Calculator,
    title: "Costing",
    description: "Costing module enables preparation of Job Cost Estimate before the job is undertaken based on planned tasks, estimated manhours and standard effort distribution model."
  },
  {
    icon: MessageSquare,
    title: "CRM",
    description: "Documenting the instances of effective communication happening through various modes between your office and client both oral and written, before, during and after the engagement is taken care by this module."
  },
  {
    icon: Key,
    title: "Digital Signature",
    description: "PowerCA DSC Module helps to track the receipt, holding and use of digital signature of the client in execution of audit jobs.Setting reminders for renewals due helps to keep them ready in times of need."
  },
  {
    icon: User,
    title: "Staff Profile",
    description: "PowerCA Employee Module helps to create and manage employee profiles and evaluate them through annual, periodic or task based grading. This module captures all relevant information about employees."
  },
  {
    icon: FolderOpen,
    title: "File Management",
    description: "The digital records of an auditor office can be kept organized in a coherent, retrievable and safe manner with the help of this module. Loss of time and efforts in tracing the file, records and documents as and when needed is eliminated by this module."
  },
  {
    icon: BarChart3,
    title: "Financial Statement",
    description: "Power CA makes the task of preparation of Financial Statements of the clients from the TB provided, much easier. Input the Trial Balance of non-corporate entities or just extract the same from Tally and the Financial statements are ready with few settings."
  },
  {
    icon: Briefcase,
    title: "Jobcard",
    description: "PowerCA Jobcard module is the cornerstone feature in Power CA. Designed in a highly structured and well-organized manner, the process starts with service request, allows to build job plan and job card, facilitates weekly review"
  },
  {
    icon: Book,
    title: "Library",
    description: "PowerCA Library Module helps to record, classify and retrieve content, pdf books, weblinks, files internally for ready reference. This module can be used to store and retrieve the valuable professional notes authored by the office staff."
  },
  {
    icon: DollarSign,
    title: "Payroll",
    description: "The payroll module is a full-fledged payroll system with definable pay components like DA, HRA, etc, configurable deductions, staff advance and recovery, Form 16 Output and Salary Certificate."
  },
  {
    icon: FileCheck,
    title: "Records",
    description: "Power CA Records Module helps to manage the receipt, holding and return of important documents, records and files of the client. Helps to manage the process, enables stock verification, and reporting of discrepancies."
  },
  {
    icon: Settings,
    title: "User Management",
    description: "User Management Module provides an exhaustive facility for mapping individual employee to the software user, setting 2 factor authentication, password reset, categorizing users into different levels, Sys admin, Office admin, In Charges, Partners and General Users, providing and restricting access rights to the different menu options of the software."
  }
];

export function ModulesSection() {
  return (
    <div className="px-[144px] py-[60px]">
      <div className="flex items-center gap-7 mb-[60px]">
        <h2 className="text-5xl font-normal text-[#001525] max-w-[527px] leading-[56px]">
          Explore Power CA Modules
        </h2>
        <p className="text-lg text-[#666d80] max-w-[800px] leading-relaxed">
          Discover the full potential of Power CA through its modules, designed to streamline operations, increase productivity, and enhance your practice.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {modules.map((module, index) => (
          <ModuleCard 
            key={index}
            icon={module.icon}
            title={module.title}
            description={module.description}
          />
        ))}
      </div>
    </div>
  );
}