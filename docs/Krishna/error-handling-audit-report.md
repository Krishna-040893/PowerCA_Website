# Next.js Error Handling & Monitoring Audit Report

**Project:** PowerCA Website V7
**Date:** 2026-02-21
**Auditor:** Claude Code

---

## Executive Summary

PowerCA has a **well-structured error handling architecture** with global error boundaries, custom React ErrorBoundary components, API error utilities, and form-level error management. However, the audit found **64+ issues** across API routes and frontend components where these utilities are not consistently applied.

| Severity | Count | Description                                     |
| -------- | ----- | ----------------------------------------------- |
| Critical | 5     | Data loss risk, crashes, unvalidated inputs     |
| High     | 12    | Features broken on error, missing user feedback |
| Medium   | 25    | Poor UX, generic messages, silent failures      |
| Low      | 3     | Missing analytics, minor enhancements           |

---

## 1. React Error Boundaries Implementation

### Status: IMPLEMENTED

| File                                | Status  | Purpose                            |
| ----------------------------------- | ------- | ---------------------------------- |
| `src/app/error.tsx`                 | Present | App-wide error UI with recovery    |
| `src/app/global-error.tsx`          | Present | Catastrophic error fallback        |
| `src/app/not-found.tsx`             | Present | SEO-optimized 404 page             |
| `src/components/error-boundary.tsx` | Present | Custom React ErrorBoundary class   |
| `src/app/layout.tsx`                | Present | GlobalErrorBoundary wraps children |

**Strengths:**

- Three-level error boundary system (component/page/global)
- Unique error ID generation for support tickets
- Google Analytics integration with `gtag()` tracking
- Development mode shows stack traces
- 20 comprehensive test cases in `__tests__/error-boundary.test.tsx`

**Missing Route-Segment Boundaries:**

- `src/app/admin/error.tsx` — Not critical (global catches)
- `src/app/checkout/error.tsx` — Recommended for payment flows
- `src/app/payment-success/error.tsx` — Recommended for payment status
- `src/app/affiliate/error.tsx` — Not critical

---

## 2. API Route Error Handling

### Issue: Unvalidated JSON.parse() in Blog Route

**Severity**: Critical
**Category**: API
**File(s)**: `src/app/api/admin/blog/route.ts` (Lines 130-132, 209-211)
**User Impact**: Admin cannot save blog posts with malformed JSON data. Server returns generic 500.

**Current Implementation**:

```typescript
// No try-catch around JSON.parse
const parsedDocuments = JSON.parse(documents)
const parsedKeyDates = JSON.parse(keyDates)
const parsedSidebarSummary = JSON.parse(sidebarSummary)
```

**Recommended Fix**: Wrap each JSON.parse in try-catch, return 400 with specific field error.

---

### Issue: Unvalidated JSON.parse of Request Header

**Severity**: High
**Category**: API
**File(s)**: `src/app/api/payment/verify/route.ts` (Line ~88)
**User Impact**: Payment verification crashes if `x-user-data` header contains invalid JSON.

**Current Implementation**:

```typescript
JSON.parse(userData) // No try-catch
```

**Recommended Fix**: Wrap in try-catch, use default values on parse failure.

---

### Issue: console.error() Used Instead of logger.error()

**Severity**: High
**Category**: API Logging
**File(s)**: 7 API route files, 14+ instances
**User Impact**: Errors invisible to centralized logging/monitoring in production.

**Files affected:**

- `src/app/api/coupon/validate/route.ts` (Line 81)
- `src/app/api/coupon/use/route.ts` (Line 55)
- `src/app/api/affiliate/referral-details/route.ts` (Lines 48, 169)
- `src/app/api/admin/blog/route.ts` (Lines 46, 59, 138, 151, 221, 234, 279, 308, 320)
- `src/app/api/admin/agreements/route.ts` (Lines 32, 37, 86)
- `src/app/api/admin/agreements/download/route.ts` (Lines 45, 49)
- `src/app/api/admin/agreements/upload-company-signed/route.ts` (Lines 77, 91, 101)

---

### Issue: Payment Order Insert Continues on Error

