import * as React from 'react'
import {Html,
  Head,
  Body,
  Container,
  Section,
  Text, Link,
  Button,
  Img,
  Preview,
  Font,
  Row,
  Column,
 } from '@react-email/components'

interface DemoBookingEmailProps {
  name: string
  email: string
  phone: string
  firmName?: string
  date: string
  time: string
  message?: string
  isTeamNotification?: boolean
}

export const DemoBookingEmail: React.FC<DemoBookingEmailProps> = ({
  name,
  email,
  phone,
  firmName,
  date,
  time,
  message,
  isTeamNotification = false,
}) => {
  const formattedDate = new Date(date).toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const preview = isTeamNotification
    ? `New demo booking from ${name} - ${firmName || 'Individual'}`
    : `Your PowerCA demo is confirmed for ${formattedDate}`

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
          {/* Header */}
          <Section style={header}>
            <Img
              src="https://powerca.com/images/powerca-logo-horizontal.png"
              width="200"
              height="60"
              alt="PowerCA"
              style={logo}
            />
          </Section>

          {/* Hero Section */}
          <Section style={heroSection}>
            <div style={heroContent}>
              <div style={iconContainer}>
                {isTeamNotification ? '🔔' : '✅'}
              </div>
              <Text style={heroTitle}>
                {isTeamNotification ? 'New Demo Booking Alert' : 'Demo Booking Confirmed!'}
              </Text>
              <Text style={heroSubtitle}>
                {isTeamNotification
                  ? `A new demo has been scheduled`
                  : `Your demo is scheduled for ${formattedDate} at ${time}`}
              </Text>
            </div>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            {!isTeamNotification && (
              <>
                <Text style={greeting}>Dear {name},</Text>
                <Text style={paragraph}>
                  Thank you for booking a demo with PowerCA! We're excited to show you how our
                  comprehensive practice management software can transform your CA practice and
                  help you save 10+ hours weekly while ensuring 100% compliance.
                </Text>
              </>
            )}

            {/* Booking Details Card */}
            <Section style={detailsCard}>
              <Text style={cardTitle}>
                {isTeamNotification ? '📋 Booking Information' : '📅 Your Demo Details'}
              </Text>

              <table style={detailsTable}>
                <tbody>
                  <tr>
                    <td style={labelCell}>Name</td>
                    <td style={valueCell}>{name}</td>
                  </tr>
                  <tr>
                    <td style={labelCell}>Email</td>
                    <td style={valueCell}>
                      <Link href={`mailto:${email}`} style={emailLink}>{email}</Link>
                    </td>
                  </tr>
                  <tr>
                    <td style={labelCell}>Phone</td>
                    <td style={valueCell}>
                      <Link href={`tel:${phone}`} style={phoneLink}>{phone}</Link>
                    </td>
                  </tr>
                  {firmName && (
                    <tr>
                      <td style={labelCell}>Firm Name</td>
                      <td style={valueCell}>{firmName}</td>
                    </tr>
                  )}
                  <tr>
                    <td style={labelCell}>Date</td>
                    <td style={valueCell}><strong>{formattedDate}</strong></td>
                  </tr>
                  <tr>
                    <td style={labelCell}>Time</td>
                    <td style={valueCell}><strong>{time} IST</strong></td>
                  </tr>
                </tbody>
              </table>

              {message && (
                <div style={messageBox}>
                  <Text style={messageLabel}>Additional Message:</Text>
                  <Text style={messageText}>{message}</Text>
                </div>
              )}
            </Section>

            {!isTeamNotification && (
              <>
                {/* What to Expect Section */}
                <Section style={expectSection}>
                  <Text style={sectionTitle}>What to Expect During Your Demo</Text>
                  <div style={featureList}>
                    <div style={featureItem}>
                      <span style={featureIcon}>📊</span>
                      <div>
                        <Text style={featureTitle}>Personalized Walkthrough</Text>
                        <Text style={featureDesc}>
                          A customized demo tailored to your firm's specific needs and workflow
                        </Text>
                      </div>
                    </div>
                    <div style={featureItem}>
                      <span style={featureIcon}>⚡</span>
                      <div>
                        <Text style={featureTitle}>Key Features Overview</Text>
                        <Text style={featureDesc}>
                          Explore our GST filing, client management, and compliance tracking modules
                        </Text>
                      </div>
                    </div>
                    <div style={featureItem}>
                      <span style={featureIcon}>💡</span>
                      <div>
                        <Text style={featureTitle}>Q&A Session</Text>
                        <Text style={featureDesc}>
                          Get all your questions answered by our product experts
                        </Text>
                      </div>
                    </div>
                    <div style={featureItem}>
                      <span style={featureIcon}>🎁</span>
                      <div>
                        <Text style={featureTitle}>Special Offers</Text>
                        <Text style={featureDesc}>
                          Exclusive pricing and onboarding support for demo attendees
                        </Text>
                      </div>
                    </div>
                  </div>
                </Section>

                {/* Important Notes */}
                <Section style={notesSection}>
                  <Text style={notesTitle}>📌 Important Information</Text>
                  <ul style={notesList}>
                    <li>We'll send you the meeting link 15 minutes before the scheduled time</li>
                    <li>Please ensure you have a stable internet connection</li>
                    <li>The demo typically lasts 30-45 minutes</li>
                    <li>Feel free to invite other team members who might benefit</li>
                  </ul>
                </Section>

                {/* CTA Section */}
                <Section style={ctaSection}>
                  <Button href="https://powerca.com" style={primaryButton}>
                    Visit PowerCA Website
                  </Button>
                  <Text style={ctaText}>
                    In the meantime, explore our features and case studies
                  </Text>
                </Section>
              </>
            )}

            {isTeamNotification && (
              <Section style={ctaSection}>
                <Text style={teamActionTitle}>Quick Actions</Text>
                <Row>
                  <Column align="center">
                    <Button
                      href={`mailto:${email}?subject=PowerCA Demo Confirmation - ${formattedDate}`}
                      style={teamButton}
                    >
                      Contact Client
                    </Button>
                  </Column>
                  <Column align="center">
                    <Button
                      href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=PowerCA Demo - ${name}&dates=${new Date(date).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}&details=Demo with ${name} from ${firmName || 'N/A'}`}
                      style={teamButton}
                    >
                      Add to Calendar
                    </Button>
                  </Column>
                </Row>
              </Section>
            )}

            {/* Contact Section */}
            <Section style={contactSection}>
              <Text style={contactTitle}>
                {isTeamNotification ? 'Client Support' : 'Need to Reschedule?'}
              </Text>
              <Text style={contactText}>
                {isTeamNotification
                  ? 'Ensure the client receives the meeting link on time'
                  : 'Contact us if you need to reschedule or have any questions'}
              </Text>
              <div style={contactInfo}>
                <Link href="mailto:contact@powerca.in" style={contactLink}>
                  📧 contact@powerca.in
                </Link>
                <span style={separator}>|</span>
                <Link href="tel:+919629514635" style={contactLink}>
                  📞 +91 9629514635
                </Link>
              </div>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Row>
              <Column align="center">
                <Link href="https://powerca.com" style={footerLink}>Website</Link>
                <span style={footerSeparator}>•</span>
                <Link href="https://linkedin.com/company/powerca" style={footerLink}>LinkedIn</Link>
                <span style={footerSeparator}>•</span>
                <Link href="https://twitter.com/powerca" style={footerLink}>Twitter</Link>
              </Column>
            </Row>
            <Text style={footerText}>
              © {new Date().getFullYear()} PowerCA - Practice Management Software for CAs
            </Text>
            <Text style={footerAddress}>
              TBS Technologies, Udumalpet, Tamil Nadu, India
            </Text>
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
}

const container: React.CSSProperties = {
  margin: '0 auto',
  maxWidth: '600px',
  backgroundColor: '#ffffff',
}

const header: React.CSSProperties = {
  backgroundColor: '#ffffff',
  padding: '30px 40px',
  borderBottom: '1px solid #e5e7eb',
}

const logo: React.CSSProperties = {
  margin: '0 auto',
  display: 'block',
}

const heroSection: React.CSSProperties = {
  background: 'linear-gradient(135deg, #1D91EB 0%, #1876C9 100%)',
  padding: '0',
}

const heroContent: React.CSSProperties = {
  padding: '40px',
  textAlign: 'center' as const,
}

const iconContainer: React.CSSProperties = {
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
  padding: '40px',
}

const greeting: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#111827',
  marginBottom: '16px',
}

const paragraph: React.CSSProperties = {
  fontSize: '15px',
  lineHeight: '24px',
  color: '#4b5563',
  marginBottom: '24px',
}

const detailsCard: React.CSSProperties = {
  backgroundColor: '#f9fafb',
  borderRadius: '12px',
  padding: '24px',
  marginBottom: '24px',
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

const expectSection: React.CSSProperties = {
  marginBottom: '32px',
}

const sectionTitle: React.CSSProperties = {
  fontSize: '20px',
  fontWeight: '600',
  color: '#111827',
  marginBottom: '20px',
}

const featureList: React.CSSProperties = {
  display: 'block',
}

const featureItem: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  marginBottom: '20px',
}

const featureIcon: React.CSSProperties = {
  fontSize: '24px',
  marginRight: '16px',
  marginTop: '2px',
}

const featureTitle: React.CSSProperties = {
  fontSize: '15px',
  fontWeight: '600',
  color: '#111827',
  marginBottom: '4px',
  marginTop: '0',
}

const featureDesc: React.CSSProperties = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '0',
  lineHeight: '20px',
}

const notesSection: React.CSSProperties = {
  backgroundColor: '#fef3c7',
  borderRadius: '12px',
  padding: '20px',
  marginBottom: '24px',
  border: '1px solid #fcd34d',
}

const notesTitle: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#92400e',
  marginBottom: '12px',
  marginTop: '0',
}

const notesList: React.CSSProperties = {
  margin: '0',
  paddingLeft: '20px',
  color: '#92400e',
  fontSize: '14px',
  lineHeight: '22px',
}

const ctaSection: React.CSSProperties = {
  textAlign: 'center' as const,
  marginTop: '32px',
  marginBottom: '32px',
}

const primaryButton: React.CSSProperties = {
  backgroundColor: '#1D91EB',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  padding: '14px 32px',
  display: 'inline-block',
}

const ctaText: React.CSSProperties = {
  fontSize: '14px',
  color: '#6b7280',
  marginTop: '12px',
}

const teamActionTitle: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#111827',
  marginBottom: '16px',
}

const teamButton: React.CSSProperties = {
  backgroundColor: '#1D91EB',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '500',
  textDecoration: 'none',
  padding: '10px 20px',
  display: 'inline-block',
}

const contactSection: React.CSSProperties = {
  backgroundColor: '#f3f4f6',
  borderRadius: '12px',
  padding: '24px',
  textAlign: 'center' as const,
  marginTop: '32px',
}

const contactTitle: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#111827',
  marginBottom: '8px',
  marginTop: '0',
}

const contactText: React.CSSProperties = {
  fontSize: '14px',
  color: '#6b7280',
  marginBottom: '16px',
}

const contactInfo: React.CSSProperties = {
  display: 'block',
}

const contactLink: React.CSSProperties = {
  color: '#1D91EB',
  textDecoration: 'none',
  fontSize: '14px',
  fontWeight: '500',
}

const separator: React.CSSProperties = {
  margin: '0 12px',
  color: '#d1d5db',
}

const footer: React.CSSProperties = {
  backgroundColor: '#f9fafb',
  padding: '32px 40px',
  borderTop: '1px solid #e5e7eb',
}

const footerLink: React.CSSProperties = {
  color: '#1D91EB',
  textDecoration: 'none',
  fontSize: '14px',
}

const footerSeparator: React.CSSProperties = {
  margin: '0 8px',
  color: '#d1d5db',
}

const footerText: React.CSSProperties = {
  fontSize: '13px',
  color: '#6b7280',
  textAlign: 'center' as const,
  marginTop: '16px',
  marginBottom: '4px',
}

const footerAddress: React.CSSProperties = {
  fontSize: '12px',
  color: '#9ca3af',
  textAlign: 'center' as const,
  margin: '0',
}

export default DemoBookingEmail