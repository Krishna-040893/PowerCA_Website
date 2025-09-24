# Google Analytics 4 Setup Guide for PowerCA

This guide will help you set up Google Analytics 4 (GA4) for your PowerCA website and obtain the tracking ID needed for your environment variables.

## Prerequisites

- A Google account
- Admin access to your website
- PowerCA website deployed (for verification)

## Step 1: Access Google Analytics

1. Go to [Google Analytics](https://analytics.google.com/)
2. Sign in with your Google account
3. Click "Start measuring" or "Get started today"

## Step 2: Create a Google Analytics Account

1. **Account Setup**:
   - Account name: `PowerCA Analytics` (or your preferred name)
   - Check data sharing settings as per your privacy requirements
   - Click "Next"

2. **Property Setup**:
   - Property name: `PowerCA Website`
   - Reporting time zone: `India Standard Time (GMT+05:30)`
   - Currency: `Indian Rupee (₹)`
   - Click "Next"

3. **Business Information**:
   - Industry category: `Professional Services` or `Finance & Insurance`
   - Business size: Select appropriate size
   - Select how you plan to use Google Analytics:
     - ✅ Get insights about my customers
     - ✅ Measure advertising ROI
     - ✅ Examine user behavior
   - Click "Create"

4. **Accept Terms of Service**:
   - Select your country: `India`
   - Read and accept the Google Analytics Terms of Service
   - Accept Data Processing Terms

## Step 3: Set Up Data Stream

1. **Choose Platform**:
   - Select "Web" (since PowerCA is a web application)

2. **Web Stream Setup**:
   - **Website URL**: 
     - For development: `http://localhost:3000`
     - For production: `https://yourdomain.com` (replace with your actual domain)
   - **Stream name**: `PowerCA Website`
   - **Enhanced measurement**: Leave enabled (recommended)
   - Click "Create stream"

## Step 4: Get Your Measurement ID

After creating the data stream, you'll see your **Measurement ID**:

```
Format: G-XXXXXXXXXX
Example: G-1A2B3C4D5E
```

**This is your `NEXT_PUBLIC_GA_ID` that goes in your `.env.local` file.**

## Step 5: Configure Your Environment

1. Open your `.env.local` file
2. Update the Google Analytics variable:
   ```env
   NEXT_PUBLIC_GA_ID="G-YOUR-MEASUREMENT-ID"
   ```

## Step 6: Verify Installation

1. **Development Testing**:
   - Start your development server: `npm run dev`
   - Open your website in browser
   - Check browser console for any GA errors

2. **Production Verification**:
   - Deploy your website
   - Go to Google Analytics > Reports > Realtime
   - Visit your website
   - You should see active users in the realtime report

## Step 7: Set Up Goals and Conversions (Optional but Recommended)

### For PowerCA Business Goals:

1. **Demo Bookings**:
   - Go to Admin > Events > Create Event
   - Event name: `demo_booking`
   - Mark as conversion: Yes

2. **Payment Completions**:
   - Event name: `purchase`
   - Mark as conversion: Yes

3. **Contact Form Submissions**:
   - Event name: `contact_form_submit`
   - Mark as conversion: Yes

## Step 8: Enhanced eCommerce Setup (For Payment Tracking)

Since PowerCA handles payments, set up eCommerce tracking:

1. **Enable Enhanced eCommerce**:
   - Go to Admin > Property > eCommerce Settings
   - Enable "Enhanced eCommerce Reporting"

2. **Configure Purchase Events**:
   ```javascript
   // This is automatically handled in your payment success page
   gtag('event', 'purchase', {
     transaction_id: 'order_123',
     value: 22000,
     currency: 'INR',
     items: [{
       item_id: 'powerca_implementation',
       item_name: 'PowerCA Implementation',
       category: 'Software License',
       quantity: 1,
       price: 22000
     }]
   });
   ```

## Step 9: Set Up Custom Dimensions (Optional)

Track PowerCA-specific data:

1. **User Type**:
   - Dimension name: `User Type`
   - Scope: User
   - Values: `demo_user`, `paid_user`, `trial_user`

2. **Firm Size**:
   - Dimension name: `Firm Size`
   - Scope: User
   - Values: `small`, `medium`, `large`

## Common Issues and Troubleshooting

### Issue 1: GA4 Not Tracking
**Solution**: 
- Check if `NEXT_PUBLIC_GA_ID` is correctly set
- Verify the Measurement ID format (starts with G-)
- Check browser console for errors

### Issue 2: Localhost Not Showing in Analytics
**Solution**:
- This is normal for development
- Use `debug_mode` parameter for testing
- Deploy to production for accurate tracking

### Issue 3: Real-time Data Not Showing
**Solution**:
- Wait 1-2 minutes for data processing
- Check if ad blockers are interfering
- Verify website URL matches the one in GA4

## Security and Privacy Considerations

1. **GDPR Compliance**:
   - Add cookie consent banner
   - Allow users to opt-out of tracking
   - Update privacy policy

2. **Data Retention**:
   - Set appropriate data retention period (14 months recommended)
   - Configure automatic data deletion

## Next Steps After Setup

1. **Create Custom Reports**:
   - CA firm signup funnel
   - Demo booking conversion rate
   - Payment completion tracking

2. **Set Up Alerts**:
   - Traffic drops
   - Conversion rate changes
   - Technical issues

3. **Regular Monitoring**:
   - Weekly traffic reports
   - Monthly conversion analysis
   - Quarterly goal reviews

## Additional Resources

- [Google Analytics 4 Documentation](https://support.google.com/analytics/topic/9143232)
- [GA4 Migration Guide](https://support.google.com/analytics/answer/9744165)
- [PowerCA Analytics Dashboard](https://analytics.google.com/analytics/web/)

---

**Need Help?**
If you encounter any issues during setup, contact the development team or refer to Google Analytics Help Center.

**Last Updated**: January 2025
**Version**: 1.0