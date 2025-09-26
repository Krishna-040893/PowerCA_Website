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
  Row,
  Column,
 } from '@react-email/components'

interface WelcomeEmailProps {
  name: string
  email?: string
}

export const WelcomeEmail: React.FC<WelcomeEmailProps> = ({
  name,
  email: _email,
}) => {
  const preview = `Welcome to PowerCA, ${name}! Let's get started.`

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

          {/* Hero Section */}
          <Section style={heroSection}>
            <div style={heroPattern}>
              <Text style={heroHeading}>Welcome to PowerCA! 🎉</Text>
              <Text style={heroSubtext}>
                Hi {name}, we're thrilled to have you with us.
              </Text>
            </div>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Text style={paragraph}>
              Thank you for choosing PowerCA as your technology partner. We're committed to helping you achieve your business goals through innovative solutions and exceptional service.
            </Text>

            <Text style={sectionTitle}>What's Next?</Text>

            {/* Feature Cards */}
            <Section style={cardsContainer}>
              <Row>
                <Column style={card}>
                  <div style={cardIcon}>🚀</div>
                  <Text style={cardTitle}>Get Started</Text>
                  <Text style={cardDescription}>
                    Explore our comprehensive suite of services designed to accelerate your business growth.
                  </Text>
                </Column>
                <Column style={card}>
                  <div style={cardIcon}>💡</div>
                  <Text style={cardTitle}>Expert Support</Text>
                  <Text style={cardDescription}>
                    Our team of experts is ready to assist you every step of the way.
                  </Text>
                </Column>
              </Row>
              <Row>
                <Column style={card}>
                  <div style={cardIcon}>🔧</div>
                  <Text style={cardTitle}>Custom Solutions</Text>
                  <Text style={cardDescription}>
                    We tailor our services to meet your unique business requirements.
                  </Text>
                </Column>
                <Column style={card}>
                  <div style={cardIcon}>📈</div>
                  <Text style={cardTitle}>Scale & Grow</Text>
                  <Text style={cardDescription}>
                    Built to scale with your business as you expand and evolve.
                  </Text>
                </Column>
              </Row>
            </Section>

            {/* CTA Section */}
            <Section style={ctaSection}>
              <Text style={ctaText}>
                Ready to transform your business with PowerCA?
              </Text>
              <Button href="https://powerca.com/dashboard" style={primaryButton}>
                Go to Dashboard
              </Button>
              <Text style={alternativeActions}>
                or
              </Text>
              <Row>
                <Column align="center">
                  <Link href="https://powerca.com/docs" style={secondaryLink}>
                    📚 Read Documentation
                  </Link>
                </Column>
                <Column align="center">
                  <Link href="https://powerca.com/contact" style={secondaryLink}>
                    💬 Contact Support
                  </Link>
                </Column>
              </Row>
            </Section>

            {/* Help Section */}
            <Section style={helpSection}>
              <Text style={helpTitle}>Need Help?</Text>
              <Text style={helpText}>
                Our support team is available 24/7 to assist you. Don't hesitate to reach out if you have any questions or need assistance.
              </Text>
              <Row>
                <Column align="center">
                  <Link href="mailto:support@powerca.com" style={helpLink}>
                    📧 support@powerca.com
                  </Link>
                </Column>
                <Column align="center">
                  <Link href="tel:+1234567890" style={helpLink}>
                    📞 +1 (234) 567-890
                  </Link>
                </Column>
              </Row>
            </Section>
          </Section>

          <Hr style={divider} />

          {/* Footer */}
          <Section style={footerSection}>
            <Row>
              <Column align="center" style={socialLinks}>
                <Link href="https://twitter.com/powerca" style={socialLink}>
                  Twitter
                </Link>
                <Text style={socialSeparator}>•</Text>
                <Link href="https://linkedin.com/company/powerca" style={socialLink}>
                  LinkedIn
                </Link>
                <Text style={socialSeparator}>•</Text>
                <Link href="https://github.com/powerca" style={socialLink}>
                  GitHub
                </Link>
              </Column>
            </Row>
            <Text style={footerText}>
              © {new Date().getFullYear()} PowerCA. All rights reserved.
            </Text>
            <Text style={footerAddress}>
              PowerCA Inc. | Empowering businesses through technology
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const main: React.CSSProperties = {
  backgroundColor: '#f0f7ff',
  fontFamily: 'Geist, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  backgroundImage: `
    radial-gradient(circle at 20% 50%, rgba(29, 145, 235, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(27, 175, 105, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 40% 20%, rgba(245, 158, 11, 0.03) 0%, transparent 50%)
  `,
}

const container: React.CSSProperties = {
  backgroundColor: '#ffffff',
  margin: '40px auto',
  borderRadius: '12px',
  boxShadow: '0 10px 40px rgba(29, 145, 235, 0.1)',
  overflow: 'hidden',
  maxWidth: '600px',
}

const header: React.CSSProperties = {
  backgroundColor: '#ffffff',
  padding: '32px 48px 24px',
  textAlign: 'center' as const,
}

const logo: React.CSSProperties = {
  margin: '0 auto',
}

const heroSection: React.CSSProperties = {
  backgroundColor: '#1D91EB',
  padding: '0',
  position: 'relative' as const,
}

const heroPattern: React.CSSProperties = {
  padding: '48px',
  backgroundImage: `
    linear-gradient(135deg, transparent 25%, rgba(255, 255, 255, 0.05) 25%, rgba(255, 255, 255, 0.05) 50%, transparent 50%, transparent 75%, rgba(255, 255, 255, 0.05) 75%, rgba(255, 255, 255, 0.05)),
    linear-gradient(45deg, transparent 25%, rgba(255, 255, 255, 0.05) 25%, rgba(255, 255, 255, 0.05) 50%, transparent 50%, transparent 75%, rgba(255, 255, 255, 0.05) 75%, rgba(255, 255, 255, 0.05))
  `,
  backgroundSize: '20px 20px',
}

const heroHeading: React.CSSProperties = {
  fontSize: '32px',
  fontWeight: '700',
  color: '#ffffff',
  textAlign: 'center' as const,
  marginBottom: '12px',
  marginTop: '0',
}

const heroSubtext: React.CSSProperties = {
  fontSize: '18px',
  color: 'rgba(255, 255, 255, 0.95)',
  textAlign: 'center' as const,
  margin: '0',
}

const content: React.CSSProperties = {
  padding: '48px',
  backgroundColor: '#ffffff',
}

const paragraph: React.CSSProperties = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#475569',
  marginBottom: '32px',
}

const sectionTitle: React.CSSProperties = {
  fontSize: '20px',
  fontWeight: '600',
  color: '#0F172A',
  marginBottom: '24px',
  marginTop: '32px',
}

const cardsContainer: React.CSSProperties = {
  marginBottom: '32px',
}

const card: React.CSSProperties = {
  backgroundColor: '#f8fafc',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '16px',
  marginRight: '8px',
  border: '1px solid #e2e8f0',
  textAlign: 'center' as const,
}

const cardIcon: React.CSSProperties = {
  fontSize: '32px',
  marginBottom: '8px',
}

const cardTitle: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#0F172A',
  marginBottom: '8px',
  marginTop: '0',
}

const cardDescription: React.CSSProperties = {
  fontSize: '14px',
  color: '#64748b',
  lineHeight: '20px',
  margin: '0',
}

const ctaSection: React.CSSProperties = {
  textAlign: 'center' as const,
  marginTop: '40px',
  marginBottom: '40px',
}

const ctaText: React.CSSProperties = {
  fontSize: '18px',
  color: '#334155',
  marginBottom: '24px',
  fontWeight: '500',
}

const primaryButton: React.CSSProperties = {
  backgroundColor: '#1D91EB',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
  boxShadow: '0 4px 12px rgba(29, 145, 235, 0.2)',
}

const alternativeActions: React.CSSProperties = {
  fontSize: '14px',
  color: '#94a3b8',
  margin: '16px 0',
}

const secondaryLink: React.CSSProperties = {
  color: '#1D91EB',
  fontSize: '14px',
  fontWeight: '500',
  textDecoration: 'none',
  display: 'inline-block',
  padding: '8px 16px',
}

const helpSection: React.CSSProperties = {
  backgroundColor: 'rgba(29, 145, 235, 0.05)',
  borderRadius: '8px',
  padding: '24px',
  marginTop: '32px',
  textAlign: 'center' as const,
}

const helpTitle: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#0F172A',
  marginBottom: '12px',
  marginTop: '0',
}

const helpText: React.CSSProperties = {
  fontSize: '14px',
  color: '#64748b',
  lineHeight: '22px',
  marginBottom: '16px',
}

const helpLink: React.CSSProperties = {
  color: '#1D91EB',
  fontSize: '14px',
  fontWeight: '500',
  textDecoration: 'none',
  display: 'inline-block',
  padding: '4px 8px',
}

const divider: React.CSSProperties = {
  borderColor: '#e2e8f0',
  margin: '0',
}

const footerSection: React.CSSProperties = {
  padding: '32px 48px',
  backgroundColor: '#f8fafc',
}

const socialLinks: React.CSSProperties = {
  marginBottom: '16px',
}

const socialLink: React.CSSProperties = {
  color: '#1D91EB',
  fontSize: '14px',
  fontWeight: '500',
  textDecoration: 'none',
  display: 'inline',
  margin: '0 4px',
}

const socialSeparator: React.CSSProperties = {
  color: '#cbd5e1',
  display: 'inline',
  margin: '0 8px',
  fontSize: '14px',
}

const footerText: React.CSSProperties = {
  fontSize: '13px',
  color: '#64748b',
  textAlign: 'center' as const,
  marginBottom: '8px',
  marginTop: '0',
}

const footerAddress: React.CSSProperties = {
  fontSize: '12px',
  color: '#94a3b8',
  textAlign: 'center' as const,
  margin: '0',
}

export default WelcomeEmail