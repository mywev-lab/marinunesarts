import React from 'react'

import { DigitalCard, Page, SectionHead, WorkCard } from '@/components/ui'
import { getGlobal, getObras, getProdutos, getSettings } from '@/lib/data'
import { pageMetadata } from '@/lib/seo'
import { contactUrl, slugify } from '@/lib/text'

export async function generateMetadata() {
  const g = await getGlobal('pagina-produtos')
  return pageMetadata({ title: g.seo?.title || g.title, description: g.seo?.description, path: '/produtos' })
}

export default async function ProdutosPage() {
  const [settings, g, produtos, obras] = await Promise.all([getSettings(), getGlobal('pagina-produtos'), getProdutos(), getObras()])
  const categories = [...new Set(produtos.map((p) => p.category || 'Produtos'))]
  const forSale = obras.filter((o) => o.forSale)
  return (
    <Page settings={settings} current="produtos">
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
              <SectionHead id={id} title={`${cat} digitais`} lede={g.digitalLede} />
              <div className="grid grid--4">
                {produtos
                  .filter((p) => (p.category || 'Produtos') === cat)
                  .map((p) => (
                    <DigitalCard key={p.id} product={p} />
                  ))}
              </div>
            </div>
          </section>
        )
      })}
      {forSale.length ? (
        <section className="section section--tight" aria-labelledby="obras-title">
          <div className="container">
            <SectionHead id="obras-title" title={g.worksTitle || 'Obras originais e impressões'} lede={g.worksLede} />
            <div className="grid grid--4">
              {forSale.map((w) => (
                <WorkCard key={w.id} work={w} variant="shop" />
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
            <a className="btn btn-primary" href={contactUrl({ assunto: 'Solicitar uma encomenda' })}>
              {g.commission.label || 'Solicitar uma encomenda'}
            </a>
          </div>
        </section>
      ) : null}
    </Page>
  )
}
