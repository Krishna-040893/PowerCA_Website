'use client'

import { Network } from 'lucide-react'
import Image from 'next/image'

interface ModuleCardProps {
  iconSrc: string;
  title: string;
  description: string;
}

function ModuleCard({ iconSrc, title, description }: ModuleCardProps) {
  return (
    <div className="bg-white border-2 rounded-2xl p-4 sm:p-5 md:p-6 h-full" style={{ borderColor: '#b6c9f3' }}>
      <div className="bg-white border-2 rounded-[10px] p-1.5 sm:p-2 w-fit mb-3 sm:mb-4 md:mb-5" style={{ borderColor: '#b6c9f3' }}>
        <Image
          src={iconSrc}
          alt={`${title} icon`}
          width={32}
          height={32}
          className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8"
        />
      </div>

      <h3 className="text-lg sm:text-xl md:text-[24px] font-medium text-[#001525] leading-tight sm:leading-[36px] mb-3 sm:mb-4 md:mb-5 font-inter">
        {title}
      </h3>

      <p className="text-sm sm:text-base text-[#666d80] leading-relaxed sm:leading-[30px] text-justify font-inter">
        {description}
      </p>
    </div>
  )
}

const modules = [
  {
    iconSrc: '/icons/modules/accounts.svg',
    title: 'Accounts',
    description: 'Accounts Module is a simple and easy financial accounting process to maintain the office accounts with all transaction types like receipts, income and expenses and is integrated with the billing module.'
  },
  {
    iconSrc: '/icons/modules/attendance.svg',
    title: 'Attendance',
    description: 'Attendance module is designed to integrate with the bio-metric devices at the office and provides flexible, customer definable options for attendance rules, leave rules, rule exceptions, staff hierarchy and approval process.'
  },
  {
    iconSrc: '/icons/modules/attestation.svg',
    title: 'Attestation',
    description: 'The Attestation module facilitates storage and retrieval of all the information relating to the certificates issued, documents used and working papers involved, related job info, staff involved along with the billing track.'
  },
  {
    iconSrc: '/icons/modules/billing.svg',
    title: 'Billing',
    description: "Effective billing and collection must be a systematic and disciplined process for a practicing-chartered accountant's survival and success."
  },
  {
    iconSrc: '/icons/modules/client-profile.svg',
    title: 'Client Profile',
    description: 'Client Profile module helps to consolidate details of the client, multiple locations, Income Tax profile data, GST Profile data, the promoters profile data, statutory registrations, permanent documents and a lot more..'
  },
  {
    iconSrc: '/icons/modules/costing.svg',
    title: 'Costing',
    description: 'Costing module enables preparation of Job Cost Estimate before the job is undertaken based on planned tasks, estimated manhours and standard effort distribution model.'
  },
  {
    iconSrc: '/icons/modules/crm.svg',
    title: 'CRM',
    description: 'Documenting the instances of effective communication happening through various modes between your office and client both oral and written, before, during and after the engagement is taken care by this module.'
  },
  {
    iconSrc: '/icons/modules/digital-signature.svg',
    title: 'Digital Signature',
    description: 'PowerCA DSC Module helps to track the receipt, holding and use of digital signature of the client in execution of audit jobs.Setting reminders for renewals due helps to keep them ready in times of need.'
  },
  {
    iconSrc: '/icons/modules/staff-profile.svg',
    title: 'Staff Profile',
    description: 'PowerCA Employee Module helps to create and manage employee profiles and evaluate them through annual, periodic or task based grading. This module captures all relevant information about employees.'
  },
  {
    iconSrc: '/icons/modules/file-management.svg',
    title: 'File Management',
    description: 'The digital records of an auditor office can be kept organized in a coherent, retrievable and safe manner with the help of this module. Loss of time and efforts in tracing the file, records and documents as and when needed is eliminated by this module.'
  },
  {
    iconSrc: '/icons/modules/financial-statement.svg',
    title: 'Financial Statement',
    description: 'Power CA makes the task of preparation of Financial Statements of the clients from the TB provided, much easier. Input the Trial Balance of non-corporate entities or just extract the same from Tally and the Financial statements are ready with few settings.'
  },
  {
    iconSrc: '/icons/modules/jobcard.svg',
    title: 'Jobcard',
    description: 'PowerCA Jobcard module is the cornerstone feature in Power CA. Designed in a highly structured and well-organized manner, the process starts with service request, allows to build job plan and job card, facilitates weekly review'
  },
  {
    iconSrc: '/icons/modules/library.svg',
    title: 'Library',
    description: 'PowerCA Library Module helps to record, classify and retrieve content, pdf books, weblinks, files internally for ready reference. This module can be used to store and retrieve the valuable professional notes authored by the office staff.'
  },
  {
    iconSrc: '/icons/modules/payroll.svg',
    title: 'Payroll',
    description: 'The payroll module is a full-fledged payroll system with definable pay components like DA, HRA, etc, configurable deductions, staff advance and recovery, Form 16 Output and Salary Certificate.'
  },
  {
    iconSrc: '/icons/modules/records.svg',
    title: 'Records',
    description: 'Power CA Records Module helps to manage the receipt, holding and return of important documents, records and files of the client. Helps to manage the process, enables stock verification, and reporting of discrepancies.'
  },
  {
    iconSrc: '/icons/modules/user-management.svg',
    title: 'User Management',
    description: 'User Management Module provides an exhaustive facility for mapping individual employee to the software user, setting 2 factor authentication, password reset, categorizing users into different levels, Sys admin, Office admin, In Charges, Partners and General Users, providing and restricting access rights to the different menu options of the software.'
  }
]

