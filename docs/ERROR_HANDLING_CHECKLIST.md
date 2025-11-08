# PowerCA API Error Handling - Implementation Checklist

## Executive Summary

**Total API Routes:** 85
**Using Best Practices:** 13 (15.3%) ✅
**Need Improvement:** 72 (84.7%) ⚠️
**Estimated Effort:** 70-90 hours over 4-5 weeks

---

## ✅ Checklist Format

Each endpoint category has a checkbox list with:

- **File path** - Absolute path to the route file
- **Status** - Current error handling status (✅ Good / ⚠️ Needs Work / ❌ Critical)
- **Priority** - Implementation priority (P0-P3)
- **Effort** - Estimated hours to fix

---

## 🚨 CRITICAL ISSUES (Fix Immediately - P0)

### 1. Module-Level Crash (P0 - 2 hours)

- [ ] **`src/app/api/affiliate/apply/route.ts`** ❌
  - **Issue:** Throws error at module import if env vars missing
  - **Impact:** Entire endpoint crashes, affects all requests
  - **Fix:** Move Supabase init to route handler, use `handleConfigurationError()`
  - **Lines:** 9-11

### 2. Exposed Database Schema (P0 - 4 hours)

- [ ] **`src/app/api/affiliate/apply/route.ts`** ❌ (Lines 59, 76, 95)
- [ ] **`src/app/api/affiliate/profile/route.ts`** ❌ (Lines 37, 55)
- [ ] **`src/app/api/affiliate/create-referral/route.ts`** ❌ (Lines 74, 90)
- [ ] **`src/app/api/admin/affiliates/route.ts`** ❌ (Line 71)
  - **Issue:** Returns `error.message` and `error.code` from Supabase
  - **Impact:** Exposes table names, column names, constraints
  - **Fix:** Use `handleDatabaseError()` utility

### 3. Silent Payment Failures (P0 - 2 hours)

- [ ] **`src/app/api/payment/webhook/route.ts`** ❌ (Lines 45-50)
- [ ] **`src/app/api/payment/cashfree/webhook/route.ts`** ❌ (Lines 80-85)
  - **Issue:** Errors caught but not logged, payment processing fails silently
  - **Impact:** Lost revenue, no audit trail
  - **Fix:** Add proper error logging with `logger.error()`

---

## 🔥 HIGH PRIORITY (Week 1-2 - P1)

### 4. Missing Rate Limiting (P1 - 15 hours)

**Only 1 endpoint has rate limiting!** Need to add to all public-facing endpoints.

#### Admin Endpoints (15 endpoints)

- [ ] **`src/app/api/admin/affiliates/route.ts`** ⚠️
- [ ] **`src/app/api/admin/affiliates/list/route.ts`** ⚠️
- [ ] **`src/app/api/admin/bookings/route.ts`** ⚠️
- [ ] **`src/app/api/admin/bookings/[id]/route.ts`** ⚠️
- [ ] **`src/app/api/admin/users/route.ts`** ⚠️
- [ ] **`src/app/api/admin/users/[id]/route.ts`** ⚠️
- [ ] **`src/app/api/admin/payments/route.ts`** ⚠️
- [ ] **`src/app/api/admin/payment-orders/route.ts`** ⚠️
- [ ] **`src/app/api/admin/referrals/list/route.ts`** ⚠️
- [ ] **`src/app/api/admin/promote-affiliate/route.ts`** ⚠️
- [ ] **`src/app/api/admin/hubspot/contacts/route.ts`** ⚠️
- [ ] **`src/app/api/admin/hubspot/status/route.ts`** ⚠️
- [ ] **`src/app/api/admin/hubspot/bulk-sync/route.ts`** ⚠️
- [ ] **`src/app/api/admin/counts/route.ts`** ⚠️
- [ ] **`src/app/api/admin/blog/route.ts`** ⚠️

#### Payment Endpoints (5 endpoints)

- [ ] **`src/app/api/payment/create-order/route.ts`** ⚠️
- [ ] **`src/app/api/payment/verify/route.ts`** ⚠️
- [ ] **`src/app/api/payment/cashfree/create-order/route.ts`** ⚠️
- [ ] **`src/app/api/payment/webhook/route.ts`** ⚠️
- [ ] **`src/app/api/payment/cashfree/webhook/route.ts`** ⚠️

#### Public API Endpoints (10 endpoints)

