import { createHmac } from 'node:crypto'
import { after } from 'next/server'

import { logger } from '@/lib/logger'

/**
 * Hands a sales enquiry to the TBS CRM (crm.tbstech.in), where it becomes a
 * Power CA lead in the sales team's call queue. Contract: TBS_CRM
 * docs/INBOUND_LEADS.md.
 *
 * Forwarding is fire-and-forget: it runs after the response is sent (`after`),
 * so the visitor never waits on the CRM, and a CRM outage never fails their
 * submission — it is already saved here and the team already emailed. The CRM
 * is idempotent on `externalId`, so the one retry can't make two leads.
 *
 * Off unless CRM_LEADS_WEBHOOK_URL and CRM_LEADS_WEBHOOK_SECRET are set.
 */
export interface CrmEnquiry {
  /** This site's own record id, e.g. `contacts:<uuid>` — the CRM's idempotency key. */
  externalId: string
  /** contact, demo… — shown on the CRM timeline. */
  type: string
  name: string
  /** Firm name. Optional: without it the CRM matches the person by email / phone. */
  organisation?: string
  email: string
  phone?: string
  message?: string
  pageUrl?: string
  /** A demo slot the visitor booked: the CRM puts the lead on its Demos board. */
  demo?: { scheduledAt: string; meetingLink?: string }
}

const TIMEOUT_MS = 10_000

const clip = (value: string | undefined, max: number) => value?.trim().slice(0, max) || undefined

async function post(url: string, secret: string, body: string): Promise<Response> {
  const timestamp = Math.floor(Date.now() / 1000).toString()
  const signature = createHmac('sha256', secret).update(`${timestamp}.${body}`).digest('hex')
  return fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-tbs-timestamp': timestamp,
      'x-tbs-signature': `sha256=${signature}`,
    },
    body,
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })
}

async function deliver(url: string, secret: string, enquiry: CrmEnquiry): Promise<void> {
  // Kept within the CRM's field limits so a long answer can't get the enquiry refused.
  const body = JSON.stringify({
    source: 'powerca.in',
    orgType: 'ca_firm',
    submittedAt: new Date().toISOString(),
    ...enquiry,
    name: enquiry.name.trim().slice(0, 150),
    organisation: clip(enquiry.organisation, 255),
    phone: clip(enquiry.phone, 20),
    message: clip(enquiry.message, 5000),
  })
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const res = await post(url, secret, body)
      if (res.ok) {
        logger.info('Forwarded enquiry to the CRM', { externalId: enquiry.externalId, type: enquiry.type })
        return
      }
      // 4xx (other than 429) won't get better on a retry.
      if (res.status < 500 && res.status !== 429) {
        logger.error('CRM refused the enquiry', undefined, {
          externalId: enquiry.externalId,
          status: res.status,
          body: (await res.text()).slice(0, 300),
        })
        return
      }
      logger.warn('CRM answered with an error', { externalId: enquiry.externalId, status: res.status, attempt })
    } catch (error) {
      logger.warn('Could not reach the CRM', {
        externalId: enquiry.externalId,
        attempt,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
    if (attempt === 1) await new Promise((resolve) => setTimeout(resolve, 2_000))
  }
  logger.error('Gave up forwarding the enquiry to the CRM; it is still saved in Supabase', undefined, {
    externalId: enquiry.externalId,
  })
}

export function forwardEnquiryToCrm(enquiry: CrmEnquiry): void {
  const url = process.env.CRM_LEADS_WEBHOOK_URL
  const secret = process.env.CRM_LEADS_WEBHOOK_SECRET
  if (!url || !secret) return

  const task = () => deliver(url, secret, enquiry)
  try {
    after(task)
  } catch {
    // Outside a request (tests, scripts): send without holding anything up.
    void task()
  }
}

/**
 * A booked slot as an instant: `date` is YYYY-MM-DD and `time` a slot label such
 * as "02:00 PM - 03:00 PM" — both India time. Null when it can't be read.
 */
export function slotStartIso(date: string, time: string): string | null {
  const m = time.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)/i)
  if (!m || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null
  let hour = Number(m[1]) % 12
  if (m[3].toUpperCase() === 'PM') hour += 12
  const at = new Date(`${date}T${String(hour).padStart(2, '0')}:${m[2]}:00+05:30`)
  return Number.isNaN(at.getTime()) ? null : at.toISOString()
}
