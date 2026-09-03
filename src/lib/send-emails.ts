import React from 'react'
import {resend  } from './email'
import {logger  } from './logger'

interface ContactFormData {
  name: string
  email: string
  phone?: string
  company?: string
  message: string
}

interface WelcomeEmailData {
  name: string
  email: string
}

export async function sendContactFormEmail(data: ContactFormData) {
  try {
    // Dynamic import to avoid bundling react-email components at build time
    const { ContactFormEmail } = await import('@/emails/contact-form-email')

    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Power CA <contact@powerca.in>',
      to: ['contact@powerca.in', 'tbsindiaudt@gmail.com'],
      subject: `New Contact Form Submission from ${data.name}`,
      react: ContactFormEmail({
        name: data.name,
        email: data.email,
        phone: data.phone,
        company: data.company,
        message: data.message,
        subject: `New inquiry from ${data.company || data.name}`,
      }) as React.ReactElement,
    })

    return { success: true, data: result }
  } catch (error) {
    console.error('Failed to send contact form email:', error)
    return { success: false, error }
  }
}

export async function sendWelcomeEmail(data: WelcomeEmailData) {
  try {
    // Dynamic import to avoid bundling react-email components at build time
    const { WelcomeEmail } = await import('@/emails/welcome-email')

    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Power CA <contact@powerca.in>',
      to: data.email,
      subject: `Welcome to Power CA, ${data.name}!`,
      react: WelcomeEmail({
        name: data.name,
        email: data.email,
      }) as React.ReactElement,
    })

    return { success: true, data: result }
  } catch (error) {
    console.error('Failed to send welcome email:', error)
    return { success: false, error }
  }
}

interface AdminRegistrationNotificationData {
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

export async function sendAdminRegistrationNotification(data: AdminRegistrationNotificationData) {
  try {
    // Dynamic import to avoid bundling react-email components at build time
    const { AdminRegistrationNotification } = await import('@/emails/admin-registration-notification')

    // Use noreply@ address to avoid FROM and TO being the same
    // This prevents email delivery issues with Resend and other email services
    const fromAddress = process.env.EMAIL_FROM || 'Power CA Notifications <noreply@powerca.in>'
    const toAddresses = ['contact@powerca.in']

    logger.info('Sending admin notification email', { from: fromAddress, to: toAddresses })

    const result = await resend.emails.send({
      from: fromAddress,
      to: toAddresses,
      subject: `🎉 New Registration: ${data.userName} (${data.userRole || 'User'})`,
      react: AdminRegistrationNotification({
        userName: data.userName,
        userEmail: data.userEmail,
        userPhone: data.userPhone,
        userRole: data.userRole,
        professionalType: data.professionalType,
        membershipNo: data.membershipNo,
        registrationNo: data.registrationNo,
        instituteName: data.instituteName,
        registeredAt: data.registeredAt,
      }) as React.ReactElement,
    })

    logger.info('Admin notification email sent successfully', { messageId: result.data?.id })
    return { success: true, data: result }
  } catch (error) {
    console.error('Failed to send admin registration notification:', error)
    return { success: false, error }
  }
}

export async function sendCustomEmail({
  to, subject, heading, body, ctaText, ctaLink, footer }: {
  to: string
  subject: string
  heading?: string
  body?: string | React.ReactNode
  ctaText?: string
  ctaLink?: string
  footer?: string | React.ReactNode
}) {
  try {
    // Dynamic import to avoid bundling react-email components at build time
    const { EmailTemplate } = await import('@/emails/email-template')

    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Power CA <contact@powerca.in>',
      to,
      subject,
      react: EmailTemplate({
        subject,
        heading,
        body,
        ctaText,
        ctaLink,
        footer,
      }) as React.ReactElement,
    })

    return { success: true, data: result }
  } catch (error) {
    console.error('Failed to send custom email:', error)
    return { success: false, error }
  }
}

// Generic email sender for raw HTML content and React components (used by payment webhook)
export async function sendEmail({
  to, subject, html, text, react, attachments }: {
  to: string
  subject: string
  html?: string
  text?: string
  react?: React.ReactNode
  attachments?: Array<{
    filename: string
    content: string
  }>
}) {
  try {
    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Power CA <contact@powerca.in>',
      to,
      subject,
      html,
      text,
      react,
      attachments,
    })

    return { success: true, data: result }
  } catch (error) {
    console.error('Failed to send email:', error)
    return { success: false, error }
  }
}