# Mobile Responsiveness Audit Prompt for Claude Code

## Instructions for Claude Code

Please conduct a comprehensive mobile responsiveness audit of this website, analyzing the source code for mobile optimization issues, responsive design problems, and touch interaction concerns. For each finding, provide specific file locations, current implementation issues, and recommended fixes with code examples.

## 1. Viewport and Meta Tags Configuration

### Check for:
- [ ] Missing or incorrect viewport meta tag in document head
- [ ] Missing mobile-web-app-capable meta tags
- [ ] Incorrect initial-scale, minimum-scale, or maximum-scale values
- [ ] Missing theme-color meta tag for mobile browsers
- [ ] Apple-specific meta tags for iOS Safari optimization

### Expected configuration:
```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#yourcolor">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
```

### Check in:
- `app/layout.tsx` or `pages/_document.tsx`
- Any custom Head components
- SEO/Meta components

## 2. Responsive Layout Analysis

### Breakpoint Implementation:
- [ ] Check for consistent breakpoint usage across components
- [ ] Identify hard-coded pixel widths that don't scale
- [ ] Find components missing mobile-first approach
- [ ] Detect layout breaking between common breakpoints
- [ ] Check for horizontal scrolling issues on mobile

### Common breakpoints to test:
```css
/* Mobile First Breakpoints */
- 320px  (iPhone SE)
- 375px  (iPhone 12/13/14)
- 390px  (iPhone 14 Pro)
- 414px  (iPhone Plus sizes)
- 768px  (iPad Mini/Air)
- 834px  (iPad Pro 11")
- 1024px (iPad Pro 12.9" / Desktop)
```

### Look for:
- Components using fixed widths instead of fluid layouts
- Missing `max-width` constraints on containers
- Flexbox/Grid layouts that don't wrap properly
- Tables without responsive alternatives
- Forms that don't stack on mobile

## 3. Typography and Readability

### Font Size and Spacing:
- [ ] Text smaller than 16px on mobile (causes zoom on iOS)
- [ ] Line height too tight for mobile reading (should be 1.5+)
- [ ] Heading sizes not scaling properly with viewport
- [ ] Missing fluid typography (clamp() or responsive units)
- [ ] Text overlapping or getting cut off

### Check for:
```css
/* Bad - Fixed sizes */
font-size: 14px;

/* Good - Responsive options */
font-size: clamp(1rem, 2vw, 1.25rem);
font-size: 16px; /* Minimum for mobile inputs */
```

### Analyze:
- Body text readability on 375px screens
- Form input text size (must be 16px+ to prevent zoom)
- Button text size and padding for touch
- Link text size and spacing

## 4. Touch Target Optimization

### Minimum touch target requirements:
- [ ] Buttons smaller than 44x44px (iOS) or 48x48px (Android)
- [ ] Links too close together (need 8px+ spacing)
- [ ] Form inputs with insufficient height
- [ ] Clickable elements overlapping on mobile
- [ ] Navigation items too small or closely packed

### Check components:
- All buttons and CTAs
- Navigation menus and hamburger menus
- Form elements (inputs, checkboxes, radio buttons)
- Card/list item click areas
- Modal close buttons
- Tab navigation

## 5. Image and Media Responsiveness

### Image issues:
- [ ] Images without responsive sizing
- [ ] Missing srcset for different screen densities
- [ ] Images causing horizontal overflow
- [ ] Background images not optimized for mobile
- [ ] Missing art direction for different viewports
- [ ] Hero images too large for mobile data plans

### Video/Media:
- [ ] Videos not responsive (fixed width)
- [ ] Embedded iframes without responsive wrapper
- [ ] Missing mobile-specific video poster images
- [ ] Autoplay videos on mobile (performance issue)

### Look for:
```jsx
/* Bad */
<img src="image.jpg" width="800" height="600" />

/* Good */
<Image
  src={image}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  style={{ width: '100%', height: 'auto' }}
/>
```

## 6. Navigation and Menu Patterns

### Mobile navigation checks:
- [ ] Missing hamburger menu for mobile
- [ ] Desktop navigation not hidden on mobile
- [ ] Hamburger menu not accessible
- [ ] Missing close button in mobile menu
- [ ] Dropdown menus not touch-optimized
- [ ] Sticky navigation taking too much viewport
- [ ] Back button functionality issues

### Common patterns to verify:
- Hamburger menu toggles properly
- Mobile menu overlays or slides correctly
- Submenus work with touch (not just hover)
- Bottom navigation bar (if applicable)
- Gesture navigation support

## 7. Forms and Input Optimization

### Form issues on mobile:
- [ ] Input fields not full width on mobile
- [ ] Missing appropriate input types (tel, email, number)
- [ ] Labels not properly associated with inputs
- [ ] Placeholder text as only label (accessibility issue)
- [ ] Select dropdowns not mobile-optimized
- [ ] Date pickers not using native mobile pickers
- [ ] Missing autocomplete attributes

### Check for:
```jsx
/* Proper mobile input types */
<input type="tel" inputMode="numeric" pattern="[0-9]*" />
<input type="email" autoComplete="email" />
<input type="date" /> /* Uses native picker */
```

