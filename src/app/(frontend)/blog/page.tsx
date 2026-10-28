import React from 'react'

import { JsonLd, Newsletter, Page, PostCard, SectionHead } from '@/components/ui'
import { getCategorias, getGlobal, getPosts, getSettings } from '@/lib/data'
import { absoluteUrl, asMedia, pick } from '@/lib/media'
import { authorRef, breadcrumbLd, pageMetadata } from '@/lib/seo'
import type { Categoria } from '@/payload-types'

export async function generateMetadata() {
  const [g, posts] = await Promise.all([getGlobal('pagina-blog'), getPosts()])
  return pageMetadata({ title: g.seo?.title || g.title, description: g.seo?.description, path: '/blog', image: posts[0]?.cover?.image })
}

const catId = (p: { category: number | Categoria }) => (typeof p.category === 'object' ? p.category.id : p.category)

export default async function BlogPage() {
  const [settings, g, categorias, posts] = await Promise.all([getSettings(), getGlobal('pagina-blog'), getCategorias(), getPosts()])
  const active = categorias.filter((c) => posts.some((p) => catId(p) === c.id))
  const author = await authorRef()
  const blogId = absoluteUrl('/blog#blog', settings.siteUrl)
  return (
    <Page settings={settings} current="blog">
      <section className="page-intro blog-intro">
        <div className="container">
          <h1>{g.title}</h1>
          {g.intro ? <p className="page-lede">{g.intro}</p> : null}
          {active.length ? (
            <nav className="blog-cats" aria-label="Categorias do blog">
              <ul>
                {active.map((c) => {
                  const n = posts.filter((p) => catId(p) === c.id).length
                  return (
                    <li key={c.id}>
                      <a href={`#${c.slug}`}>
                        {c.name}
                        <span className="blog-cats-count">
                          {n}
                          <span className="visually-hidden"> {n === 1 ? 'artigo' : 'artigos'}</span>
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
              <SectionHead id={`${c.slug}-title`} title={c.name} lede={c.description} />
              <div className={`post-grid${list.length === 1 ? ' post-grid--single' : ''}`}>
                {list.map((p) => (
                  <PostCard key={p.id} post={p} wide={list.length === 1} />
                ))}
              </div>
            </div>
          </section>
        )
      })}
      <Newsletter settings={settings} />
      <JsonLd
        data={[
          {
            '@context': 'https://schema.org',
            '@type': 'Blog',
            '@id': blogId,
            name: g.title,
            description: g.seo?.description || undefined,
            url: absoluteUrl('/blog', settings.siteUrl),
            inLanguage: 'pt-BR',
            author,
            publisher: author,
            blogPost: posts.map((p) => {
              const img = asMedia(p.cover?.image)
              return {
                '@type': 'BlogPosting',
                '@id': absoluteUrl(`/blog/${p.slug}#artigo`, settings.siteUrl),
                headline: p.title,
                url: absoluteUrl(`/blog/${p.slug}`, settings.siteUrl),
                image: img ? absoluteUrl(pick(img, 1200)?.url, settings.siteUrl) : undefined,
                author,
                ...(p.publishedAt ? { datePublished: p.publishedAt } : {}),
              }
            }),
          },
          await breadcrumbLd([
            ['/', 'Início'],
            ['/blog', 'Blog'],
          ]),
        ]}
      />
    </Page>
  )
}
