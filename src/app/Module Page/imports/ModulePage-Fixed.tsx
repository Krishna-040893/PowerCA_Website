"use client"

import Image from "next/image"
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
  Settings,
  Network,
  X,
  Menu,
  ChevronDown
} from "lucide-react"

// Fixed component interfaces
interface ModuleCardProps {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  description: string;
}

// Promotional Banner Component
function PromotionalBanner() {
  return (
    <div className="bg-[#306BEA] text-white py-3 px-6 relative">
      <div className="container mx-auto flex items-center justify-center gap-4">
        <div className="bg-[#f4f7fd] text-[#001525] px-2 py-1 rounded-full text-xs font-medium">
          NEW
        </div>
        <p className="text-sm font-medium">
          Special discount 75% for CAs – Till 31st Oct 2025
        </p>
        <p className="text-sm italic">
          (Be an Early Bird to Enjoy the Offer)
        </p>
        <button className="bg-[#f4f7fd] text-[#001525] px-2 py-1 rounded-full text-xs font-medium underline">
          Click Here
        </button>
        <button className="absolute right-6 top-1/2 transform -translate-y-1/2">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

// Navigation Component
function Navigation() {
  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Image
            src="/images/powerca-logo-main.png"
            alt="PowerCA Logo"
            width={120}
            height={40}
            className="h-10 w-auto"
          />

          <div className="hidden md:flex items-center gap-6">
            <a href="/" className="text-gray-700 hover:text-blue-600">Home</a>
            <a href="/about" className="text-gray-700 hover:text-blue-600">About</a>
            <a href="/modules" className="text-blue-600 font-medium">Modules</a>
            <a href="/pricing" className="text-gray-700 hover:text-blue-600">Pricing</a>
            <a href="/blog" className="text-gray-700 hover:text-blue-600">Blog</a>
            <a href="/contact" className="text-gray-700 hover:text-blue-600">Contact</a>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="hidden md:block text-gray-700 hover:text-blue-600">
            Login
          </button>
          <button className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700">
            Register
          </button>
          <button className="md:hidden">
            <Menu size={24} />
          </button>
        </div>
      </div>
    </nav>
  );
}

// Module Card Component
function ModuleCard({ icon: Icon, title, description }: ModuleCardProps) {
  return (
    <div className="bg-white border-2 rounded-2xl p-6 h-full hover:shadow-lg transition-shadow"
         style={{ borderColor: '#b6c9f3' }}>
      <div className="bg-white border-2 rounded-lg p-3 w-fit mb-5"
           style={{ borderColor: '#b6c9f3' }}>
        <Icon size={44} className="text-[#306BEA]" />
      </div>

      <h3 className="text-2xl font-medium text-[#001525] leading-tight mb-4">
        {title}
      </h3>

      <p className="text-lg text-[#666d80] leading-relaxed text-justify">
        {description}
      </p>
    </div>
  );
}

// Hero Section Component
function HeroSection() {
  return (
    <section className="relative py-16 bg-white overflow-hidden">
      {/* Background with 48px padding */}
      <div className="absolute inset-0 px-12">
        <div
          className="w-full h-full rounded-2xl border-2"
          style={{
            backgroundColor: '#f4f7fd',
            borderColor: '#b6c9f3'
          }}
        >
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
        </div>
      </div>

      <div className="container mx-auto px-6 lg:px-8 relative z-10">
        <div className="max-w-6xl mx-auto text-center py-16">
          {/* Badge */}
          <div className="mb-8">
            <span className="inline-flex items-center px-6 py-3 bg-[rgba(48,107,234,0.1)] border border-[#306bea] text-[#244b9b] rounded-full text-sm font-medium">
              <Network className="w-6 h-6 mr-2" />
              Tailored Modules for Total Control
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium text-[#001525] leading-tight mb-8">
            Elevate Your Practice with Power CA Modules
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-[#666d80] leading-relaxed max-w-4xl mx-auto">
            Optimize your practice with powerful management tools that streamline operations and enhance client services.
          </p>
        </div>
      </div>
    </section>
  );
}

// Modules data
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

// Modules Section Component
function ModulesSection() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8 mb-16">
          <h2 className="text-4xl md:text-5xl font-normal text-[#001525] leading-tight">
            Explore Power CA Modules
          </h2>
          <p className="text-lg text-[#666d80] leading-relaxed max-w-2xl">
            Discover the full potential of Power CA through its modules, designed to streamline operations, increase productivity, and enhance your practice.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
    </section>
  );
}

// Footer Component
function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Image
              src="/images/powerca-logo-main.png"
              alt="PowerCA Logo"
              width={150}
              height={50}
              className="h-12 w-auto mb-4"
            />
            <p className="text-gray-400 mb-4">
              Comprehensive practice management solution for Chartered Accountants
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li><a href="/modules" className="text-gray-400 hover:text-white">Modules</a></li>
              <li><a href="/pricing" className="text-gray-400 hover:text-white">Pricing</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><a href="/about" className="text-gray-400 hover:text-white">About</a></li>
              <li><a href="/contact" className="text-gray-400 hover:text-white">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 PowerCA. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

// Main Module Page Component
export default function ModulePage() {
  return (
    <div className="min-h-screen bg-white">
      <PromotionalBanner />
      <Navigation />
      <HeroSection />
      <ModulesSection />
      <Footer />
    </div>
  );
}