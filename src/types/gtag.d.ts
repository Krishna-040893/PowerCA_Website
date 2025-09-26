/* eslint-disable @typescript-eslint/no-explicit-any */
interface Window {
  gtag: (
    command: 'config' | 'event',
    targetId: string,
    config?: any
  ) => void
  dataLayer: any[]
}

declare global {
  interface Window {
    dataLayer: any[]
  }
}