# PowerCA Error Handling Migration Guide

## Overview

This guide helps you migrate existing API routes to use the new standardized error handling, rate limiting, and validation middleware.

**Generated:** 2025-03-11
**Status:** Implementation Ready

---

## What's New

### 1. Middleware Functions

Three new middleware wrappers have been created in `src/lib/middleware/`:

- **`withErrorHandling`** - Automatic error catching and standardized responses
- **`withRateLimit`** - Easy rate limiting for any endpoint
- **`withZodValidation`** - Type-safe validation using Zod schemas

### 2. Critical Fixes Applied

✅ **Fixed Issues:**

- Module-level crash in `affiliate/apply/route.ts` (moved Supabase init to route handler)
- Exposed database errors now use `handleDatabaseError()`
- Silent payment failures now have comprehensive logging
- Monitoring endpoint already exists and is well-implemented
- Created reusable middleware for all endpoints

---

## Quick Migration Examples

### Before: Basic Error Handling

```typescript
// ❌ OLD WAY - Inconsistent error handling
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const result = await someOperation(body)
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
```

### After: Standardized Error Handling

```typescript
// ✅ NEW WAY - Automatic error handling
import { withErrorHandling } from '@/lib/middleware'

export const POST = withErrorHandling(
  async (req: NextRequest) => {
    const body = await req.json()
    const result = await someOperation(body)
    return NextResponse.json({ success: true, data: result })
  },
  { routeName: 'My API Route' }
)
```

---

## Migration Steps

### Step 1: Add Rate Limiting

**When:** Public-facing endpoints (auth, contact, payment, booking)

```typescript
import { withRateLimit, RateLimits } from '@/lib/middleware'

// Before
export async function POST(req: NextRequest) {
  // ... your handler code
}

// After
export const POST = withRateLimit(async (req: NextRequest) => {
  // ... your handler code
}, RateLimits.AUTH) // 5 requests per minute
```

**Rate Limit Presets:**

- `RateLimits.STRICT` (3/min) - Sensitive operations
- `RateLimits.AUTH` (5/min) - Auth & contact forms
- `RateLimits.STANDARD` (10/min) - Most endpoints
- `RateLimits.RELAXED` (30/min) - Read operations
- `RateLimits.ADMIN` (100/min) - Admin operations

### Step 2: Replace Database Error Handling

```typescript
// ❌ OLD WAY - Exposes schema
if (error) {
  return NextResponse.json({ error: error.message, code: error.code }, { status: 500 })
}

// ✅ NEW WAY - Safe error handling
import { handleDatabaseError } from '@/lib/error-handler'

if (error) {
  return handleDatabaseError(error)
}
```

### Step 3: Replace Console Logs

```typescript
// ❌ OLD WAY - Console logs
console.log('Success:', result)
console.error('Error:', error)

// ✅ NEW WAY - Structured logging
import { logger } from '@/lib/logger'

logger.info('Operation successful', { resultId: result.id })
logger.error('Operation failed', error, { userId: user.id })
```

### Step 4: Add Input Validation

```typescript
import { withZodValidation, CommonSchemas } from '@/lib/middleware'
import { z } from 'zod'

// Define schema
const MySchema = z.object({
  email: CommonSchemas.email,
  phone: CommonSchemas.phone,
  message: z.string().min(10).max(500),
})

// Apply validation
export const POST = withZodValidation(
  MySchema,
  async (req, validatedData) => {
    // validatedData is fully typed!
    const { email, phone, message } = validatedData
    // ... your logic
    return NextResponse.json({ success: true })
  },
  { routeName: 'Contact Form' }
)
```

### Step 5: Combine Multiple Middleware

```typescript
import {
  withMiddleware,
  withRateLimit,
  withErrorHandling,
  withZodValidation,
  RateLimits,
  CommonSchemas,
} from '@/lib/middleware'
import { z } from 'zod'

const LoginSchema = z.object({
  email: CommonSchemas.email,
  password: z.string().min(8),
})

// Handler with all protections
const handler = async (req: NextRequest, validatedData: z.infer<typeof LoginSchema>) => {
  const { email, password } = validatedData
  // ... authentication logic
  return NextResponse.json({ success: true })
}

// Apply all middleware
export const POST = withMiddleware(
  (req, ...args) => withZodValidation(LoginSchema, handler)(req),
  (h) => withRateLimit(h, RateLimits.AUTH),
  (h) => withErrorHandling(h, { routeName: 'Auth Login' })
)
```

