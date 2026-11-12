import React from 'react'

import { RichText } from '@/components/RichText'
import { Page } from '@/components/ui'
import { getGlobal, getSettings } from '@/lib/data'
import { dict, type Locale } from '@/lib/i18n'
import { pageMetadata } from '@/lib/seo'

export async function privacidadeMetadata(locale: Locale) {
  const g = await getGlobal('privacidade', locale)
  return pageMetadata({ locale, title: g.title, brand: true, description: dict(locale).privacyDescription, path: '/privacidade', noindex: true })
}

export async function PrivacidadeView({ locale }: { locale: Locale }) {
  const [settings, g] = await Promise.all([getSettings(locale), getGlobal('privacidade', locale)])
  return (
    <Page settings={settings} locale={locale} path="/privacidade">
      <section className="legal container prose">
        <h1>{g.title}</h1>
        <RichText data={g.body as any} locale={locale} />
      </section>
    </Page>
  )
}
