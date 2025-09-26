'use client';

import { useEffect } from 'react';
import { browserFeatures, setViewportHeightProperty, isIOS, isSafari, isLowEndDevice } from '@/lib/browser-compat';

/**
 * Browser Feature Detection Component
 * Adds feature classes to HTML element and handles browser-specific fixes
 */
export function BrowserCheck() {
  useEffect(() => {
    // Add feature classes to HTML element
    const html = document.documentElement;

    // Add browser feature classes
    Object.entries(browserFeatures).forEach(([feature, supported]) => {
      const className = `has-${feature.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      if (supported) {
        html.classList.add(className);
      } else {
        html.classList.add(`no-${className.substring(4)}`); // no-feature-name
      }
    });

    // Add browser-specific classes
    if (isIOS()) {
      html.classList.add('is-ios');
    }

    if (isSafari()) {
      html.classList.add('is-safari');
    }

    if (isLowEndDevice()) {
      html.classList.add('low-end-device');
    }

    // Handle iOS viewport height
    setViewportHeightProperty();

    // Handle iOS input zoom prevention
    if (isIOS()) {
      const metaViewport = document.querySelector('meta[name="viewport"]');
      if (metaViewport) {
        const content = metaViewport.getAttribute('content') || '';
        if (!content.includes('maximum-scale')) {
          metaViewport.setAttribute(
            'content',
            content + ', maximum-scale=1.0, user-scalable=no'
          );
        }
      }
    }

    // Load polyfills if needed
    loadPolyfillsIfNeeded();

    // Cleanup function
    return () => {
      // Remove event listeners if any were added
    };
  }, []);

  return null;
}

/**
 * Load polyfills conditionally based on browser support
 */
async function loadPolyfillsIfNeeded() {
  const polyfills = [];

  // Intersection Observer polyfill
  if (!window.IntersectionObserver) {
    polyfills.push(
      import('intersection-observer').catch(err => {
        console.warn('Failed to load IntersectionObserver polyfill:', err);
      })
    );
  }

  // Smooth scroll polyfill for Safari
  if (isSafari() && !('scrollBehavior' in document.documentElement.style)) {
    polyfills.push(
      import('smoothscroll-polyfill').then(module => {
        module.polyfill();
      }).catch(err => {
        console.warn('Failed to load smooth scroll polyfill:', err);
      })
    );
  }

  // ResizeObserver polyfill
  if (!window.ResizeObserver) {
    polyfills.push(
      import('resize-observer-polyfill').then(module => {
        window.ResizeObserver = module.default;
      }).catch(err => {
        console.warn('Failed to load ResizeObserver polyfill:', err);
      })
    );
  }

  // Element.closest polyfill
  if (!Element.prototype.closest) {
    Element.prototype.closest = function(selector: string) {
      let element: Element | null = this;
      while (element && element.nodeType === 1) {
        if (element.matches(selector)) return element;
        element = element.parentElement;
      }
      return null;
    };
  }

  // Object.entries polyfill
  if (!Object.entries) {
    Object.entries = function(obj: any) {
      const ownProps = Object.keys(obj);
      let i = ownProps.length;
      const resArray = new Array(i);
      while (i--) {
        resArray[i] = [ownProps[i], obj[ownProps[i]]];
      }
      return resArray;
    };
  }

  // Wait for all polyfills to load
  if (polyfills.length > 0) {
    await Promise.all(polyfills);
    console.log(`Loaded ${polyfills.length} polyfills for browser compatibility`);
  }
}