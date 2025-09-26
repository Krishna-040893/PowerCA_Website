declare module 'intersection-observer' {
  // This is a polyfill module that doesn't export anything
  // It just adds IntersectionObserver to the global window object
}

declare module 'smoothscroll-polyfill' {
  export function polyfill(): void
}