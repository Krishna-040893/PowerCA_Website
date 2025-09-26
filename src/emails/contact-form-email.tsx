import * as React from 'react'
import {Html,
  Head,
  Body,
  Container,
  Section,
  Text, Link,
  Img,
  Preview,
  Hr,
  Font,
  Row,
  Column,
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
  subject = 'New Contact Form Submission',
}) => {
  const preview = `New message from ${name} at ${company || 'N/A'}`

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
        {/* Background Pattern Container */}
        <div style={backgroundPattern}>
          <Container style={container}>
            {/* Header with Logo */}
            <Section style={header}>
              <Img
                src="https://powerca.com/images/powerca-logo-horizontal.png"
                width="180"
                height="50"
                alt="PowerCA"
                style={logo}
              />
            </Section>

            {/* Alert Banner */}
            <Section style={alertBanner}>
              <Text style={alertText}>📬 New Contact Form Submission</Text>
            </Section>

            {/* Main Content */}
            <Section style={content}>
              <Text style={headingStyle}>{subject}</Text>

              {/* Contact Details Card */}
              <Section style={detailsCard}>
                <Text style={sectionTitle}>Contact Information</Text>

                <Row style={detailRow}>
                  <Column style={labelColumn}>
                    <Text style={label}>Name:</Text>
                  </Column>
                  <Column style={valueColumn}>
                    <Text style={value}>{name}</Text>
                  </Column>
                </Row>

                <Row style={detailRow}>
                  <Column style={labelColumn}>
                    <Text style={label}>Email:</Text>
                  </Column>
                  <Column style={valueColumn}>
                    <Link href={`mailto:${email}`} style={emailLink}>
                      {email}
                    </Link>
                  </Column>
                </Row>

                {phone && (
                  <Row style={detailRow}>
                    <Column style={labelColumn}>
                      <Text style={label}>Phone:</Text>
                    </Column>
                    <Column style={valueColumn}>
                      <Link href={`tel:${phone}`} style={phoneLink}>
                        {phone}
                      </Link>
                    </Column>
                  </Row>
                )}

                {company && (
                  <Row style={detailRow}>
                    <Column style={labelColumn}>
                      <Text style={label}>Company:</Text>
                    </Column>
                    <Column style={valueColumn}>
                      <Text style={value}>{company}</Text>
                    </Column>
                  </Row>
                )}
              </Section>

              {/* Message Section */}
              <Section style={messageSection}>
                <Text style={sectionTitle}>Message</Text>
                <Section style={messageCard}>
                  <Text style={messageText}>{message}</Text>
                </Section>
              </Section>

              {/* Action Buttons */}
              <Section style={actionSection}>
                <Text style={actionText}>Quick Actions:</Text>
                <Row>
                  <Column align="center">
                    <Link
                      href={`mailto:${email}?subject=Re: ${subject}`}
                      style={actionButton}
                    >
                      Reply to {name}
                    </Link>
                  </Column>
                </Row>
              </Section>
            </Section>

            <Hr style={divider} />

            {/* Footer */}
            <Section style={footerSection}>
              <Text style={footerText}>
                This email was sent from the PowerCA contact form.
              </Text>
              <Text style={timestamp}>
                Received on {new Date().toLocaleString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  timeZoneName: 'short',
                })}
              </Text>
            </Section>
          </Container>
        </div>
      </Body>
    </Html>
  )
}

const main: React.CSSProperties = {
  backgroundColor: '#f0f7ff',
  fontFamily: 'Geist, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  margin: 0,
  padding: 0,
}

const backgroundPattern: React.CSSProperties = {
  backgroundImage: `
    linear-gradient(45deg, rgba(29, 145, 235, 0.03) 25%, transparent 25%),
    linear-gradient(-45deg, rgba(29, 145, 235, 0.03) 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, rgba(29, 145, 235, 0.03) 75%),
    linear-gradient(-45deg, transparent 75%, rgba(29, 145, 235, 0.03) 75%)
  `,
  backgroundSize: '20px 20px',
  backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
  padding: '40px 20px',
}

