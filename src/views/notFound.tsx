import React from 'react'

import { Page } from '@/components/ui'
import { getSettings } from '@/lib/data'
import { dict, localizePath, type Locale } from '@/lib/i18n'

export async function NotFoundView({ locale }: { locale: Locale }) {
  const settings = await getSettings(locale)
  const t = dict(locale)
  return (
    <Page settings={settings} locale={locale} path="/">
      <section className="page-intro">
        <div className="container">
          <h1>{t.notFoundTitle}</h1>
          <p className="page-lede">{t.notFoundText}</p>
          <p style={{ marginTop: '2rem', display: 'flex', gap: '.8rem', flexWrap: 'wrap' }}>
            <a className="btn btn-primary" href={localizePath('/portfolio', locale)}>
              {t.seePortfolio}
            </a>
            <a className="btn btn-outline" href={localizePath('/blog', locale)}>
              {t.readBlog}
            </a>
          </p>
        </div>
      </section>
      <div style={{ height: '6rem' }} />
    </Page>
  )
}
