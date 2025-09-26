# Next.js Performance Audit Prompt for Claude Code

## Instructions for Claude Code

Please conduct a comprehensive performance audit of this Next.js website, analyzing the source code for optimization opportunities across the following critical areas. For each finding, provide specific file locations, current implementation issues, and actionable recommendations with code examples.

## 1. Image Optimization Analysis

### Check for:
- [ ] Usage of native `<img>` tags instead of `next/image` component
- [ ] Missing `priority` prop on above-the-fold images (hero images, logos)
- [ ] Missing `sizes` attribute for responsive images
- [ ] Images without width/height causing layout shifts
- [ ] Large image files that could benefit from modern formats (WebP/AVIF)
- [ ] Lazy loading applied to above-the-fold images
- [ ] Missing blur placeholders for better perceived performance
- [ ] Unoptimized external image URLs without proper loader configuration

### Look specifically in:
- Components rendering hero sections
- Product/content galleries
- Navigation/header logos
- Any component with image rendering

## 2. Bundle Size and Code Splitting

### Analyze for:
- [ ] Large third-party dependencies that could be replaced with lighter alternatives
- [ ] Missing dynamic imports for heavy components (charts, editors, maps)
- [ ] Full library imports instead of specific functions (e.g., `import _ from 'lodash'` vs `import debounce from 'lodash/debounce'`)
- [ ] Unused dependencies in package.json
- [ ] Client components that could be Server Components
- [ ] Missing `next/dynamic` usage for conditional components
- [ ] Webpack bundle analyzer setup and findings

### Check files:
- `package.json` for dependency audit
- Page components for unnecessary client-side JavaScript
- `next.config.js` for optimization settings
- Components using heavy libraries

## 3. Rendering Strategy Assessment

### Evaluate:
- [ ] Pages using `getServerSideProps` that could use `getStaticProps` + ISR
- [ ] Missing ISR implementation for content that updates periodically
- [ ] Client-side data fetching that could be moved to Server Components
- [ ] Waterfall data fetching patterns (sequential instead of parallel)
- [ ] Missing Suspense boundaries for streaming
- [ ] Components marked with 'use client' unnecessarily
- [ ] Opportunities for Partial Prerendering (Next.js 14+)

### Focus on:
- `app/` or `pages/` directory structure
- Data fetching patterns in components
- API route implementations
- Layout components that could benefit from streaming

## 4. Core Web Vitals Issues

### LCP (Largest Contentful Paint) - Target: ≤2.5s
- [ ] Hero images without priority loading
- [ ] Slow server response times (check API routes)
- [ ] Render-blocking resources
- [ ] Missing preconnect/dns-prefetch for critical domains

### INP (Interaction to Next Paint) - Target: ≤200ms
- [ ] Heavy computations on the main thread
- [ ] Large event handlers blocking interactions
- [ ] Missing `useDeferredValue` or `startTransition` for heavy updates
- [ ] Synchronous operations that could be async

### CLS (Cumulative Layout Shift) - Target: <0.1
- [ ] Images/videos without dimensions
- [ ] Dynamic content injection without space reservation
- [ ] Font loading causing text shifts (not using next/font)
- [ ] Ads or embeds causing layout shifts

## 5. Caching Configuration

### Review:
- [ ] Missing or incorrect Cache-Control headers
- [ ] Data fetching without proper caching configuration
- [ ] Missing revalidation settings for ISR pages
- [ ] Client-side navigation cache issues
- [ ] Static assets without long-term caching
- [ ] API routes without appropriate caching strategies

### Check in:
- `next.config.js` for headers configuration
- Data fetching functions for cache options
- API route handlers

## 6. Font Optimization

### Verify:
- [ ] External font loading (Google Fonts via <link>)
- [ ] Not using `next/font` for font optimization
- [ ] Multiple font weights loaded unnecessarily
- [ ] Missing font-display: swap causing invisible text
- [ ] Variable fonts opportunity for multiple weights

## 7. Third-Party Scripts

### Audit:
- [ ] Scripts loaded without Next.js Script component
- [ ] Analytics/tracking scripts blocking main thread
- [ ] Incorrect script strategy (should use afterInteractive or lazyOnload)
- [ ] Missing facade pattern for heavy embeds (YouTube, social media)
- [ ] Opportunity for Partytown/Web Worker offloading

### Look for:
- Google Analytics/Tag Manager implementation
- Social media SDKs
- Chat widgets
- Marketing/tracking pixels

## 8. CSS Optimization

### Analyze:
- [ ] Unused CSS in production builds
- [ ] Runtime CSS-in-JS that could be static
- [ ] Missing CSS purging configuration (Tailwind)
- [ ] Inline styles that could be extracted
- [ ] Large CSS bundles without code splitting

## 9. API and Data Fetching

### Check for:
- [ ] N+1 query problems in API routes
- [ ] Missing database connection pooling
- [ ] Unoptimized database queries
- [ ] Over-fetching data (no field selection)
- [ ] Missing pagination for large datasets
- [ ] Sequential fetches that could be parallel

## 10. Build Configuration

### Verify:
- [ ] Next.js version (should be 14+ or latest 15)
- [ ] Missing SWC configuration for faster builds
- [ ] Experimental features that could help (Turbopack, etc.)
- [ ] Missing environment-specific optimizations
- [ ] Bundle analyzer not configured
- [ ] Missing performance monitoring setup

## Output Format

For each issue found, provide:

```markdown
### Issue: [Brief description]
**Severity**: High/Medium/Low
**File(s)**: [Specific file paths]
**Current Implementation**:
```[current code]```
**Recommended Fix**:
```[improved code]```
**Expected Impact**: [Performance improvement estimate]
**Additional Notes**: [Any context or trade-offs]
```

## Priority Checklist

Start with these high-impact optimizations:
1. Images not using next/image component
2. Missing priority prop on LCP images
3. Client components that could be Server Components
4. Heavy libraries that could be replaced
5. SSR pages that could be SSG/ISR
6. Missing font optimization
7. Third-party scripts blocking main thread

## Additional Checks

- [ ] Lighthouse score in Chrome DevTools
- [ ] Bundle size visualization with @next/bundle-analyzer
- [ ] Core Web Vitals in Chrome DevTools Performance tab
- [ ] Network waterfall for critical resources
- [ ] Check for memory leaks in long-running pages
- [ ] Verify proper error boundaries are in place
- [ ] Check for proper meta tags and SEO optimization

## Questions to Answer

1. What is the current Lighthouse performance score?
2. What is the total JavaScript bundle size?
3. Which pages have the worst Core Web Vitals?
4. Are there any memory leaks or performance degradation over time?
5. What are the top 3 quick wins for performance improvement?
6. What are the top 3 high-impact but complex optimizations needed?

## Testing Commands to Run

```bash
# Install bundle analyzer if not present
npm install --save-dev @next/bundle-analyzer

# Build and analyze
ANALYZE=true npm run build

# Check build output size
npm run build

# Run Lighthouse CI if configured
npm run lighthouse

# Check for unused dependencies
npx depcheck
```

Please provide a comprehensive audit with actionable recommendations prioritized by impact and implementation complexity.