- [ ] **`src/app/api/contact/route.ts`** ⚠️
- [ ] **`src/app/api/newsletter/subscribe/route.ts`** ⚠️
- [ ] **`src/app/api/bookings/route.ts`** ⚠️
- [ ] **`src/app/api/registrations/route.ts`** ⚠️
- [ ] **`src/app/api/affiliate/apply/route.ts`** ⚠️
- [ ] **`src/app/api/affiliate/track-referral/route.ts`** ⚠️
- [ ] **`src/app/api/auth/register/route.ts`** ⚠️
- [ ] **`src/app/api/auth/forgot-password/route.ts`** ⚠️
- [ ] **`src/app/api/auth/reset-password/route.ts`** ⚠️
- [ ] **`src/app/api/email/route.ts`** ⚠️

### 5. Inconsistent Admin Authentication (P1 - 8 hours)

Some admin endpoints use different auth methods. Standardize all.

- [ ] **`src/app/api/admin/affiliates/route.ts`** ⚠️ (Custom auth - Line 15)
- [ ] **`src/app/api/admin/payment-orders/route.ts`** ⚠️ (No auth check!)
- [ ] **`src/app/api/admin/clear-test-data/route.ts`** ⚠️ (No auth check!)
- [ ] **`src/app/api/admin/test-referrals/route.ts`** ⚠️ (No auth check!)
- [ ] **`src/app/api/admin/test-payments/route.ts`** ⚠️ (No auth check!)
- [ ] **`src/app/api/admin/newsletter-subscribers/route.ts`** ⚠️ (No auth check!)
- [ ] **`src/app/api/admin/payments/sync-status/route.ts`** ⚠️ (No auth check!)
- [ ] **`src/app/api/admin/affiliate-payments/route.ts`** ⚠️ (No auth check!)
- [ ] **`src/app/api/admin/affiliate-referrals/route.ts`** ⚠️ (No auth check!)

**Fix:** Create centralized admin auth middleware, use in all admin routes.

---

## 📋 MEDIUM PRIORITY (Week 2-3 - P2)

### 6. Missing Input Validation (P2 - 20 hours)

40 endpoints lack proper input validation. Need to add schema validation.

#### Affiliate Endpoints (13 endpoints - 6 hours)

- [ ] **`src/app/api/affiliate/apply/route.ts`** ⚠️
- [ ] **`src/app/api/affiliate/create-referral/route.ts`** ⚠️
- [ ] **`src/app/api/affiliate/profile/route.ts`** ⚠️
- [ ] **`src/app/api/affiliate/track-referral/route.ts`** ⚠️
- [ ] **`src/app/api/affiliate/validate-referral/route.ts`** ⚠️
- [ ] **`src/app/api/affiliate/check-referral-limit/route.ts`** ⚠️
- [ ] **`src/app/api/affiliate/referral-status/route.ts`** ⚠️
- [ ] **`src/app/api/affiliate/referrals/route.ts`** ⚠️
- [ ] **`src/app/api/affiliate/referral-details/route.ts`** ⚠️
- [ ] **`src/app/api/affiliate/user-info/route.ts`** ⚠️
- [ ] **`src/app/api/affiliate/details/route.ts`** ⚠️
- [ ] **`src/app/api/affiliate/generate-id/route.ts`** ⚠️
- [ ] **`src/app/api/affiliate/next-customer-id/route.ts`** ⚠️

#### User/Profile Endpoints (5 endpoints - 2 hours)

- [ ] **`src/app/api/user/data/route.ts`** ⚠️
- [ ] **`src/app/api/user/delete/route.ts`** ⚠️
- [ ] **`src/app/api/user/profile-photo/route.ts`** ⚠️
- [ ] **`src/app/api/user/billing/route.ts`** ⚠️
- [ ] **`src/app/api/user/referral-info/route.ts`** ⚠️

#### Form Submissions (5 endpoints - 3 hours)

- [ ] **`src/app/api/contact/route.ts`** ⚠️
- [ ] **`src/app/api/newsletter/subscribe/route.ts`** ⚠️
- [ ] **`src/app/api/bookings/route.ts`** ⚠️
- [ ] **`src/app/api/registrations/route.ts`** ⚠️
- [ ] **`src/app/api/email/route.ts`** ⚠️

#### Admin Actions (8 endpoints - 4 hours)

- [ ] **`src/app/api/admin/affiliates/route.ts`** ⚠️
- [ ] **`src/app/api/admin/bookings/[id]/route.ts`** ⚠️
- [ ] **`src/app/api/admin/users/[id]/route.ts`** ⚠️
- [ ] **`src/app/api/admin/promote-affiliate/route.ts`** ⚠️
- [ ] **`src/app/api/admin/hubspot/contacts/route.ts`** ⚠️
- [ ] **`src/app/api/admin/hubspot/bulk-sync/route.ts`** ⚠️
- [ ] **`src/app/api/admin/blog/route.ts`** ⚠️
- [ ] **`src/app/api/admin/clear-test-data/route.ts`** ⚠️

