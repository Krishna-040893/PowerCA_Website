/**
 * Polyfills for browser compatibility
 * This file loads polyfills conditionally based on browser support
 */

/**
 * Load all required polyfills
 */
export async function loadPolyfills() {
  const polyfills = [];

  // Check for missing features and load polyfills
  if (typeof window !== 'undefined') {
    // IntersectionObserver polyfill
    if (!window.IntersectionObserver) {
      polyfills.push(
        import('intersection-observer').catch(err => {
          console.warn('Failed to load IntersectionObserver polyfill:', err);
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

    // Smooth scroll polyfill (for Safari)
    if (!('scrollBehavior' in document.documentElement.style)) {
      polyfills.push(
        import('smoothscroll-polyfill').then(module => {
          module.polyfill();
        }).catch(err => {
          console.warn('Failed to load smooth scroll polyfill:', err);
        })
      );
    }

    // Element.prototype.closest polyfill
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

    // Element.prototype.matches polyfill
    if (!Element.prototype.matches) {
      Element.prototype.matches =
        (Element.prototype as any).msMatchesSelector ||
        Element.prototype.webkitMatchesSelector;
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

    // Object.values polyfill
    if (!Object.values) {
      Object.values = function(obj: any) {
        return Object.keys(obj).map(key => obj[key]);
      };
    }

    // Array.prototype.includes polyfill
    if (!Array.prototype.includes) {
      Array.prototype.includes = function(searchElement: any, fromIndex?: number) {
        const O = Object(this);
        const len = parseInt(O.length, 10) || 0;
        if (len === 0) return false;

        const n = parseInt(String(fromIndex), 10) || 0;
        let k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

        while (k < len) {
          if (O[k] === searchElement) return true;
          k++;
        }
        return false;
      };
    }

    // String.prototype.startsWith polyfill
    if (!String.prototype.startsWith) {
      String.prototype.startsWith = function(searchString: string, position?: number) {
        position = position || 0;
        return this.substring(position, position + searchString.length) === searchString;
      };
    }

    // String.prototype.endsWith polyfill
    if (!String.prototype.endsWith) {
      String.prototype.endsWith = function(searchString: string, length?: number) {
        if (length === undefined || length > this.length) {
          length = this.length;
        }
        return this.substring(length - searchString.length, length) === searchString;
      };
    }

    // String.prototype.includes polyfill
    if (!String.prototype.includes) {
      String.prototype.includes = function(search: string, start?: number) {
        if (typeof start !== 'number') {
          start = 0;
        }

        if (start + search.length > this.length) {
          return false;
        } else {
          return this.indexOf(search, start) !== -1;
        }
      };
    }

    // Array.from polyfill
    if (!Array.from) {
      Array.from = function(arrayLike: any, mapFn?: Function, thisArg?: any) {
        const C = this;
        const items = Object(arrayLike);
        if (arrayLike == null) {
          throw new TypeError('Array.from requires an array-like object - not null or undefined');
        }

        const len = items.length >>> 0;
        const A = typeof C === 'function' ? Object(new C(len)) : new Array(len);

        let k = 0;
        while (k < len) {
          const kValue = items[k];
          if (mapFn) {
            A[k] = typeof thisArg === 'undefined' ? mapFn(kValue, k) : mapFn.call(thisArg, kValue, k);
          } else {
            A[k] = kValue;
          }
          k++;
        }

        A.length = len;
        return A;
      };
    }

    // Promise.finally polyfill
    if (!Promise.prototype.finally) {
      Promise.prototype.finally = function(callback: () => void) {
        const P = this.constructor as PromiseConstructor;
        return this.then(
          value => P.resolve(callback()).then(() => value),
          reason => P.resolve(callback()).then(() => { throw reason; })
        );
      };
    }

    // CustomEvent polyfill for IE
    if (typeof window.CustomEvent !== 'function') {
      function CustomEvent(event: string, params?: CustomEventInit) {
        params = params || { bubbles: false, cancelable: false, detail: null };
        const evt = document.createEvent('CustomEvent');
        evt.initCustomEvent(event, params.bubbles || false, params.cancelable || false, params.detail);
        return evt;
      }
      CustomEvent.prototype = window.Event.prototype;
      window.CustomEvent = CustomEvent as any;
    }

    // RequestIdleCallback polyfill
    if (!window.requestIdleCallback) {
      (window as any).requestIdleCallback = function(callback: Function, options?: { timeout?: number }) {
        const start = Date.now();
        return setTimeout(function() {
          callback({
            didTimeout: false,
            timeRemaining: function() {
              return Math.max(0, 50 - (Date.now() - start));
            }
          });
        }, options?.timeout || 1);
      };

      (window as any).cancelIdleCallback = function(id: number) {
        clearTimeout(id);
      };
    }
  }

  // Wait for all polyfills to load
  if (polyfills.length > 0) {
    await Promise.all(polyfills);
    console.log(`Loaded ${polyfills.length} dynamic polyfills`);
  }
}

/**
 * Check if polyfills are needed
 */
export function needsPolyfills(): boolean {
  if (typeof window === 'undefined') return false;

  return (
    !window.IntersectionObserver ||
    !window.ResizeObserver ||
    !('scrollBehavior' in document.documentElement.style) ||
    !Element.prototype.closest ||
    !Object.entries ||
    !Array.prototype.includes ||
    !String.prototype.startsWith ||
    !Promise.prototype.finally ||
    !window.requestIdleCallback
  );
}