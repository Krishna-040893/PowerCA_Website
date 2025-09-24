'use client'

import { useState } from 'react'
import { ContactFormEmail } from '@/emails/contact-form-email'
import { WelcomeEmail } from '@/emails/welcome-email'
import { EmailTemplate } from '@/emails/email-template'

export default function EmailPreviewPage() {
  const [selectedTemplate, setSelectedTemplate] = useState('contact')

  const renderTemplate = () => {
    switch (selectedTemplate) {
      case 'contact':
        return (
          <ContactFormEmail
            name="John Doe"
            email="john.doe@example.com"
            phone="+1 (555) 123-4567"
            company="Acme Corporation"
            message="I'm interested in learning more about PowerCA's services. We're looking for a comprehensive solution to modernize our infrastructure and would love to discuss how PowerCA can help us achieve our goals."
          />
        )
      case 'welcome':
        return (
          <WelcomeEmail
            name="Jane Smith"
            email="jane.smith@example.com"
          />
        )
      case 'custom':
        return (
          <EmailTemplate
            subject="Important Update from PowerCA"
            heading="System Maintenance Notice"
            body="We'll be performing scheduled maintenance on our systems this weekend to improve performance and add new features. The maintenance window is scheduled for Saturday, 2:00 AM - 6:00 AM EST."
            ctaText="View Details"
            ctaLink="https://powerca.com/maintenance"
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Email Template Preview</h1>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Template
          </label>
          <select
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="contact">Contact Form Email</option>
            <option value="welcome">Welcome Email</option>
            <option value="custom">Custom Template</option>
          </select>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-4 bg-gray-100 border-b">
            <p className="text-sm text-gray-600">Email Preview</p>
          </div>
          <div className="p-0">
            {renderTemplate()}
          </div>
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">Template Features</h2>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>✓ PowerCA blue color scheme (#1D91EB)</li>
            <li>✓ Geist font family</li>
            <li>✓ Subtle background patterns</li>
            <li>✓ Consistent button styles matching the website</li>
            <li>✓ PowerCA logo in header</li>
            <li>✓ Responsive design for all devices</li>
            <li>✓ Professional and clean layout</li>
          </ul>
        </div>
      </div>
    </div>
  )
}