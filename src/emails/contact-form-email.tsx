import * as React from 'react'
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Link,
  Preview,
  Font,
} from '@react-email/components'

interface ContactFormEmailProps {
  name: string
  email: string
  phone?: string
  company?: string
  message: string
  subject?: string
}

export const ContactFormEmail: React.FC<ContactFormEmailProps> = ({
  name,
  email,
  phone,
  company,
  message,
  subject: _subject = 'New Contact Form Submission',
}) => {
  const preview = `New contact from ${name}${company ? ` - ${company}` : ''}`
  const timestamp = new Date().toLocaleString('en-IN', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata',
  })

  return (
    <Html>
      <Head>
        <Font
          fontFamily="Geist"
          fallbackFontFamily="sans-serif"
          webFont={{
            url: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2',
            format: 'woff2',
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Hero Section */}
          <Section style={heroSection}>
            <div style={heroContent}>

              <Text style={heroTitle}>New Contact Form Submission</Text>
              <Text style={heroSubtitle}>Someone reached out through your website</Text>
            </div>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            {/* Contact Details Card */}
            <Section style={detailsCard}>
              <Text style={cardTitle}>📋 Contact Information</Text>

              <table style={detailsTable}>
                <tbody>
                  <tr>
                    <td style={labelCell}>Name</td>
                    <td style={valueCell}>{name}</td>
                  </tr>
                  <tr>
                    <td style={labelCell}>Email</td>
                    <td style={valueCell}>
                      <Link href={`mailto:${email}`} style={emailLink}>
                        {email}
                      </Link>
                    </td>
                  </tr>
                  {phone && (
                    <tr>
                      <td style={labelCell}>Phone</td>
                      <td style={valueCell}>
                        <Link href={`tel:${phone}`} style={phoneLink}>
                          {phone}
                        </Link>
                      </td>
                    </tr>
                  )}
                  {company && (
                    <tr>
                      <td style={labelCell}>Company</td>
                      <td style={valueCell}>{company}</td>
                    </tr>
                  )}
                  <tr>
                    <td style={labelCell}>Submitted</td>
                    <td style={valueCell}>{timestamp}</td>
                  </tr>
                </tbody>
              </table>

              {message && (
                <div style={messageBox}>
                  <Text style={messageLabel}>Message:</Text>
                  <Text style={messageText}>{message}</Text>
                </div>
              )}
            </Section>
          </Section>


          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              © {new Date().getFullYear()} Power CA - Practice Management Software for CAs
            </Text>
            <Text style={footerAddress}>TBS Technologies, Udumalpet, Tamil Nadu, India</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// Styles
const main: React.CSSProperties = {
  backgroundColor: '#f3f4f6',
  fontFamily: 'Geist, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  padding: '20px',
}

const container: React.CSSProperties = {
  margin: '0 auto',
  maxWidth: '600px',
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  overflow: 'hidden',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
}

const heroSection: React.CSSProperties = {
  background: 'linear-gradient(135deg, #1D91EB 0%, #1876C9 100%)',
  padding: '0',
}

const heroContent: React.CSSProperties = {
  padding: '50px 40px',
  textAlign: 'center' as const,
}

const _iconContainer: React.CSSProperties = {
  fontSize: '48px',
  marginBottom: '16px',
}

const heroTitle: React.CSSProperties = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: '700',
  margin: '0 0 8px 0',
}

const heroSubtitle: React.CSSProperties = {
  color: 'rgba(255, 255, 255, 0.95)',
  fontSize: '16px',
  margin: '0',
}

const content: React.CSSProperties = {
  padding: '50px',
}

const detailsCard: React.CSSProperties = {
  backgroundColor: '#f9fafb',
  borderRadius: '12px',
  padding: '50px',
  marginBottom: '0',
  border: '1px solid #e5e7eb',
}

const cardTitle: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#111827',
  marginBottom: '20px',
  marginTop: '0',
}

const detailsTable: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse' as const,
}

const labelCell: React.CSSProperties = {
  padding: '12px 0',
  fontSize: '14px',
  color: '#6b7280',
  fontWeight: '500',
  width: '120px',
  verticalAlign: 'top' as const,
}

const valueCell: React.CSSProperties = {
  padding: '12px 0',
  fontSize: '14px',
  color: '#111827',
}

const emailLink: React.CSSProperties = {
  color: '#1D91EB',
  textDecoration: 'none',
}

const phoneLink: React.CSSProperties = {
  color: '#1D91EB',
  textDecoration: 'none',
}

const messageBox: React.CSSProperties = {
  marginTop: '20px',
  padding: '16px',
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  borderLeft: '4px solid #1D91EB',
}

const messageLabel: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: '600',
  color: '#6b7280',
  marginBottom: '8px',
}

const messageText: React.CSSProperties = {
  fontSize: '14px',
  color: '#374151',
  margin: '0',
  whiteSpace: 'pre-wrap' as const,
}

const footer: React.CSSProperties = {
  backgroundColor: '#f9fafb',
  padding: '40px 50px',
  borderTop: '1px solid #e5e7eb',
}

const footerText: React.CSSProperties = {
  fontSize: '13px',
  color: '#6b7280',
  textAlign: 'center' as const,
  marginTop: '0',
  marginBottom: '4px',
}

const footerAddress: React.CSSProperties = {
  fontSize: '12px',
  color: '#9ca3af',
  textAlign: 'center' as const,
  margin: '0',
}

export default ContactFormEmail