### Verify:
- Keyboard types match input purpose
- Auto-zoom prevention (16px+ font size)
- Touch-friendly spacing between fields
- Error messages visible on mobile
- Submit buttons reachable with thumb

## 8. Performance on Mobile Networks

### Mobile-specific performance:
- [ ] Large JavaScript bundles affecting mobile CPUs
- [ ] Images not lazy-loaded for mobile data saving
- [ ] Unnecessary animations on low-power devices
- [ ] Heavy components loaded on mobile
- [ ] Missing reduced motion preferences

### Check for:
```jsx
/* Respect user preferences */
@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; }
}

/* Conditional loading for mobile */
{!isMobile && <HeavyComponent />}
```

## 9. Component-Specific Mobile Issues

### Common problematic components:

#### Tables:
- [ ] Tables without responsive wrapper
- [ ] Missing horizontal scroll indicators
- [ ] No mobile-friendly alternative view

#### Modals/Dialogs:
- [ ] Modals too large for mobile viewport
- [ ] Close buttons out of reach
- [ ] Content not scrollable
- [ ] Background scroll not locked

#### Carousels/Sliders:
- [ ] Not touch/swipe enabled
- [ ] Pagination dots too small
- [ ] Multiple items showing incorrectly

#### Sidebars:
- [ ] Desktop sidebars not hidden on mobile
- [ ] Missing off-canvas pattern for mobile
- [ ] Content pushed off-screen

## 10. CSS Framework Specific Checks

### Tailwind CSS:
- [ ] Missing responsive prefixes (sm:, md:, lg:)
- [ ] Using desktop-first instead of mobile-first
- [ ] Hard-coded spacing instead of responsive spacing
- [ ] Container not properly configured

### CSS Modules/Styled Components:
- [ ] Media queries missing or incorrect
- [ ] Styles not properly scoped for mobile
- [ ] Missing responsive utility classes

## 11. Accessibility on Mobile

### Mobile accessibility concerns:
- [ ] Zoom disabled (user-scalable=no)
- [ ] Focus indicators not visible on mobile
- [ ] Skip links not working properly
- [ ] Screen reader announcements missing
- [ ] Gesture-only interactions without alternatives

## 12. Testing Checklist

### Device-specific issues to check:
- [ ] iPhone Safari safe areas (notch handling)
- [ ] Android Chrome address bar behavior
- [ ] iPad split-screen layouts
- [ ] Landscape orientation handling
- [ ] Samsung Internet specific quirks
- [ ] iOS input zoom behavior

## Output Format

For each issue found, provide:

```markdown
### Issue: [Brief description]
**Severity**: Critical/High/Medium/Low
**File(s)**: [Specific file paths]
**Affected breakpoints**: [e.g., <768px, all mobile]

**Current Implementation**:
```[current code]```

**Recommended Fix**:
```[improved code]```

**Visual Impact**: [Description of how it affects UX]
**Devices Affected**: [Specific devices/viewports]

**Additional Notes**: [Context, trade-offs, or alternatives]
```

## Priority Issues to Find

1. **Critical**: Content inaccessible or broken on mobile
2. **High**: Touch targets too small, text unreadable
3. **Medium**: Layout issues, non-optimized images
4. **Low**: Minor spacing issues, aesthetic improvements

## Specific Questions to Answer

1. What percentage of components are truly mobile-responsive?
2. Are there any pages completely broken on mobile?
3. What's the smallest viewport width the site supports?
4. Do all interactive elements meet touch target guidelines?
5. Are forms usable on mobile devices?
6. Is the navigation pattern mobile-friendly?
7. Do modals and overlays work properly on small screens?

## Testing Commands and Tools

```bash
# Install responsive testing tools if needed
npm install --save-dev @testing-library/react
npm install --save-dev @testing-library/user-event

# Run any existing responsive tests
npm test -- --grep "mobile|responsive"

# Check CSS file sizes
find . -name "*.css" -o -name "*.scss" | xargs wc -l

# Find viewport meta tags
grep -r "viewport" --include="*.tsx" --include="*.jsx" --include="*.html"

# Find fixed widths in CSS/styled-components
grep -r "width: [0-9]*px" --include="*.css" --include="*.scss" --include="*.tsx"

# Find potential touch target issues
grep -r "height: [0-9]*px" --include="*.css" --include="*.scss" --include="*.tsx" | grep -E "height: [0-3]?[0-9]px"
```

## Common Anti-Patterns to Flag

- Desktop-only hover states without touch alternatives
- Fixed positioning that breaks on mobile keyboards
- Horizontal scrolling (except for intentional carousels)
- Text in images that becomes unreadable
- Z-index issues with mobile overlays
- Pop-ups that can't be closed on mobile
- Infinite scroll without proper implementation
- Desktop-only features with no mobile fallback

## Responsive Design Best Practices to Verify

- Mobile-first CSS approach
- Fluid grids and flexible images
- Relative units (rem, em, %) over pixels
- CSS Grid and Flexbox for layouts
- Progressive enhancement strategy
- Performance budget for mobile
- Touch-friendly interaction patterns
- Thumb-reachable important actions

Please provide a comprehensive audit with specific recommendations for improving mobile responsiveness, prioritized by user impact and implementation complexity.