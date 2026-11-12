import { notFound } from 'next/navigation'
import React from 'react'

import { Figure, RichText } from '@/components/RichText'
import { Breadcrumb, JsonLd, Page, Picture, PostCard, SectionHead } from '@/components/ui'
import { getGlobal, getPost, getPosts, getSettings } from '@/lib/data'
import { HTML_LANG, dict, localizePath, type Locale } from '@/lib/i18n'
import { headingsOf, readingMinutes, wordCount } from '@/lib/lexical'
import { absoluteUrl, asMedia, pick } from '@/lib/media'
import { authorRef, breadcrumbLd, pageMetadata } from '@/lib/seo'
import { formatDate } from '@/lib/text'
import type { Categoria, Post } from '@/payload-types'

export async function postParams() {
  return (await getPosts('pt')).map((p) => ({ slug: p.slug }))
}

export async function postMetadata(locale: Locale, slug: string) {
  const post = await getPost(slug, locale)
  if (!post) return {}
  const cat = typeof post.category === 'object' ? (post.category as Categoria) : null
  return pageMetadata({
    locale,
    title: post.seoTitle || post.title,
    description: post.description,
    path: `/blog/${post.slug}`,
    image: post.cover?.image,
    type: 'article',
    article: { publishedTime: post.publishedAt || undefined, modifiedTime: post.revisedAt || post.publishedAt || undefined, section: cat?.name },
  })
}

const COVER_SIZES = { wide: '(max-width: 1000px) 92vw, 820px', art: '(max-width: 760px) 80vw, 460px', product: '(max-width: 760px) 92vw, 600px' }

export async function PostView({ locale, slug }: { locale: Locale; slug: string }) {
  const [settings, post, blog] = await Promise.all([getSettings(locale), getPost(slug, locale), getGlobal('pagina-blog', locale)])
  if (!post) notFound()
  const t = dict(locale)
  const L = (p: string) => localizePath(p, locale)
  const cat = typeof post.category === 'object' ? (post.category as Categoria) : null
  const related = (post.related || []).filter((r): r is Post => typeof r === 'object' && r !== null && r._status === 'published')
  const toc = headingsOf(post.content as any)
  const minutes = readingMinutes(post.content as any)
  const kind = (post.cover?.kind || 'art') as keyof typeof COVER_SIZES
  const lastDate = post.revisedAt || post.publishedAt
  const path = `/blog/${post.slug}`
  const url = L(path)
  const crumbs: [string, string][] = [
    ['/', t.nav.inicio],
    ['/blog', t.nav.blog],
    [path, post.title],
  ]
  const author = await authorRef(locale)
  const cover = asMedia(post.cover?.image)
  const photo = asMedia(settings.person?.photo)

  return (
    <Page settings={settings} locale={locale} path={path} current="blog">
      <div className="post-wrap post-top">
        <Breadcrumb items={crumbs} locale={locale} />
      </div>
      <article className="post">
        <header className="post-wrap post-header">
          {cat ? (
            <a className="post-category" href={`${L('/blog')}#${cat.slug}`}>
              {cat.name}
            </a>
          ) : null}
          <h1>{post.title}</h1>
          <p className="post-dek">{post.dek}</p>
          <p className="post-byline">
            <span>
              {t.by}{' '}
              <a href={L('/sobre')} rel="author">
                {settings.authorName}
              </a>
            </span>
            {post.publishedAt ? (
              <span>
                {post.revisedAt ? t.updatedOn : t.publishedOn}
                <time dateTime={lastDate!}>{formatDate(lastDate!, locale)}</time>
              </span>
            ) : null}
            <span>{t.readingTime(minutes)}</span>
          </p>
        </header>
        <div className="post-wrap post-layout">
          <Figure image={post.cover?.image} caption={post.cover?.caption as any} kind={kind} cls="post-cover" sizes={COVER_SIZES[kind]} eager locale={locale} />
          {toc.length ? (
            <nav className="post-toc" aria-labelledby="toc-title">
              <p className="post-toc-title" id="toc-title">
                {t.inThisArticle}
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
            <RichText data={post.content as any} locale={locale} />
            {post.sources?.length ? (
              <section className="post-sources" aria-labelledby="fontes-title">
                <h2 id="fontes-title">{t.sources}</h2>
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
                {photo ? <Picture media={photo} alt={t.portraitOf(settings.authorName)} sizes="96px" maxSrc={480} maxFallback={480} /> : null}
                <div>
                  <h2 className="h3" id="autora-title">
                    {t.aboutAuthor}
                  </h2>
                  <p>{settings.person.authorBio}</p>
                  <a className="text-link" href={L('/sobre')}>
                    {t.readMariStory}
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
              <a className="btn btn-primary" href={L(post.cta.href)}>
                {post.cta.label || t.learnMore}
              </a>
            ) : null}
          </div>
        </section>
      ) : null}
      {related.length ? (
        <section className="section section--mist" aria-labelledby="continue-title">
          <div className="container">
            <SectionHead id="continue-title" locale={locale} title={t.keepReading} link={['/blog', t.seeAllArticles]} />
            <div className="post-grid">
              {related.map((r) => (
                <PostCard key={r.id} post={r} locale={locale} />
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
            inLanguage: HTML_LANG[locale],
            articleSection: cat?.name,
            keywords: (post.keywords || []).map((k) => k.keyword).join(', ') || undefined,
            wordCount: wordCount(post.content as any),
            isPartOf: {
              '@type': 'Blog',
              '@id': absoluteUrl(`${L('/blog')}#blog`, settings.siteUrl),
              name: blog.title,
              url: absoluteUrl(L('/blog'), settings.siteUrl),
            },
            ...(post.publishedAt ? { datePublished: post.publishedAt } : {}),
            ...(lastDate ? { dateModified: lastDate } : {}),
            ...(post.sources?.length
              ? {
                  citation: post.sources.map((s) => ({ '@type': 'CreativeWork', name: s.title, url: s.url, publisher: { '@type': 'Organization', name: s.publisher } })),
                }
              : {}),
          },
          await breadcrumbLd(crumbs, locale),
        ]}
      />
    </Page>
  )
}
