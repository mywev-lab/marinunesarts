import React from 'react'

import type { Categoria, Obra, Post, Produto } from '@/payload-types'
import type { Configuracoes } from '@/lib/data'
import { asMedia, pick, srcSet, type MediaRef } from '@/lib/media'
import { readingMinutes } from '@/lib/lexical'
import { STATUS_LABEL, shortTechnique } from '@/lib/text'

/* ---------------- imagem ---------------- */
export function Picture({
  media,
  sizes = '100vw',
  alt,
  eager = false,
  maxFallback = 800,
  maxSrc = Infinity,
  className,
}: {
  media: MediaRef
  sizes?: string
  alt?: string
  eager?: boolean
  maxFallback?: number
  maxSrc?: number
  className?: string
}) {
  const m = asMedia(media)
  if (!m) return null
  const fb = pick(m, maxFallback)
  if (!fb) return null
  return (
    <picture className={className}>
      <img
        src={fb.url}
        srcSet={srcSet(m, maxSrc) || undefined}
        sizes={sizes}
        alt={alt ?? m.alt ?? ''}
        width={fb.width || undefined}
        height={fb.height || undefined}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={eager ? 'high' : undefined}
      />
    </picture>
  )
}

/* ---------------- ícones ---------------- */
const ICONS = {
  instagram: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="3.8" />
      <circle cx="17.2" cy="6.8" r=".6" className="fill" />
    </svg>
  ),
  pinterest: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8.7" />
      <path d="M10.6 19.6l1.3-5.5m-.3-1.2c.4.9 1.2 1.4 2.2 1.4 2.1 0 3.4-1.8 3.4-4.1 0-2-1.6-3.6-4-3.6-2.9 0-4.4 2-4.4 3.8 0 1 .4 1.9 1.2 2.2" />
    </svg>
  ),
  etsy: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 5h8.6l-.4 2.6M8 5v14m0-14H6.5M8 19h8.3l.6-2.8M8 19H6.5M8 12h5.4" />
    </svg>
  ),
}

export function SocialLinks({ settings, className = 'social-links' }: { settings: Configuracoes; className?: string }) {
  const s = settings.social || {}
  const items: [string, string | null | undefined, React.ReactNode][] = [
    ['Instagram', s.instagram, ICONS.instagram],
    ['Pinterest', s.pinterest, ICONS.pinterest],
    ['Loja na Etsy', s.etsy, ICONS.etsy],
  ]
  return (
    <div className={className}>
      {items
        .filter(([, url]) => url)
        .map(([label, url, icon]) => (
          <a key={label} href={url!} target="_blank" rel="noopener" aria-label={`${label} de ${settings.siteName}`}>
            {icon}
          </a>
        ))}
    </div>
  )
}

/* ---------------- estrutura ---------------- */
export const NAV = [
  ['/', 'Início', 'inicio'],
  ['/portfolio', 'Portfólio', 'portfolio'],
  ['/produtos', 'Produtos', 'produtos'],
  ['/blog', 'Blog', 'blog'],
  ['/sobre', 'Sobre', 'sobre'],
  ['/contato', 'Contato', 'contato'],
] as const

export function SiteHeader({ settings, current, overlay = false }: { settings: Configuracoes; current?: string; overlay?: boolean }) {
  return (
    <>
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>
      <header className={`site-header ${overlay ? 'site-header--overlay' : 'site-header--solid'}`}>
        <div className="header-inner">
          <a className="brand" href="/" aria-label={`${settings.siteName}, página inicial`}>
            {settings.siteName}
          </a>
          <nav className="main-nav" id="main-nav" aria-label="Navegação principal">
            <ul>
              {NAV.map(([href, label, id]) => (
                <li key={id}>
                  <a href={href} aria-current={id === current ? 'page' : undefined}>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
            <SocialLinks settings={settings} className="social-links social-links--menu" />
          </nav>
          <div className="header-actions">
            <SocialLinks settings={settings} />
            <button className="nav-toggle" id="nav-toggle" type="button" aria-label="Abrir menu" aria-expanded="false" aria-controls="main-nav">
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>
    </>
  )
}

export function Page({
  settings,
  current,
  overlay,
  children,
}: {
  settings: Configuracoes
  current?: string
  overlay?: boolean
  children: React.ReactNode
}) {
  return (
    <>
      <SiteHeader settings={settings} current={current} overlay={overlay} />
      <main id="conteudo">{children}</main>
      <SiteFooter settings={settings} />
    </>
  )
}

export function SiteFooter({ settings }: { settings: Configuracoes }) {
  const s = settings.social || {}
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <p className="footer-name">{settings.siteName}</p>
          {settings.footerText ? <p>{settings.footerText}</p> : null}
          {settings.city ? <p>{settings.city}</p> : null}
        </div>
        <nav className="footer-col" aria-label="Rodapé">
          <p className="footer-heading">Navegue</p>
          {NAV.map(([href, label, id]) => (
            <a key={id} href={href}>
              {label}
            </a>
          ))}
        </nav>
        <div className="footer-col">
          <p className="footer-heading">Acompanhe</p>
          {s.instagram ? (
            <a href={s.instagram} target="_blank" rel="noopener">
              Instagram
            </a>
          ) : null}
          {s.pinterest ? (
            <a href={s.pinterest} target="_blank" rel="noopener">
              Pinterest
            </a>
          ) : null}
          {s.etsy ? (
            <a href={s.etsy} target="_blank" rel="noopener">
              Loja na Etsy
            </a>
          ) : null}
          <a href={`mailto:${settings.email}`}>{settings.email}</a>
        </div>
      </div>
      <div className="footer-bottom">
        <p>
          © <span data-year>{new Date().getFullYear()}</span> {settings.authorName}. Todos os direitos reservados.
        </p>
        <a href="/privacidade">Política de privacidade</a>
      </div>
    </footer>
  )
}

export function Newsletter({ settings }: { settings: Configuracoes }) {
  const n = settings.newsletter || {}
  return (
    <section className="newsletter" aria-labelledby="newsletter-title">
      <div className="newsletter-inner">
        <div>
          <h2 id="newsletter-title">{n.title}</h2>
          {n.text ? <p>{n.text}</p> : null}
        </div>
        <form className="newsletter-form" id="newsletter-form">
          <label className="visually-hidden" htmlFor="newsletter-email">
            Seu e-mail
          </label>
          <input type="email" id="newsletter-email" name="email" placeholder="seu@email.com" autoComplete="email" required />
          <button type="submit" className="btn btn-light">
            {n.buttonLabel || 'Quero receber'}
          </button>
          <p className="form-note" id="newsletter-note" role="status" aria-live="polite" />
        </form>
      </div>
    </section>
  )
}

export function SectionHead({ id, title, lede, link }: { id: string; title: string; lede?: string | null; link?: [string, string] }) {
  return (
    <div className="section-head">
      <div>
        <h2 id={id}>{title}</h2>
        {lede ? <p className="section-lede">{lede}</p> : null}
      </div>
      {link ? (
        <a className="text-link" href={link[0]}>
          {link[1]}
        </a>
      ) : null}
    </div>
  )
}

export function Breadcrumb({ items }: { items: [string, string][] }) {
  return (
    <nav className="breadcrumb" aria-label="Você está em">
      <ol>
        {items.map(([href, label], i) =>
          i === items.length - 1 ? (
            <li key={href} aria-current="page">
              {label}
            </li>
          ) : (
            <li key={href}>
              <a href={href}>{label}</a>
            </li>
          ),
        )}
      </ol>
    </nav>
  )
}

export function JsonLd({ data }: { data: unknown | unknown[] }) {
  const list = Array.isArray(data) ? data : [data]
  return (
    <>
      {list.map((d, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(d).replace(/</g, '\\u003c') }} />
      ))}
    </>
  )
}

