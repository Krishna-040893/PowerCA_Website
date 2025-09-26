import {Resend  } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmail({
  to, subject, react }: {
  to: string
  subject: string
  react: React.ReactElement
}) {
  try {
    const emailFrom = process.env.EMAIL_FROM || 'noreply@powerca.com'
    const data = await resend.emails.send({
      from: emailFrom,
      to,
      subject,
      react,
    })
    return { success: true, data }
  } catch (error) {
    console.error('Failed to send email:', error)
    return { success: false, error }
  }
}