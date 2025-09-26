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
  Hr,
  Font,
 } from '@react-email/components'

interface EmailTemplateProps {
  subject?: string
  preview?: string
  heading?: string
  body?: string | React.ReactNode
  ctaText?: string
  ctaLink?: string
  footer?: string | React.ReactNode
}

export const EmailTemplate: React.FC<EmailTemplateProps> = ({
  subject: _subject = 'PowerCA - Empowering Your Business',
  preview = 'Important update from PowerCA',
  heading = 'Welcome to PowerCA',
  body = 'Thank you for your interest in our services.',
  ctaText,
  ctaLink,
  footer,
}) => {
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

          {/* Main Content */}
          <Section style={content}>
            <Text style={headingStyle}>{heading}</Text>

            {typeof body === 'string' ? (
              <Text style={paragraph}>{body}</Text>
            ) : (
              body
            )}

            {ctaText && ctaLink && (
              <Section style={buttonContainer}>
                <Button href={ctaLink} style={button}>
                  {ctaText}
                </Button>
              </Section>
            )}
          </Section>

          <Hr style={divider} />

          {/* Footer */}
          <Section style={footerSection}>
            {footer ? (
              typeof footer === 'string' ? (
                <Text style={footerText}>{footer}</Text>
              ) : (
                footer
              )
            ) : (
              <>
                <Text style={footerText}>
                  © {new Date().getFullYear()} PowerCA. All rights reserved.
                </Text>
                <Text style={footerLinks}>
                  <Link href="https://powerca.com" style={link}>
                    Website
                  </Link>
                  {' • '}
                  <Link href="https://powerca.com/privacy" style={link}>
                    Privacy Policy
                  </Link>
                  {' • '}
                  <Link href="https://powerca.com/terms" style={link}>
                    Terms of Service
                  </Link>
                </Text>
                <Text style={footerAddress}>
                  PowerCA Inc. | Your trusted technology partner
                </Text>
              </>
            )}
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const main: React.CSSProperties = {
  backgroundColor: '#f6f9fc',
  backgroundImage: `
    linear-gradient(to right, rgba(29, 145, 235, 0.05) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(29, 145, 235, 0.05) 1px, transparent 1px)
  `,
  backgroundSize: '40px 40px',
  fontFamily: 'Geist, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
}

const container: React.CSSProperties = {
  backgroundColor: '#ffffff',
  margin: '40px auto',
  padding: '0',
  borderRadius: '10px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
  overflow: 'hidden',
  maxWidth: '600px',
}

const header: React.CSSProperties = {
  backgroundColor: '#ffffff',
  padding: '32px 48px',
  borderBottom: '1px solid #e6e9ec',
  textAlign: 'center' as const,
}

const logo: React.CSSProperties = {
  margin: '0 auto',
}

const content: React.CSSProperties = {
  padding: '48px',
  backgroundColor: '#ffffff',
}

const headingStyle: React.CSSProperties = {
  fontSize: '28px',
  fontWeight: '600',
  color: '#0F172A',
  marginBottom: '24px',
  marginTop: '0',
  lineHeight: '1.3',
  textAlign: 'center' as const,
}

const paragraph: React.CSSProperties = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#475569',
  marginBottom: '24px',
}

const buttonContainer: React.CSSProperties = {
  textAlign: 'center' as const,
  marginTop: '32px',
  marginBottom: '32px',
}

const button: React.CSSProperties = {
  backgroundColor: '#1D91EB',
  borderRadius: '10px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '500',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 32px',
  boxShadow: '0 2px 4px rgba(29, 145, 235, 0.2)',
  transition: 'all 0.2s',
}

const divider: React.CSSProperties = {
  borderColor: '#e6e9ec',
  margin: '0',
}

const footerSection: React.CSSProperties = {
  padding: '32px 48px',
  backgroundColor: '#f8fafc',
}

const footerText: React.CSSProperties = {
  fontSize: '14px',
  color: '#64748b',
  textAlign: 'center' as const,
  marginBottom: '8px',
}

const footerLinks: React.CSSProperties = {
  fontSize: '14px',
  color: '#64748b',
  textAlign: 'center' as const,
  marginBottom: '16px',
}

const link: React.CSSProperties = {
  color: '#1D91EB',
  textDecoration: 'none',
  fontWeight: '500',
}

const footerAddress: React.CSSProperties = {
  fontSize: '12px',
  color: '#94a3b8',
  textAlign: 'center' as const,
  marginTop: '16px',
}

export default EmailTemplate