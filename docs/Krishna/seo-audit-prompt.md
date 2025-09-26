# SEO Audit Prompt for Power CA Website

## Copy this entire prompt to use with Claude Code or any AI assistant:

---

**PROMPT START:**

I need you to perform a comprehensive SEO audit for my website powerca.in, which is a practice management software for Chartered Accountants in India. Please analyze the website and provide detailed recommendations with code implementations.

## 1. Technical SEO Audit

Please check and provide code fixes for:

### Core Technical Elements:
- Meta titles (50-60 characters, unique for each page)
- Meta descriptions (150-160 characters, with CTAs)
- Canonical URLs implementation
- Robots.txt file optimization
- XML sitemap generation and structure
- Schema markup (Organization, SoftwareApplication, FAQPage, Review)
- Open Graph tags for social sharing
- Twitter Card tags
- Favicon and apple-touch-icon implementation

### Performance Optimization:
- Core Web Vitals (LCP, FID, CLS)
- Page load speed (<3 seconds)
- Image optimization (WebP format, lazy loading, proper sizing)
- JavaScript and CSS minification
- Browser caching implementation
- CDN usage recommendations
- Mobile responsiveness and viewport settings
- AMP implementation feasibility

### Next.js Specific Optimizations:
- next/image component usage for images
- Dynamic imports for code splitting
- ISR (Incremental Static Regeneration) implementation
- API routes optimization
- Bundle size analysis
- Font optimization with next/font

## 2. On-Page SEO Audit

Analyze and provide improvements for:

### Content Structure:
- H1 tags (one per page, contains primary keyword)
- H2-H6 hierarchy and keyword usage
- URL structure (short, descriptive, keyword-rich)
- Internal linking strategy
- External linking (authority sites)
- Breadcrumb navigation implementation
- Table of contents for long pages

### Keyword Optimization:
Check for these primary keywords and suggest placement:
- "CA practice management software"
- "chartered accountant software India"
- "CA Office automation"
- "accounting practice management"
- "CA office management software"
- "tax practice management software"
- Location-based: "[city] CA software"

### Content Quality:
- Word count recommendations (minimum 1500 words for important pages)
- Keyword density (1-2%)
- LSI keywords usage
- Content uniqueness
- Readability score (Flesch Reading Ease)
- FAQ sections implementation

## 3. Local SEO Optimization

Since we're targeting Indian CAs, implement:

### Google My Business Optimization:
- NAP (Name, Address, Phone) consistency
- Local schema markup
- City-specific landing pages
- Indian business directories submission list
- Local keywords integration

### Location Pages Structure:
Create templates for:
- /ca-software-mumbai
- /ca-software-delhi
- /ca-software-bangalore
- /ca-software-chennai
- /ca-software-kolkata

## 4. E-A-T (Expertise, Authoritativeness, Trustworthiness)

Implement trust signals:
- About Us page optimization
- Team member profiles with credentials
- Client testimonials with schema
- Case studies structure
- Security badges placement
- Privacy policy and terms optimization
- SSL certificate verification
- Contact page with multiple methods

## 5. Competitor Analysis

Compare with these competitors and suggest improvements:
- turia.in
- erpca.in
- caofficeautomation.com
- jamku.app
- tally.com

Check their:
- Domain authority
- Keyword rankings
- Backlink profile
- Content strategy
- Technical implementation

## 6. Link Building Opportunities

Identify and suggest:
- Guest posting opportunities on CA/accounting sites
- ICAI related websites for backlinks
- Indian business directories
- Software listing sites (G2, Capterra, Software Suggest)
- Partnership opportunities with CA associations
- Resource page link building
- Broken link building opportunities

## 7. Content Strategy

Create an SEO-focused content calendar:

### Blog Topics (with search volume):
- "GST return filing deadline 2025"
- "How to start CA practice in India"
- "Best accounting software for CA"
- "Income tax calculator FY 2024-25"
- "CA practice management tips"
- "Digital signature for CA"
- "GST invoice format"
- "Tax audit checklist"

### Landing Pages to Create:
- Feature-specific pages (billing, client portal, etc.)
- Integration pages (Tally, QuickBooks, etc.)
- Use case pages (Small firms, GST practitioners, etc.)
- Comparison pages (vs competitors)
- Resource/tool pages (calculators, templates)

## 8. International SEO

For English + Hindi support:
- Hreflang tags implementation
- Language switcher SEO best practices
- Hindi keyword research
- Regional content optimization

## 9. Code Implementation

Provide actual Next.js code for:

### SEO Component:
```jsx
// Create a reusable SEO component with all meta tags
// Include dynamic OG image generation
// Add JSON-LD structured data
```

### Sitemap Generation:
```javascript
// Dynamic sitemap.xml generation
// Include all pages, blog posts, tools
// Set priority and changefreq
```

### Robots.txt:
```
# Optimized robots.txt for Power CA
# Include crawl-delay, sitemap location
```

### Schema Markup Examples:
```javascript
// Organization schema
// Software application schema
// FAQ schema
// Review/Rating schema
// Breadcrumb schema
```

### Performance Monitoring:
```javascript
// Core Web Vitals tracking
// Google Analytics 4 setup
// Search Console integration
// Custom event tracking for conversions
```