---

## Priority Endpoints to Migrate

### 🔥 Critical Priority (Immediate)

Already fixed:

- ✅ `src/app/api/affiliate/apply/route.ts` - Module-level crash fixed
- ✅ `src/app/api/payment/webhook/route.ts` - Logging added
- ✅ `src/app/api/payment/cashfree/webhook/route.ts` - Logging added

### 📋 High Priority (This Week)

**Auth Endpoints** (Add RateLimits.AUTH):

```typescript
// Template for all auth endpoints
import { withRateLimit, withErrorHandling, RateLimits } from '@/lib/middleware'

const handler = async (req: NextRequest) => {
  // ... your auth logic
}

export const POST = withMiddleware(
  handler,
  (h) => withRateLimit(h, RateLimits.AUTH),
  (h) => withErrorHandling(h, { routeName: 'Auth Login' })
)
```

Apply to:

- [x] `src/app/api/auth/register/route.ts` - ✅ Completed
- [x] `src/app/api/auth/forgot-password/route.ts` - ✅ Completed (Fixed module-level crash)
- [x] `src/app/api/auth/reset-password/route.ts` - ✅ Completed (Fixed module-level crash)

**Contact & Forms** (Add RateLimits.STRICT):

- [x] `src/app/api/contact/route.ts` - ✅ Completed (Fixed module-level crash)
- [x] `src/app/api/newsletter/subscribe/route.ts` - ✅ Completed (Fixed module-level crash)
- [x] `src/app/api/bookings/route.ts` - ✅ Completed (Added rate limiting to both POST and GET)
- [ ] `src/app/api/registrations/route.ts`

**Payment Endpoints** (Add RateLimits.STANDARD):

- [ ] `src/app/api/payment/create-order/route.ts`
- [ ] `src/app/api/payment/verify/route.ts`
- [ ] `src/app/api/payment/cashfree/create-order/route.ts`

### 📌 Medium Priority (Next Week)

**Admin Endpoints** (Add RateLimits.ADMIN):

- [ ] All routes in `src/app/api/admin/`

**Affiliate Endpoints** (Add RateLimits.STANDARD):

- [ ] `src/app/api/affiliate/profile/route.ts`
- [ ] `src/app/api/affiliate/create-referral/route.ts`
- [ ] `src/app/api/affiliate/track-referral/route.ts`

---

## Common Schema Validations

The middleware includes ready-to-use validators:

```typescript
import { CommonSchemas } from '@/lib/middleware'

// Email validation
email: CommonSchemas.email

// Indian phone number (10 digits)
phone: CommonSchemas.phone

// PAN number (ABCDE1234F)
pan: CommonSchemas.pan

// GST number (15 characters)
gst: CommonSchemas.gst

// IFSC code (11 characters)
ifsc: CommonSchemas.ifsc

// URL validation
website: CommonSchemas.url

// Amount in rupees
amount: CommonSchemas.amount
```

### Complete Example: Affiliate Registration

```typescript
import { withZodValidation, CommonSchemas } from '@/lib/middleware'
import { z } from 'zod'

const AffiliateSchema = z.object({
  fullName: z.string().min(2),
  email: CommonSchemas.email,
  phone: CommonSchemas.phone,
  password: z.string().min(8),
  city: z.string().min(2),
  state: z.string().min(2),
  businessType: z.enum(['individual', 'company']).optional(),
  promotionMethod: z.string().min(10),
  targetAudience: z.string().min(10),
  panNumber: CommonSchemas.pan.optional(),
  gstNumber: CommonSchemas.gst.optional(),
})

export const POST = withZodValidation(
  AffiliateSchema,
  async (req, data) => {
    // All fields are validated and typed!
    // ... registration logic
    return NextResponse.json({ success: true })
  },
  { routeName: 'Affiliate Registration' }
)
```

