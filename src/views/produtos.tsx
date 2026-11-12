import React from 'react'

import { DigitalCard, Page, SectionHead, WorkCard } from '@/components/ui'
import { getGlobal, getObras, getProdutos, getSettings } from '@/lib/data'
import { dict, type Locale } from '@/lib/i18n'
import { pageMetadata } from '@/lib/seo'
import { contactUrl, slugify } from '@/lib/text'

export async function produtosMetadata(locale: Locale) {
  const g = await getGlobal('pagina-produtos', locale)
  return pageMetadata({ locale, title: g.seo?.title || g.title, description: g.seo?.description, path: '/produtos' })
}

export async function ProdutosView({ locale }: { locale: Locale }) {
  const [settings, g, produtos, obras] = await Promise.all([
    getSettings(locale),
    getGlobal('pagina-produtos', locale),
    getProdutos(locale),
    getObras(locale),
  ])
  const t = dict(locale)
  const digital = produtos.filter((p) => p.type !== 'print')
  const prints = produtos.filter((p) => p.type === 'print')
  const categories = [...new Set(digital.map((p) => p.category || t.defaultCategory))]
  const forSale = obras.filter((o) => o.forSale)
  return (
    <Page settings={settings} locale={locale} path="/produtos" current="produtos">
      <section className="page-intro">
        <div className="container">
          <h1>{g.title}</h1>
          {g.lede ? <p className="page-lede">{g.lede}</p> : null}
        </div>
      </section>
      {categories.map((cat) => {
        const id = `${slugify(cat)}-title`
        return (
          <section key={cat} className="section section--tight" aria-labelledby={id}>
            <div className="container">
              <SectionHead id={id} locale={locale} title={t.digitalCategory(cat)} lede={g.digitalLede} />
              <div className="grid grid--4">
                {digital
                  .filter((p) => (p.category || t.defaultCategory) === cat)
                  .map((p) => (
                    <DigitalCard key={p.id} product={p} locale={locale} />
                  ))}
              </div>
            </div>
          </section>
        )
      })}
      {prints.length ? (
        <section className="section section--tight" aria-labelledby="prints-title">
          <div className="container">
            <SectionHead id="prints-title" locale={locale} title={g.printsTitle || t.artPrints} lede={g.printsLede} />
            <div className="grid grid--4">
              {prints.map((p) => (
                <DigitalCard key={p.id} product={p} locale={locale} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
      {forSale.length ? (
        <section className="section section--tight" aria-labelledby="obras-title">
          <div className="container">
            <SectionHead id="obras-title" locale={locale} title={g.worksTitle || t.originalWorks} lede={g.worksLede} />
            <div className="grid grid--4">
              {forSale.map((w) => (
                <WorkCard key={w.id} work={w} locale={locale} variant="shop" />
              ))}
            </div>
          </div>
        </section>
      ) : null}
      {g.commission?.title ? (
        <section className="section">
          <div className="container commission">
            <h2>{g.commission.title}</h2>
            {g.commission.text ? <p>{g.commission.text}</p> : null}
            <a className="btn btn-primary" href={contactUrl({ assunto: t.subjects.commission }, locale)}>
              {g.commission.label || t.requestCommission}
            </a>
          </div>
        </section>
      ) : null}
    </Page>
  )
}