**Severity**: High
**Category**: API / Payment
**File(s)**: `src/app/api/payment/create-order/route.ts` (Lines 203-225)
**User Impact**: Payment order insert error is logged but processing continues. Payment records missing from database, making invoices unrecoverable.

---

### Issue: Race Condition in Coupon Usage

**Severity**: Medium
**Category**: API
**File(s)**: `src/app/api/coupon/use/route.ts` (Lines 24-50)
**User Impact**: If RPC fails and fallback runs, concurrent requests may increment usage multiple times.

---

### Issue: Missing Error Checks After Supabase Queries

**Severity**: Medium
**Category**: API
**File(s)**:

- `src/app/api/user/data/route.ts` (Lines 27-75)
- `src/app/api/affiliate/referral-details/route.ts` (Lines 41-53)
  **User Impact**: Supabase errors logged but code continues assuming data exists, causing null reference errors downstream.

---

### Issue: Generic Error Responses Without Context

**Severity**: Medium
**Category**: API
**File(s)**:

- `src/app/api/admin/affiliate-payments/route.ts` (Line 414)
- `src/app/api/admin/affiliate-referrals/route.ts` (Lines 434, 680, 730)
  **User Impact**: `{ error: 'Internal server error' }` provides no debugging context for admins.

---

## 3. Client-Side Error Handling

### Issue: Checkout Page — Missing response.ok Checks

**Severity**: Critical
**Category**: Client / Payment
**File(s)**: `src/app/checkout/page.tsx` (Lines 298-354, 447-489)
**User Impact**: HTTP errors from referral validation, address fetching, and pricing endpoints are silently ignored. Invalid affiliate links may appear valid.

**Pattern found across 6+ fetch calls:**

```typescript
const response = await fetch('/api/...')
const result = await response.json()
// Missing: if (!response.ok) { ... }
if (result.success) { ... }
```

---

### Issue: Affiliate Profile — Silent Catch Blocks

**Severity**: High
**Category**: Client
**File(s)**: `src/app/affiliate/profile/page.tsx` (Lines 148-167)
**User Impact**: Data fetching fails silently — loading spinner disappears, page shows empty state with no error message.

**Current Implementation**:

```typescript
catch (error) {
  console.error('Error fetching affiliate data:', error)
}
```

---

### Issue: Payment Success — No Logging for Failed Verification

**Severity**: High
**Category**: Client / Payment
**File(s)**: `src/app/payment-success/page.tsx` (Lines 165-170)
**User Impact**: Payment verification failures are not logged — critical debugging data lost.

---

### Issue: Alert() Used Instead of Toast

**Severity**: Medium
**Category**: Client UX
**File(s)**:

- `src/app/payment-success/page.tsx` (Line 213) — Receipt download error
- `src/app/affiliate/profile/page.tsx` (Lines 207-209) — Profile save error
  **User Impact**: `alert()` blocks UI interaction. Should use `toast.error()` for non-blocking feedback.

---

### Issue: Affiliate Register — Double Submission Possible

**Severity**: Medium
**Category**: Client / Forms
**File(s)**: `src/app/affiliate-register/page.tsx`
**User Impact**: Form fields don't disable during submission, allowing duplicate registrations.

---

### Issue: Login Page — Infinite Retry Risk

**Severity**: Medium
**Category**: Client
**File(s)**: `src/app/(auth)/login/page.tsx` (Lines 76-94)
**User Impact**: Session fetch inside retry loop has no error handling — network error could cause infinite retry loop.

---

### Issue: Affiliate Referral — Silent Catch Blocks

**Severity**: Medium
**Category**: Client
**File(s)**: `src/app/affiliate/referral/page.tsx` (Lines 54-65, 118-120, 243-250)
**User Impact**: Referral details and status fetches fail silently. Non-JSON responses cause confusing errors.

---

### Issue: Account Page — Multiple Silent Failures

**Severity**: High
**Category**: Client
**File(s)**: `src/app/account/page.tsx`
**User Impact**: Address operations, subscription fetching, and agreement loading use console.error without user-facing feedback.

---

## 4. Error Handling Infrastructure (Existing)

### Well-Implemented Systems

