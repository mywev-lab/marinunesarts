import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import React from 'react'

import { getSettings } from '@/lib/data'
import './style.css'

export const viewport: Viewport = { themeColor: '#F5F0E6' }

/** Google Tag Manager do site (as tags, como o Google Analytics, são configuradas no próprio GTM) */
const GTM_ID = 'GTM-5T5HFRXH'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings()
  return {
    metadataBase: new URL(settings.siteUrl),
    authors: [{ name: settings.authorName }],
    icons: {
      icon: [{ url: '/images/icons/favicon-32.png', sizes: '32x32', type: 'image/png' }],
      apple: '/images/icons/apple-touch-icon.png',
    },
  }
}

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400..700;1,400..700&family=Young+Serif&display=swap"
          rel="stylesheet"
        />
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`}
        </Script>
      </head>
      <body>
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
            title="Google Tag Manager"
          />
        </noscript>
        {children}
        <Script src="/js/main.js" strategy="afterInteractive" />
      </body>
    </html>
  )
}
