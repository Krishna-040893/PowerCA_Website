import * as React from 'react'
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Link,
  Img,
  Preview,
  Hr,
  Font,
} from '@react-email/components'

interface AdminRegistrationNotificationProps {
  userName: string
  userEmail: string
  userPhone?: string
  userRole?: string
  professionalType?: string
  membershipNo?: string
  registrationNo?: string
  instituteName?: string
  registeredAt?: string
}

export const AdminRegistrationNotification: React.FC<AdminRegistrationNotificationProps> = ({
  userName,
  userEmail,
  userPhone,
  userRole,
  professionalType,
  membershipNo,
  registrationNo,
  instituteName,
  registeredAt,
}) => {
  const preview = `New registration: ${userName} (${userEmail})`

  return (
    <Html>
      <Head>
        <Font
          fontFamily="Geist"
          fallbackFontFamily="Verdana"
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
              src="https://powerca.in/images/powerca-logo-horizontal.png"
              width="180"
              height="50"
              alt="Power CA"
              style={logo}
            />
          </Section>

          {/* Alert Section */}
          <Section style={alertSection}>
            <Text style={alertHeading}>🎉 New Client Registration</Text>
            <Text style={alertSubtext}>
              A new client has registered on Power CA
            </Text>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Text style={sectionTitle}>Client Details</Text>

            <table style={detailsTable}>
              <tbody>
                <tr>
                  <td style={labelCell}>Name:</td>
                  <td style={valueCell}>{userName}</td>
                </tr>
                <tr>
                  <td style={labelCell}>Email:</td>
                  <td style={valueCell}>
                    <Link href={`mailto:${userEmail}`} style={emailLink}>
                      {userEmail}
                    </Link>
                  </td>
                </tr>
                {userPhone && (
                  <tr>
                    <td style={labelCell}>Phone:</td>
                    <td style={valueCell}>
                      <Link href={`tel:${userPhone}`} style={phoneLink}>
                        {userPhone}
                      </Link>
                    </td>
                  </tr>
                )}
                {userRole && (
                  <tr>
                    <td style={labelCell}>Role:</td>
                    <td style={valueCell}>
                      <span style={badge}>{userRole}</span>
                    </td>
                  </tr>
                )}
                {professionalType && (
                  <tr>
                    <td style={labelCell}>Professional Type:</td>
                    <td style={valueCell}>{professionalType}</td>
                  </tr>
                )}
                {membershipNo && (
                  <tr>
                    <td style={labelCell}>Membership No:</td>
                    <td style={valueCell}>{membershipNo}</td>
                  </tr>
                )}
                {registrationNo && (
                  <tr>
                    <td style={labelCell}>Registration No:</td>
                    <td style={valueCell}>{registrationNo}</td>
                  </tr>
                )}
                {instituteName && (
                  <tr>
                    <td style={labelCell}>Institute:</td>
                    <td style={valueCell}>{instituteName}</td>
                  </tr>
                )}
                {registeredAt && (
                  <tr>
                    <td style={labelCell}>Registered At:</td>
                    <td style={valueCell}>{new Date(registeredAt).toLocaleString()}</td>
                  </tr>
                )}
              </tbody>
            </table>

            <Hr style={divider} />

            <Section style={actionSection}>
              <Text style={actionText}>
                Please follow up with this client to ensure they have a smooth onboarding experience.
              </Text>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={footerSection}>
            <Text style={footerText}>
              This is an automated notification from Power CA Registration System
            </Text>
            <Text style={footerAddress}>
              © {new Date().getFullYear()} Power CA. All rights reserved.
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

const alertSection: React.CSSProperties = {
  backgroundColor: '#1BAF69',
  padding: '32px 48px',
}

const alertHeading: React.CSSProperties = {
  fontSize: '28px',
  fontWeight: '700',
  color: '#ffffff',
  textAlign: 'center' as const,
  marginBottom: '8px',
  marginTop: '0',
}

const alertSubtext: React.CSSProperties = {
  fontSize: '16px',
  color: 'rgba(255, 255, 255, 0.95)',
  textAlign: 'center' as const,
  margin: '0',
}

const content: React.CSSProperties = {
  padding: '48px',
  backgroundColor: '#ffffff',
}

const sectionTitle: React.CSSProperties = {
  fontSize: '20px',
  fontWeight: '600',
  color: '#0F172A',
  marginBottom: '24px',
  marginTop: '0',
}

const detailsTable: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse' as const,
  marginBottom: '24px',
}

const labelCell: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#64748b',
  padding: '12px 16px 12px 0',
  verticalAlign: 'top' as const,
  width: '35%',
}

const valueCell: React.CSSProperties = {
  fontSize: '14px',
  color: '#0F172A',
  padding: '12px 0',
  verticalAlign: 'top' as const,
}

const emailLink: React.CSSProperties = {
  color: '#1D91EB',
  textDecoration: 'none',
}

const phoneLink: React.CSSProperties = {
  color: '#1D91EB',
  textDecoration: 'none',
}

const badge: React.CSSProperties = {
  backgroundColor: '#e0f2fe',
  color: '#0369a1',
  padding: '4px 12px',
  borderRadius: '4px',
  fontSize: '13px',
  fontWeight: '500',
  display: 'inline-block',
}

const divider: React.CSSProperties = {
  borderColor: '#e2e8f0',
  margin: '24px 0',
}

const actionSection: React.CSSProperties = {
  backgroundColor: '#f8fafc',
  borderRadius: '8px',
  padding: '20px',
  marginTop: '24px',
}

const actionText: React.CSSProperties = {
  fontSize: '14px',
  color: '#475569',
  lineHeight: '22px',
  margin: '0',
  textAlign: 'center' as const,
}

const footerSection: React.CSSProperties = {
  padding: '32px 48px',
  backgroundColor: '#f8fafc',
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

export default AdminRegistrationNotification