| System                     | File                                        | Status                                      |
| -------------------------- | ------------------------------------------- | ------------------------------------------- |
| Error Type Enum            | `src/lib/error-handler.ts`                  | 10 error types defined                      |
| Standardized API Responses | `src/lib/error-handler.ts`                  | `createErrorResponse()` with request IDs    |
| Database Error Handler     | `src/lib/error-handler.ts`                  | `handleDatabaseError()` prevents data leaks |
| Config Error Handler       | `src/lib/error-handler.ts`                  | `handleConfigurationError()` env-aware      |
| API Middleware Wrapper     | `src/lib/middleware/with-error-handling.ts` | `withErrorHandling()` auto try-catch        |
| Request Validation         | `src/lib/middleware/with-error-handling.ts` | `withValidation()` for JSON parsing         |
| Form Error Hook            | `src/hooks/use-form-with-error-handling.ts` | Field validation, persistence, debounce     |
| Logger Utility             | `src/lib/logger.ts`                         | Centralized logging                         |

**Key Problem:** These utilities exist but are **not consistently used** across all routes and components.

---

## 5. Summary by Category

### API Routes (35+ issues)

| Category                        | Count                   | Severity |
| ------------------------------- | ----------------------- | -------- |
| console.error instead of logger | 14 instances in 7 files | High     |
| Unvalidated JSON.parse()        | 6 instances in 2 files  | Critical |
| Missing Supabase error checks   | 3 instances in 2 files  | Medium   |
| Generic error responses         | 7+ instances in 3 files | Medium   |
| Missing try-catch around async  | 5 instances in 5 files  | Medium   |

### Frontend Pages (29+ issues)

| Category                                 | Count               | Severity      |
| ---------------------------------------- | ------------------- | ------------- |
| Missing response.ok checks               | ~70% of fetch calls | Critical-High |
| Silent catch blocks (console.error only) | 8+ instances        | High          |
| alert() instead of toast                 | 2 instances         | Medium        |
| Missing loading state disabling          | 2 instances         | Medium        |
| Missing error states in UI               | 6+ instances        | Medium        |

---

## 6. Priority Recommendations

### Critical (Fix Immediately)

1. **Add try-catch around JSON.parse() in blog API** — Prevents server crashes
2. **Add response.ok checks to checkout page fetch calls** — Payment flow integrity
3. **Wrap payment verify header JSON.parse in try-catch** — Payment flow reliability

### High (Fix Soon)

4. **Replace all console.error with logger.error** — 14 instances across 7 API files
5. **Add user-facing error messages to affiliate profile/referral pages** — Replace silent catches
6. **Add error feedback to account page operations** — Users need to know when saves fail
7. **Replace alert() with toast.error()** — Better UX

### Medium (Plan to Fix)

8. **Add route-segment error.tsx for checkout and payment-success** — Better isolation for payment flows
9. **Standardize error handling patterns** — Use existing `createErrorResponse()` everywhere
10. **Add form field disabling during submissions** — Prevent double submissions
11. **Add loading.tsx files for slow routes** — Better UX during data loading

### Low (Nice to Have)

12. **Add Sentry/DataDog integration** — Currently only GA tracking
13. **Add retry logic for transient API failures** — Network resilience
14. **Add offline detection and messaging** — PWA consideration

---

## 7. Questions Answered

| Question                                     | Answer                                                                                        |
| -------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Are error boundaries implemented globally?   | Yes — global + custom React ErrorBoundary                                                     |
| Do all API calls have proper error handling? | No — ~30% of routes lack consistent handling                                                  |
| Are errors logged to a monitoring service?   | Partially — GA tracking active, logger utility exists but console.error still used in 7 files |
| Do forms preserve data on submission errors? | Yes — `use-form-with-error-handling` hook supports this, but not all forms use it             |
| Are network failures handled gracefully?     | Partially — Many catch blocks are silent                                                      |
| Do users receive helpful error messages?     | Inconsistent — Mix of toast, alert, console.error, and nothing                                |
| Are there retry mechanisms?                  | No — No automatic retry logic implemented                                                     |
| Is there offline support?                    | No — No offline detection or service worker                                                   |
| Are loading states shown?                    | Partially — Most pages have loading states, missing loading.tsx files                         |
| Are custom error pages informative?          | Yes — error.tsx, global-error.tsx, and not-found.tsx are well-designed                        |

---

_End of Audit Report_
