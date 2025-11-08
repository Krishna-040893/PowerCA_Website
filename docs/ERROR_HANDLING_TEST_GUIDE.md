# Error Handling Migration - Testing Guide

## Purpose

This guide helps you verify that all error handling migrations work correctly without breaking existing functionality.

---

## Quick Test Checklist

### ✅ Pre-Migration Tests (Do First)

- [ ] 1. Run TypeScript check: `npm run typecheck`
- [ ] 2. Run build: `npm run build`
- [ ] 3. Start dev server: `npm run dev`
- [ ] 4. Verify no console errors on startup

### ✅ Post-Migration Tests (After Changes)

- [ ] 1. Run TypeScript check again
- [ ] 2. Test each migrated endpoint
- [ ] 3. Verify rate limiting works
- [ ] 4. Verify error responses are standardized
- [ ] 5. Check logs are structured

---

## Step 1: TypeScript Compilation Test

**Purpose:** Ensure no type errors were introduced

```bash
npm run typecheck
```

**Expected Result:**

```
✓ No TypeScript errors found
```

**If errors occur:**

- Review the error messages
- Check import paths are correct
- Verify all types are properly imported

---

## Step 2: Build Test

**Purpose:** Ensure the app builds successfully

```bash
npm run build
```

**Expected Result:**

```
✓ Compiled successfully
```

**Common Issues:**

- Missing imports: Add them from `@/lib/middleware` or `@/lib/error-handler`
- Unused variables: Remove or use them

---

## Step 3: Development Server Test

**Purpose:** Ensure the app starts without crashes

```bash
npm run dev
```

**Expected Result:**

- Server starts on port 3000 (or configured port)
- No module initialization errors
- No "Missing environment variable" crashes

**What to check:**

- ✅ No errors about missing Supabase/Resend at module level
- ✅ Server starts cleanly
- ✅ Can navigate to the homepage

---

## Step 4: API Endpoint Testing

### A. Manual Testing with cURL

#### Test 1: Auth - Register (Rate Limited - 5 req/min)

```bash
# Success case
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "SecurePass123!",
    "phone": "9876543210",
    "role": "Professional",
    "professionalType": "CA",
    "membershipNo": "123456"
  }'
```

**Expected Response:**

```json
{
  "success": true,
  "message": "Registration successful!",
  "user": {
    "id": "...",
    "email": "test@example.com",
    "name": "Test User"
  }
}
```

**Validation Error Test:**

```bash
# Missing required fields
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Test"}'
```

**Expected Error Response:**

```json
{
  "success": false,
  "error": {
    "type": "VALIDATION_ERROR",
    "message": "...",
    "code": "VALIDATION_ERROR"
  },
  "timestamp": "...",
  "requestId": "req_..."
}
```

#### Test 2: Auth - Login (Rate Limited - 5 req/min)

```bash
# Success case
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'
```

#### Test 3: Forgot Password (Rate Limited - 3 req/min - STRICT)

```bash
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

**Expected Response:**

```json
{
  "success": true,
  "message": "Password reset link has been sent to your email"
}
```

#### Test 4: Contact Form (Rate Limited - 3 req/min - STRICT)

```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "message": "Test message from API test"
  }'
```

**Expected Response:**

```json
{
  "success": true,
  "message": "Your message has been sent successfully!"
}
```

---

## Step 5: Rate Limiting Test

**Purpose:** Verify rate limiting is working

### Test Rate Limiting

**Method 1: Quick Bash Script**

```bash
# Test contact form rate limit (3 requests/min)
for i in {1..5}; do
  echo "Request $i:"
  curl -X POST http://localhost:3000/api/contact \
    -H "Content-Type: application/json" \
    -d '{"name":"Test","email":"test@test.com","message":"Test message"}' \
    -w "\nStatus: %{http_code}\n\n"
  sleep 1
