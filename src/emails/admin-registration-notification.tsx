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
  const isProfessional = userRole === 'professional'
  const isStudent = userRole === 'student'

  const roleDisplay = isProfessional ? 'Professional' : isStudent ? 'Student' : 'User'
  const preview = `New ${roleDisplay} Registration: ${userName}`

  // Dynamic colors based on role
  const themeColor = isProfessional ? '#1e40af' : isStudent ? '#7c3aed' : '#1BAF69'
  const lightThemeColor = isProfessional ? '#dbeafe' : isStudent ? '#ede9fe' : '#d1fae5'
  const iconEmoji = isProfessional ? '💼' : isStudent ? '🎓' : '👤'

  return (
    <Html>
      <Head>
        <Font
          fontFamily="Inter"
          fallbackFontFamily="Arial, sans-serif"
          webFont={{
            url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
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
          <Section style={{...header, borderBottom: `4px solid ${themeColor}`}}>
            <Img
              src="https://powerca.in/images/powerca-logo-horizontal.png"
              width="160"
              height="45"
              alt="PowerCA"
              style={logo}
            />
          </Section>

          {/* Hero Alert Section with Dynamic Color */}
          <Section style={{...alertSection, background: `linear-gradient(135deg, ${themeColor} 0%, ${themeColor}dd 100%)`}}>
            <Text style={iconStyle}>{iconEmoji}</Text>
            <Text style={alertHeading}>New {roleDisplay} Registration!</Text>
            <Text style={alertSubtext}>
              {userName} just registered on PowerCA
            </Text>
            <Text style={timestampText}>
              {registeredAt && new Date(registeredAt).toLocaleString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            {/* Personal Information Card */}
            <Section style={{...infoCard, borderLeft: `4px solid ${themeColor}`}}>
              <Text style={cardTitle}>👤 Personal Information</Text>
              <table style={detailsTable}>
                <tbody>
                  <tr>
                    <td style={labelCell}>Full Name:</td>
                    <td style={valueCell}>
                      <Text style={strongText}>{userName}</Text>
                    </td>
                  </tr>
                  <tr>
                    <td style={labelCell}>Email:</td>
                    <td style={valueCell}>
                      <Link href={`mailto:${userEmail}`} style={{...emailLink, color: themeColor}}>
                        {userEmail}
                      </Link>
                    </td>
                  </tr>
                  {userPhone && (
                    <tr>
                      <td style={labelCell}>Phone:</td>
                      <td style={valueCell}>
                        <Link href={`tel:${userPhone}`} style={{...phoneLink, color: themeColor}}>
                          {userPhone}
                        </Link>
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td style={labelCell}>Account Type:</td>
                    <td style={valueCell}>
                      <span style={{...badge, backgroundColor: lightThemeColor, color: themeColor}}>
                        {roleDisplay}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </Section>

            {/* Professional-specific Information */}
            {isProfessional && (professionalType || membershipNo) && (
              <>
                <Section style={{...infoCard, borderLeft: '4px solid #10b981', marginTop: '20px'}}>
                  <Text style={cardTitle}>💼 Professional Details</Text>
                  <table style={detailsTable}>
                    <tbody>
                      {professionalType && (
                        <tr>
                          <td style={labelCell}>Professional Type:</td>
                          <td style={valueCell}>
                            <Text style={{...strongText, color: '#10b981'}}>
                              {professionalType.toUpperCase()}
                            </Text>
                          </td>
                        </tr>
                      )}
                      {membershipNo && (
                        <tr>
                          <td style={labelCell}>Membership Number:</td>
                          <td style={valueCell}>
                            <code style={codeStyle}>{membershipNo}</code>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </Section>
              </>
            )}

            {/* Student-specific Information */}
            {isStudent && (registrationNo || instituteName) && (
              <>
                <Section style={{...infoCard, borderLeft: '4px solid #f59e0b', marginTop: '20px'}}>
                  <Text style={cardTitle}>🎓 Student Details</Text>
                  <table style={detailsTable}>
                    <tbody>
                      {instituteName && (
                        <tr>
                          <td style={labelCell}>Institute Name:</td>
                          <td style={valueCell}>
                            <Text style={strongText}>{instituteName}</Text>
                          </td>
                        </tr>
                      )}
                      {registrationNo && (
                        <tr>
                          <td style={labelCell}>Registration Number:</td>
                          <td style={valueCell}>
                            <code style={codeStyle}>{registrationNo}</code>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </Section>
              </>
            )}

            <Hr style={divider} />

            {/* Quick Actions Section */}
            <Section style={actionSection}>
              <Text style={actionTitle}>📋 Next Steps</Text>
              <table style={actionTable}>
                <tbody>
                  <tr>
                    <td style={actionItem}>
                      <Text style={actionNumber}>1</Text>
                    </td>
                    <td style={actionItemText}>
                      <Text style={actionTextBold}>Review Registration</Text>
                      <Text style={actionTextSmall}>Verify all provided information</Text>
                    </td>
                  </tr>
                  <tr>
                    <td style={actionItem}>
                      <Text style={actionNumber}>2</Text>
                    </td>
                    <td style={actionItemText}>
                      <Text style={actionTextBold}>Send Welcome Email</Text>
                      <Text style={actionTextSmall}>Greet the new {roleDisplay.toLowerCase()}</Text>
                    </td>
                  </tr>
                  <tr>
                    <td style={actionItem}>
                      <Text style={actionNumber}>3</Text>
                    </td>
                    <td style={actionItemText}>
                      <Text style={actionTextBold}>Schedule Follow-up</Text>
                      <Text style={actionTextSmall}>Ensure smooth onboarding experience</Text>
                    </td>
                  </tr>
                </tbody>
              </table>
            </Section>

            {/* Admin Portal Link */}
            <Section style={ctaSection}>
              <Link
                href="https://powerca.in/admin/registrations"
                style={{...ctaButton, backgroundColor: themeColor}}
              >
                View in Admin Panel →
              </Link>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={footerSection}>
            <Hr style={footerDivider} />
            <Text style={footerText}>
              🤖 This is an automated notification from <strong>PowerCA Registration System</strong>
            </Text>
            <Text style={footerText}>
              For support, contact: <Link href="mailto:admin@powerca.in" style={footerLink}>admin@powerca.in</Link>
            </Text>
            <Text style={footerAddress}>
              © {new Date().getFullYear()} PowerCA. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// ============================================
// STYLES
// ============================================

const main: React.CSSProperties = {
  backgroundColor: '#f3f4f6',
  fontFamily: 'Inter, Arial, sans-serif',
  padding: '20px 0',
}

const container: React.CSSProperties = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  borderRadius: '16px',
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  overflow: 'hidden',
  maxWidth: '680px',
}

const header: React.CSSProperties = {
  backgroundColor: '#ffffff',
  padding: '32px 40px',
  textAlign: 'center' as const,
}

const logo: React.CSSProperties = {
  margin: '0 auto',
  display: 'block',
}

const alertSection: React.CSSProperties = {
  padding: '48px 40px',
  textAlign: 'center' as const,
}

const iconStyle: React.CSSProperties = {
  fontSize: '48px',
  margin: '0 0 16px 0',
  lineHeight: '1',
}

const alertHeading: React.CSSProperties = {
  fontSize: '32px',
  fontWeight: '700',
  color: '#ffffff',
  margin: '0 0 8px 0',
  lineHeight: '1.2',
}

const alertSubtext: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: '500',
  color: 'rgba(255, 255, 255, 0.95)',
  margin: '0 0 16px 0',
}

const timestampText: React.CSSProperties = {
  fontSize: '14px',
  color: 'rgba(255, 255, 255, 0.8)',
  margin: '0',
  fontStyle: 'italic',
}

const content: React.CSSProperties = {
  padding: '40px',
  backgroundColor: '#ffffff',
}

const infoCard: React.CSSProperties = {
  backgroundColor: '#f9fafb',
  borderRadius: '12px',
  padding: '24px',
  marginBottom: '0',
}

const cardTitle: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#111827',
  margin: '0 0 20px 0',
}

const detailsTable: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse' as const,
}

const labelCell: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: '500',
  color: '#6b7280',
  padding: '10px 20px 10px 0',
  verticalAlign: 'top' as const,
  width: '40%',
}

const valueCell: React.CSSProperties = {
  fontSize: '15px',
  color: '#111827',
  padding: '10px 0',
  verticalAlign: 'top' as const,
  fontWeight: '500',
}

const strongText: React.CSSProperties = {
  fontWeight: '600',
  margin: '0',
}

const emailLink: React.CSSProperties = {
  textDecoration: 'none',
  fontWeight: '500',
}

const phoneLink: React.CSSProperties = {
  textDecoration: 'none',
  fontWeight: '500',
}

const badge: React.CSSProperties = {
  padding: '6px 14px',
  borderRadius: '6px',
  fontSize: '13px',
  fontWeight: '600',
  display: 'inline-block',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
}

const codeStyle: React.CSSProperties = {
  backgroundColor: '#f1f5f9',
  color: '#0f172a',
  padding: '4px 8px',
  borderRadius: '4px',
  fontSize: '14px',
  fontFamily: 'Monaco, Courier, monospace',
  fontWeight: '600',
}

const divider: React.CSSProperties = {
  borderColor: '#e5e7eb',
  margin: '32px 0',
}

const actionSection: React.CSSProperties = {
  backgroundColor: '#f0f9ff',
  borderRadius: '12px',
  padding: '28px',
  border: '2px dashed #bae6fd',
}

const actionTitle: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#0c4a6e',
  margin: '0 0 20px 0',
}

const actionTable: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse' as const,
}

const actionItem: React.CSSProperties = {
  width: '40px',
  paddingRight: '16px',
  verticalAlign: 'top' as const,
  paddingTop: '8px',
  paddingBottom: '8px',
}

const actionNumber: React.CSSProperties = {
  width: '32px',
  height: '32px',
  backgroundColor: '#0ea5e9',
  color: '#ffffff',
  borderRadius: '50%',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: '700',
  fontSize: '14px',
  margin: '0',
  lineHeight: '32px',
  textAlign: 'center' as const,
}

const actionItemText: React.CSSProperties = {
  paddingTop: '8px',
  paddingBottom: '8px',
}

const actionTextBold: React.CSSProperties = {
  fontSize: '15px',
  fontWeight: '600',
  color: '#0c4a6e',
  margin: '0 0 4px 0',
}

const actionTextSmall: React.CSSProperties = {
  fontSize: '13px',
  color: '#64748b',
  margin: '0',
}

const ctaSection: React.CSSProperties = {
  textAlign: 'center' as const,
  marginTop: '32px',
}

const ctaButton: React.CSSProperties = {
  display: 'inline-block',
  padding: '14px 32px',
  color: '#ffffff',
  textDecoration: 'none',
  borderRadius: '8px',
  fontSize: '16px',
  fontWeight: '600',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
}

const footerSection: React.CSSProperties = {
  padding: '32px 40px',
  backgroundColor: '#f9fafb',
}

const footerDivider: React.CSSProperties = {
  borderColor: '#e5e7eb',
  margin: '0 0 24px 0',
}

const footerText: React.CSSProperties = {
  fontSize: '13px',
  color: '#6b7280',
  textAlign: 'center' as const,
  margin: '0 0 8px 0',
  lineHeight: '1.6',
}

const footerLink: React.CSSProperties = {
  color: '#2563eb',
  textDecoration: 'none',
  fontWeight: '500',
}

const footerAddress: React.CSSProperties = {
  fontSize: '12px',
  color: '#9ca3af',
  textAlign: 'center' as const,
  margin: '16px 0 0 0',
}

export default AdminRegistrationNotification
