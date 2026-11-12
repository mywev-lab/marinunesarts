import type { Metadata } from 'next'
import Script from 'next/script'
import React from 'react'

import { CookieBanner } from '@/components/ui'
import { getSettings } from '@/lib/data'
import { HTML_LANG, type Locale } from '@/lib/i18n'

/** Google Tag Manager do site (as tags, como o Google Analytics, são configuradas no próprio GTM) */
const GTM_ID = 'GTM-5T5HFRXH'
/** Escolha do aviso de cookies, guardada no navegador ('aceito' ou 'recusado'); vale para os dois idiomas */
const CONSENT_KEY = 'efugio-cookies'

export async function documentMetadata(locale: Locale): Promise<Metadata> {
  const settings = await getSettings(locale)
  return {
    metadataBase: new URL(settings.siteUrl),
    authors: [{ name: settings.authorName }],
    icons: {
      icon: [{ url: '/images/icons/favicon-32.png', sizes: '32x32', type: 'image/png' }],
      apple: '/images/icons/apple-touch-icon.png',
    },
  }
}

/** Estrutura comum das páginas (português em /, inglês em /en) */
export async function SiteDocument({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  const settings = await getSettings(locale)
  return (
    <html lang={HTML_LANG[locale]}>
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
gtag('consent', 'default', {ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied', functionality_storage: 'granted', security_storage: 'granted', wait_for_update: 500});
try { if (localStorage.getItem('${CONSENT_KEY}') === 'aceito') gtag('consent', 'update', {ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted', analytics_storage: 'granted'}); } catch (e) {}
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
        <CookieBanner settings={settings} locale={locale} />
        <Script src="/js/main.js" strategy="afterInteractive" />
      </body>
    </html>
  )
}
