# Google Tag Manager (GTM) Setup Documentation

## Overview

Google Tag Manager has been successfully integrated into the PowerCA website. GTM provides a centralized platform to manage all tracking tags, including Google Analytics, conversion tracking, remarketing pixels, and more.

## Implementation Details

### GTM Container ID
- **Production ID**: `GTM-5QRPSNJQ`
- **Environment Variable**: `NEXT_PUBLIC_GTM_ID` (optional override)

### Files Created/Modified

1. **GTM Component**: `/src/components/google-tag-manager.tsx`
   - Main GTM script injection
   - Noscript fallback component
   - Helper functions for event tracking
   - Enhanced ecommerce tracking support

2. **Layout Integration**: `/src/app/layout.tsx`
   - GTM components added to root layout
   - Loads on all pages automatically
   - Both script and noscript versions included

3. **Payment Tracking**: `/src/app/payment-success/page.tsx`
   - Enhanced ecommerce purchase tracking
   - Transaction data pushed to dataLayer

## Benefits of GTM Over Direct GA Implementation

1. **Centralized Management**: Manage all tags from one interface
2. **No Code Deployments**: Update tracking without code changes
3. **Version Control**: GTM has built-in versioning for tag configurations
4. **Debug Mode**: Test tags before publishing
5. **Multiple Tags**: Easy to add Facebook Pixel, LinkedIn Insight, etc.
6. **Custom Triggers**: Create complex tracking rules without coding

## Available Helper Functions

```typescript
import {
  pushToDataLayer,
  trackGTMEvent,
  trackGTMPageView,
  trackGTMFormSubmit,
  trackGTMPurchase,
  trackGTMSignup,
  trackGTMButtonClick
} from '@/components/google-tag-manager'
```

### Usage Examples

```typescript
// Track custom event
trackGTMEvent('video_play', {
  video_title: 'Product Demo',
  video_duration: 120
})

// Track form submission
trackGTMFormSubmit('contact-form', {
  subject: 'Demo Request',
  company_size: 'medium'
})

// Track purchase (enhanced ecommerce)
trackGTMPurchase({
  transaction_id: 'ORD-123456',
  value: 19999,
  currency: 'INR',
  items: [{
    item_id: 'powerca-early-bird',
    item_name: 'PowerCA Early Bird License',
    price: 19999,
    quantity: 1
  }]
})

// Track signup
trackGTMSignup('email', 'user_123')

// Track button click
trackGTMButtonClick('cta-header', 'header-navigation')
```

## GTM Container Setup Guide

### Step 1: Access GTM Container

