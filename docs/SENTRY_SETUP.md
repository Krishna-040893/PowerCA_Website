# Sentry Setup Guide

This guide explains how to configure Sentry for error tracking and monitoring in the PowerCA application.

## 1. Create a Sentry Account

1. Go to [sentry.io](https://sentry.io) and sign up for a free account
2. Create a new project and select "Next.js" as the platform
3. Note down your DSN (Data Source Name) - you'll need this for configuration

## 2. Environment Variables

Add the following environment variables to your `.env.local` file:

```env
# Sentry Configuration
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/your-project-id
SENTRY_ORG=your-org-name
SENTRY_PROJECT=your-project-name
SENTRY_AUTH_TOKEN=your-auth-token

# Optional: Enable Sentry in development
NEXT_PUBLIC_SENTRY_DEBUG=false
SENTRY_DEBUG=false
```

### Getting Your Sentry Auth Token

1. Go to [sentry.io/settings/account/api/auth-tokens/](https://sentry.io/settings/account/api/auth-tokens/)
2. Click "Create New Token"
3. Give it a name like "PowerCA Deployment"
4. Select scopes:
   - `project:read`
   - `project:releases`
   - `org:read`
5. Copy the token and add it to your `.env.local`

## 3. Vercel Deployment

If deploying to Vercel, add the environment variables:

1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add all the Sentry variables listed above
4. Make sure to add them for all environments (Production, Preview, Development)

## 4. Test Your Setup

### Local Testing

1. Enable Sentry in development:

   ```env
   NEXT_PUBLIC_SENTRY_DEBUG=true
   ```

2. Trigger a test error:

   ```typescript
   // In your code
   throw new Error('Test Sentry Integration')
   ```

3. Check your Sentry dashboard for the error

### Production Testing

1. Deploy your application
2. Navigate to any page and trigger an error
3. Check your Sentry dashboard

## 5. Features Enabled

The PowerCA Sentry integration includes:

- **Error Tracking**: Automatic capture of JavaScript errors
- **Performance Monitoring**: Track page load times and API response times (10% sample rate)
- **Session Replay**: Record user sessions with errors (100% of error sessions)
- **Privacy Protection**: Automatic masking of sensitive data (passwords, tokens, PII)
- **Source Maps**: Upload source maps for better error debugging (production only)

## 6. Configuration Files

Sentry is configured in three files:

- `sentry.client.config.ts` - Client-side error tracking
- `sentry.server.config.ts` - Server-side error tracking
- `sentry.edge.config.ts` - Edge runtime error tracking

## 7. Monitoring Dashboard

Access your monitoring dashboard at:

- Sentry Dashboard: `https://sentry.io/organizations/your-org/issues/`
- Application Monitoring: `https://your-app.vercel.app/admin` (coming soon)

## 8. Alerting Rules

Configure alerts in Sentry:

1. Go to your project settings
2. Click on "Alerts" → "Create Alert"
3. Recommended alert rules:
   - **High Error Rate**: Alert when error rate > 1%
   - **New Issue**: Alert on first occurrence of new errors
   - **Regression**: Alert when resolved issues reoccur
   - **Performance Degradation**: Alert when page load time > 3s

## 9. Cost Optimization

Free tier includes:

- 5,000 errors per month
- 10,000 performance events per month
- 50 replays per month

To stay within limits:

- Sample rates are already configured (10% for performance, 10% for replays)
- Errors are filtered to exclude common non-issues
- Development errors are not sent (unless explicitly enabled)

## 10. Troubleshooting

### Sentry is not capturing errors

1. Check that `NEXT_PUBLIC_SENTRY_DSN` is set correctly
2. Check browser console for Sentry initialization
3. Ensure CSP allows Sentry domains (already configured)

### Source maps are not uploading

1. Verify `SENTRY_AUTH_TOKEN` has correct permissions
2. Check build logs for upload errors
3. Ensure `SENTRY_ORG` and `SENTRY_PROJECT` match your Sentry project

### Too many events

1. Review ignored errors in `sentry.client.config.ts`
2. Adjust sample rates if needed
3. Set up more aggressive filtering

## 11. Integration with Existing Monitoring

Sentry complements the existing monitoring system:

- **Custom monitoring** (`/api/monitoring/events`) - Stores all events in database
- **Sentry** - Provides UI, alerts, and advanced analysis
- **Google Analytics** - Tracks user behavior and conversions

All three systems work together for comprehensive monitoring.

## Support

For questions or issues:

- Sentry Docs: [docs.sentry.io](https://docs.sentry.io)
- PowerCA Support: Contact your development team
