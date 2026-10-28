import React from 'react'

import { WORK_CATEGORIES } from '@/collections/Obras'
import { JsonLd, Page, WorkCard } from '@/components/ui'
import { getGlobal, getObras, getSettings } from '@/lib/data'
import { absoluteUrl } from '@/lib/media'
import { pageMetadata } from '@/lib/seo'

export async function generateMetadata() {
  const g = await getGlobal('pagina-portfolio')
  return pageMetadata({ title: g.seo?.title || g.title, description: g.seo?.description, path: '/portfolio' })
}

export default async function PortfolioPage() {
  const [settings, g, obras] = await Promise.all([getSettings(), getGlobal('pagina-portfolio'), getObras()])
  const filters = [{ value: 'todas', label: 'Todas' }, ...WORK_CATEGORIES]
  return (
    <Page settings={settings} current="portfolio">
      <section className="page-intro">
        <div className="container">
          <h1>{g.title}</h1>
          {g.lede ? <p className="page-lede">{g.lede}</p> : null}
        </div>
      </section>
      <section className="section section--tight" aria-label="Obras">
        <div className="container">
          <div className="filters" role="group" aria-label="Filtrar obras">
            {filters.map((f, i) => (
              <button key={f.value} type="button" className="filter-btn" data-filter={f.value} aria-pressed={i === 0}>
                {f.label}
              </button>
            ))}
          </div>
          <div className="grid grid--3" id="gallery">
            {obras.map((w) => (
              <WorkCard key={w.id} work={w} />
            ))}
          </div>
          <p className="gallery-empty" id="gallery-empty" hidden>
            Ainda não há obras nesta categoria.
          </p>
        </div>
      </section>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          itemListElement: obras.map((w, i) => ({ '@type': 'ListItem', position: i + 1, url: absoluteUrl(`/obras/${w.slug}`, settings.siteUrl), name: w.title })),
        }}
      />
    </Page>
  )
}