export default function ModulesPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-3 sm:py-4 md:py-5 lg:py-8 flex items-center justify-center overflow-hidden bg-white">
        {/* Background image with responsive padding */}
        <div className="absolute inset-0 px-3 sm:px-4 md:px-6 lg:px-6">
          <div
            className="w-full h-full rounded-2xl"
            style={{
              backgroundImage: 'url(/modules-hero-bg.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          ></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-6 relative z-10">
          <div className="max-w-6xl mx-auto text-center">
            {/* Badge */}
            <div className="mb-6 sm:mb-8">
              <span className="inline-flex items-center px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 bg-blue-100 border border-blue-200 text-blue-700 rounded-full text-xs sm:text-sm font-medium font-inter">
                <Network className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                Tailored Modules for Total Control
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-900 leading-tight mb-6 sm:mb-8 font-inter px-2">
              Elevate Your Practice with
              <br />
              <span className="text-blue-600">Power CA Modules</span>
            </h1>

            {/* Description */}
            <div className="mb-8 sm:mb-10 md:mb-12 max-w-5xl mx-auto px-2">
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 leading-relaxed font-inter">
                Optimize your practice with powerful management tools that streamline operations and enhance client services.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Modules Section */}
      <section className="pt-4 sm:pt-5 md:pt-6 lg:pt-8 pb-6 sm:pb-8 bg-white">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-6">
          <div className="grid lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 lg:gap-12 items-start mb-8 sm:mb-10 md:mb-12 lg:mb-16">
            {/* Left Content - Title */}
            <div className="lg:col-span-2">
              <h2 className="font-semibold leading-normal text-2xl sm:text-3xl md:text-4xl lg:text-[42px] text-gray-900 font-inter">
                Explore Power CA Modules
              </h2>
            </div>

            {/* Center Content - Description */}
            <div className="lg:col-span-2">
              <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed font-inter">
                Discover the full potential of Power CA through its modules, designed to streamline operations, increase productivity, and enhance your practice with comprehensive tools.
              </p>
            </div>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {modules.map((module, index) => (
              <ModuleCard
                key={index}
                iconSrc={module.iconSrc}
                title={module.title}
                description={module.description}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
