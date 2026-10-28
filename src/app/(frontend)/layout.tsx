import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import React from 'react'

import { getSettings } from '@/lib/data'
import './style.css'

export const viewport: Viewport = { themeColor: '#F5F0E6' }

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
      </head>
      <body>
        {children}
        <Script src="/js/main.js" strategy="afterInteractive" />
      </body>
    </html>
  )
}
