import { notFound } from 'next/navigation'
import React from 'react'

import { Breadcrumb, JsonLd, Page, Picture, SectionHead, WorkCard } from '@/components/ui'
import { getGlobal, getObra, getObras, getPosts, getProdutos, getSettings } from '@/lib/data'
import { HTML_LANG, dict, localizePath, type Locale } from '@/lib/i18n'
import { absoluteUrl, asMedia, pick } from '@/lib/media'
import { authorRef, breadcrumbLd, pageMetadata } from '@/lib/seo'
import { contactUrl, paragraphs } from '@/lib/text'

export async function obraParams() {
  return (await getObras('pt')).map((o) => ({ slug: o.slug }))
}

export async function obraMetadata(locale: Locale, slug: string) {
  const w = await getObra(slug, locale)
  if (!w) return {}
  const desc = `${w.title}, ${w.technique.toLowerCase()}${w.year ? `, ${w.year}` : ''}. ${paragraphs(w.description)[0] || ''}`.slice(0, 300)
  return pageMetadata({ locale, title: w.title, brand: true, description: desc, path: `/obras/${w.slug}`, image: w.image, type: 'article' })
}

/** Artigo do blog que explica a técnica da obra */
async function techniquePost(technique: string, locale: Locale) {
  const posts = await getPosts(locale)
  if (/^(giz pastel oleoso|oil pastel)/i.test(technique)) return posts.find((p) => p.slug === 'giz-pastel-oleoso')
  if (/^(aquarela|watercolou?r)/i.test(technique)) return posts.find((p) => p.slug === 'pintura-aquarela-iniciantes')
  return undefined
}

export async function ObraView({ locale, slug }: { locale: Locale; slug: string }) {
  const [settings, obras, w, produtos, loja] = await Promise.all([
    getSettings(locale),
    getObras(locale),
    getObra(slug, locale),
    getProdutos(locale),
    getGlobal('pagina-produtos', locale),
  ])
  if (!w) notFound()
  const t = dict(locale)
  const L = (p: string) => localizePath(p, locale)
  const prints = produtos.filter((p) => p.type === 'print' && (p.works || []).some((x) => (typeof x === 'object' ? x?.id : x) === w.id))
  const i = obras.findIndex((o) => o.id === w.id)
  const prev = obras[(i - 1 + obras.length) % obras.length]
  const next = obras[(i + 1) % obras.length]
  const related = obras.filter((o) => o.id !== w.id && (o.categories || []).some((c) => c !== 'colecoes' && (w.categories || []).includes(c))).slice(0, 3)
  const specs = [
    [t.specs.technique, w.technique],
    [t.specs.dimensions, w.dimensions],
    [t.specs.year, w.year],
    [t.specs.format, w.format],
    [t.specs.status, w.status ? t.status[w.status] : t.askAvailability],
  ].filter(([, v]) => v) as [string, string][]
  const mockups = (w.mockups || []).map((m) => asMedia(m.image)).filter(Boolean)
  const post = await techniquePost(w.technique, locale)
  const path = `/obras/${w.slug}`
  const crumbs: [string, string][] = [
    ['/', t.nav.inicio],
    ['/portfolio', t.nav.portfolio],
    [path, w.title],
  ]
  const image = asMedia(w.image)
  const contact = (assunto: string) => contactUrl({ assunto, obra: w.title }, locale)

  // Prints: todas as obras podem ser pedidas em print (texto em Páginas → Produtos); se houver um produto de print,
  // leva até ele (de preferência o print só desta obra, e não um conjunto)
  const print = prints.find((p) => (p.works || []).length === 1) || prints[0]
  const printAction = loja.printNote
    ? print
      ? { href: L(`/produtos/${print.slug}`), label: t.seePrint }
      : { href: contact(t.subjects.buyPrint), label: t.requestPrint }
    : null

  // Original: com print em destaque, o botão deixa claro que a pergunta é sobre a obra original
  let action = { href: contact(t.subjects.buyWork), label: printAction ? t.askAboutOriginal : t.askAboutWork }
  if (w.status === 'disponivel') action = { href: contact(t.subjects.buyWork), label: printAction ? t.askAboutOriginal : t.interestedInWork }
  if (w.status === 'colecao-particular' || w.status === 'vendida') action = { href: contact(t.subjects.commission), label: t.commissionSimilar }

  return (
    <Page settings={settings} locale={locale} path={path} current="portfolio">
      <div className="container">
        <Breadcrumb items={crumbs} locale={locale} />
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
            {/* o print vem primeiro (destaque); o original continua sob consulta */}
            {printAction ? (
              <a className="btn btn-primary" href={printAction.href}>
                {printAction.label}
              </a>
            ) : null}
            <a className={`btn ${printAction ? 'btn-outline' : 'btn-primary'}`} href={action.href}>
              {action.label}
            </a>
            {w.etsy?.url ? (
              <a className="btn btn-outline" href={w.etsy.url} target="_blank" rel="noopener">
                {w.etsy.label || t.viewOnEtsy}
              </a>
            ) : null}
          </div>
          {loja.printNote ? <p className="work-note">{loja.printNote}</p> : null}
          {w.instagram ? (
            <a className="text-link" href={w.instagram} target="_blank" rel="noopener">
              {t.seeInstagram}
            </a>
          ) : null}
          {post ? (
            <p className="work-read">
              {t.aboutTechnique} <a href={L(`/blog/${post.slug}`)}>{post.title}</a>
            </p>
          ) : null}
        </div>
      </article>
      {mockups.length ? (
        <section className="section section--tight" aria-labelledby="parede-title">
          <div className="container">
            <h2 id="parede-title" className="h3">
              {t.onTheWall}
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
      <nav className="container work-nav" aria-label={t.otherWorks}>
        <a href={L(`/obras/${prev.slug}`)} rel="prev">
          <span>{t.previousWork}</span>
          {prev.title}
        </a>
        <a href={L(`/obras/${next.slug}`)} rel="next">
          <span>{t.nextWork}</span>
          {next.title}
        </a>
      </nav>
      {related.length ? (
        <section className="section section--mist" aria-labelledby="relacionadas-title">
          <div className="container">
            <SectionHead id="relacionadas-title" locale={locale} title={t.otherWorks} link={['/portfolio', t.seeFullPortfolio]} />
            <div className="grid grid--3">
              {related.map((o) => (
                <WorkCard key={o.id} work={o} locale={locale} />
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
            artform: t.painting,
            artMedium: w.technique,
            ...(w.year ? { dateCreated: w.year } : {}),
            creator: await authorRef(locale),
            image: image ? absoluteUrl(pick(image, 1200)?.url, settings.siteUrl) : undefined,
            description: paragraphs(w.description).join(' '),
            url: absoluteUrl(L(path), settings.siteUrl),
            inLanguage: HTML_LANG[locale],
          },
          await breadcrumbLd(crumbs, locale),
        ]}
      />
    </Page>
  )
}
