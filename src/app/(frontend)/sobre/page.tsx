import React from 'react'

import { RichText } from '@/components/RichText'
import { JsonLd, Page, Picture, SectionHead } from '@/components/ui'
import { getGlobal, getSettings } from '@/lib/data'
import { asMedia } from '@/lib/media'
import { pageMetadata, personLd } from '@/lib/seo'

export async function generateMetadata() {
  const g = await getGlobal('sobre')
  return pageMetadata({ title: g.seo?.title || g.title, description: g.seo?.description, path: '/sobre', image: g.photo })
}

export default async function SobrePage() {
  const [settings, g, home] = await Promise.all([getSettings(), getGlobal('sobre'), getGlobal('inicio')])
  const statement = home.statement
  const steps = g.processo?.steps || []
  const gallery = (g.processo?.gallery || []).map((x) => asMedia(x.image)).filter(Boolean)
  return (
    <Page settings={settings} current="sobre">
      <section className="about-page container">
        {g.photo ? (
          <div className="about-photo about-photo--sticky">
            <Picture media={g.photo} sizes="(max-width: 900px) 70vw, 340px" eager />
          </div>
        ) : null}
        <div className="about-copy prose" id="mariane-nunes">
          {g.kicker ? <p className="page-kicker">{g.kicker}</p> : null}
          <h1>{g.title}</h1>
          <RichText data={g.body as any} />
          {g.pullQuote ? <blockquote className="pull-quote">{g.pullQuote}</blockquote> : null}
        </div>
      </section>
      {statement?.quote ? (
        <section className="statement" aria-label="Manifesto">
          <div className="container statement-inner">
            <p className="statement-quote">{statement.quote}</p>
            {statement.text ? <p className="statement-text">{statement.text}</p> : null}
          </div>
        </section>
      ) : null}
      {g.processo?.title ? (
        <section className="section" aria-labelledby="processo-title">
          <div className="container">
            <SectionHead id="processo-title" title={g.processo.title} lede={g.processo.lede} />
            {steps.length ? (
              <ol className="process-steps">
                {steps.map((s, i) => (
                  <li key={s.id || i}>
                    <span className={`step-swatch step-swatch--${(i % 5) + 1}`} aria-hidden="true" />
                    <h3>{s.title}</h3>
                    {s.text ? <p>{s.text}</p> : null}
                  </li>
                ))}
              </ol>
            ) : null}
            {gallery.length ? (
              <div className="process-gallery">
                {gallery.map((m, i) => (
                  <figure key={i}>
                    <Picture media={m} sizes="(max-width: 700px) 92vw, 30vw" maxFallback={1200} />
                  </figure>
                ))}
              </div>
            ) : null}
            {g.processo.caption ? <p className="process-caption">{g.processo.caption}</p> : null}
          </div>
        </section>
      ) : null}
      {g.influencias?.groups?.length ? (
        <section className="section section--mist" aria-labelledby="influencias-title">
          <div className="container">
            <SectionHead id="influencias-title" title={g.influencias.title || 'Influências e inspirações'} />
            <div className="influences">
              {g.influencias.groups.map((group, i) => (
                <div className="influence-group" key={group.id || i}>
                  <h3>{group.title}</h3>
                  <dl>
                    {(group.items || []).map((it, j) => (
                      <div key={it.id || j}>
                        <dt>{it.name}</dt>
                        {it.text ? <dd>{it.text}</dd> : null}
                      </div>
                    ))}
                  </dl>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}
      {g.cta?.title ? (
        <section className="section">
          <div className="container commission">
            <h2>{g.cta.title}</h2>
            {g.cta.text ? <p>{g.cta.text}</p> : null}
            <a className="btn btn-primary" href="/contato">
              {g.cta.label || 'Entrar em contato'}
            </a>
          </div>
        </section>
      ) : null}
      <JsonLd data={await personLd()} />
    </Page>
  )
}
