'use client'

import { Network } from 'lucide-react'
import Image from 'next/image'
import { PageHero } from '@/components/layout/page-hero'
import { Reveal } from '@/components/ui/reveal'
import { SectionHeader } from '@/components/home/section-header'

interface ModuleCardProps {
  iconSrc: string;
  title: string;
  description: string;
}

function ModuleCard({ iconSrc, title, description }: ModuleCardProps) {
  return (
    <div className="group h-full rounded-2xl border border-gray-100 bg-white p-5 sm:p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-12px_rgba(16,24,40,0.10)] transition-shadow duration-200 hover:shadow-[0_1px_2px_rgba(16,24,40,0.06),0_16px_32px_-12px_rgba(16,24,40,0.16)]">
      {/* Soft neutral chip so the icons read as one set rather than competing
          with the card's own border. */}
      <div className="mb-6 sm:mb-7 flex h-11 w-11 items-center justify-center rounded-[6px] bg-blue-50">
        <Image
          src={iconSrc}
          alt={`${title} icon`}
          width={32}
          height={32}
          className="h-6 w-6"
        />
      </div>

      <h3 className="mb-2 text-lg sm:text-xl font-semibold leading-snug text-[#001525] font-inter">
        {title}
      </h3>

      <p className="text-sm leading-relaxed text-gray-500 font-inter">
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
    description: 'Power CA DSC Module helps to track the receipt, holding and use of digital signature of the client in execution of audit jobs.Setting reminders for renewals due helps to keep them ready in times of need.'
  },
  {
    iconSrc: '/icons/modules/staff-profile.svg',
    title: 'Staff Profile',
    description: 'Power CA Employee Module helps to create and manage employee profiles and evaluate them through annual, periodic or task based grading. This module captures all relevant information about employees.'
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
    description: 'Power CA Jobcard module is the cornerstone feature in Power CA. Designed in a highly structured and well-organized manner, the process starts with service request, allows to build job plan and job card, facilitates weekly review'
  },
  {
    iconSrc: '/icons/modules/library.svg',
    title: 'Library',
    description: 'Power CA Library Module helps to record, classify and retrieve content, pdf books, weblinks, files internally for ready reference. This module can be used to store and retrieve the valuable professional notes authored by the office staff.'
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
      <PageHero
        backgroundImage="/modules-hero-bg.jpg"
        badge={{
          icon: <Network className="w-3 h-3 sm:w-3.5 sm:h-3.5" />,
          label: 'Tailored Modules for Total Control',
        }}
        title="Elevate Your Practice with"
        accent="Power CA Modules"
        description="Optimize your practice with powerful management tools that streamline operations and enhance client services."
      />

      {/* Modules Section */}
      <section className="py-7 sm:py-10 md:py-12 lg:py-[60px] bg-white">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-6">
          <div className="mb-8 sm:mb-10 md:mb-12 lg:mb-16">
            <SectionHeader
              title="Explore Power CA"
              emphasis="Modules"
              description="Discover the full potential of Power CA through its modules, designed to streamline operations, increase productivity, and enhance your practice with comprehensive tools."
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
            {modules.map((module, index) => (
              <Reveal key={index} delay={(index % 4) * 0.05}>
                <ModuleCard
                  iconSrc={module.iconSrc}
                  title={module.title}
                  description={module.description}
                />
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
