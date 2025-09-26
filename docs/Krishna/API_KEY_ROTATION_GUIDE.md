# 🔑 API Key Rotation Guide

## ⚠️ URGENT: Exposed API Keys Detected

The following API keys were found in the .env file and need immediate rotation:

1. **Resend API Key** (Email Service)
2. **Supabase Keys** (Database)
3. **NextAuth Secret** (Authentication)

---

## 🚨 Immediate Actions Required

### Step 1: Revoke Compromised Keys

#### 1.1 Resend API Key
1. Go to [Resend Dashboard](https://resend.com/api-keys)
2. Find the key: `re_BHpihZ2L_GdXPKMHC5Usraiwi1Xc5JZEW`
3. Click "Revoke" or "Delete"
4. Generate a new API key
5. Update your local `.env.local` file (NOT .env)

#### 1.2 Supabase Keys
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Navigate to your project: `gevwzzrztriktdazfbpw`
3. Go to Settings → API
4. Regenerate both:
   - Anon/Public Key
   - Service Role Key
5. Update your local `.env.local` file

#### 1.3 NextAuth Secret
1. Generate a new secret:
   ```bash
   openssl rand -base64 32
   ```
2. Update NEXTAUTH_SECRET in `.env.local`

---

## 📝 Proper Environment Variable Setup

### 1. Create `.env.local` (for actual values)
```bash
# Copy the template
cp .env.example .env.local

# Edit with your actual values
# NEVER commit this file
```

### 2. Environment Files Structure
```
.env.example    # Template with placeholders (✅ Commit this)
.env.local      # Your actual secrets (❌ Never commit)
.env            # DELETE this file if it exists (❌ Never use)
```

### 3. Verify Git Ignore
Ensure `.gitignore` contains:
```
.env
.env.local
.env.production
# But allows
!.env.example
```

---

## 🔐 Security Best Practices

### For Development
1. Use `.env.local` for all secrets
2. Never hardcode credentials in code
3. Use environment variables or prompts in scripts
4. Rotate keys regularly (every 90 days)

### For Production
1. Use environment variables in your hosting platform:
   - Vercel: Dashboard → Settings → Environment Variables
   - Netlify: Site Settings → Environment Variables
   - AWS: Systems Manager Parameter Store or Secrets Manager
2. Enable key rotation policies
3. Use different keys for dev/staging/production
4. Implement key expiration alerts

---

## 🛠️ Update Deployment Environments

### Vercel
```bash
vercel env add RESEND_API_KEY production
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add NEXTAUTH_SECRET production
```

### Netlify
```bash
netlify env:set RESEND_API_KEY "your-new-key"
# Repeat for other variables
```

### Manual Hosting
Update your server's environment variables or use a secrets management service.

---

## ✅ Verification Checklist

- [ ] Old Resend API key revoked
- [ ] New Resend API key generated and updated
- [ ] Old Supabase keys regenerated
- [ ] New Supabase keys updated in `.env.local`
- [ ] NextAuth secret regenerated
- [ ] `.env` file deleted (if it existed)
- [ ] `.env.local` created with new values
- [ ] Production environment variables updated
- [ ] Application tested with new keys
- [ ] Git repository checked (no secrets committed)

---

## 🔄 Regular Rotation Schedule

Set reminders to rotate keys:
- **Critical Keys** (Payment, Auth): Every 30 days
- **API Keys** (Services): Every 90 days
- **Database Keys**: Every 180 days
- **After any security incident**: Immediately

---

## 📞 If Keys Were Compromised

If you suspect the exposed keys were used maliciously:

1. **Check Service Logs**:
   - Resend: Check email send history
   - Supabase: Review database access logs
   - Look for unusual activity

2. **Contact Support**:
   - Resend: support@resend.com
   - Supabase: support@supabase.io
   - Report the security incident

3. **Notify Users** (if data was accessed):
   - Prepare incident communication
   - Follow GDPR/privacy law requirements

---

## 🚀 Going Forward

1. **Use Secret Management Tools**:
   - HashiCorp Vault
   - AWS Secrets Manager
   - Azure Key Vault
   - Doppler

2. **Implement Secret Scanning**:
   - GitHub Secret Scanning
   - GitGuardian
   - TruffleHog

3. **Regular Security Audits**:
   - Monthly key rotation checks
   - Quarterly security reviews
   - Annual penetration testing

---

**Remember**: The security of your application depends on keeping secrets secret. Never commit sensitive data to version control, even in private repositories.

**Last Updated**: September 2025
**Next Review**: December 2025