1. Go to [Google Tag Manager](https://tagmanager.google.com/)
2. Sign in with your Google account
3. Your container `GTM-5QRPSNJQ` should be visible

### Step 2: Connect Google Analytics 4

1. Click "Tags" → "New"
2. Choose tag type: "Google Analytics: GA4 Configuration"
3. Enter your GA4 Measurement ID: `G-P15M72BCQ6`
4. Trigger: "All Pages"
5. Save and name it "GA4 Configuration"

### Step 3: Set Up Common Events

#### Form Submission Tracking
1. Create new tag: "GA4 Event - Form Submit"
2. Event name: `generate_lead`
3. Trigger: Custom Event → `form_submit`

#### Purchase Tracking
1. Create new tag: "GA4 Event - Purchase"
2. Event name: `purchase`
3. Include ecommerce parameters from dataLayer
4. Trigger: Custom Event → `purchase`

#### Button Click Tracking
1. Create new tag: "GA4 Event - Button Click"
2. Event name: `button_click`
3. Trigger: Custom Event → `button_click`

### Step 4: Create Variables

Create dataLayer variables for common data:

1. **User ID Variable**
   - Name: "DLV - User ID"
   - Type: Data Layer Variable
   - Variable Name: `user_id`

2. **Transaction Value**
   - Name: "DLV - Transaction Value"
   - Type: Data Layer Variable
   - Variable Name: `ecommerce.value`

3. **Form Name**
   - Name: "DLV - Form Name"
   - Type: Data Layer Variable
   - Variable Name: `form_name`

## Testing GTM Implementation

### Method 1: GTM Preview Mode

1. In GTM, click "Preview"
2. Enter your website URL
3. Navigate your site - you'll see events firing in the preview panel
4. Verify tags are firing correctly

### Method 2: Browser Console

```javascript
// Check if GTM is loaded
console.log(window.dataLayer)

// Push test event
window.dataLayer.push({
  event: 'test_event',
  test_parameter: 'test_value'
})
```

### Method 3: GTM/GA Debug Chrome Extension

1. Install "Tag Assistant Legacy" Chrome extension
2. Enable on your website
3. Check for GTM container and tag firing

## Recommended GTM Tags for PowerCA

### 1. Google Ads Conversion Tracking
- Track demo bookings as conversions
- Track payments as purchase conversions
- Set up remarketing audiences

### 2. Facebook Pixel
- Track page views
- Track lead events (demo bookings)
- Track purchase events
- Build custom audiences

### 3. LinkedIn Insight Tag
- Track conversions
- Build matched audiences
- Website retargeting

### 4. Microsoft Clarity
- Free heatmap and session recording
- Understand user behavior
- Identify UX issues

### 5. Hotjar
- Advanced heatmaps
- User feedback polls
- Session recordings

## DataLayer Schema for PowerCA

```javascript
// Page View
dataLayer.push({
  event: 'page_view',
  page_path: '/pricing',
  page_title: 'Pricing - PowerCA',
  user_type: 'visitor' // visitor, lead, customer
})

// Lead Generation
dataLayer.push({
  event: 'generate_lead',
  lead_type: 'demo_booking', // demo_booking, contact_form, newsletter
  lead_value: 'high', // high, medium, low
  company_size: 'medium'
})

// Purchase
dataLayer.push({
  event: 'purchase',
  ecommerce: {
    transaction_id: 'ORD-123',
    value: 19999,
    currency: 'INR',
    payment_method: 'razorpay',
    coupon: 'EARLYBIRD',
    items: [{
      item_id: 'powerca-license',
      item_name: 'PowerCA License',
      item_category: 'Software',
      price: 19999,
      quantity: 1
    }]
  }
})

// User Properties
dataLayer.push({
  user_id: 'usr_123',
  user_type: 'ca_professional',
  firm_size: 'small',
  subscription_status: 'trial'
})
```

## Environment Variables

Add to `.env.local` if you need to use a different GTM container:

```env
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
```

## Security & Privacy

1. **Cookie Consent**: Consider implementing a consent management platform
2. **Data Privacy**: Configure GTM to respect user privacy choices
3. **PII Protection**: Never send personally identifiable information to GA
4. **Server-side GTM**: Consider for sensitive data and better performance

## Troubleshooting

### GTM Not Loading
- Check if container ID is correct
- Verify no ad blockers are active
- Check browser console for errors

### Tags Not Firing
- Use GTM Preview mode to debug
- Check trigger conditions
- Verify dataLayer push is happening

### Data Not in GA4
- Ensure GA4 Configuration tag is set up
- Check GA4 real-time reports
- Verify measurement ID is correct

## Next Steps

1. **Configure GA4 in GTM**: Set up GA4 configuration tag
2. **Add Conversion Tracking**: Set up Google Ads conversion tracking
3. **Implement Enhanced Ecommerce**: Track full purchase funnel
4. **Set Up Custom Triggers**: Create specific tracking rules
5. **Add Marketing Pixels**: Facebook, LinkedIn, etc.
6. **Configure Server-side GTM**: For better performance and privacy

## Resources

- [GTM Documentation](https://support.google.com/tagmanager)
- [GTM Container Dashboard](https://tagmanager.google.com/#/container/accounts/6224256982/containers/191559174)
- [DataLayer Documentation](https://developers.google.com/tag-manager/devguide)
- [Enhanced Ecommerce Guide](https://developers.google.com/analytics/devguides/collection/ga4/ecommerce)

---

**Last Updated**: January 2025
**GTM Container ID**: GTM-5QRPSNJQ
**Status**: ✅ Fully Integrated