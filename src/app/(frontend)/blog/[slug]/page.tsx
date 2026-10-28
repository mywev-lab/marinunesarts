import { notFound } from 'next/navigation'
import React from 'react'

import { Figure, RichText } from '@/components/RichText'
import { Breadcrumb, JsonLd, Page, Picture, PostCard, SectionHead } from '@/components/ui'
import { getGlobal, getPost, getPosts, getSettings } from '@/lib/data'
import { headingsOf, readingMinutes, wordCount } from '@/lib/lexical'
import { absoluteUrl, asMedia, pick } from '@/lib/media'
import { authorRef, breadcrumbLd, pageMetadata } from '@/lib/seo'
import { formatDate } from '@/lib/text'
import type { Categoria, Post } from '@/payload-types'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return (await getPosts()).map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return {}
  const cat = typeof post.category === 'object' ? (post.category as Categoria) : null
  return pageMetadata({
    title: post.seoTitle || post.title,
    description: post.description,
    path: `/blog/${post.slug}`,
    image: post.cover?.image,
    type: 'article',
    article: { publishedTime: post.publishedAt || undefined, modifiedTime: post.revisedAt || post.publishedAt || undefined, section: cat?.name },
  })
}

const COVER_SIZES = { wide: '(max-width: 1000px) 92vw, 820px', art: '(max-width: 760px) 80vw, 460px', product: '(max-width: 760px) 92vw, 600px' }

export default async function PostPage({ params }: Props) {
  const { slug } = await params
  const [settings, post, blog] = await Promise.all([getSettings(), getPost(slug), getGlobal('pagina-blog')])
  if (!post) notFound()
  const cat = typeof post.category === 'object' ? (post.category as Categoria) : null
  const related = (post.related || []).filter((r): r is Post => typeof r === 'object' && r !== null && r._status === 'published')
  const toc = headingsOf(post.content as any)
  const minutes = readingMinutes(post.content as any)
  const kind = (post.cover?.kind || 'art') as keyof typeof COVER_SIZES
  const lastDate = post.revisedAt || post.publishedAt
  const url = `/blog/${post.slug}`
  const crumbs: [string, string][] = [
    ['/', 'Início'],
    ['/blog', 'Blog'],
    [url, post.title],
  ]
  const author = await authorRef()
  const cover = asMedia(post.cover?.image)
  const photo = asMedia(settings.person?.photo)

  return (
    <Page settings={settings} current="blog">
      <div className="post-wrap post-top">
        <Breadcrumb items={crumbs} />
      </div>
      <article className="post">
        <header className="post-wrap post-header">
          {cat ? (
            <a className="post-category" href={`/blog#${cat.slug}`}>
              {cat.name}
            </a>
          ) : null}
          <h1>{post.title}</h1>
          <p className="post-dek">{post.dek}</p>
          <p className="post-byline">
            <span>
              Por{' '}
              <a href="/sobre" rel="author">
                {settings.authorName}
              </a>
            </span>
            {post.publishedAt ? (
              <span>
                {post.revisedAt ? 'Atualizado em ' : 'Publicado em '}
                <time dateTime={lastDate!}>{formatDate(lastDate!)}</time>
              </span>
            ) : null}
            <span>Leitura de {minutes} minutos</span>
          </p>
        </header>
        <div className="post-wrap post-layout">
          <Figure image={post.cover?.image} caption={post.cover?.caption as any} kind={kind} cls="post-cover" sizes={COVER_SIZES[kind]} eager />
          {toc.length ? (
            <nav className="post-toc" aria-labelledby="toc-title">
              <p className="post-toc-title" id="toc-title">
                Neste artigo
              </p>
              <ol>
                {toc.map((h) => (
                  <li key={h.id}>
                    <a href={`#${h.id}`}>{h.text}</a>
                  </li>
                ))}
              </ol>
            </nav>
          ) : null}
          <div className="post-body">
            <RichText data={post.content as any} />
            {post.sources?.length ? (
              <section className="post-sources" aria-labelledby="fontes-title">
                <h2 id="fontes-title">Fontes</h2>
                <ol>
                  {post.sources.map((s) => (
                    <li key={s.id || s.url}>
                      <a href={s.url} target="_blank" rel="noopener">
                        {s.title}
                      </a>
                      , {s.publisher}
                    </li>
                  ))}
                </ol>
              </section>
            ) : null}
            {settings.person?.authorBio ? (
              <aside className="author-box" aria-labelledby="autora-title">
                {photo ? <Picture media={photo} alt={`Retrato de ${settings.authorName}`} sizes="96px" maxSrc={480} maxFallback={480} /> : null}
                <div>
                  <h2 className="h3" id="autora-title">
                    Sobre a autora
                  </h2>
                  <p>{settings.person.authorBio}</p>
                  <a className="text-link" href="/sobre">
                    Conheça a história da Mari
                  </a>
                </div>
              </aside>
            ) : null}
          </div>
        </div>
      </article>
      {post.cta?.title ? (
        <section className="section section--tight" aria-labelledby="cta-title">
          <div className="container commission post-cta">
            <h2 id="cta-title">{post.cta.title}</h2>
            {post.cta.text ? <p>{post.cta.text}</p> : null}
            {post.cta.href ? (
              <a className="btn btn-primary" href={post.cta.href}>
                {post.cta.label || 'Saiba mais'}
              </a>
            ) : null}
          </div>
        </section>
      ) : null}
      {related.length ? (
        <section className="section section--mist" aria-labelledby="continue-title">
          <div className="container">
            <SectionHead id="continue-title" title="Continue lendo" link={['/blog', 'Ver todos os artigos']} />
            <div className="post-grid">
              {related.map((r) => (
                <PostCard key={r.id} post={r} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
      <JsonLd
        data={[
          {
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            '@id': absoluteUrl(`${url}#artigo`, settings.siteUrl),
            headline: post.title,
            description: post.description,
            image: cover ? [absoluteUrl(pick(cover, 1200)?.url, settings.siteUrl)] : undefined,
            author,
            publisher: author,
            url: absoluteUrl(url, settings.siteUrl),
            mainEntityOfPage: absoluteUrl(url, settings.siteUrl),
            inLanguage: 'pt-BR',
            articleSection: cat?.name,
            keywords: (post.keywords || []).map((k) => k.keyword).join(', ') || undefined,
            wordCount: wordCount(post.content as any),
            isPartOf: { '@type': 'Blog', '@id': absoluteUrl('/blog#blog', settings.siteUrl), name: blog.title, url: absoluteUrl('/blog', settings.siteUrl) },
            ...(post.publishedAt ? { datePublished: post.publishedAt } : {}),
            ...(lastDate ? { dateModified: lastDate } : {}),
            ...(post.sources?.length
              ? {
                  citation: post.sources.map((s) => ({ '@type': 'CreativeWork', name: s.title, url: s.url, publisher: { '@type': 'Organization', name: s.publisher } })),
                }
              : {}),
          },
          await breadcrumbLd(crumbs),
        ]}
      />
    </Page>
  )
}
