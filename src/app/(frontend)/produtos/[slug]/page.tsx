import { notFound } from 'next/navigation'
import React from 'react'

import { Breadcrumb, DigitalCard, JsonLd, Page, Picture, SectionHead } from '@/components/ui'
import { getGlobal, getPosts, getProduto, getProdutos, getSettings } from '@/lib/data'
import { absoluteUrl, asMedia, pick } from '@/lib/media'
import { breadcrumbLd, pageMetadata } from '@/lib/seo'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return (await getProdutos()).map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const p = await getProduto(slug)
  if (!p) return {}
  return pageMetadata({ title: `${p.name}: ${p.kind} | Mari Nunes Arts`, description: p.summary.slice(0, 300), path: `/produtos/${p.slug}`, image: p.images?.[0]?.image })
}

export default async function ProdutoPage({ params }: Props) {
  const { slug } = await params
  const [settings, g, produtos, p, posts] = await Promise.all([getSettings(), getGlobal('pagina-produtos'), getProdutos(), getProduto(slug), getPosts()])
  if (!p) notFound()
  const images = (p.images || []).map((im) => asMedia(im.image)).filter((m): m is NonNullable<typeof m> => Boolean(m))
  const others = produtos.filter((o) => o.id !== p.id)
  const guide = posts.find((x) => x.slug === 'como-usar-planner-digital')
  const crumbs: [string, string][] = [
    ['/', 'Início'],
    ['/produtos', 'Produtos'],
    [`/produtos/${p.slug}`, p.name],
  ]
  return (
    <Page settings={settings} current="produtos">
      <div className="container">
        <Breadcrumb items={crumbs} />
      </div>
      <article className="work product container">
        <div className="product-gallery" data-gallery>
          <div className="product-main card-mat--product">
            <Picture media={images[0]} sizes="(max-width: 960px) 92vw, 50vw" eager maxFallback={1200} />
          </div>
          <ul className="product-thumbs" aria-label="Mais imagens">
            {images.map((im, i) => {
              const full = pick(im, 1200)
              return (
                <li key={im.id}>
                  <button type="button" aria-label={`Ver imagem ${i + 1} de ${images.length}`} aria-current={i === 0} data-full={full?.url} data-full-webp={full?.url} data-alt={im.alt}>
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
            {p.price} <span>download digital</span>
          </p>
          <div className="work-desc">
            <p>{p.summary}</p>
          </div>
          <div className="work-actions">
            <a className="btn btn-primary" href={p.etsy} target="_blank" rel="noopener">
              Comprar na Etsy
            </a>
          </div>
          {g.purchaseNote ? <p className="work-note">{g.purchaseNote}</p> : null}
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
      <section className="section section--tight" aria-labelledby="inclui-title">
        <div className="container product-details">
          <div>
            <h2 id="inclui-title" className="h3">
              O que vem no planner
            </h2>
            <ul className="check-list">
              {(p.includes || []).map((t) => (
                <li key={t.id || t.text}>{t.text}</li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="h3">Como usar</h2>
            <ol className="step-list">
              {(g.howToUse || []).map((t) => (
                <li key={t.id || t.text}>{t.text}</li>
              ))}
            </ol>
            {g.digitalNote ? <p className="work-note">{g.digitalNote}</p> : null}
            {guide ? (
              <p className="work-read">
                Guia completo, no Diário do Ateliê: <a href={`/blog/${guide.slug}`}>{guide.title}</a>
              </p>
            ) : null}
          </div>
        </div>
      </section>
      {others.length ? (
        <section className="section section--mist" aria-labelledby="outros-title">
          <div className="container">
            <SectionHead id="outros-title" title="Você também pode gostar" link={['/produtos', 'Ver todos os produtos']} />
            <div className="grid grid--4">
              {others.map((o) => (
                <DigitalCard key={o.id} product={o} />
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
            description: p.summary,
            image: images.map((im) => absoluteUrl(pick(im, 1200)?.url, settings.siteUrl)),
            brand: { '@type': 'Brand', name: settings.siteName },
            ...(p.priceValue
              ? { offers: { '@type': 'Offer', price: p.priceValue.toFixed(2), priceCurrency: p.currency || 'USD', availability: 'https://schema.org/InStock', url: p.etsy } }
              : {}),
          },
          await breadcrumbLd(crumbs),
        ]}
      />
    </Page>
  )
}