/* ---------------- cartões ---------------- */
export function WorkCard({ work, variant = 'portfolio' }: { work: Obra; variant?: 'portfolio' | 'shop' }) {
  const isShop = variant === 'shop'
  const details = [work.dimensions, work.year].filter(Boolean).join(', ')
  const meta = isShop ? `${shortTechnique(work.technique)}${work.format ? `, ${work.format.toLowerCase()}` : ''}` : shortTechnique(work.technique)
  const second = isShop ? work.dimensions : details
  return (
    <article className="card" data-categories={(work.categories || []).join(' ')}>
      <a className="card-link" href={`/obras/${work.slug}`}>
        <div className="card-mat">
          <Picture media={work.image} maxSrc={800} sizes="(max-width: 600px) 46vw, (max-width: 1000px) 30vw, 22vw" />
        </div>
        <div className="card-body">
          <h3 className="card-title">{work.title}</h3>
          <p className="card-meta">
            {meta}
            {second ? (
              <>
                <br />
                {second}
              </>
            ) : null}
          </p>
          {isShop ? (
            <p className="card-foot">
              <span className="card-price">Valor sob consulta</span>
            </p>
          ) : work.status ? (
            <p className="card-foot">
              <span className={`card-status card-status--${work.status}`}>{STATUS_LABEL[work.status]}</span>
            </p>
          ) : null}
        </div>
      </a>
    </article>
  )
}

export function DigitalCard({ product }: { product: Produto }) {
  const cover = product.images?.[0]?.image
  return (
    <article className="card">
      <a className="card-link" href={`/produtos/${product.slug}`}>
        <div className="card-mat card-mat--product">
          <Picture media={cover} maxFallback={800} sizes="(max-width: 600px) 92vw, (max-width: 1000px) 46vw, 24vw" />
        </div>
        <div className="card-body">
          <h3 className="card-title">{product.name}</h3>
          <p className="card-meta">
            {product.kind}
            {product.cardMeta ? (
              <>
                <br />
                {product.cardMeta}
              </>
            ) : null}
          </p>
          <p className="card-foot">
            <span className="card-price">{product.price}</span>
            <span className="card-tag">Download digital</span>
          </p>
        </div>
      </a>
    </article>
  )
}

export function PostCard({ post, wide = false }: { post: Post; wide?: boolean }) {
  const category = typeof post.category === 'object' ? (post.category as Categoria) : null
  const isProduct = post.cover?.kind === 'product'
  return (
    <article className={`card post-card${wide ? ' post-card--wide' : ''}`}>
      <a className="card-link" href={`/blog/${post.slug}`}>
        <div className={`card-mat${isProduct ? ' card-mat--product' : ''}`}>
          <Picture
            media={post.cover?.image}
            maxSrc={isProduct ? Infinity : 800}
            sizes={wide ? '(max-width: 760px) 92vw, 36vw' : '(max-width: 600px) 92vw, (max-width: 1000px) 46vw, 30vw'}
          />
        </div>
        <div className="card-body">
          {category ? <p className="post-card-cat">{category.name}</p> : null}
          <h3 className="card-title">{post.title}</h3>
          <p className="card-meta">{post.excerpt}</p>
          <p className="card-foot">
            <span className="card-tag">Leitura de {readingMinutes(post.content as any)} min</span>
          </p>
        </div>
      </a>
    </article>
  )
}
