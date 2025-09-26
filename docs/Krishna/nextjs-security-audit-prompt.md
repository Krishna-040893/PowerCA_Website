# Next.js Security Audit Prompt for Claude Code

## Instructions for Claude Code

Please conduct a comprehensive security audit of this Next.js application, identifying vulnerabilities, misconfigurations, and security anti-patterns. For each finding, provide the specific file location, vulnerability details, potential attack vectors, and secure implementation examples. Rate each finding by OWASP severity standards.

## 1. Authentication & Authorization Vulnerabilities

### Authentication Issues to Check:
- [ ] Passwords stored in plain text or weak hashing (should use bcrypt/argon2)
- [ ] Missing rate limiting on login attempts
- [ ] Session tokens in localStorage (should be httpOnly cookies)
- [ ] JWT tokens without expiration or weak secrets
- [ ] Missing CSRF token validation
- [ ] Insecure password reset flows
- [ ] Missing account lockout mechanisms
- [ ] OAuth implementation vulnerabilities
- [ ] Missing Multi-Factor Authentication (MFA) options

### Authorization Flaws:
- [ ] Direct Object Reference vulnerabilities (IDOR)
- [ ] Missing role-based access control (RBAC)
- [ ] Client-side only authorization checks
- [ ] API routes without authentication middleware
- [ ] Privilege escalation possibilities
- [ ] Missing ownership validation on resources

### Check in:
```javascript
// Look for patterns like:
- pages/api/**/*.ts without auth checks
- Missing middleware.ts for route protection
- localStorage.setItem('token', ...) 
- Predictable user/resource IDs
- Role checks only in UI components
```

## 2. API Security & Data Validation

### Input Validation Issues:
- [ ] Missing input sanitization on API routes
- [ ] SQL injection vulnerabilities in database queries
- [ ] NoSQL injection risks (MongoDB query injection)
- [ ] Command injection possibilities
- [ ] Path traversal vulnerabilities
- [ ] Missing request body validation (zod/yup)
- [ ] File upload without type/size validation
- [ ] GraphQL query depth/complexity limits missing

### API Security Problems:
- [ ] Missing rate limiting on API endpoints
- [ ] CORS misconfiguration (* origin allowed)
- [ ] Sensitive data in API responses
- [ ] Missing API versioning strategy
- [ ] GraphQL introspection enabled in production
- [ ] REST API exposing internal structure

### Look for:
```javascript
// Dangerous patterns:
const query = `SELECT * FROM users WHERE id = ${userId}`; // SQL injection
await User.find({ $where: userInput }); // NoSQL injection
exec(userCommand); // Command injection
res.setHeader('Access-Control-Allow-Origin', '*'); // CORS issue
```

## 3. Cross-Site Scripting (XSS) Prevention

### XSS Vulnerabilities:
- [ ] dangerouslySetInnerHTML without sanitization
- [ ] User input reflected without escaping
- [ ] JavaScript URLs in href attributes
- [ ] Event handlers with user input
- [ ] SVG files with embedded scripts
- [ ] Markdown rendering without sanitization
- [ ] JSON data rendered as HTML
- [ ] Third-party content without sandboxing

### Check Components for:
```jsx
// Dangerous:
<div dangerouslySetInnerHTML={{ __html: userContent }} />
<a href={userProvidedURL}>Link</a> // If URL is javascript:
<div>{userInput}</div> // If userInput contains HTML

// Safe:
import DOMPurify from 'isomorphic-dompurify';
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userContent) }} />
```

## 4. Security Headers Configuration

### Missing Security Headers:
- [ ] Content Security Policy (CSP)
- [ ] X-Frame-Options (Clickjacking protection)
- [ ] X-Content-Type-Options: nosniff
- [ ] Referrer-Policy
- [ ] Permissions-Policy
- [ ] Strict-Transport-Security (HSTS)
- [ ] X-XSS-Protection (legacy but still useful)
- [ ] Cross-Origin-Embedder-Policy (COEP)
- [ ] Cross-Origin-Opener-Policy (COOP)
- [ ] Cross-Origin-Resource-Policy (CORP)

### Check next.config.js for:
```javascript
// Should include comprehensive headers:
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        {
          key: 'Content-Security-Policy',
          value: "default-src 'self'; script-src 'self' 'unsafe-inline'..."
        },
        {
          key: 'X-Frame-Options',
          value: 'DENY'
        },
        // ... other security headers
      ]
    }
  ]
}
```

## 5. Sensitive Data Exposure

### Client-Side Exposure:
- [ ] API keys in client-side code
- [ ] Database credentials in bundle
- [ ] Internal endpoints exposed
- [ ] Sensitive business logic in client
- [ ] User PII in client state/storage
- [ ] Debug information in production
- [ ] Source maps exposed in production
- [ ] Git history with secrets (.git folder)

