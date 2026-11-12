import React from 'react'

import { JsonLd, Newsletter, Page, PostCard, SectionHead } from '@/components/ui'
import { getCategorias, getGlobal, getPosts, getSettings } from '@/lib/data'
import { HTML_LANG, dict, localizePath, type Locale } from '@/lib/i18n'
import { absoluteUrl, asMedia, pick } from '@/lib/media'
import { authorRef, breadcrumbLd, pageMetadata } from '@/lib/seo'
import type { Categoria } from '@/payload-types'

export async function blogMetadata(locale: Locale) {
  const [g, posts] = await Promise.all([getGlobal('pagina-blog', locale), getPosts(locale)])
  return pageMetadata({ locale, title: g.seo?.title || g.title, description: g.seo?.description, path: '/blog', image: posts[0]?.cover?.image })
}

const catId = (p: { category: number | Categoria }) => (typeof p.category === 'object' ? p.category.id : p.category)

export async function BlogView({ locale }: { locale: Locale }) {
  const [settings, g, categorias, posts] = await Promise.all([getSettings(locale), getGlobal('pagina-blog', locale), getCategorias(locale), getPosts(locale)])
  const t = dict(locale)
  const L = (p: string) => localizePath(p, locale)
  const active = categorias.filter((c) => posts.some((p) => catId(p) === c.id))
  const author = await authorRef(locale)
  const blogId = absoluteUrl(`${L('/blog')}#blog`, settings.siteUrl)
  return (
    <Page settings={settings} locale={locale} path="/blog" current="blog">
      <section className="page-intro blog-intro">
        <div className="container">
          <h1>{g.title}</h1>
          {g.intro ? <p className="page-lede">{g.intro}</p> : null}
          {active.length ? (
            <nav className="blog-cats" aria-label={t.blogCategories}>
              <ul>
                {active.map((c) => {
                  const n = posts.filter((p) => catId(p) === c.id).length
                  return (
                    <li key={c.id}>
                      <a href={`#${c.slug}`}>
                        {c.name}
                        <span className="blog-cats-count">
                          {n}
                          <span className="visually-hidden"> {t.articles(n)}</span>
                        </span>
                      </a>
                    </li>
                  )
                })}
              </ul>
            </nav>
          ) : null}
        </div>
      </section>
      {active.map((c) => {
        const list = posts.filter((p) => catId(p) === c.id)
        return (
          <section key={c.id} className="section section--tight blog-section" id={c.slug} aria-labelledby={`${c.slug}-title`}>
            <div className="container">
              <SectionHead id={`${c.slug}-title`} locale={locale} title={c.name} lede={c.description} />
              <div className={`post-grid${list.length === 1 ? ' post-grid--single' : ''}`}>
                {list.map((p) => (
                  <PostCard key={p.id} post={p} locale={locale} wide={list.length === 1} />
                ))}
              </div>
            </div>
          </section>
        )
      })}
      <Newsletter settings={settings} locale={locale} />
      <JsonLd
        data={[
          {
            '@context': 'https://schema.org',
            '@type': 'Blog',
            '@id': blogId,
            name: g.title,
            description: g.seo?.description || undefined,
            url: absoluteUrl(L('/blog'), settings.siteUrl),
            inLanguage: HTML_LANG[locale],
            author,
            publisher: author,
            blogPost: posts.map((p) => {
              const img = asMedia(p.cover?.image)
              const url = L(`/blog/${p.slug}`)
              return {
                '@type': 'BlogPosting',
                '@id': absoluteUrl(`${url}#artigo`, settings.siteUrl),
                headline: p.title,
                url: absoluteUrl(url, settings.siteUrl),
                image: img ? absoluteUrl(pick(img, 1200)?.url, settings.siteUrl) : undefined,
                author,
                ...(p.publishedAt ? { datePublished: p.publishedAt } : {}),
              }
            }),
          },
          await breadcrumbLd(
            [
              ['/', t.nav.inicio],
              ['/blog', t.nav.blog],
            ],
            locale,
          ),
        ]}
      />
    </Page>
  )
}
