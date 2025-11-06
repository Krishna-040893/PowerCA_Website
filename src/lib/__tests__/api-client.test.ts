/**
 * @fileoverview Tests for API client with retry logic
 * Tests cover retry mechanisms, exponential backoff, timeouts, and error handling
 */

import { apiClient } from '../api-client'
import { server } from '@/test/mocks/server'
import { rest } from 'msw'

describe('API Client', () => {
  describe('Successful Requests', () => {
    it('should make successful GET request', async () => {
      server.use(
        rest.get('/api/test', (req, res, ctx) => {
          return res(ctx.json({ success: true, data: 'test data' }))
        })
      )

      const response = await apiClient.get('/test')

      expect(response.ok).toBe(true)
      expect(response.data).toEqual({ success: true, data: 'test data' })
      expect(response.status).toBe(200)
    })

    it('should make successful POST request', async () => {
      server.use(
        rest.post('/api/test', async (req, res, ctx) => {
          const body = await req.json()
          return res(ctx.json({ success: true, received: body }))
        })
      )

      const response = await apiClient.post('/test', { name: 'John' })

      expect(response.ok).toBe(true)
      expect(response.data).toEqual({ success: true, received: { name: 'John' } })
    })

    it('should make successful PUT request', async () => {
      server.use(
        rest.put('/api/test/123', async (req, res, ctx) => {
          const body = await req.json()
          return res(ctx.json({ success: true, updated: body }))
        })
      )

      const response = await apiClient.put('/test/123', { name: 'Jane' })

      expect(response.ok).toBe(true)
      expect(response.data).toEqual({ success: true, updated: { name: 'Jane' } })
    })

    it('should make successful DELETE request', async () => {
      server.use(
        rest.delete('/api/test/123', (req, res, ctx) => {
          return res(ctx.json({ success: true, deleted: true }))
        })
      )

      const response = await apiClient.delete('/test/123')

      expect(response.ok).toBe(true)
      expect(response.data).toEqual({ success: true, deleted: true })
    })
  })

  describe('Retry Logic', () => {
    it('should retry failed requests up to 3 times by default', async () => {
      let attemptCount = 0

      server.use(
        rest.get('/api/test', (req, res, ctx) => {
          attemptCount++
          if (attemptCount < 3) {
            return res(ctx.status(500), ctx.json({ error: 'Server error' }))
          }
          return res(ctx.json({ success: true }))
        })
      )

      const response = await apiClient.get('/test')

      expect(attemptCount).toBe(3)
      expect(response.ok).toBe(true)
    })

    it('should not retry client errors (4xx)', async () => {
      let attemptCount = 0

      server.use(
        rest.get('/api/test', (req, res, ctx) => {
          attemptCount++
          return res(ctx.status(400), ctx.json({ error: 'Bad request' }))
        })
      )

      const response = await apiClient.get('/test')

      expect(attemptCount).toBe(1)
      expect(response.ok).toBe(false)
      expect(response.status).toBe(400)
    })

    it('should retry server errors (5xx)', async () => {
      let attemptCount = 0

      server.use(
        rest.get('/api/test', (req, res, ctx) => {
          attemptCount++
          return res(ctx.status(500), ctx.json({ error: 'Server error' }))
        })
      )

      const response = await apiClient.get('/test')

      expect(attemptCount).toBeGreaterThan(1)
      expect(response.ok).toBe(false)
    })

    it('should use exponential backoff between retries', async () => {
      const timestamps: number[] = []

      server.use(
        rest.get('/api/test', (req, res, ctx) => {
          timestamps.push(Date.now())
          return res(ctx.status(500))
        })
      )

      await apiClient.get('/test')

      // Check that delay increases between attempts
      if (timestamps.length > 1) {
        const delay1 = timestamps[1] - timestamps[0]
        const delay2 = timestamps[2] - timestamps[1]

        // Second delay should be longer than first (exponential backoff)
        expect(delay2).toBeGreaterThan(delay1)
      }
    }, 10000) // Increase timeout for this test

    it('should respect custom retry count', async () => {
      let attemptCount = 0

      server.use(
        rest.get('/api/test', (req, res, ctx) => {
          attemptCount++
          return res(ctx.status(500))
        })
      )

      await apiClient.get('/test', { retry: 1 })

      expect(attemptCount).toBe(2) // Initial + 1 retry
    })
  })

  describe('Timeout Handling', () => {
    it('should timeout long-running requests', async () => {
      server.use(
        rest.get('/api/test', async (req, res, ctx) => {
          await new Promise(resolve => setTimeout(resolve, 2000))
          return res(ctx.json({ success: true }))
        })
      )

      const response = await apiClient.get('/test', { timeout: 500 })

      expect(response.ok).toBe(false)
      expect(response.error).toBe('Request timeout')
    }, 10000)

    it('should not timeout fast requests', async () => {
      server.use(
        rest.get('/api/test', (req, res, ctx) => {
          return res(ctx.json({ success: true }))
        })
      )

      const response = await apiClient.get('/test', { timeout: 5000 })

      expect(response.ok).toBe(true)
    })

    it('should respect custom timeout values', async () => {
      server.use(
        rest.get('/api/test', async (req, res, ctx) => {
          await new Promise(resolve => setTimeout(resolve, 1000))
          return res(ctx.json({ success: true }))
        })
      )

      const response = await apiClient.get('/test', { timeout: 2000 })

      expect(response.ok).toBe(true)
    }, 5000)
  })

  describe('Error Responses', () => {
    it('should parse JSON error responses', async () => {
      server.use(
        rest.get('/api/test', (req, res, ctx) => {
          return res(
            ctx.status(400),
            ctx.json({ error: 'Validation failed', details: { field: 'email' } })
          )
        })
      )

      const response = await apiClient.get('/test')

      expect(response.ok).toBe(false)
      expect(response.error).toBe('Validation failed')
      expect(response.data).toEqual({
        error: 'Validation failed',
        details: { field: 'email' },
      })
    })

    it('should handle text error responses', async () => {
      server.use(
        rest.get('/api/test', (req, res, ctx) => {
          return res(ctx.status(500), ctx.text('Internal Server Error'))
        })
      )

      const response = await apiClient.get('/test')

      expect(response.ok).toBe(false)
      expect(response.error).toContain('500')
    })

    it('should handle network errors', async () => {
      server.use(
        rest.get('/api/test', (req, res) => {
          return res.networkError('Network connection failed')
        })
      )

      const response = await apiClient.get('/test')

      expect(response.ok).toBe(false)
      expect(response.error).toBeTruthy()
    })
  })

  describe('Request Headers', () => {
    it('should include Content-Type header by default', async () => {
      let receivedHeaders: HeadersInit | undefined

      server.use(
        rest.post('/api/test', (req, res, ctx) => {
          receivedHeaders = Object.fromEntries(req.headers)
          return res(ctx.json({ success: true }))
        })
      )

      await apiClient.post('/test', { data: 'test' })

      expect(receivedHeaders).toHaveProperty('content-type', 'application/json')
    })

    it('should include custom headers when provided', async () => {
      let receivedHeaders: HeadersInit | undefined

      server.use(
        rest.get('/api/test', (req, res, ctx) => {
          receivedHeaders = Object.fromEntries(req.headers)
          return res(ctx.json({ success: true }))
        })
      )

      await apiClient.get('/test', {
        headers: {
          'X-Custom-Header': 'custom-value',
        },
      })

      expect(receivedHeaders).toHaveProperty('x-custom-header', 'custom-value')
    })

    it('should include Authorization header when withAuth is true', async () => {
      // Mock auth token in sessionStorage
      const mockToken = 'mock-auth-token'
      sessionStorage.setItem('auth_token', mockToken)

      let receivedHeaders: HeadersInit | undefined

      server.use(
        rest.get('/api/test', (req, res, ctx) => {
          receivedHeaders = Object.fromEntries(req.headers)
          return res(ctx.json({ success: true }))
        })
      )

      await apiClient.get('/test', { withAuth: true })

      expect(receivedHeaders).toHaveProperty('authorization', `Bearer ${mockToken}`)

      sessionStorage.clear()
    })
  })

  describe('Request Body', () => {
    it('should send JSON data in POST requests', async () => {
      let receivedBody: unknown

      server.use(
        rest.post('/api/test', async (req, res, ctx) => {
          receivedBody = await req.json()
          return res(ctx.json({ success: true }))
        })
      )

      await apiClient.post('/test', { name: 'John', age: 30 })

      expect(receivedBody).toEqual({ name: 'John', age: 30 })
    })

    it('should handle FormData uploads', async () => {
      const formData = new FormData()
      formData.append('file', new Blob(['test']), 'test.txt')
      formData.append('name', 'John')

      let receivedData: { file: boolean; name: string } | undefined

      server.use(
        rest.post('/api/test', async (req, res, ctx) => {
          const data = await req.formData()
          receivedData = {
            file: data.has('file'),
            name: data.get('name') as string,
          }
          return res(ctx.json({ success: true }))
        })
      )

      await apiClient.upload('/test', formData)

      expect(receivedData).toEqual({ file: true, name: 'John' })
    })
  })

  describe('Response Parsing', () => {
    it('should parse JSON responses', async () => {
      server.use(
        rest.get('/api/test', (req, res, ctx) => {
          return res(
            ctx.json({
              user: { id: 1, name: 'John' },
              meta: { count: 10 },
            })
          )
        })
      )

      const response = await apiClient.get('/test')

      expect(response.ok).toBe(true)
      expect(response.data).toEqual({
        user: { id: 1, name: 'John' },
        meta: { count: 10 },
      })
    })

    it('should handle empty responses', async () => {
      server.use(
        rest.get('/api/test', (req, res, ctx) => {
          return res(ctx.status(204))
        })
      )

      const response = await apiClient.get('/test')

      expect(response.ok).toBe(true)
    })

    it('should handle malformed JSON gracefully', async () => {
      server.use(
        rest.get('/api/test', (req, res, ctx) => {
          return res(ctx.text('{invalid json}'))
        })
      )

      const response = await apiClient.get('/test')

      expect(response.ok).toBe(true)
      expect(response.data).toBeTruthy()
    })
  })

  describe('Concurrent Requests', () => {
    it('should handle multiple concurrent requests', async () => {
      server.use(
        rest.get('/api/test/:id', (req, res, ctx) => {
          const { id } = req.params
          return res(ctx.json({ id }))
        })
      )

      const requests = [
        apiClient.get('/test/1'),
        apiClient.get('/test/2'),
        apiClient.get('/test/3'),
      ]

      const responses = await Promise.all(requests)

      expect(responses[0].data).toEqual({ id: '1' })
      expect(responses[1].data).toEqual({ id: '2' })
      expect(responses[2].data).toEqual({ id: '3' })
      expect(responses.every(r => r.ok)).toBe(true)
    })
  })

  describe('Edge Cases', () => {
    it('should handle undefined request body', async () => {
      server.use(
        rest.post('/api/test', (req, res, ctx) => {
          return res(ctx.json({ success: true }))
        })
      )

      const response = await apiClient.post('/test')

      expect(response.ok).toBe(true)
    })

    it('should handle null values in request data', async () => {
      let receivedBody: unknown

      server.use(
        rest.post('/api/test', async (req, res, ctx) => {
          receivedBody = await req.json()
          return res(ctx.json({ success: true }))
        })
      )

      await apiClient.post('/test', { value: null })

      expect(receivedBody).toEqual({ value: null })
    })

    it('should handle very large responses', async () => {
      const largeData = Array.from({ length: 10000 }, (_, i) => ({ id: i, name: `Item ${i}` }))

      server.use(
        rest.get('/api/test', (req, res, ctx) => {
          return res(ctx.json({ items: largeData }))
        })
      )

      const response = await apiClient.get('/test')

      expect(response.ok).toBe(true)
      expect(Array.isArray((response.data as { items: unknown[] }).items)).toBe(true)
      expect((response.data as { items: unknown[] }).items.length).toBe(10000)
    })
  })
})
