/**
 * Browser Compatibility Utilities
 * Provides feature detection and browser-specific helpers
 */

/**
 * Browser feature detection object
 */
export const browserFeatures = {
  hasClipboardAPI: typeof navigator !== 'undefined' &&
    'clipboard' in navigator &&
    typeof window !== 'undefined' &&
    window.isSecureContext,

  hasBackdropFilter: typeof CSS !== 'undefined' &&
    CSS.supports &&
    (CSS.supports('backdrop-filter', 'blur(1px)') ||
     CSS.supports('-webkit-backdrop-filter', 'blur(1px)')),

  hasIntersectionObserver: typeof window !== 'undefined' &&
    'IntersectionObserver' in window,

  hasResizeObserver: typeof window !== 'undefined' &&
    'ResizeObserver' in window,

  hasMutationObserver: typeof window !== 'undefined' &&
    'MutationObserver' in window,

  hasWebShare: typeof navigator !== 'undefined' &&
    'share' in navigator,

  hasVibrate: typeof navigator !== 'undefined' &&
    'vibrate' in navigator,

  hasServiceWorker: typeof navigator !== 'undefined' &&
    'serviceWorker' in navigator,

  hasNotifications: typeof window !== 'undefined' &&
    'Notification' in window,

  hasGeolocation: typeof navigator !== 'undefined' &&
    'geolocation' in navigator,
};

/**
 * Check if the browser is Safari
 */
export function isSafari(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent.toLowerCase();
  return ua.includes('safari') && !ua.includes('chrome') && !ua.includes('android');
}

/**
 * Check if the device is iOS
 */
export function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iPhone|iPad|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1); // iPad Pro detection
}

/**
 * Check if the browser is Firefox
 */
export function isFirefox(): boolean {
  if (typeof navigator === 'undefined') return false;
  return navigator.userAgent.toLowerCase().includes('firefox');
}

/**
 * Check if the browser is Chrome
 */
export function isChrome(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent.toLowerCase();
  return ua.includes('chrome') && !ua.includes('edg');
}

/**
 * Check if the browser is Edge
 */
export function isEdge(): boolean {
  if (typeof navigator === 'undefined') return false;
  return navigator.userAgent.toLowerCase().includes('edg');
}

/**
 * Get browser name and version
 */
export function getBrowserInfo(): { name: string; version: string } {
  if (typeof navigator === 'undefined') {
    return { name: 'unknown', version: 'unknown' };
  }

  const ua = navigator.userAgent;
  let browserName = 'unknown';
  let browserVersion = 'unknown';

  if (isChrome()) {
    browserName = 'Chrome';
    const match = ua.match(/Chrome\/(\d+)/);
    if (match) browserVersion = match[1];
  } else if (isFirefox()) {
    browserName = 'Firefox';
    const match = ua.match(/Firefox\/(\d+)/);
    if (match) browserVersion = match[1];
  } else if (isSafari()) {
    browserName = 'Safari';
    const match = ua.match(/Version\/(\d+)/);
    if (match) browserVersion = match[1];
  } else if (isEdge()) {
    browserName = 'Edge';
    const match = ua.match(/Edg\/(\d+)/);
    if (match) browserVersion = match[1];
  }

  return { name: browserName, version: browserVersion };
}

/**
 * Check if the device is mobile
 */
