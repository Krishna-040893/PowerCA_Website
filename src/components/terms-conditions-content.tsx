'use client'

import { BackButton } from '@/components/ui/back-button'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import { FileText, Shield, Lock } from 'lucide-react'

export function TermsConditionsContent() {
  return (
    <div className="min-h-screen bg-white bg-dot-pattern">
      <div className="relative z-10 w-full px-4 sm:px-8 lg:px-[120px] py-16 sm:py-20">
        <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 md:p-12 space-y-8">
          {/* Header */}
          <header className="text-center pb-6 border-b border-gray-100">
            <h1 className="text-2xl sm:text-4xl lg:text-[40px] font-normal tracking-tight leading-[1.15] text-[#001525] font-inter">
              Terms & Conditions
            </h1>
          </header>

          {/* Accordion Sections */}
          <Accordion type="single" collapsible defaultValue="agreement" className="space-y-4">

            {/* 1. SOFTWARE SUBSCRIPTION & LICENSE AGREEMENT */}
            <AccordionItem value="agreement" className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
              <AccordionTrigger className="px-5 sm:px-6 py-4 sm:py-5 hover:no-underline hover:bg-gray-50 transition-colors [&[data-state=open]]:bg-gray-50">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="flex-shrink-0 h-11 w-11 rounded-[6px] bg-blue-50 text-blue-600 flex items-center justify-center">
                    <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm sm:text-base font-semibold text-[#001525] font-inter">Software Subscription & License Agreement</p>
                    <p className="text-xs text-gray-500 mt-0.5">Power CA &ndash; Desktop Application</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-5 sm:px-6 pb-6">
                <div className="prose prose-sm prose-gray max-w-none pt-4 border-t border-gray-100 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin">
                  <p className="text-gray-500 leading-relaxed">
                    This Software Subscription & License Agreement (&ldquo;Agreement&rdquo;) is entered into between:
                  </p>
                  <p className="text-gray-500 leading-relaxed">
                    <strong>TBS TECHNOLOGIES PRIVATE LIMITED</strong>, a company incorporated under the Companies Act, 2013, having its registered office at 2nd Floor, Muneer Complex, 130, Palani Road, Udumalpet, Tiruppur District, Tamil Nadu, India, Pin: 642126 (hereinafter referred to as &ldquo;Company&rdquo;, &ldquo;Power CA&rdquo;, &ldquo;We&rdquo;, &ldquo;Us&rdquo;, or &ldquo;Our&rdquo;);
                  </p>
                  <p className="text-gray-500 leading-relaxed mb-6">
                    <strong>AND</strong> the individual Chartered Accountant, partnership firm, LLP, or company subscribing to the Software (&ldquo;Subscriber&rdquo;, &ldquo;You&rdquo;, or &ldquo;Your&rdquo;).
                  </p>
                  <p className="text-gray-500 text-xs italic mb-6">
                    This Agreement becomes effective upon installation, activation, subscription payment, or use of the Software, whichever is earlier (&ldquo;Effective Date&rdquo;).
                  </p>

                  <SectionHeading number="1" title="Definitions" />
                  <DefinitionList items={[
                    { term: 'Software', def: 'The desktop application branded as "Power CA" including updates, enhancements, patches, and documentation.' },
                    { term: 'Subscription Term', def: 'The annual subscription period commencing on activation and valid for twelve (12) months unless otherwise specified.' },
                    { term: 'Authorized User', def: 'An individual person designated by the Subscriber and licensed to use the Software under the permitted user count.' },
                    { term: 'Subscription Fee', def: 'The annual license fee payable for the permitted number of users.' },
                  ]} />

                  <SectionHeading number="2" title="License Grant" />
                  <p className="text-gray-500 leading-relaxed">
                    Subject to payment of applicable Subscription Fees and compliance with this Agreement, the Company grants the Subscriber a limited, non-exclusive, non-transferable, non-sublicensable license to install and use the Software during the Subscription Term.
                  </p>
                  <p className="text-gray-500 leading-relaxed mt-2">The license is:</p>
                  <BulletList items={[
                    'Restricted to the number of Authorized Users purchased',
                    'Valid only for internal professional use',
                    'Restricted to the territory of India unless otherwise approved in writing',
                  ]} />
                  <p className="text-gray-500 leading-relaxed mt-2">
                    The Software is licensed, not sold. All intellectual property rights remain exclusively with the Company.
                  </p>

                  <SectionHeading number="3" title="License Restrictions" />
                  <p className="text-gray-500 leading-relaxed">The Subscriber shall not:</p>
                  <LetterList items={[
                    'Reverse engineer, decompile, disassemble, or attempt to derive source code',
                    'Copy, distribute, rent, lease, sublicense, or resell the Software',
                    'Circumvent license controls or activation mechanisms',
                    'Use the Software beyond the permitted user count',
                    'Host, publish, or make the Software available to third parties as a service',
                    'Modify or create derivative works without written authorization',
                  ]} />
                  <p className="text-gray-500 leading-relaxed mt-3">
                    Unauthorized use shall result in immediate suspension and may attract civil and criminal remedies.
                  </p>
                  <SubHeading title="Audit Rights" />
                  <p className="text-gray-500 leading-relaxed">
                    The Company reserves the right, upon reasonable prior notice and not more than once annually, to verify compliance with user-count licensing restrictions. If under-licensing exceeding 5% is discovered, the Subscriber shall immediately regularize licenses and pay applicable license fees with interest at 12% per annum.
                  </p>

                  <SectionHeading number="4" title="Subscription & Payment" />
                  <BulletList items={[
                    'Subscription Fees shall be payable annually in advance',
                    'License activation is conditional upon receipt of full payment',
                    'Subscription Fees are non-refundable except as required under applicable law',
                    'Upon expiration, access to updates and support shall cease unless renewed',
                  ]} />
                  <SubHeading title="Auto-Renewal" />
                  <p className="text-gray-500 leading-relaxed">
                    Unless the Subscriber provides written notice of non-renewal at least thirty (30) days prior to expiry, the Subscription shall automatically renew for successive one-year terms at prevailing rates. The Company shall notify renewal at least fifteen (15) days before renewal date.
                  </p>

                  <SectionHeading number="5" title="Updates and Support" />
                  <BulletList items={[
                    'Minor updates and patches released during the Subscription Term shall be included',
                    'Major version upgrades may be subject to additional fees',
                    'Support shall be provided via designated support channels during business hours',
                    'No guaranteed service levels or uptime commitments are provided unless agreed separately in writing',
                  ]} />

                  <SectionHeading number="6" title="Data Ownership and Responsibility" />
                  <p className="text-gray-500 leading-relaxed">
                    All professional, client, and financial data entered into the Software remains the sole property of the Subscriber. The Software primarily operates as a local desktop application. The Subscriber is solely responsible for data accuracy, data security, and backup and recovery procedures.
                  </p>
                  <p className="text-gray-500 leading-relaxed mt-2">
                    The Company shall not be liable for data loss unless caused by willful misconduct. Any diagnostic data voluntarily shared shall be used solely for support and improvement purposes.
                  </p>

                  <SectionHeading number="7" title="Professional Responsibility Disclaimer" />
                  <p className="text-gray-500 leading-relaxed">
                    The Software is a compliance facilitation tool and does not constitute professional, tax, audit, accounting, or legal advice. The Subscriber remains solely responsible for all statutory filings, certifications, regulatory submissions, and compliance verification.
                  </p>
                  <p className="text-gray-500 leading-relaxed mt-2">
                    The Subscriber represents that they are a practicing Chartered Accountant or authorized firm and shall use the Software in compliance with the Chartered Accountants Act, 1949, ICAI Code of Ethics, and applicable tax and regulatory laws. The Company does not represent affiliation, endorsement, or approval by the ICAI.
                  </p>

                  <SectionHeading number="8" title="Confidentiality" />
                  <p className="text-gray-500 leading-relaxed">
                    Each party agrees to maintain confidentiality of non-public information received from the other party. Confidential information shall not be disclosed except with written consent, as required by law, or to professional advisors bound by confidentiality. This clause survives termination for five (5) years.
                  </p>

                  <SectionHeading number="9" title="Intellectual Property" />
                  <p className="text-gray-500 leading-relaxed">
                    All rights, title, and interest in the Software, trademarks, documentation, and associated materials remain the exclusive property of the Company. Feedback provided by the Subscriber may be used by the Company without restriction.
                  </p>

                  <SectionHeading number="10" title="Indemnity" />
                  <p className="text-gray-500 leading-relaxed">
                    The Subscriber shall indemnify and hold harmless the Company against claims arising from misuse of the Software, violation of this Agreement, non-compliance with applicable laws, and third-party claims arising from Subscriber&apos;s professional services.
                  </p>

                  <SectionHeading number="11" title="Limitation of Liability" />
                  <p className="text-gray-500 leading-relaxed">
                    To the maximum extent permitted by law, the Company&apos;s total aggregate liability shall not exceed the Subscription Fees paid during the preceding twelve (12) months. The Company shall not be liable for indirect, incidental, or consequential damages, loss of profits, business interruption, regulatory penalties, loss of goodwill, or data corruption not caused by gross negligence.
                  </p>

                  <SectionHeading number="12" title="Term and Termination" />
                  <p className="text-gray-500 leading-relaxed">
                    This Agreement remains effective during the Subscription Term unless terminated earlier. The Company may suspend or terminate the license upon non-payment, breach of Agreement, or unauthorized copying or piracy. Upon termination, the Subscriber shall cease use and uninstall all copies.
                  </p>

                  <SectionHeading number="13" title="Force Majeure" />
                  <p className="text-gray-500 leading-relaxed">
                    Neither party shall be liable for delay or failure caused by circumstances beyond reasonable control including natural disasters, government actions, network failures, or regulatory changes.
                  </p>

                  <SectionHeading number="14" title="Governing Law and Dispute Resolution" />
                  <p className="text-gray-500 leading-relaxed">
                    This Agreement shall be governed by the laws of India. Any dispute shall be resolved by arbitration under the Arbitration and Conciliation Act, 1996 by a sole arbitrator appointed by mutual consent. The seat of arbitration shall be Udumalpet, and proceedings shall be conducted in English. The courts at Udumalpet, Tiruppur District, India shall have exclusive jurisdiction.
                  </p>

                  <SectionHeading number="15" title="Severability" />
                  <p className="text-gray-500 leading-relaxed">
                    If any provision is held invalid, remaining provisions shall continue in full force.
                  </p>

                  <SectionHeading number="16" title="Entire Agreement" />
                  <p className="text-gray-500 leading-relaxed">
                    This Agreement constitutes the complete understanding between the parties and supersedes prior communications.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* 2. ACCEPTABLE USE & PROFESSIONAL COMPLIANCE POLICY */}
            <AccordionItem value="acceptable-use" className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
              <AccordionTrigger className="px-5 sm:px-6 py-4 sm:py-5 hover:no-underline hover:bg-gray-50 transition-colors [&[data-state=open]]:bg-emerald-50">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="flex-shrink-0 h-11 w-11 rounded-[6px] bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Shield className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm sm:text-base font-semibold text-[#001525] font-inter">Acceptable Use & Professional Compliance Policy</p>
                    <p className="text-xs text-gray-500 mt-0.5">Standards for Subscribers and Authorized Users</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-5 sm:px-6 pb-6">
                <div className="prose prose-sm prose-gray max-w-none pt-4 border-t border-gray-100">
                  <p className="text-gray-500 text-xs italic mb-6">
                    This Acceptable Use & Professional Compliance Policy forms an integral part of the Software Subscription & License Agreement.
                  </p>

                  <SectionHeading number="1" title="Purpose" />
                  <p className="text-gray-500 leading-relaxed">
                    This Policy establishes acceptable use standards for Subscribers and Authorized Users of the Power CA Software.
                  </p>

                  <SectionHeading number="2" title="Permitted Use" />
                  <p className="text-gray-500 leading-relaxed">The Software may be used solely for:</p>
                  <BulletList items={[
                    'Internal professional services of the Subscriber',
                    'Tax computation, compliance preparation, audit assistance',
                    'Lawful accounting, advisory, and compliance purposes',
                  ]} />

                  <SectionHeading number="3" title="Prohibited Activities" />
                  <p className="text-gray-500 leading-relaxed">The Subscriber and Authorized Users shall not:</p>
                  <NumberedSubList items={[
                    'Use the Software for fraudulent, illegal, or unethical tax practices',
                    'Generate false, fabricated, or manipulated compliance documents',
                    'Circumvent license control mechanisms',
                    'Share activation credentials externally',
                    'Attempt reverse engineering or tampering',
                    'Use the Software to provide software-as-a-service to third parties',
                    'Upload malware or malicious code',
                    'Use the Software in violation of ICAI Code of Ethics',
                  ]} />

                  <SectionHeading number="4" title="Regulatory Responsibility" />
                  <p className="text-gray-500 leading-relaxed">The Subscriber remains fully responsible for:</p>
                  <BulletList items={[
                    'Accuracy of filings',
                    'Legal interpretation of tax positions',
                    'Professional judgments',
                    'Client representations',
                  ]} />
                  <p className="text-gray-500 leading-relaxed mt-2">
                    The Software does not replace professional diligence.
                  </p>

                  <SectionHeading number="5" title="Misrepresentation Restriction" />
                  <p className="text-gray-500 leading-relaxed">Subscribers shall not:</p>
                  <BulletList items={[
                    'Claim official government integration unless expressly authorized',
                    'Use Company branding without written approval',
                    'Represent themselves as agents of Power CA',
                  ]} />

                  <SectionHeading number="6" title="Monitoring & Enforcement" />
                  <p className="text-gray-500 leading-relaxed">
                    The Company may monitor license usage solely for compliance verification. Violation of this Policy may result in suspension of activation, termination without refund, or legal action.
                  </p>

                  <SectionHeading number="7" title="Reporting Violations" />
                  <p className="text-gray-500 leading-relaxed">
                    Violations may be reported to: <a href="mailto:contact@powerca.in" className="text-blue-600 hover:underline font-medium">contact@powerca.in</a>
                  </p>

                  <SectionHeading number="8" title="Survival" />
                  <p className="text-gray-500 leading-relaxed">
                    This Policy survives termination to the extent necessary to enforce rights accrued prior to termination.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* 3. DATA PROCESSING & CONFIDENTIALITY ADDENDUM */}
            <AccordionItem value="data-processing" className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
              <AccordionTrigger className="px-5 sm:px-6 py-4 sm:py-5 hover:no-underline hover:bg-gray-50 transition-colors [&[data-state=open]]:bg-purple-50">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="flex-shrink-0 h-11 w-11 rounded-[6px] bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Lock className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm sm:text-base font-semibold text-[#001525] font-inter">Data Processing & Confidentiality Addendum</p>
                    <p className="text-xs text-gray-500 mt-0.5">Applicable where subscriber processes third-party client data</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-5 sm:px-6 pb-6">
                <div className="prose prose-sm prose-gray max-w-none pt-4 border-t border-gray-100">
                  <SectionHeading number="1" title="Purpose" />
                  <p className="text-gray-500 leading-relaxed">
                    This Addendum governs processing of personal data and confidential information exchanged between the Company and Subscriber.
                  </p>

                  <SectionHeading number="2" title="Role Clarification" />
                  <BulletList items={[
                    'Subscriber acts as Data Fiduciary for client data processed using the Software',
                    'Company does not access client data unless voluntarily shared for support',
                    'Company acts only as limited technical facilitator',
                  ]} />

                  <SectionHeading number="3" title="Confidential Information" />
                  <p className="text-gray-500 leading-relaxed">Confidential Information includes:</p>
                  <BulletList items={[
                    'Business information',
                    'Financial records',
                    'Client lists',
                    'Technical architecture',
                    'Pricing models',
                  ]} />
                  <p className="text-gray-500 leading-relaxed mt-3">Excludes information that is:</p>
                  <BulletList items={[
                    'Publicly known',
                    'Independently developed',
                    'Disclosed under legal obligation',
                  ]} />

                  <SectionHeading number="4" title="Obligations" />
                  <p className="text-gray-500 leading-relaxed">Each party shall:</p>
                  <BulletList items={[
                    'Maintain confidentiality',
                    'Use information only for agreed purposes',
                    'Protect using reasonable security measures',
                  ]} />

                  <SectionHeading number="5" title="Limited Data Access" />
                  <p className="text-gray-500 leading-relaxed">
                    If Subscriber shares client data for troubleshooting, data shall be used strictly for support resolution and deleted after case closure unless legally required.
                  </p>

                  <SectionHeading number="6" title="Survival" />
                  <p className="text-gray-500 leading-relaxed">
                    Confidentiality obligations survive for five (5) years after termination.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

          </Accordion>

          {/* Footer */}
          <div className="flex justify-center pt-6 border-t border-gray-100">
            <BackButton />
          </div>
        </div>
      </div>
    </div>
  )
}