const container: React.CSSProperties = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  borderRadius: '12px',
  boxShadow: '0 8px 24px rgba(29, 145, 235, 0.08)',
  overflow: 'hidden',
  maxWidth: '600px',
  border: '1px solid rgba(29, 145, 235, 0.1)',
}

const header: React.CSSProperties = {
  backgroundColor: '#ffffff',
  padding: '32px 48px 24px',
  textAlign: 'center' as const,
}

const logo: React.CSSProperties = {
  margin: '0 auto',
}

const alertBanner: React.CSSProperties = {
  backgroundColor: 'rgba(29, 145, 235, 0.08)',
  padding: '12px 24px',
  borderBottom: '2px solid #1D91EB',
}

const alertText: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#1D91EB',
  textAlign: 'center' as const,
  margin: 0,
}

const content: React.CSSProperties = {
  padding: '32px 48px 48px',
  backgroundColor: '#ffffff',
}

const headingStyle: React.CSSProperties = {
  fontSize: '24px',
  fontWeight: '600',
  color: '#0F172A',
  marginBottom: '24px',
  marginTop: '0',
  textAlign: 'center' as const,
}

const detailsCard: React.CSSProperties = {
  backgroundColor: '#f8fafc',
  borderRadius: '8px',
  padding: '24px',
  marginBottom: '24px',
  border: '1px solid #e2e8f0',
}

const sectionTitle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#64748b',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  marginBottom: '16px',
  marginTop: '0',
}

const detailRow: React.CSSProperties = {
  marginBottom: '12px',
}

const labelColumn: React.CSSProperties = {
  width: '120px',
  paddingRight: '16px',
}

const valueColumn: React.CSSProperties = {
  width: 'auto',
}

const label: React.CSSProperties = {
  fontSize: '14px',
  color: '#64748b',
  fontWeight: '500',
  margin: 0,
}

const value: React.CSSProperties = {
  fontSize: '14px',
  color: '#0F172A',
  fontWeight: '400',
  margin: 0,
}

const emailLink: React.CSSProperties = {
  color: '#1D91EB',
  textDecoration: 'none',
  fontSize: '14px',
  fontWeight: '500',
}

const phoneLink: React.CSSProperties = {
  color: '#1D91EB',
  textDecoration: 'none',
  fontSize: '14px',
  fontWeight: '500',
}

const messageSection: React.CSSProperties = {
  marginTop: '32px',
}

const messageCard: React.CSSProperties = {
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  padding: '24px',
  border: '1px solid #e2e8f0',
  borderLeft: '4px solid #1D91EB',
}

const messageText: React.CSSProperties = {
  fontSize: '15px',
  lineHeight: '24px',
  color: '#334155',
  margin: 0,
  whiteSpace: 'pre-wrap' as const,
}

const actionSection: React.CSSProperties = {
  marginTop: '32px',
  textAlign: 'center' as const,
}

const actionText: React.CSSProperties = {
  fontSize: '14px',
  color: '#64748b',
  marginBottom: '16px',
}

const actionButton: React.CSSProperties = {
  display: 'inline-block',
  backgroundColor: '#1D91EB',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '600',
  textDecoration: 'none',
  padding: '12px 24px',
  boxShadow: '0 2px 8px rgba(29, 145, 235, 0.15)',
  transition: 'all 0.2s',
}

const divider: React.CSSProperties = {
  borderColor: '#e2e8f0',
  margin: '0',
}

const footerSection: React.CSSProperties = {
  padding: '24px 48px',
  backgroundColor: '#f8fafc',
}

const footerText: React.CSSProperties = {
  fontSize: '13px',
  color: '#64748b',
  textAlign: 'center' as const,
  marginBottom: '8px',
  marginTop: 0,
}

const timestamp: React.CSSProperties = {
  fontSize: '12px',
  color: '#94a3b8',
  textAlign: 'center' as const,
  margin: 0,
}

export default ContactFormEmail