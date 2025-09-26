import React from 'react'
import {resend  } from './email'
import {ContactFormEmail  } from '@/emails/contact-form-email'
import {WelcomeEmail  } from '@/emails/welcome-email'
import {EmailTemplate  } from '@/emails/email-template'

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
    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'PowerCA <noreply@powerca.com>',
      to: process.env.CONTACT_EMAIL || 'support@powerca.com',
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
    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'PowerCA <noreply@powerca.com>',
      to: data.email,
      subject: `Welcome to PowerCA, ${data.name}!`,
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
    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'PowerCA <noreply@powerca.com>',
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
      from: process.env.EMAIL_FROM || 'PowerCA <noreply@powerca.com>',
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