// --- Reusable sub-components ---

function SectionHeading({ number, title }: { number: string; title: string }) {
  return (
    <h3 className="flex items-center gap-2 text-base font-semibold text-[#001525] font-inter mt-6 mb-2">
      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 text-gray-500 text-xs flex items-center justify-center font-bold">{number}</span>
      {title}
    </h3>
  )
}

function SubHeading({ title }: { title: string }) {
  return (
    <h4 className="text-sm font-semibold text-gray-800 mt-4 mb-1">{title}</h4>
  )
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="mt-2 space-y-1.5 pl-5">
      {items.map((item, i) => (
        <li key={i} className="text-gray-500 leading-relaxed list-disc marker:text-gray-300">{item}</li>
      ))}
    </ul>
  )
}

function LetterList({ items }: { items: string[] }) {
  return (
    <ol className="mt-2 space-y-1.5 pl-5 list-[lower-alpha]">
      {items.map((item, i) => (
        <li key={i} className="text-gray-500 leading-relaxed marker:text-gray-400 marker:font-medium">{item}</li>
      ))}
    </ol>
  )
}

function NumberedSubList({ items }: { items: string[] }) {
  return (
    <ol className="mt-2 space-y-1.5 pl-5">
      {items.map((item, i) => (
        <li key={i} className="text-gray-500 leading-relaxed list-decimal marker:text-gray-400 marker:font-medium">{item}</li>
      ))}
    </ol>
  )
}

function DefinitionList({ items }: { items: { term: string; def: string }[] }) {
  return (
    <div className="mt-2 space-y-2 pl-1">
      {items.map((item, i) => (
        <div key={i} className="flex gap-2">
          <span className="text-gray-500 text-xs font-mono mt-0.5">1.{i + 1}</span>
          <p className="text-gray-500 leading-relaxed">
            <strong className="text-gray-700">{item.term}</strong> &mdash; {item.def}
          </p>
        </div>
      ))}
    </div>
  )
}
