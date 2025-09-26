# Next.js Browser Compatibility Audit Prompt for Claude Code

## Instructions for Claude Code

Please conduct a comprehensive browser compatibility audit of this Next.js application, identifying features, APIs, CSS properties, and JavaScript patterns that may not work consistently across different browsers and versions. For each compatibility issue, provide the browser support data, fallback implementations, polyfills needed, and progressive enhancement strategies. Include testing recommendations for each browser category.

## 1. JavaScript Feature Compatibility

### Modern JavaScript Features Check:
- [ ] Optional chaining (?.) usage without transpilation
- [ ] Nullish coalescing (??) operator support
- [ ] BigInt usage in older browsers
- [ ] Private class fields (#) compatibility
- [ ] Dynamic imports in older browsers
- [ ] Top-level await usage
- [ ] Logical assignment operators (&&=, ||=, ??=)
- [ ] Array/Object methods (flat, flatMap, fromEntries)
- [ ] Promise.allSettled/any compatibility
- [ ] WeakRef and FinalizationRegistry usage

### JavaScript API Compatibility:
```javascript
// Bad - Using modern features without checks
const data = response?.data?.items?.at(-1) ?? [];
const formatted = new Intl.ListFormat('en').format(items);

// Good - With feature detection and fallbacks
// Optional chaining fallback
const data = response && response.data && response.data.items 
  ? response.data.items[response.data.items.length - 1] 
  : [];

// Intl API with fallback
const formatList = (items) => {
  if (typeof Intl !== 'undefined' && Intl.ListFormat) {
    return new Intl.ListFormat('en').format(items);
  }
  // Fallback for older browsers
  return items.join(', ').replace(/, ([^,]*)$/, ' and $1');
};

// Feature detection pattern
if ('IntersectionObserver' in window) {
  // Use Intersection Observer
} else {
  // Load polyfill or use fallback
  import('intersection-observer').then(() => {
    // Now use Intersection Observer
  });
}
```

### Check Browser Support For:
- Intersection Observer API
- ResizeObserver API
- MutationObserver (older browsers)
- Web Animations API
- Payment Request API
- Web Share API
- Clipboard API
- File System Access API
- WebRTC APIs
- Service Worker support

## 2. CSS Compatibility Issues

### Modern CSS Features:
- [ ] CSS Grid in IE11
- [ ] CSS Custom Properties (variables) fallbacks
- [ ] Flexbox bugs in older browsers
- [ ] CSS Container Queries usage
- [ ] CSS :has() selector
- [ ] CSS @layer usage
- [ ] CSS aspect-ratio property
- [ ] CSS logical properties (inline-start, block-end)
- [ ] CSS clamp(), min(), max() functions
- [ ] CSS :is() and :where() selectors
- [ ] Backdrop-filter support
- [ ] CSS scroll-behavior smooth

### CSS Implementation Patterns:
```css
/* Bad - No fallbacks */
.container {
  display: grid;
  gap: 1rem;
  aspect-ratio: 16 / 9;
  container-type: inline-size;
}

/* Good - With fallbacks */
.container {
  /* Fallback for older browsers */
  display: flex;
  flex-wrap: wrap;
  margin: -0.5rem;
  
  /* Modern browsers */
  @supports (display: grid) {
    display: grid;
    gap: 1rem;
    margin: 0;
  }
  
  /* Aspect ratio with fallback */
  position: relative;
  padding-bottom: 56.25%; /* 16:9 fallback */
  
  @supports (aspect-ratio: 16 / 9) {
    aspect-ratio: 16 / 9;
    padding-bottom: 0;
  }
}

/* CSS Variables with fallbacks */
.element {
  /* Fallback for browsers without CSS variable support */
  color: #007bff;
  color: var(--primary-color, #007bff);
  
  /* Logical properties with fallbacks */
  margin-left: 1rem; /* Fallback */
  margin-inline-start: 1rem; /* Modern */
}

/* Vendor prefixes where needed */
.smooth-scroll {
  -webkit-scroll-behavior: smooth; /* Safari */
  scroll-behavior: smooth;
}

/* Feature queries */
@supports (backdrop-filter: blur(10px)) {
  .modal-backdrop {
    backdrop-filter: blur(10px);
  }
}

@supports not (backdrop-filter: blur(10px)) {
  .modal-backdrop {
    background: rgba(0, 0, 0, 0.5);
  }
}
```

### CSS Grid/Flexbox Fallbacks:
```css
/* Grid with flexbox fallback */
.grid {
  /* Flexbox fallback */
  display: flex;
  flex-wrap: wrap;
}

.grid > * {
  flex: 1 1 300px;
  margin: 0.5rem;
}

/* Grid enhancement for modern browsers */
@supports (display: grid) {
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1rem;
  }
  
  .grid > * {
    margin: 0;
  }
}
```

## 3. Safari/iOS Specific Issues

### Safari Compatibility Problems:
- [ ] Date input type issues
- [ ] 100vh problem with mobile Safari
- [ ] PWA limitations on iOS
- [ ] Smooth scrolling bugs
- [ ] Position fixed with transform
- [ ] Touch event handling differences
- [ ] Audio/Video autoplay restrictions
- [ ] IndexedDB storage limits
- [ ] Regex lookbehind assertions
- [ ] CSS overflow scrolling

### Safari-Specific Fixes:
```javascript
// Date handling for Safari
function parseDateString(dateString) {
  // Safari doesn't parse YYYY-MM-DD correctly
  if (dateString.includes('-')) {
    const [year, month, day] = dateString.split('-');
    return new Date(year, month - 1, day);
  }
  return new Date(dateString);
}

// 100vh fix for mobile Safari
function setViewportHeight() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

window.addEventListener('resize', setViewportHeight);
window.addEventListener('orientationchange', setViewportHeight);
setViewportHeight();

// CSS usage
.fullscreen {
  height: 100vh;
  height: calc(var(--vh, 1vh) * 100);
}

// Touch event handling for iOS
function handleTouch(e) {
  // iOS Safari sometimes doesn't prevent default properly
  e.preventDefault();
  e.stopPropagation();
  
  const touch = e.touches[0] || e.changedTouches[0];
  // Handle touch...
}

// Smooth scroll polyfill for Safari
if (!('scrollBehavior' in document.documentElement.style)) {
  import('smoothscroll-polyfill').then(smoothscroll => {
    smoothscroll.polyfill();
  });
}

// PWA install prompt (not supported on iOS)
if ('BeforeInstallPromptEvent' in window) {
  // Chrome/Edge PWA install
} else {
  // Show iOS-specific install instructions
  if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
    showIOSInstallInstructions();
  }
}
```

### iOS-Specific CSS:
```css
/* iOS bounce scroll */
.scrollable {
  -webkit-overflow-scrolling: touch;
  overflow-y: scroll;
}

/* iOS tap highlight */
button, a {
  -webkit-tap-highlight-color: transparent;
}

/* iOS font size adjustment */
body {
  -webkit-text-size-adjust: 100%;
}

/* iOS input zoom prevention */
input, textarea, select {
  font-size: 16px; /* Prevents zoom on focus */
}

/* Safe area for notched devices */
.container {
  padding: env(safe-area-inset-top) 
           env(safe-area-inset-right) 
           env(safe-area-inset-bottom) 
           env(safe-area-inset-left);
}
```

## 4. Internet Explorer 11 Support (if required)

### IE11 Compatibility Issues:
- [ ] Fetch API not supported
- [ ] Promise polyfill needed
- [ ] CSS Grid limited support
- [ ] No CSS variables
- [ ] No arrow functions
- [ ] No template literals
- [ ] No ES6 modules
- [ ] No classList on SVG elements

### IE11 Polyfills Setup:
```javascript
// next.config.js for IE11 support
module.exports = {
  target: 'es5',
  compiler: {
    // Ensure transpilation for IE11
    exclude: /node_modules/,
  },
};

// Polyfills for IE11 (polyfills.js)
import 'core-js/stable';
import 'regenerator-runtime/runtime';

// Fetch polyfill
if (!window.fetch) {
  require('whatwg-fetch');
}

// Promise polyfill
if (!window.Promise) {
  window.Promise = require('promise-polyfill').default;
}

// Object.assign polyfill
if (typeof Object.assign !== 'function') {
  Object.assign = require('object-assign');
}

// Custom Event polyfill
(function() {
  if (typeof window.CustomEvent === 'function') return false;
  
  function CustomEvent(event, params) {
    params = params || { bubbles: false, cancelable: false, detail: null };
    const evt = document.createEvent('CustomEvent');
    evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
    return evt;
  }
  
  window.CustomEvent = CustomEvent;
})();

// _app.js or layout.js
import './polyfills';
```

### IE11 Specific Styles:
```css
/* IE11 specific hacks */
@media screen and (-ms-high-contrast: active), (-ms-high-contrast: none) {
  /* IE11 specific styles */
  .flex-container {
    display: -ms-flexbox;
    display: flex;
  }
  
  .grid-container {
    display: -ms-grid;
    -ms-grid-columns: 1fr 1fr 1fr;
  }
}

/* Feature detection for IE11 */
.modern-feature {
  display: none;
}

@supports (display: grid) {
  .modern-feature {
    display: block;
  }
  
  .ie-fallback {
    display: none;
  }
}
```

## 5. Chrome/Chromium Specific Considerations

### Chrome-Specific Features:
- [ ] WebUSB API usage
- [ ] Web Bluetooth API
- [ ] File System Access API
- [ ] Native File System API
- [ ] Idle Detection API
- [ ] Screen Wake Lock API

### Chrome Feature Detection:
```javascript
// Chrome-specific API detection
const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);

// Feature-based detection instead of browser detection
async function useAdvancedFeatures() {
  // File System Access API (Chrome/Edge)
  if ('showOpenFilePicker' in window) {
    try {
      const [fileHandle] = await window.showOpenFilePicker();
      const file = await fileHandle.getFile();
      // Process file
    } catch (err) {
      // User cancelled or error
    }
  } else {
    // Fallback to input type="file"
    const input = document.createElement('input');
    input.type = 'file';
    input.click();
  }
  
  // Screen Wake Lock (Chrome/Edge)
  if ('wakeLock' in navigator) {
    try {
      const wakeLock = await navigator.wakeLock.request('screen');
      // Wake lock acquired
    } catch (err) {
      // Wake lock failed
    }
  }
  
  // Web Share API with feature detection
  if (navigator.share) {
    await navigator.share({
      title: 'Title',
      text: 'Text',
      url: 'https://example.com',
    });
  } else {
    // Fallback to custom share buttons
    showShareButtons();
  }
}
```

## 6. Firefox Specific Compatibility

### Firefox Issues:
- [ ] Date picker UI differences
- [ ] Scroll behavior differences
- [ ] CSS backdrop-filter support
- [ ] WebP image support (older versions)
- [ ] OffscreenCanvas support

### Firefox-Specific Handling:
```javascript
// Firefox detection and handling
const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;

// Firefox-specific date handling
if (isFirefox) {
  // Firefox has different date picker behavior
  document.querySelectorAll('input[type="date"]').forEach(input => {
    input.addEventListener('click', function() {
      this.showPicker?.(); // Firefox may need explicit trigger
    });
  });
}

// Smooth scroll behavior for Firefox
function smoothScrollTo(element) {
  if ('scrollBehavior' in document.documentElement.style) {
    element.scrollIntoView({ behavior: 'smooth' });
  } else {
    // Fallback for older Firefox versions
    const scrollY = element.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: scrollY, behavior: 'smooth' });
  }
}
```

### Firefox CSS:
```css
/* Firefox specific styles */
@-moz-document url-prefix() {
  .firefox-specific {
    /* Firefox only styles */
  }
  
  /* Firefox scrollbar styling */
  .scrollable {
    scrollbar-width: thin;
    scrollbar-color: #888 #f1f1f1;
  }
}

/* Firefox input styling */
input[type="number"] {
  -moz-appearance: textfield;
}

input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
```

## 7. Edge Legacy vs Modern Edge

### Edge Compatibility:
```javascript
// Edge detection
const isEdge = window.navigator.userAgent.indexOf('Edge') > -1;
const isEdgeChromium = window.navigator.userAgent.indexOf('Edg/') > -1;

// Legacy Edge specific handling
if (isEdge && !isEdgeChromium) {
  // Legacy Edge (EdgeHTML)
  // Limited CSS Grid support
  // No CSS variables in pseudo-elements
  // Different clipboard API
}

// Modern Edge (Chromium-based)
if (isEdgeChromium) {
  // Supports most Chrome features
  // May have different default behaviors
}

// Clipboard API compatibility
async function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    // Modern browsers
    await navigator.clipboard.writeText(text);
  } else if (window.clipboardData && window.clipboardData.setData) {
    // IE/Legacy Edge
    window.clipboardData.setData('Text', text);
  } else {
    // Fallback
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }
}
```

## 8. Mobile Browser Compatibility

### Mobile-Specific Issues:
- [ ] Touch event vs Pointer event handling
- [ ] Virtual keyboard behavior
- [ ] Orientation change handling
- [ ] Mobile gesture conflicts
- [ ] Battery Status API
- [ ] Device motion/orientation APIs
- [ ] Mobile viewport issues

### Mobile Browser Handling:
```javascript
// Touch/Pointer event normalization
function addPointerListener(element, callback) {
  if (window.PointerEvent) {
    // Modern pointer events
    element.addEventListener('pointerdown', callback);
  } else if ('ontouchstart' in window) {
    // Touch events
    element.addEventListener('touchstart', callback);
    element.addEventListener('mousedown', callback); // Also mouse for desktop
  } else {
    // Mouse only
    element.addEventListener('mousedown', callback);
  }
}

// Virtual keyboard handling
function handleVirtualKeyboard() {
  const viewport = document.querySelector('meta[name="viewport"]');
  const initialContent = viewport.getAttribute('content');
  
  // iOS virtual keyboard
  document.addEventListener('focusin', (e) => {
    if (e.target.matches('input, textarea')) {
      // Prevent zoom on iOS
      viewport.setAttribute('content', initialContent + ', maximum-scale=1');
    }
  });
  
  document.addEventListener('focusout', () => {
    viewport.setAttribute('content', initialContent);
  });
  
  // Android virtual keyboard resize handling
  let windowHeight = window.innerHeight;
  window.addEventListener('resize', () => {
    if (window.innerHeight < windowHeight * 0.75) {
      document.body.classList.add('keyboard-open');
    } else {
      document.body.classList.remove('keyboard-open');
    }
  });
}

// Orientation handling
function handleOrientation() {
  // Modern approach
  if (screen.orientation) {
    screen.orientation.addEventListener('change', () => {
      console.log(`Orientation: ${screen.orientation.angle}`);
    });
  } else {
    // Legacy approach
    window.addEventListener('orientationchange', () => {
      console.log(`Orientation: ${window.orientation}`);
    });
  }
}
```

## 9. Progressive Enhancement Strategy

### Feature Detection Pattern:
```javascript
// Progressive enhancement utilities
const features = {
  intersectionObserver: 'IntersectionObserver' in window,
  resizeObserver: 'ResizeObserver' in window,
  webp: false, // Set via image test
  avif: false,
  serviceWorker: 'serviceWorker' in navigator,
  webGL: (() => {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && 
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch(e) {
      return false;
    }
  })(),
  webAudio: 'AudioContext' in window || 'webkitAudioContext' in window,
  localStorage: (() => {
    try {
      const test = 'test';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch(e) {
      return false;
    }
  })(),
};

// Image format detection
function checkImageFormat(format) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    
    if (format === 'webp') {
      img.src = 'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==';
    } else if (format === 'avif') {
      img.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIABoAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A==';
    }
  });
}

// Initialize feature detection
async function initializeFeatures() {
  features.webp = await checkImageFormat('webp');
  features.avif = await checkImageFormat('avif');
  
  // Store in document for CSS
  document.documentElement.classList.add(
    ...Object.entries(features)
      .filter(([_, supported]) => supported)
      .map(([feature]) => `has-${feature}`)
  );
}

// Progressive component loading
function loadComponent(componentName) {
  if (features.intersectionObserver) {
    // Lazy load with Intersection Observer
    return import(`./components/${componentName}`);
  } else {
    // Load immediately for older browsers
    return import(`./components/${componentName}/fallback`);
  }
}
```

## 10. Polyfill Strategy

### Polyfill Loading:
```javascript
// Dynamic polyfill loading based on browser capabilities
async function loadPolyfills() {
  const polyfills = [];

  // Check and load required polyfills
  if (!window.IntersectionObserver) {
    polyfills.push(import('intersection-observer'));
  }

  if (!window.ResizeObserver) {
    polyfills.push(import('resize-observer-polyfill').then(module => {
      window.ResizeObserver = module.default;
    }));
  }

  if (!Element.prototype.matches) {
    Element.prototype.matches = Element.prototype.msMatchesSelector;
  }

  if (!Element.prototype.closest) {
    polyfills.push(import('element-closest-polyfill'));
  }

  if (!window.fetch) {
    polyfills.push(import('whatwg-fetch'));
  }

  if (!Object.entries) {
    polyfills.push(import('core-js/features/object/entries'));
  }

  if (!Array.prototype.includes) {
    polyfills.push(import('core-js/features/array/includes'));
  }

  if (!String.prototype.startsWith) {
    polyfills.push(import('core-js/features/string/starts-with'));
  }

  // Wait for all polyfills to load
  await Promise.all(polyfills);
}

// Load polyfills before app initialization
loadPolyfills().then(() => {
  // Initialize app
  import('./app').then(({ initApp }) => {
    initApp();
  });
});
```

### Next.js Polyfill Configuration:
```javascript
// next.config.js
module.exports = {
  // For older browser support
  experimental: {
    runtime: 'nodejs',
    fallback: true,
  },
  
  // Custom webpack config for polyfills
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Client-side polyfills
      const originalEntry = config.entry;
      config.entry = async () => {
        const entries = await originalEntry();
        
        if (entries['main.js'] && !entries['main.js'].includes('./polyfills.js')) {
          entries['main.js'].unshift('./polyfills.js');
        }
        
        return entries;
      };
    }
    
    return config;
  },
};
```

## 11. Browser Testing Strategy

### Testing Matrix:
```yaml
# Browser testing requirements
Desktop:
  Chrome: [Latest, Latest-1, Latest-2]
  Firefox: [Latest, Latest-1, ESR]
  Safari: [Latest, Latest-1]
  Edge: [Latest, Latest-1]
  
Mobile:
  iOS Safari: [15, 14, 13]
  Chrome Android: [Latest]
  Samsung Internet: [Latest]
  Firefox Android: [Latest]

Optional (based on analytics):
  Opera: [Latest]
  UC Browser: [Latest]
  QQ Browser: [Latest]
```

### Automated Testing:
```javascript
// playwright.config.js for cross-browser testing
module.exports = {
  projects: [
    {
      name: 'Chrome',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'Safari',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
};

// Cross-browser test example
test.describe('Cross-browser compatibility', () => {
  test('should work in all browsers', async ({ page, browserName }) => {
    await page.goto('/');
    
    // Browser-specific assertions
    if (browserName === 'webkit') {
      // Safari-specific tests
      expect(await page.evaluate(() => window.safari)).toBeDefined();
    }
    
    if (browserName === 'firefox') {
      // Firefox-specific tests
      expect(await page.evaluate(() => window.mozInnerScreenX)).toBeDefined();
    }
    
    // Common functionality tests
    await expect(page.locator('h1')).toBeVisible();
  });
});
```

## 12. Performance Differences Across Browsers

### Performance Considerations:
```javascript
// Browser-specific performance optimizations
function optimizeForBrowser() {
  const ua = navigator.userAgent.toLowerCase();
  
  // Safari performance optimizations
  if (ua.includes('safari') && !ua.includes('chrome')) {
    // Reduce animation complexity
    document.documentElement.style.setProperty('--animation-duration', '0.2s');
    
    // Disable heavy effects
    document.documentElement.classList.add('reduce-effects');
  }
  
  // Mobile browser optimizations
  if (/mobile|android|ios/i.test(ua)) {
    // Reduce particle effects
    window.particleCount = 50; // Instead of 200
    
    // Simplify animations
    document.documentElement.classList.add('simple-animations');
    
    // Lazy load more aggressively
    window.lazyLoadOffset = 500; // Pixels before viewport
  }
  
  // Low-end device detection
  if (navigator.hardwareConcurrency <= 2 || navigator.deviceMemory < 4) {
    document.documentElement.classList.add('low-end-device');
    
    // Disable non-essential features
    window.enableParticles = false;
    window.enableSmoothScroll = false;
  }
}

// CSS for performance optimization
/* Reduce effects for Safari */
.reduce-effects .complex-animation {
  animation: none;
  transition: opacity 0.2s;
}

/* Simple animations for mobile */
.simple-animations * {
  animation-duration: 0.2s !important;
  animation-timing-function: ease !important;
}

/* Low-end device optimizations */
.low-end-device .parallax {
  transform: none !important;
}

.low-end-device .blur-effect {
  backdrop-filter: none;
  background: rgba(0, 0, 0, 0.8);
}
```

## Output Format

For each compatibility issue found, provide:

```markdown
### Issue: [Browser feature or API incompatibility]
**Affected Browsers**: [List of browsers and versions]
**Browser Support**: [Percentage of global users affected]
**Severity**: Critical/High/Medium/Low
**File(s)**: [Specific file paths]

**Current Implementation**:
```[current code without fallbacks]```

**Compatible Implementation**:
```[code with fallbacks/polyfills]```

**Polyfill Required**:
```[polyfill code or npm package]```

**Progressive Enhancement**:
```[feature detection and enhancement code]```

**Testing Notes**:
[How to test in different browsers]

**Performance Impact**:
[Impact of polyfills/fallbacks on performance]
```

## Priority Classification

### Critical (Site Broken):
- JavaScript syntax errors in target browsers
- CSS layout completely broken
- Core functionality unavailable
- Payment/checkout failures

### High (Feature Broken):
- Important features not working
- Form inputs not functioning
- Media not playing
- Navigation issues

### Medium (Degraded Experience):
- Visual inconsistencies
- Animation glitches
- Minor functionality gaps
- Performance differences

### Low (Enhancement):
- Missing nice-to-have features
- Slight visual differences
- Optional API usage
- Progressive enhancements

## Testing Checklist

1. **Core Functionality**: Works without JavaScript?
2. **CSS Layout**: Displays correctly without Grid/Flexbox?
3. **Forms**: All inputs work across browsers?
4. **Media**: Images/videos load and play?
5. **Navigation**: Links and routing work?
6. **Interactions**: Touch/mouse/keyboard work?
7. **Performance**: Acceptable speed on all browsers?
8. **Accessibility**: Screen readers work?
9. **Print**: Print styles work?
10. **Offline**: Service worker compatible?

## Questions to Answer

1. What is the minimum browser version supported?
2. Are all modern JavaScript features transpiled?
3. Are CSS features properly prefixed?
4. Do all polyfills load conditionally?
5. Is there graceful degradation for unsupported features?
6. Are browser-specific bugs addressed?
7. Does the site work without JavaScript?
8. Are there browser-specific performance issues?
9. Is the site tested on real devices?
10. Are analytics showing browser-related errors?

Please provide a comprehensive browser compatibility audit with specific browser support percentages, required polyfills, and progressive enhancement strategies to ensure consistent experience across all target browsers.