## 10. SEO Testing & Monitoring

Set up monitoring for:
- Google Search Console integration
- Google Analytics 4 configuration
- Rank tracking for target keywords
- Backlink monitoring
- Site uptime monitoring
- 404 error tracking
- Mobile usability issues
- Core Web Vitals tracking

## 11. Quick Wins (Implement Immediately)

Identify the top 10 quick fixes that will have immediate impact:
1. Missing meta descriptions
2. Duplicate title tags
3. Broken internal links
4. Missing alt text on images
5. Slow loading images
6. Missing schema markup
7. Non-optimized URLs
8. Missing XML sitemap
9. No robots.txt
10. Missing Google Analytics

## 12. SEO Audit Report Format

Provide the audit results in this format:

### Critical Issues (Fix Immediately):
- [ ] Issue description
- [ ] Impact on SEO
- [ ] Code fix
- [ ] Priority: HIGH

### Important Issues (Fix Within 30 Days):
- [ ] Issue description
- [ ] Impact on SEO
- [ ] Code fix
- [ ] Priority: MEDIUM

### Minor Issues (Fix Within 90 Days):
- [ ] Issue description
- [ ] Impact on SEO
- [ ] Code fix
- [ ] Priority: LOW

### Opportunities:
- [ ] New content ideas
- [ ] Link building opportunities
- [ ] Technical enhancements

## Expected Deliverables:

1. **Technical SEO Fixes**: Complete Next.js code for all meta tags, schema, sitemaps
2. **On-Page Optimization**: Content recommendations with keyword placement
3. **Performance Code**: Image optimization, lazy loading, caching strategies
4. **Local SEO Setup**: City pages template, local schema implementation
5. **Content Calendar**: 3-month blog calendar with keywords and search volume
6. **Competitor Gaps**: Features/content competitors have that we lack
7. **Quick Win List**: 10 immediate fixes with implementation code
8. **Monitoring Setup**: Analytics and Search Console configuration code
9. **Mobile SEO**: Responsive fixes and mobile-specific optimizations
10. **SEO Dashboard**: Code for internal dashboard to track SEO metrics

## Additional Context:

- Website: powerca.in
- Target Audience: Chartered Accountants in India
- Primary Locations: Mumbai, Delhi, Bangalore, Chennai, Kolkata, Pune
- Competitors: Tally, Zoho Books, ERPCA, Marg ERP
- Current Tech Stack: React, Next.js, Tailwind CSS
- Current Monthly Traffic: [Provide if known]
- Primary Conversion Goal: Free trial signups
- Secondary Goals: Demo bookings, resource downloads

Please provide:
1. Complete code implementations (not just suggestions)
2. Priority order for implementation
3. Expected impact of each change
4. Time estimate for implementation
5. Tools needed for ongoing monitoring

Focus on actionable recommendations with actual code that can be immediately implemented in our Next.js application.

**PROMPT END**

---

# How to Use This Prompt:

## With Claude Code:
1. Copy the entire prompt above
2. Paste it into Claude Code
3. Add: "Also create a Node.js script that can automatically check these SEO issues"
4. Claude will provide both the audit and automated checking tools

## With Regular Claude:
1. Copy the prompt
2. Add your website URL specifics
3. Ask for section-by-section analysis if the response is too long
4. Request code examples for each recommendation

## With Other AI Tools:
- **ChatGPT**: Works directly, might need to break into sections
- **GitHub Copilot**: Use for generating the implementation code
- **Cursor**: Excellent for implementing the fixes in your codebase

## Follow-up Prompts to Use:

### After Initial Audit:
```
"Create a complete Next.js SEO component with all the meta tags and schema markup you recommended"
```

### For Content:
```
"Generate 20 blog post titles with search volume estimates for CA/accounting niche in India"
```

### For Technical Implementation:
```
"Create a GitHub Action workflow that automatically checks these SEO issues on every commit"
```

### For Monitoring:
```
"Create a Next.js API route that pulls SEO metrics from Google Search Console and displays them in a dashboard"
```

### For Local SEO:
```
"Generate complete schema markup for a CA firm with multiple office locations in India"
```

## Expected Output Structure:

The AI should provide:
1. **Immediate Issues Found** (with severity)
2. **Code Fixes** (copy-paste ready)
3. **Priority Implementation Plan** (30-60-90 days)
4. **Monitoring Setup** (Analytics code)
5. **Content Recommendations** (with keywords)
6. **Competitive Analysis** (gap identification)

## Pro Tips:

1. **Run Monthly**: Use this prompt monthly to track improvements
2. **Version Control**: Save each audit to track progress
3. **Automate**: Build the checks into your CI/CD pipeline
4. **Customize**: Add your specific keywords and competitors
5. **Measure Impact**: Track rankings before and after changes

## Tools to Validate AI Recommendations:

- **Google PageSpeed Insights**: Verify performance fixes
- **Google Rich Results Test**: Check schema markup
- **Mobile-Friendly Test**: Validate mobile optimization
- **SEMrush/Ahrefs**: Verify keyword suggestions
- **Screaming Frog**: Cross-check technical issues
- **GTmetrix**: Validate performance improvements