### Environment Variables:
- [ ] NEXT_PUBLIC_ prefix misuse for secrets
- [ ] .env files committed to repository
- [ ] Missing .env.example file
- [ ] Production secrets in .env.local
- [ ] Hardcoded secrets in code
- [ ] AWS/Cloud credentials exposed

### Search for:
```javascript
// Dangerous patterns:
NEXT_PUBLIC_SECRET_KEY // Exposed to client
process.env.DATABASE_URL // In client component
const apiKey = "sk_live_..." // Hardcoded
console.log(sensitiveData) // Debug logs
```

## 6. Dependencies & Supply Chain Security

### Dependency Vulnerabilities:
- [ ] Known vulnerabilities (npm audit)
- [ ] Outdated dependencies with security patches
- [ ] Unused dependencies increasing attack surface
- [ ] Dependencies with poor maintenance
- [ ] Missing package-lock.json for deterministic installs
- [ ] Typosquatting vulnerable package names

### Check for:
```bash
npm audit
npm outdated
npx depcheck # Find unused dependencies
npm ls # Check for multiple versions
```

### Third-Party Scripts:
- [ ] CDN scripts without integrity checks (SRI)
- [ ] Loading scripts from untrusted sources
- [ ] npm packages with suspicious postinstall scripts
- [ ] GitHub Actions from untrusted sources

## 7. File Upload & Storage Security

### File Upload Vulnerabilities:
- [ ] Missing file type validation (MIME type spoofing)
- [ ] No file size limits
- [ ] Executable file uploads allowed
- [ ] Path traversal in file names
- [ ] Missing virus scanning
- [ ] Files stored in public directories
- [ ] Missing file extension whitelist
- [ ] SVG files without sanitization

### Implementation Check:
```javascript
// Look for unsafe patterns:
const fileName = req.body.fileName; // User controlled
fs.writeFile(`/uploads/${fileName}`, data); // Path traversal

// Should validate:
const allowedTypes = ['image/jpeg', 'image/png'];
const maxSize = 5 * 1024 * 1024; // 5MB
```

## 8. Session & Cookie Security

### Cookie Vulnerabilities:
- [ ] Missing httpOnly flag (XSS can steal)
- [ ] Missing secure flag (sent over HTTP)
- [ ] Missing sameSite attribute (CSRF)
- [ ] Session fixation vulnerabilities
- [ ] Predictable session IDs
- [ ] Sessions not invalidated on logout
- [ ] Long session timeout periods
- [ ] Missing session rotation after privilege change

### Check for:
```javascript
// Insecure:
res.setHeader('Set-Cookie', 'session=abc123');

// Secure:
res.setHeader('Set-Cookie', 
  'session=abc123; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=3600'
);
```

## 9. CORS & Cross-Origin Security

### CORS Misconfigurations:
- [ ] Wildcard origin (* ) in production
- [ ] Reflecting Origin header without validation
- [ ] Credentials with wildcard origin
- [ ] Missing vary: Origin header
- [ ] Overly permissive methods/headers
- [ ] Pre-flight cache too long

### Check API routes and next.config.js:
```javascript
// Dangerous:
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Credentials', 'true');

// Better:
const allowedOrigins = ['https://trusted-domain.com'];
if (allowedOrigins.includes(origin)) {
  res.setHeader('Access-Control-Allow-Origin', origin);
}
```

## 10. Database Security

### Database Vulnerabilities:
- [ ] Raw SQL queries with user input
- [ ] Missing parameterized queries
- [ ] Database credentials in code
- [ ] Missing connection encryption (SSL/TLS)
- [ ] Overly permissive database user permissions
- [ ] Missing query timeout limits
- [ ] Connection pool misconfigurations
- [ ] Exposed database error messages

### Check for patterns:
```javascript
// SQL Injection vulnerable:
db.query(`SELECT * FROM users WHERE id = ${userId}`);

// Safe - Parameterized:
db.query('SELECT * FROM users WHERE id = ?', [userId]);

// Safe - ORM with proper escaping:
await prisma.user.findUnique({ where: { id: userId } });
```

## 11. Server-Side Request Forgery (SSRF)

### SSRF Vulnerabilities:
- [ ] User-controlled URLs in fetch/axios
- [ ] Missing URL validation/whitelist
- [ ] Internal network access possible
- [ ] Cloud metadata endpoints accessible
- [ ] DNS rebinding vulnerabilities
- [ ] URL parser confusion attacks

### Look for:
```javascript
// Dangerous:
const response = await fetch(req.body.url);

// Safer:
const allowedDomains = ['api.trusted.com'];
const url = new URL(req.body.url);
if (!allowedDomains.includes(url.hostname)) {
  throw new Error('Domain not allowed');
}
```

## 12. Cryptography & Secrets Management

### Cryptographic Issues:
- [ ] Weak encryption algorithms (MD5, SHA1)
- [ ] Hardcoded encryption keys
- [ ] Predictable random number generation
- [ ] Missing encryption for sensitive data
- [ ] Weak key derivation functions
- [ ] Reused IVs/nonces in encryption
- [ ] Timing attacks in comparisons

