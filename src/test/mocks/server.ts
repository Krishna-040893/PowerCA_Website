/**
 * MSW server setup for Node.js tests
 *
 * @module mocks/server
 */

import { setupServer } from 'msw/node'
import { handlers } from './handlers'

/**
 * Create MSW server with default handlers
 */
export const server = setupServer(...handlers)

/**
 * Setup MSW server lifecycle hooks
 */
beforeAll(() => {
  // Start server before all tests
  server.listen({
    onUnhandledRequest: 'warn',
  })
})

afterEach(() => {
  // Reset handlers after each test
  server.resetHandlers()
})

afterAll(() => {
  // Clean up after all tests
  server.close()
})