#### Subscription/Payment (4 endpoints - 2 hours)

- [ ] **`src/app/api/subscription/create/route.ts`** ⚠️
- [ ] **`src/app/api/subscriptions/status/route.ts`** ⚠️
- [ ] **`src/app/api/payment/create-order/route.ts`** ⚠️ (Partial validation)
- [ ] **`src/app/api/payment/cashfree/create-order/route.ts`** ⚠️ (Partial validation)

#### Other (5 endpoints - 3 hours)

- [ ] **`src/app/api/blog/posts/route.ts`** ⚠️
- [ ] **`src/app/api/blog/posts/[slug]/route.ts`** ⚠️
- [ ] **`src/app/api/invoice/regenerate/[invoiceNumber]/route.ts`** ⚠️
- [ ] **`src/app/api/monitoring/events/route.ts`** ⚠️
- [ ] **`src/app/api/booking/route.ts`** ⚠️

**Fix:** Use Zod or Yup for schema validation, call `handleValidationError()` on failure.

### 7. Unhandled Promise Rejections (P2 - 5 hours)

15 endpoints have async operations without proper error handling.

- [ ] **`src/app/api/affiliate/apply/route.ts`** ⚠️ (Lines 34-40, 68-73)
- [ ] **`src/app/api/admin/hubspot/contacts/route.ts`** ⚠️ (Line 85)
- [ ] **`src/app/api/admin/hubspot/bulk-sync/route.ts`** ⚠️ (Line 45)
- [ ] **`src/app/api/payment/verify/route.ts`** ⚠️ (Email send - Line 120)
- [ ] **`src/app/api/email/route.ts`** ⚠️ (Resend API - Line 45)
- [ ] **`src/app/api/contact/route.ts`** ⚠️ (Email send - Line 60)
- [ ] **`src/app/api/bookings/route.ts`** ⚠️ (Database insert - Line 50)
- [ ] **`src/app/api/registrations/route.ts`** ⚠️ (Database insert - Line 45)
- [ ] **`src/app/api/newsletter/subscribe/route.ts`** ⚠️ (Database insert - Line 35)
- [ ] **`src/app/api/user/profile-photo/route.ts`** ⚠️ (File upload - Line 55)
- [ ] **`src/app/api/invoice/regenerate/[invoiceNumber]/route.ts`** ⚠️ (PDF generation - Line 70)
- [ ] **`src/app/api/subscription/create/route.ts`** ⚠️ (Payment API - Line 80)
- [ ] **`src/app/api/subscriptions/check-renewal-eligibility/route.ts`** ⚠️ (Bulk operations - Line 95)
- [ ] **`src/app/api/admin/clear-test-data/route.ts`** ⚠️ (Multiple deletes - Lines 30-50)
- [ ] **`src/app/api/blog/posts/route.ts`** ⚠️ (Database query - Line 40)

**Fix:** Add `.catch()` handlers or wrap in try-catch, use `createErrorResponse()`.

---

## 📌 LOW PRIORITY (Week 4+ - P3)

### 8. Missing Request ID Tracking (P3 - 10 hours)

70+ endpoints don't use request IDs for debugging.

**Fix:** All endpoints should use the error-handler which automatically adds request IDs.

### 9. Inconsistent Error Messages (P3 - 5 hours)

Some endpoints return different error formats:

- Some return `{ error: "message" }`
- Some return `{ success: false, message: "..." }`
- Some return `{ error: { message: "..." } }`

**Fix:** Standardize to error-handler format across all endpoints.

### 10. Missing Error Types (P3 - 5 hours)

Many endpoints use generic try-catch without specific error types:

- [ ] Add `ErrorType.NOT_FOUND` for 404s (23 endpoints)
- [ ] Add `ErrorType.AUTHENTICATION` for auth failures (17 endpoints)
- [ ] Add `ErrorType.AUTHORIZATION` for permission errors (13 endpoints)

---

## 🎯 Implementation Roadmap

### **Phase 1: Critical Fixes (Week 1 - 8 hours)**

**Goal:** Fix crashes and security issues

