import { notFound } from 'next/navigation'
import React from 'react'

import { Breadcrumb, DigitalCard, JsonLd, Page, Picture, SectionHead } from '@/components/ui'
import { getGlobal, getPosts, getProduto, getProdutos, getSettings } from '@/lib/data'
import { dict, localizePath, type Locale } from '@/lib/i18n'
import { absoluteUrl, asMedia, pick } from '@/lib/media'
import { breadcrumbLd, pageMetadata } from '@/lib/seo'
import { contactUrl } from '@/lib/text'
import type { Obra } from '@/payload-types'

export async function produtoParams() {
  return (await getProdutos('pt')).map((p) => ({ slug: p.slug }))
}

export async function produtoMetadata(locale: Locale, slug: string) {
  const p = await getProduto(slug, locale)
  if (!p) return {}
  return pageMetadata({
    locale,
    title: `${p.name}: ${p.kind}`,
    brand: true,
    description: p.summary.slice(0, 300),
    path: `/produtos/${p.slug}`,
    image: p.images?.[0]?.image,
  })
}

export async function ProdutoView({ locale, slug }: { locale: Locale; slug: string }) {
  const [settings, g, produtos, p, posts] = await Promise.all([
    getSettings(locale),
    getGlobal('pagina-produtos', locale),
    getProdutos(locale),
    getProduto(slug, locale),
    getPosts(locale),
  ])
  if (!p) notFound()
  const t = dict(locale)
  const L = (path: string) => localizePath(path, locale)
  const images = (p.images || []).map((im) => asMedia(im.image)).filter((m): m is NonNullable<typeof m> => Boolean(m))
  const isPrint = p.type === 'print'
  const others = produtos.filter((o) => o.id !== p.id && (o.type === 'print') === isPrint)
  const guide = isPrint ? undefined : posts.find((x) => x.slug === 'como-usar-planner-digital')
  const works = (p.works || []).filter((w): w is Obra => typeof w === 'object' && w !== null)
  const buyUrl = p.etsy || contactUrl({ assunto: isPrint ? t.subjects.buyPrint : t.subjects.digitalQuestion, obra: p.name }, locale)
  const path = `/produtos/${p.slug}`
  const crumbs: [string, string][] = [
    ['/', t.nav.inicio],
    ['/produtos', t.nav.produtos],
    [path, p.name],
  ]
  return (
    <Page settings={settings} locale={locale} path={path} current="produtos">
      <div className="container">
        <Breadcrumb items={crumbs} locale={locale} />
      </div>
      <article className="work product container">
        <div className="product-gallery" data-gallery>
          <div className={`product-main card-mat--product${isPrint ? ' product-main--print' : ''}`}>
            <Picture media={images[0]} sizes="(max-width: 960px) 92vw, 50vw" eager maxFallback={1200} />
          </div>
          <ul className="product-thumbs" aria-label={t.moreImages}>
            {images.map((im, i) => {
              const full = pick(im, 1200)
              return (
                <li key={im.id}>
                  <button
                    type="button"
                    aria-label={t.viewImage(i + 1, images.length)}
                    aria-current={i === 0}
                    data-full={full?.url}
                    data-full-webp={full?.url}
                    data-alt={im.alt}
                  >
                    <Picture media={im} alt="" sizes="120px" maxSrc={480} maxFallback={480} />
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
        <div className="work-info">
          <p className="product-kind">{p.kind}</p>
          <h1>{p.name}</h1>
          <p className="product-price">
            {p.price || t.priceOnRequest} <span>{isPrint ? t.printLower : t.digitalLower}</span>
          </p>
          <div className="work-desc">
            <p>{p.summary}</p>
          </div>
          <div className="work-actions">
            {p.etsy ? (
              <a className="btn btn-primary" href={p.etsy} target="_blank" rel="noopener">
                {t.buyOnEtsy}
              </a>
            ) : (
              <a className="btn btn-primary" href={buyUrl}>
                {isPrint ? t.requestThisPrint : t.askAboutProduct}
              </a>
            )}
          </div>
          {!isPrint && g.purchaseNote ? <p className="work-note">{g.purchaseNote}</p> : null}
          {works.length ? (
            <p className="work-read">
              {works.length > 1 ? t.originalWorksLabel : t.originalWorkLabel}
              {works.map((w, i) => (
                <React.Fragment key={w.id}>
                  {i ? t.and : ''}
                  <a href={L(`/obras/${w.slug}`)}>{w.title}</a>
                </React.Fragment>
              ))}
            </p>
          ) : null}
          {p.specs?.length ? (
            <dl className="specs">
              {p.specs.map((s) => (
                <div key={s.id || s.label}>
                  <dt>{s.label}</dt>
                  <dd>{s.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>
      </article>
      {isPrint && !p.includes?.length ? null : (
        <section className="section section--tight" aria-labelledby="inclui-title">
          <div className="container product-details">
            <div>
              <h2 id="inclui-title" className="h3">
                {isPrint ? t.inTheOrder : t.inThePlanner}
              </h2>
              <ul className="check-list">
                {(p.includes || []).map((x) => (
                  <li key={x.id || x.text}>{x.text}</li>
                ))}
              </ul>
            </div>
            {isPrint ? null : (
              <div>
                <h2 className="h3">{t.howToUse}</h2>
                <ol className="step-list">
                  {(g.howToUse || []).map((x) => (
                    <li key={x.id || x.text}>{x.text}</li>
                  ))}
                </ol>
                {g.digitalNote ? <p className="work-note">{g.digitalNote}</p> : null}
                {guide ? (
                  <p className="work-read">
                    {t.fullGuide} <a href={L(`/blog/${guide.slug}`)}>{guide.title}</a>
                  </p>
                ) : null}
              </div>
            )}
          </div>
        </section>
      )}
      {others.length ? (
        <section className="section section--mist" aria-labelledby="outros-title">
          <div className="container">
            <SectionHead id="outros-title" locale={locale} title={t.youMayLike} link={['/produtos', t.seeAllProducts]} />
            <div className="grid grid--4">
              {others.map((o) => (
                <DigitalCard key={o.id} product={o} locale={locale} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
      <JsonLd
        data={[
          {
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: `${p.name} — ${p.kind}`,
            ...(works.length
              ? { isRelatedTo: works.map((w) => ({ '@type': 'VisualArtwork', name: w.title, url: absoluteUrl(L(`/obras/${w.slug}`), settings.siteUrl) })) }
              : {}),
            description: p.summary,
            image: images.map((im) => absoluteUrl(pick(im, 1200)?.url, settings.siteUrl)),
            brand: { '@type': 'Brand', name: settings.siteName },
            ...(p.priceValue && p.etsy
              ? { offers: { '@type': 'Offer', price: p.priceValue.toFixed(2), priceCurrency: p.currency || 'USD', availability: 'https://schema.org/InStock', url: p.etsy } }
              : {}),
          },
          await breadcrumbLd(crumbs, locale),
        ]}
      />
    </Page>
  )
}