done
```

**Expected Result:**

- Requests 1-3: Success (200)
- Request 4+: Rate limited (429)

**Rate Limited Response:**

```json
{
  "error": "Too many requests",
  "reset": "2025-03-11T10:35:00.000Z"
}
```

**Headers to Check:**

```
Retry-After: 60
X-RateLimit-Limit: 3
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1710154500
```

---

## Step 6: Error Response Format Test

### Check Standardized Error Format

All errors should follow this format:

```json
{
  "success": false,
  "error": {
    "type": "ERROR_TYPE",
    "message": "User-friendly message",
    "code": "ERROR_TYPE",
    "details": {
      /* optional */
    }
  },
  "timestamp": "2025-03-11T10:30:00.000Z",
  "requestId": "req_1234567890_abc123"
}
```

**Error Types to Test:**

| Type                 | Test Case              | Expected Status |
| -------------------- | ---------------------- | --------------- |
| VALIDATION_ERROR     | Missing required field | 400             |
| AUTHENTICATION_ERROR | Invalid credentials    | 401             |
| RATE_LIMIT_ERROR     | Too many requests      | 429             |
| INTERNAL_ERROR       | Server error           | 500             |

---

## Step 7: Logging Verification

### Check Structured Logging

**Where to look:** Terminal/console output during development

**Expected Log Format:**

```
[2025-03-11T10:30:00.000Z] INFO: Login attempt { email: 'test@example.com' }
[2025-03-11T10:30:01.000Z] INFO: Login successful { userId: '123', email: 'test@example.com' }
```

**NOT Expected (old format):**

```
✅ Login successful: test@example.com  // Old console.log format
```

**What to verify:**

- ✅ Timestamps present
- ✅ Log level (INFO, WARN, ERROR)
- ✅ Structured data (JSON objects)
- ✅ No sensitive data (passwords, tokens)
- ✅ Request context included

---

## Step 8: Database Error Protection Test

**Purpose:** Verify database errors don't leak schema info

### Simulate Database Error

**Test with invalid data:**

```bash
# Try to create duplicate user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test",
    "email": "existing@example.com",
    "password": "pass",
    "phone": "1234567890",
    "role": "Professional"
  }'
```

**DO NOT Expect (Bad - schema leak):**

```json
{
  "error": "duplicate key value violates unique constraint \"users_email_key\"",
  "code": "23505",
  "table": "users"
}
```

**DO Expect (Good - safe message):**

```json
{
  "success": false,
  "error": {
    "type": "DATABASE_ERROR",
    "message": "A database error occurred. Please try again later.",
    "code": "DATABASE_ERROR"
  }
}
```

---

## Step 9: Configuration Error Test

**Purpose:** Verify graceful handling of missing config

### Test Missing Environment Variables

**Temporarily rename an env var:**

```bash
# In .env.local, temporarily comment out:
# NEXT_PUBLIC_SUPABASE_URL=...

# Restart server
npm run dev
```

**Test an endpoint:**

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"pass","phone":"1234567890"}'
```

**Expected Response:**

```json
{
  "success": false,
  "error": {
    "type": "CONFIGURATION_ERROR",
    "message": "Service configuration error",
    "code": "CONFIGURATION_ERROR"
  }
}
```

**Important:**

- ✅ Server should NOT crash on startup
- ✅ Should return proper error response
- ✅ Should not reveal which config is missing in production

**Remember to uncomment the env var after testing!**

---

## Step 10: Integration Testing (Optional but Recommended)

### Create Automated Test File

**File:** `tests/api/auth.test.ts`

```typescript
import { describe, it, expect } from '@jest/globals'

describe('Auth API - Error Handling', () => {
  it('should return standardized error for missing fields', async () => {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })

    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toHaveProperty('type')
    expect(data.error).toHaveProperty('message')
    expect(data.error).toHaveProperty('code')
    expect(data).toHaveProperty('timestamp')
    expect(data).toHaveProperty('requestId')
  })

  it('should rate limit after 5 requests', async () => {
    // Make 6 requests
    const requests = Array(6)
      .fill(null)
      .map(() =>
        fetch('http://localhost:3000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'test@test.com', password: 'pass' }),
        })
      )

    const responses = await Promise.all(requests)
    const lastResponse = responses[responses.length - 1]

    expect(lastResponse.status).toBe(429)
  })
})
```

---

## Common Issues & Solutions

### Issue 1: TypeScript Error - Cannot find module