---

## Error Handler Utilities Reference

### Available Functions

```typescript
import {
  createErrorResponse,
  handleConfigurationError,
  handleDatabaseError,
  handleValidationError,
  isServiceConfigured,
  ErrorType,
} from '@/lib/error-handler'

// Check if service is configured
if (!isServiceConfigured('RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET')) {
  return handleConfigurationError('Payment gateway')
}

// Handle database errors safely
if (dbError) {
  return handleDatabaseError(dbError)
}

// Handle validation errors
if (!email || !password) {
  return handleValidationError(['Email and password are required'])
}

// Create custom error response
return createErrorResponse(ErrorType.AUTHENTICATION, 'Invalid credentials', { statusCode: 401 })
```

### Error Types

```typescript
enum ErrorType {
  VALIDATION = 'VALIDATION_ERROR',
  AUTHENTICATION = 'AUTHENTICATION_ERROR',
  AUTHORIZATION = 'AUTHORIZATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  RATE_LIMIT = 'RATE_LIMIT_ERROR',
  DATABASE = 'DATABASE_ERROR',
  PAYMENT = 'PAYMENT_ERROR',
  EXTERNAL_SERVICE = 'EXTERNAL_SERVICE_ERROR',
  CONFIGURATION = 'CONFIGURATION_ERROR',
  INTERNAL = 'INTERNAL_ERROR',
}
```

---

## Testing Your Changes

### 1. Test Error Scenarios

```bash
# Test validation errors
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name": "A"}' # Too short

# Test rate limiting
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/contact \
    -H "Content-Type: application/json" \
    -d '{"name": "Test", "email": "test@example.com", "message": "Test message"}'
done
```

### 2. Check Logs

```typescript
// Logs should now be structured
import { logger } from '@/lib/logger'

logger.info('User logged in', { userId: user.id, email: user.email })
logger.error('Payment failed', error, { orderId, amount })
```

### 3. Verify Error Responses

All errors should follow this format:

```json
{
  "success": false,
  "error": {
    "type": "VALIDATION_ERROR",
    "message": "Invalid input provided",
    "code": "VALIDATION_ERROR",
    "details": {
      "errors": ["Email is required", "Password must be at least 8 characters"]
    }
  },
  "timestamp": "2025-03-11T10:30:00.000Z",
  "requestId": "req_1234567890_abc123"
}
```

---

## Rollback Plan

If you need to revert changes:

1. **Keep the middleware files** - They won't affect existing routes
2. **Revert individual routes** - Each route can be reverted independently
3. **Old code still works** - Existing error handling continues to function

---

## Benefits of Migration

✅ **Security:**

- No database schema leakage
- No sensitive data in error responses
- Automatic PII redaction in logs

✅ **Consistency:**

- Standardized error format across all endpoints
- Uniform rate limiting
- Predictable API responses

✅ **Observability:**

- Structured logging with context
- Request ID tracking
- Better debugging

✅ **Type Safety:**

- Compile-time validation with Zod
- Autocomplete for validated data
- Fewer runtime errors

✅ **Maintainability:**

- DRY principle - reusable middleware
- Less boilerplate code
- Easier to add new endpoints

---

## Next Steps

1. ✅ Critical fixes applied
2. ✅ Middleware created
3. 📋 Migrate high-priority endpoints (this week)
4. 📋 Migrate medium-priority endpoints (next week)
5. 📋 Add monitoring dashboard
6. 📋 Set up Sentry for production errors

---

## Questions & Support

- **Documentation:** Check `src/lib/middleware/index.ts` for examples
- **Common Schemas:** See `src/lib/middleware/with-zod-validation.ts`
- **Error Types:** Reference `src/lib/error-handler.ts`
- **Rate Limits:** Review `src/lib/middleware/with-rate-limit.ts`

---

## Conclusion

The new error handling infrastructure is production-ready and provides:

- 🔒 Better security through safe error messages
- 📊 Improved observability with structured logging
- ✅ Type-safe validation with Zod
- 🛡️ Protection against API abuse with rate limiting
- 🚀 Easier maintenance and consistency

**Start by migrating your most critical endpoints first!**
