/**
 * @jest-environment node
 */
import { createHmac } from 'node:crypto'

// Outside a request `after` throws, so the helper sends straight away — which
// is what lets these tests await the fetch.
jest.mock('next/server', () => ({
  after: jest.fn(() => {
    throw new Error('after() called outside a request scope')
  }),
}))

import { forwardEnquiryToCrm, slotStartIso } from '../crm'

const enquiry = {
  externalId: 'contacts:row-1',
  type: 'contact',
  name: 'Ramesh Kumar',
  email: 'ramesh@example.com',
  message: 'Need pricing',
}

describe('forwardEnquiryToCrm', () => {
  const fetchMock = jest.fn()
  const originalFetch = global.fetch

  beforeEach(() => {
    jest.useFakeTimers()
    fetchMock.mockReset()
    global.fetch = fetchMock as unknown as typeof fetch
    process.env.CRM_LEADS_WEBHOOK_URL = 'https://crm.example/api/webhooks/leads'
    process.env.CRM_LEADS_WEBHOOK_SECRET = 'test-secret'
  })

  afterEach(() => {
    jest.useRealTimers()
    global.fetch = originalFetch
    delete process.env.CRM_LEADS_WEBHOOK_URL
    delete process.env.CRM_LEADS_WEBHOOK_SECRET
  })

  it('does nothing when the CRM is not configured', async () => {
    delete process.env.CRM_LEADS_WEBHOOK_URL
    forwardEnquiryToCrm(enquiry)
    await jest.runAllTimersAsync()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('posts a Power CA enquiry signed over timestamp + body', async () => {
    fetchMock.mockResolvedValue(new Response('{"ok":true}', { status: 200 }))
    forwardEnquiryToCrm(enquiry)
    await jest.runAllTimersAsync()

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit & { headers: Record<string, string> }]
    expect(url).toBe('https://crm.example/api/webhooks/leads')
    const body = init.body as string
    const timestamp = init.headers['x-tbs-timestamp']
    const expected = createHmac('sha256', 'test-secret').update(`${timestamp}.${body}`).digest('hex')
    expect(init.headers['x-tbs-signature']).toBe(`sha256=${expected}`)
    expect(JSON.parse(body)).toMatchObject({ ...enquiry, source: 'powerca.in', orgType: 'ca_firm' })
  })

  it('retries once when the CRM has a server error', async () => {
    fetchMock
      .mockResolvedValueOnce(new Response('down', { status: 503 }))
      .mockResolvedValueOnce(new Response('{"ok":true}', { status: 200 }))
    forwardEnquiryToCrm(enquiry)
    await jest.runAllTimersAsync()
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('does not retry an enquiry the CRM refused', async () => {
    fetchMock.mockResolvedValue(new Response('{"error":"Invalid enquiry"}', { status: 400 }))
    forwardEnquiryToCrm(enquiry)
    await jest.runAllTimersAsync()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})

describe('slotStartIso', () => {
  it('reads a slot label as India time', () => {
    expect(slotStartIso('2026-09-24', '11:00 AM - 12:00 PM')).toBe('2026-09-24T05:30:00.000Z')
    expect(slotStartIso('2026-09-24', '02:00 PM - 03:00 PM')).toBe('2026-09-24T08:30:00.000Z')
    expect(slotStartIso('2026-09-24', '12:30 PM - 01:30 PM')).toBe('2026-09-24T07:00:00.000Z')
  })

  it('is null for anything it cannot read', () => {
    expect(slotStartIso('2026-09-24', 'afternoon')).toBeNull()
    expect(slotStartIso('24/09/2026', '11:00 AM - 12:00 PM')).toBeNull()
  })
})