**Error:**

```
Cannot find module '@/lib/middleware' or its corresponding type declarations
```

**Solution:**

```bash
# Check the file exists
ls src/lib/middleware/index.ts

# If missing, create it or check import path
```

### Issue 2: Rate Limiting Not Working

**Symptoms:** All requests succeed, no 429 errors

**Check:**

1. Is middleware applied? Look for: `export const POST = withRateLimit(...)`
2. Is rate-limit.ts properly configured?
3. Check console for rate limiter errors

### Issue 3: Module-Level Crash

**Error:**

```
Error: Missing Supabase environment variables
```

**Solution:**

- Move initialization inside route handler
- Add `isServiceConfigured()` check
- See `affiliate/apply/route.ts` for example

### Issue 4: Logs Not Structured

**Symptom:** Still seeing `console.log()` output

**Solution:**

- Replace all `console.log()` with `logger.info()`
- Replace all `console.error()` with `logger.error()`
- Import logger: `import { logger } from '@/lib/logger'`

---

## Testing Checklist Summary

### Migrated Endpoints Verification

| Endpoint                    | Rate Limit | Error Format | Logging   | Config Check | Status |
| --------------------------- | ---------- | ------------ | --------- | ------------ | ------ |
| `/api/auth/register`        | ✅ 5/min   | ✅ Std       | ✅ Struct | ✅ Yes       | ✅     |
| `/api/auth/login`           | ✅ 5/min   | ✅ Std       | ✅ Struct | ✅ Yes       | ✅     |
| `/api/auth/forgot-password` | ✅ 3/min   | ✅ Std       | ✅ Struct | ✅ Yes       | ✅     |
| `/api/contact`              | ✅ 3/min   | ✅ Std       | ✅ Struct | ✅ Yes       | ✅     |
| `/api/affiliate/apply`      | ⏳         | ✅ Std       | ✅ Struct | ✅ Yes       | ✅     |
| `/api/payment/webhook`      | ⏳         | ✅ Std       | ✅ Struct | ✅ Yes       | ✅     |

---

## Production Deployment Checklist

Before deploying to production:

- [ ] All tests pass
- [ ] TypeScript compiles without errors
- [ ] Build succeeds
- [ ] Environment variables configured in production
- [ ] Rate limiting tested and working
- [ ] Error logs verified (no sensitive data)
- [ ] Monitoring endpoint working (`/api/monitoring/events`)
- [ ] Database errors safely handled
- [ ] No module-level crashes

---

## Quick Validation Commands

```bash
# 1. Type check
npm run typecheck

# 2. Build
npm run build

# 3. Start dev server
npm run dev

# 4. Quick API test
curl http://localhost:3000/api/contact \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","message":"Test"}'

# 5. Rate limit test (run 5 times quickly)
for i in {1..5}; do curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","message":"Test"}' \
  -w " - Status: %{http_code}\n"; done
```

---

## Expected Test Results

### ✅ All Tests Pass

```
TypeScript Check: ✓ No errors
Build: ✓ Compiled successfully
Dev Server: ✓ Started without crashes
API Endpoints: ✓ All returning standardized errors
Rate Limiting: ✓ Working (429 after limit)
Logging: ✓ Structured format
Database Errors: ✓ No schema leakage
Configuration Errors: ✓ Graceful handling
```

### Next Steps After Testing

1. ✅ Mark endpoints as tested in migration guide
2. ✅ Document any issues found
3. ✅ Deploy to staging environment
4. ✅ Monitor production logs
5. ✅ Set up alerting (optional but recommended)

---

## Need Help?

**Common Resources:**

- Migration Guide: `ERROR_HANDLING_MIGRATION_GUIDE.md`
- Implementation Summary: `ERROR_HANDLING_IMPLEMENTATION_SUMMARY.md`
- Middleware Examples: `src/lib/middleware/index.ts`
- Error Handler Reference: `src/lib/error-handler.ts`

**Testing Tips:**

1. Test one endpoint at a time
2. Check both success and error cases
3. Verify rate limiting separately
4. Use browser DevTools Network tab
5. Check server logs in terminal

---

**Happy Testing! 🚀**
