'use client'

import Script from 'next/script'

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || 'GTM-5QRPSNJQ'

export const GoogleTagManager = () => {
  return (
    <>
      {/* Google Tag Manager - Script */}
      <Script
        id="gtm-script"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${GTM_ID}');
          `,
        }}
      />
    </>
  )
}

export const GoogleTagManagerNoscript = () => {
  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
        height="0"
        width="0"
        style={{ display: 'none', visibility: 'hidden' }}
      />
    </noscript>
  )
}

// GTM data layer values can be strings, numbers, booleans, or nested objects
type GTMValue = string | number | boolean | null | undefined | GTMValue[] | { [key: string]: GTMValue }

// Helper function to push events to dataLayer
export const pushToDataLayer = (data: Record<string, GTMValue>) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push(data)
  }
}

// Common GTM event helpers
export const trackGTMEvent = (eventName: string, parameters?: Record<string, GTMValue>) => {
  pushToDataLayer({
    event: eventName,
    ...parameters,
  })
}

export const trackGTMPageView = (pagePath: string, pageTitle?: string) => {
  pushToDataLayer({
    event: 'page_view',
    page_path: pagePath,
    page_title: pageTitle || document.title,
  })
}

export const trackGTMFormSubmit = (formName: string, formData?: Record<string, GTMValue>) => {
  pushToDataLayer({
    event: 'form_submit',
    form_name: formName,
    form_data: formData,
  })
}

export const trackGTMPurchase = (transactionData: {
  transaction_id: string
  value: number
  currency: string
  items?: Array<{
    item_id: string
    item_name: string
    price: number
    quantity: number
  }>
}) => {
  pushToDataLayer({
    event: 'purchase',
    ecommerce: {
      ...transactionData,
    },
  })
}

export const trackGTMSignup = (method: string, userId?: string) => {
  pushToDataLayer({
    event: 'sign_up',
    method: method,
    user_id: userId,
  })
}

export const trackGTMButtonClick = (buttonName: string, buttonLocation?: string) => {
  pushToDataLayer({
    event: 'button_click',
    button_name: buttonName,
    button_location: buttonLocation,
  })
}