export function isMobile(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

/**
 * Check if the device supports touch
 */
export function hasTouch(): boolean {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    (window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
}

/**
 * Copy text to clipboard with fallback for older browsers
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  // Try modern Clipboard API first
  if (browserFeatures.hasClipboardAPI) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn('Clipboard API failed, using fallback', err);
    }
  }

  // Fallback for older browsers
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  textArea.style.top = '-999999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    const successful = document.execCommand('copy');
    return successful;
  } catch (err) {
    console.error('Fallback copy failed', err);
    return false;
  } finally {
    document.body.removeChild(textArea);
  }
}

/**
 * Parse date string safely for Safari
 */
export function parseDateSafely(dateString: string | Date): Date {
  if (dateString instanceof Date) {
    return dateString;
  }

  // Handle empty or invalid strings
  if (!dateString) {
    return new Date();
  }

  // Safari doesn't parse YYYY-MM-DD correctly
  if (isSafari() && dateString.includes('-')) {
    // Handle ISO 8601 format
    if (dateString.includes('T')) {
      // Replace - with / for Safari compatibility
      const safariDate = dateString.replace(/-/g, '/').replace('T', ' ').replace(/\.\d+Z?$/, '');
      return new Date(safariDate);
    } else {
      // Handle date-only format (YYYY-MM-DD)
      const parts = dateString.split('-');
      if (parts.length === 3) {
        return new Date(
          parseInt(parts[0], 10),
          parseInt(parts[1], 10) - 1,
          parseInt(parts[2], 10)
        );
      }
    }
  }

  // Default parsing for other browsers
  return new Date(dateString);
}

/**
 * Format date to ISO string safely
 */
export function toISOStringSafely(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseDateSafely(date) : date;

  // Check for invalid date
  if (isNaN(dateObj.getTime())) {
    console.warn('Invalid date provided to toISOStringSafely:', date);
    return new Date().toISOString();
  }

  return dateObj.toISOString();
}

/**
 * Get viewport height accounting for mobile browsers
 */
export function getViewportHeight(): number {
  if (typeof window === 'undefined') return 0;

  // Use visualViewport API if available (better for mobile)
  if (window.visualViewport) {
    return window.visualViewport.height;
  }

  // Fallback to innerHeight
  return window.innerHeight;
}

/**
 * Set CSS custom property for viewport height (mobile-safe)
 */
export function setViewportHeightProperty(): void {
  if (typeof window === 'undefined') return;

  const updateHeight = () => {
    const vh = getViewportHeight() * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  };

  updateHeight();

  // Update on resize and orientation change
  window.addEventListener('resize', updateHeight);
  window.addEventListener('orientationchange', updateHeight);

  // Update on visual viewport change (mobile keyboard, etc.)
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', updateHeight);
  }
}

/**
 * Check if a CSS feature is supported
 */
export function supportsCSSFeature(property: string, value: string): boolean {
  if (typeof CSS === 'undefined' || !CSS.supports) return false;
  return CSS.supports(property, value);
}

/**
 * Load polyfill conditionally
 */
export async function loadPolyfill(
  condition: boolean,
  polyfillLoader: () => Promise<any>
): Promise<void> {
  if (!condition) {
    await polyfillLoader();
  }
}

/**
 * Get safe area insets for notched devices
 */
export function getSafeAreaInsets() {
  if (typeof window === 'undefined') return { top: 0, right: 0, bottom: 0, left: 0 };

  const computedStyle = getComputedStyle(document.documentElement);

  return {
    top: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-top)') || '0'),
    right: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-right)') || '0'),
    bottom: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-bottom)') || '0'),
    left: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-left)') || '0'),
  };
}

/**
 * Detect if the device is low-end
 */
export function isLowEndDevice(): boolean {
  if (typeof navigator === 'undefined') return false;

  // Check hardware concurrency (CPU cores)
  const cores = navigator.hardwareConcurrency || 0;

  // Check device memory (if available)
  const memory = (navigator as any).deviceMemory || 0;

  // Consider device low-end if it has 2 or fewer cores OR less than 4GB RAM
  return cores <= 2 || (memory > 0 && memory < 4);
}

/**
 * Request idle callback with fallback
 */
export function requestIdleCallbackPolyfill(
  callback: () => void,
  options?: { timeout?: number }
): number {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    return (window as any).requestIdleCallback(callback, options);
  }

  // Fallback using setTimeout
  return window.setTimeout(callback, options?.timeout || 1);
}

/**
 * Cancel idle callback with fallback
 */
export function cancelIdleCallbackPolyfill(id: number): void {
  if (typeof window !== 'undefined' && 'cancelIdleCallback' in window) {
    (window as any).cancelIdleCallback(id);
  } else {
    window.clearTimeout(id);
  }
}