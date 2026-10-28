import { notFound } from 'next/navigation'
import React from 'react'

import { JsonLd, Page, Picture, SectionHead, WorkCard, Breadcrumb } from '@/components/ui'
import { getObra, getObras, getPosts, getSettings } from '@/lib/data'
import { absoluteUrl, asMedia, pick } from '@/lib/media'
import { authorRef, breadcrumbLd, pageMetadata } from '@/lib/seo'
import { STATUS_LABEL, contactUrl, paragraphs } from '@/lib/text'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return (await getObras()).map((o) => ({ slug: o.slug }))
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const w = await getObra(slug)
  if (!w) return {}
  const desc = `${w.title}, ${w.technique.toLowerCase()}${w.year ? `, ${w.year}` : ''}. ${paragraphs(w.description)[0] || ''}`.slice(0, 300)
  return pageMetadata({ title: `${w.title} | Mari Nunes Arts`, description: desc, path: `/obras/${w.slug}`, image: w.image, type: 'article' })
}

/** Artigo do blog que explica a técnica da obra */
async function techniquePost(technique: string) {
  const posts = await getPosts()
  if (/^giz pastel oleoso/i.test(technique)) return posts.find((p) => p.slug === 'giz-pastel-oleoso')
  if (/^aquarela/i.test(technique)) return posts.find((p) => p.slug === 'pintura-aquarela-iniciantes')
  return undefined
}

export default async function WorkPage({ params }: Props) {
  const { slug } = await params
  const [settings, obras, w] = await Promise.all([getSettings(), getObras(), getObra(slug)])
  if (!w) notFound()
  const i = obras.findIndex((o) => o.id === w.id)
  const prev = obras[(i - 1 + obras.length) % obras.length]
  const next = obras[(i + 1) % obras.length]
  const related = obras.filter((o) => o.id !== w.id && (o.categories || []).some((c) => c !== 'colecoes' && (w.categories || []).includes(c))).slice(0, 3)
  const specs = [
    ['Técnica', w.technique],
    ['Dimensões', w.dimensions],
    ['Ano', w.year],
    ['Formato', w.format],
    ['Situação', w.status ? STATUS_LABEL[w.status] : 'Consulte a disponibilidade'],
  ].filter(([, v]) => v) as [string, string][]
  const mockups = (w.mockups || []).map((m) => asMedia(m.image)).filter(Boolean)
  const post = await techniquePost(w.technique)
  const crumbs: [string, string][] = [
    ['/', 'Início'],
    ['/portfolio', 'Portfólio'],
    [`/obras/${w.slug}`, w.title],
  ]
  const image = asMedia(w.image)

  let action = { href: contactUrl({ assunto: 'Comprar uma obra', obra: w.title }), label: 'Perguntar sobre esta obra' }
  if (w.status === 'disponivel') action = { href: contactUrl({ assunto: 'Comprar uma obra', obra: w.title }), label: 'Tenho interesse nesta obra' }
  if (w.status === 'colecao-particular' || w.status === 'vendida')
    action = { href: contactUrl({ assunto: 'Solicitar uma encomenda', obra: w.title }), label: 'Encomendar uma obra parecida' }

  return (
    <Page settings={settings} current="portfolio">
      <div className="container">
        <Breadcrumb items={crumbs} />
      </div>
      <article className="work container">
        <div className="work-media">
          <Picture media={w.image} sizes="(max-width: 960px) 92vw, 55vw" eager maxFallback={1200} />
        </div>
        <div className="work-info">
          <h1>{w.title}</h1>
          <dl className="specs">
            {specs.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          <div className="work-desc">
            {paragraphs(w.description).map((p, j) => (
              <p key={j}>{p}</p>
            ))}
          </div>
          {w.etsy?.note ? <p className="work-note">{w.etsy.note}</p> : null}
          <div className="work-actions">
            <a className="btn btn-primary" href={action.href}>
              {action.label}
            </a>
            {w.etsy?.url ? (
              <a className="btn btn-outline" href={w.etsy.url} target="_blank" rel="noopener">
                {w.etsy.label || 'Ver na Etsy'}
              </a>
            ) : null}
          </div>
          {w.instagram ? (
            <a className="text-link" href={w.instagram} target="_blank" rel="noopener">
              Ver a publicação no Instagram
            </a>
          ) : null}
          {post ? (
            <p className="work-read">
              Sobre a técnica, no Diário do Ateliê: <a href={`/blog/${post.slug}`}>{post.title}</a>
            </p>
          ) : null}
        </div>
      </article>
      {mockups.length ? (
        <section className="section section--tight" aria-labelledby="parede-title">
          <div className="container">
            <h2 id="parede-title" className="h3">
              Na parede
            </h2>
            <div className={`wall-grid wall-grid--${mockups.length}`}>
              {mockups.map((m, j) => (
                <figure key={j}>
                  <Picture media={m} sizes="(max-width: 700px) 92vw, 45vw" maxFallback={1200} />
                </figure>
              ))}
            </div>
          </div>
        </section>
      ) : null}
      <nav className="container work-nav" aria-label="Outras obras">
        <a href={`/obras/${prev.slug}`} rel="prev">
          <span>Obra anterior</span>
          {prev.title}
        </a>
        <a href={`/obras/${next.slug}`} rel="next">
          <span>Próxima obra</span>
          {next.title}
        </a>
      </nav>
      {related.length ? (
        <section className="section section--mist" aria-labelledby="relacionadas-title">
          <div className="container">
            <SectionHead id="relacionadas-title" title="Outras obras" link={['/portfolio', 'Ver o portfólio completo']} />
            <div className="grid grid--3">
              {related.map((o) => (
                <WorkCard key={o.id} work={o} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
      <JsonLd
        data={[
          {
            '@context': 'https://schema.org',
            '@type': 'VisualArtwork',
            name: w.title,
            artform: 'Pintura',
            artMedium: w.technique,
            ...(w.year ? { dateCreated: w.year } : {}),
            creator: await authorRef(),
            image: image ? absoluteUrl(pick(image, 1200)?.url, settings.siteUrl) : undefined,
            description: paragraphs(w.description).join(' '),
            url: absoluteUrl(`/obras/${w.slug}`, settings.siteUrl),
          },
          await breadcrumbLd(crumbs),
        ]}
      />
    </Page>
  )
}