### Check for:
```javascript
// Weak:
crypto.createHash('md5'); // Weak algorithm
Math.random(); // Predictable

// Strong:
crypto.createHash('sha256');
crypto.randomBytes(32); // Cryptographically secure
```

## 13. Error Handling & Information Disclosure

### Information Leakage:
- [ ] Stack traces exposed to users
- [ ] Database errors shown to users
- [ ] Internal paths/structures revealed
- [ ] Version numbers exposed
- [ ] Debug mode enabled in production
- [ ] Detailed error messages
- [ ] Server technology disclosure

### Check error handling:
```javascript
// Bad:
catch (error) {
  res.status(500).json({ error: error.stack });
}

// Good:
catch (error) {
  console.error(error); // Log internally
  res.status(500).json({ error: 'Internal server error' });
}
```

## 14. Next.js Specific Security Issues

### Framework-Specific Vulnerabilities:
- [ ] Exposed API routes without authentication
- [ ] getServerSideProps exposing sensitive data
- [ ] Middleware bypass vulnerabilities
- [ ] Dynamic routes without validation ([id].tsx)
- [ ] Rewrite rules creating open redirects
- [ ] Image optimization API abuse
- [ ] ISR cache poisoning possibilities
- [ ] Server Actions without validation

### Check for:
```javascript
// Dangerous getServerSideProps:
export async function getServerSideProps(context) {
  const data = await db.query(`SELECT * FROM sensitive_table`);
  return { props: { data } }; // Exposing too much
}

// Server Actions need validation:
async function serverAction(formData) {
  'use server';
  // Missing validation here
}
```

## 15. Logging & Monitoring Security

### Logging Issues:
- [ ] Sensitive data in logs (passwords, tokens)
- [ ] Missing security event logging
- [ ] Logs accessible publicly
- [ ] No log rotation/retention policy
- [ ] Missing failed authentication logging
- [ ] No anomaly detection

### Monitoring Gaps:
- [ ] No rate limit monitoring
- [ ] Missing intrusion detection
- [ ] No alerting for security events
- [ ] Absence of audit trails

## Output Format

For each vulnerability found, provide:

```markdown
### Vulnerability: [Name/Type]
**Severity**: Critical/High/Medium/Low (OWASP rating)
**OWASP Category**: [e.g., A01:2021 - Broken Access Control]
**File(s)**: [Specific file paths and line numbers]

**Vulnerability Details**:
[Explain what the vulnerability is and why it's dangerous]

**Current Code**:
```[vulnerable code snippet]```

**Attack Scenario**:
[How an attacker could exploit this]

**Recommended Fix**:
```[secure implementation]```

**Additional Measures**:
- [Other related security improvements]
- [Defense in depth strategies]

**References**:
- [OWASP or security documentation links]
```

## Priority Classification

### Critical (Fix Immediately):
- Authentication bypass
- SQL/NoSQL injection
- Remote code execution
- Sensitive data exposure
- Missing authorization checks

### High (Fix This Week):
- XSS vulnerabilities
- CSRF vulnerabilities
- Insecure direct object references
- Weak cryptography
- Security header misconfigurations

### Medium (Fix This Month):
- Missing rate limiting
- Verbose error messages
- Outdated dependencies
- Missing security logging

### Low (Fix When Possible):
- Missing defense in depth measures
- Performance-impacting DoS vectors
- Legacy browser security headers

## Security Testing Commands

```bash
# Check for known vulnerabilities
npm audit
npm audit fix

# Check for outdated packages
npm outdated

# Check for secrets in code
npx secretlint "**/*"

# Find unused dependencies
npx depcheck

# Security headers check (after deploying)
curl -I https://yoursite.com

# Check for exposed .env files
curl https://yoursite.com/.env

# OWASP dependency check
npx owasp-dependency-check --project "YourProject" --scan .

# License compliance check
npx license-checker --summary
```

## Quick Security Wins to Implement

1. Add security headers in next.config.js
2. Run npm audit and fix vulnerabilities
3. Implement rate limiting on API routes
4. Add input validation with zod/yup
5. Use parameterized database queries
6. Set secure cookie flags
7. Remove all console.logs from production
8. Implement proper error handling
9. Add CSRF protection
10. Enable dependabot for automatic updates

## Questions to Answer

1. Are there any Critical/High severity vulnerabilities?
2. Is authentication properly implemented?
3. Are all API routes protected appropriately?
4. Is user input properly validated and sanitized?
5. Are security headers properly configured?
6. Is sensitive data properly protected?
7. Are there any known vulnerable dependencies?
8. Is HTTPS enforced everywhere?
9. Are errors handled securely?
10. Is there a clear security update process?

Please provide a comprehensive security audit with prioritized recommendations for fixing vulnerabilities, including specific code examples and implementation guidance.