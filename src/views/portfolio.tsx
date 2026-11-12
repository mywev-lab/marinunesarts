import React from 'react'

import { WORK_CATEGORIES } from '@/collections/Obras'
import { JsonLd, Page, WorkCard } from '@/components/ui'
import { getGlobal, getObras, getSettings } from '@/lib/data'
import { dict, localizePath, type Locale } from '@/lib/i18n'
import { absoluteUrl } from '@/lib/media'
import { pageMetadata } from '@/lib/seo'

export async function portfolioMetadata(locale: Locale) {
  const g = await getGlobal('pagina-portfolio', locale)
  return pageMetadata({ locale, title: g.seo?.title || g.title, description: g.seo?.description, path: '/portfolio' })
}

export async function PortfolioView({ locale }: { locale: Locale }) {
  const [settings, g, obras] = await Promise.all([getSettings(locale), getGlobal('pagina-portfolio', locale), getObras(locale)])
  const t = dict(locale)
  const filters = ['todas', ...WORK_CATEGORIES.map((c) => c.value)]
  return (
    <Page settings={settings} locale={locale} path="/portfolio" current="portfolio">
      <section className="page-intro">
        <div className="container">
          <h1>{g.title}</h1>
          {g.lede ? <p className="page-lede">{g.lede}</p> : null}
        </div>
      </section>
      <section className="section section--tight" aria-label={t.works}>
        <div className="container">
          <div className="filters" role="group" aria-label={t.filterWorks}>
            {filters.map((value, i) => (
              <button key={value} type="button" className="filter-btn" data-filter={value} aria-pressed={i === 0}>
                {t.categories[value]}
              </button>
            ))}
          </div>
          <div className="grid grid--3" id="gallery">
            {obras.map((w) => (
              <WorkCard key={w.id} work={w} locale={locale} />
            ))}
          </div>
          <p className="gallery-empty" id="gallery-empty" hidden>
            {t.emptyCategory}
          </p>
        </div>
      </section>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          itemListElement: obras.map((w, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            url: absoluteUrl(localizePath(`/obras/${w.slug}`, locale), settings.siteUrl),
            name: w.title,
          })),
        }}
      />
    </Page>
  )
}