1. [ ] Fix module-level crash in `affiliate/apply/route.ts` (2 hours)
2. [ ] Fix exposed database errors (4 endpoints, 4 hours)
3. [ ] Fix silent payment failures (2 endpoints, 2 hours)

**Deliverable:** No more crashes, database schema protected

---

### **Phase 2: High Priority (Week 2-3 - 23 hours)**

**Goal:** Add rate limiting and standardize admin auth

1. [ ] Create rate limiting middleware (3 hours)
2. [ ] Add rate limiting to 30 public endpoints (12 hours)
3. [ ] Create admin auth middleware (2 hours)
4. [ ] Standardize admin auth across 20 endpoints (6 hours)

**Deliverable:** Protection against abuse, consistent admin security

---

### **Phase 3: Input Validation (Week 3-4 - 25 hours)**

**Goal:** Validate all user inputs

1. [ ] Set up Zod validation library (1 hour)
2. [ ] Create validation schemas for common types (4 hours)
3. [ ] Add validation to 40 endpoints (20 hours)

**Deliverable:** All user inputs validated, better error messages

---

### **Phase 4: Standardization (Week 4-5 - 25 hours)**

**Goal:** Migrate all endpoints to use error-handler

1. [ ] Fix unhandled promise rejections (15 endpoints, 5 hours)
2. [ ] Migrate 52 custom error handlers to standardized format (20 hours)
3. [ ] Add comprehensive logging and monitoring

**Deliverable:** Consistent error handling, full observability

---

## 📚 Error Handler Utility Reference

### Available Functions

```typescript
// Create standard error response
createErrorResponse(
  type: ErrorType,
  error: Error | string,
  options?: {
    statusCode?: number
    details?: Record<string, unknown>
    requestId?: string
    logError?: boolean
  }
): NextResponse

// Handle configuration errors
handleConfigurationError(service: string): NextResponse

// Handle database errors
handleDatabaseError(error: unknown): NextResponse

// Handle validation errors
handleValidationError(errors: string[] | Record<string, string>): NextResponse

// Require environment variable
requireEnvVar(varName: string, serviceName: string): string

// Check if service is configured
isServiceConfigured(...envVars: string[]): boolean
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

### Standard Response Format

```json
{
  "success": false,
  "error": {
    "type": "VALIDATION_ERROR",
    "message": "Invalid input provided",
    "code": "VALIDATION_ERROR",
    "details": { ... }
  },
  "timestamp": "2025-01-15T10:30:00.000Z",
  "requestId": "req_1234567890_abc123"
}
```

---

## ✅ Example Migrations

### Before (Custom Error Handling)

```typescript
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const result = await supabase.from('users').insert(body)

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
```

### After (Using Error Handler)

```typescript
import { createErrorResponse, handleDatabaseError, ErrorType } from '@/lib/error-handler'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Input validation
    if (!body.email || !body.name) {
      return handleValidationError(['Email and name are required'])
    }

    const result = await supabase.from('users').insert(body)

    if (result.error) {
      return handleDatabaseError(result.error)
    }

    return NextResponse.json({ success: true, data: result.data })
  } catch (error) {
    return createErrorResponse(ErrorType.INTERNAL, error as Error, {
      logError: true,
    })
  }
}
```

---

## 📊 Progress Tracking

### Overall Progress

- [ ] **Phase 1:** Critical Fixes (0/3 tasks)
- [ ] **Phase 2:** High Priority (0/2 milestones)
- [ ] **Phase 3:** Input Validation (0/3 tasks)
- [ ] **Phase 4:** Standardization (0/3 tasks)

### By Category

- [ ] **Critical Issues:** 0/4 fixed
- [ ] **Rate Limiting:** 0/30 endpoints
- [ ] **Admin Auth:** 0/20 endpoints
- [ ] **Input Validation:** 0/40 endpoints
- [ ] **Promise Handling:** 0/15 endpoints
- [ ] **Standardization:** 0/72 endpoints

---

## 🎓 Testing Strategy

After each phase:

1. **Unit Tests:** Test error scenarios for each endpoint
2. **Integration Tests:** Test full error flows
3. **Load Tests:** Verify rate limiting works
4. **Security Audit:** Verify no information leakage
5. **Production Monitoring:** Track error rates with Sentry

---

## 📝 Notes

- This checklist was generated by analyzing 85 API route files
- Priorities are based on security impact and user experience
- Time estimates include testing and documentation
- Some endpoints may need multiple fixes from different categories
- Focus on Phase 1 critical fixes first to prevent production issues

**Generated:** 2025-01-15
**Last Updated:** 2025-01-15
**Status:** Ready for implementation
