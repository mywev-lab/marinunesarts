import React from 'react'

import type { Categoria, Obra, Post, Produto } from '@/payload-types'
import type { Configuracoes } from '@/lib/data'
import { HTML_LANG, LOCALES, alternatePaths, dict, localizePath, type Locale } from '@/lib/i18n'
import { asMedia, pick, srcSet, type MediaRef } from '@/lib/media'
import { readingMinutes } from '@/lib/lexical'
import { shortTechnique } from '@/lib/text'

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

export function SocialLinks({ settings, locale, className = 'social-links' }: { settings: Configuracoes; locale: Locale; className?: string }) {
  const s = settings.social || {}
  const t = dict(locale)
  const items: [string, string | null | undefined, React.ReactNode][] = [
    ['Instagram', s.instagram, ICONS.instagram],
    ['Pinterest', s.pinterest, ICONS.pinterest],
    [locale === 'pt' ? 'Loja na Etsy' : 'Etsy', s.etsy, ICONS.etsy],
  ]
  return (
    <div className={className}>
      {items
        .filter(([, url]) => url)
        .map(([label, url, icon]) => (
          <a key={label} href={url!} target="_blank" rel="noopener" aria-label={t.social(label, settings.siteName)}>
            {icon}
          </a>
        ))}
    </div>
  )
}

/* ---------------- estrutura ---------------- */
/** Menu: endereço em português e chave do texto no dicionário */
export const NAV = [
  ['/', 'inicio'],
  ['/portfolio', 'portfolio'],
  ['/produtos', 'produtos'],
  ['/blog', 'blog'],
  ['/sobre', 'sobre'],
  ['/contato', 'contato'],
] as const

/** Seletor PT / EN: leva para a mesma página no outro idioma */
export function LanguageSwitch({ locale, path }: { locale: Locale; path: string }) {
  const t = dict(locale)
  const paths = alternatePaths(path)
  return (
    <nav className="lang-switch" aria-label={t.language}>
      {LOCALES.map((l) => (
        <a
          key={l}
          href={paths[l]}
          lang={HTML_LANG[l]}
          hrefLang={HTML_LANG[l]}
          title={t.languageNames[l]}
          aria-current={l === locale ? 'true' : undefined}
        >
          <span aria-hidden="true">{l.toUpperCase()}</span>
          <span className="visually-hidden">{t.languageNames[l]}</span>
        </a>
      ))}
    </nav>
  )
}

export function SiteHeader({
  settings,
  locale,
  path,
  current,
  overlay = false,
}: {
  settings: Configuracoes
  locale: Locale
  path: string
  current?: string
  overlay?: boolean
}) {
  const t = dict(locale)
  return (
    <>
      <a className="skip-link" href="#conteudo">
        {t.skip}
      </a>
      <header className={`site-header ${overlay ? 'site-header--overlay' : 'site-header--solid'}`}>
        <div className="header-inner">
          <a className="brand" href={localizePath('/', locale)} aria-label={t.home(settings.siteName)}>
            <img className="brand-mark brand-mark--dark" src="/images/brand/efugio-ramo.webp" alt="" width={300} height={187} />
            <img className="brand-mark brand-mark--light" src="/images/brand/efugio-ramo-claro.webp" alt="" width={300} height={187} />
            <span className="brand-sub" aria-hidden="true">
              Atelier
            </span>
          </a>
          <nav className="main-nav" id="main-nav" aria-label={t.mainNav}>
            <ul>
              {NAV.map(([href, id]) => (
                <li key={id}>
                  <a href={localizePath(href, locale)} aria-current={id === current ? 'page' : undefined}>
                    {t.nav[id]}
                  </a>
                </li>
              ))}
            </ul>
            <SocialLinks settings={settings} locale={locale} className="social-links social-links--menu" />
          </nav>
          <div className="header-actions">
            <SocialLinks settings={settings} locale={locale} />
            <LanguageSwitch locale={locale} path={path} />
            <button
              className="nav-toggle"
              id="nav-toggle"
              type="button"
              aria-label={t.openMenu}
              data-label-open={t.openMenu}
              data-label-close={t.closeMenu}
              aria-expanded="false"
              aria-controls="main-nav"
            >
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
  locale,
  path,
  current,
  overlay,
  children,
}: {
  settings: Configuracoes
  locale: Locale
  /** endereço desta página em português (o seletor de idioma calcula o outro) */
  path: string
  current?: string
  overlay?: boolean
  children: React.ReactNode
}) {
  return (
    <>
      <SiteHeader settings={settings} locale={locale} path={path} current={current} overlay={overlay} />
      <main id="conteudo">{children}</main>
      <SiteFooter settings={settings} locale={locale} />
    </>
  )
}

export function SiteFooter({ settings, locale }: { settings: Configuracoes; locale: Locale }) {
  const s = settings.social || {}
  const t = dict(locale)
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <p className="footer-name">
            <img src="/images/brand/efugio-atelier-logo-claro.webp" alt={t.logoAlt(settings.siteName)} width={560} height={466} loading="lazy" />
          </p>
          {settings.footerText ? <p>{settings.footerText}</p> : null}
          {settings.city ? <p>{settings.city}</p> : null}
        </div>
        <nav className="footer-col" aria-label={t.footer}>
          <p className="footer-heading">{t.footerExplore}</p>
          {NAV.map(([href, id]) => (
            <a key={id} href={localizePath(href, locale)}>
              {t.nav[id]}
            </a>
          ))}
        </nav>
        <div className="footer-col">
          <p className="footer-heading">{t.footerFollow}</p>
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
              {t.etsyShop}
            </a>
          ) : null}
          <a href={`mailto:${settings.email}`}>{settings.email}</a>
        </div>
      </div>
      <div className="footer-bottom">
        <p>
          © <span data-year>{new Date().getFullYear()}</span> {settings.authorName}. {t.rights}
        </p>
        <div className="footer-legal">
          <a href={localizePath('/privacidade', locale)}>{t.privacy}</a>
          <button type="button" className="footer-link-btn" data-cookie-prefs>
            {t.cookiePrefs}
          </button>
        </div>
      </div>
    </footer>
  )
}

/* ---------------- aviso de cookies (LGPD) ---------------- */
/** Fica escondido; o /js/main.js mostra na primeira visita e guarda a escolha (vale para os dois idiomas) */
export function CookieBanner({ settings, locale }: { settings: Configuracoes; locale: Locale }) {
  const c = settings.cookies || {}
  const t = dict(locale)
  const defaults = t.cookieDefaults
  return (
    <section className="cookie-banner" id="cookie-banner" aria-label={t.cookieNotice} hidden>
      <p>
        {c.text || defaults.text} <a href={localizePath('/privacidade', locale)}>{t.privacy}</a>
      </p>
      <div className="cookie-actions">
        <button type="button" className="btn btn-primary" data-cookie-choice="aceito">
          {c.acceptLabel || defaults.acceptLabel}
        </button>
        <button type="button" className="btn btn-outline" data-cookie-choice="recusado">
          {c.rejectLabel || defaults.rejectLabel}
        </button>
      </div>
    </section>
  )
}

export function Newsletter({ settings, locale }: { settings: Configuracoes; locale: Locale }) {
  const n = settings.newsletter || {}
  const t = dict(locale)
  return (
    <section className="newsletter" aria-labelledby="newsletter-title">
      <div className="newsletter-inner">
        <div>
          <h2 id="newsletter-title">{n.title}</h2>
          {n.text ? <p>{n.text}</p> : null}
        </div>
        <form className="newsletter-form" id="newsletter-form" data-thanks={t.newsletterThanks}>
          <label className="visually-hidden" htmlFor="newsletter-email">
            {t.newsletterEmail}
          </label>
          <input type="email" id="newsletter-email" name="email" placeholder={t.newsletterPlaceholder} autoComplete="email" required />
          <button type="submit" className="btn btn-light">
            {n.buttonLabel || t.newsletterButton}
          </button>
          <p className="form-note" id="newsletter-note" role="status" aria-live="polite" />
        </form>
      </div>
    </section>
  )
}

/** Título de seção; o link (endereço em português) vai para a página no idioma atual */
export function SectionHead({ id, title, lede, link, locale = 'pt' }: { id: string; title: string; lede?: string | null; link?: [string, string]; locale?: Locale }) {
  return (
    <div className="section-head">
      <div>
        <h2 id={id}>{title}</h2>
        {lede ? <p className="section-lede">{lede}</p> : null}
      </div>
      {link ? (
        <a className="text-link" href={localizePath(link[0], locale)}>
          {link[1]}
        </a>
      ) : null}
    </div>
  )
}

/** Trilha de navegação (endereços em português, convertidos para o idioma da página) */
export function Breadcrumb({ items, locale }: { items: [string, string][]; locale: Locale }) {
  return (
    <nav className="breadcrumb" aria-label={dict(locale).breadcrumb}>
      <ol>
        {items.map(([href, label], i) =>
          i === items.length - 1 ? (
            <li key={href} aria-current="page">
              {label}
            </li>
          ) : (
            <li key={href}>
              <a href={localizePath(href, locale)}>{label}</a>
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
export function WorkCard({ work, locale, variant = 'portfolio' }: { work: Obra; locale: Locale; variant?: 'portfolio' | 'shop' }) {
  const t = dict(locale)
  const isShop = variant === 'shop'
  const details = [work.dimensions, work.year].filter(Boolean).join(', ')
  const meta = isShop ? `${shortTechnique(work.technique)}${work.format ? `, ${work.format.toLowerCase()}` : ''}` : shortTechnique(work.technique)
  const second = isShop ? work.dimensions : details
  return (
    <article className="card" data-categories={(work.categories || []).join(' ')}>
      <a className="card-link" href={localizePath(`/obras/${work.slug}`, locale)}>
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
              <span className="card-price">{t.priceOnRequest}</span>
            </p>
          ) : work.status ? (
            <p className="card-foot">
              <span className={`card-status card-status--${work.status}`}>{t.status[work.status]}</span>
            </p>
          ) : null}
        </div>
      </a>
    </article>
  )
}

export function DigitalCard({ product, locale }: { product: Produto; locale: Locale }) {
  const t = dict(locale)
  const cover = product.images?.[0]?.image
  const isPrint = product.type === 'print'
  // Print cuja capa é a própria pintura: aparece com passe-partout, como nos cartões de obra (sem cortar a imagem)
  const coverId = typeof cover === 'object' && cover ? cover.id : cover
  const artCover = isPrint && (product.works || []).some((w) => typeof w === 'object' && w && (typeof w.image === 'object' ? w.image?.id : w.image) === coverId)
  return (
    <article className="card">
      <a className="card-link" href={localizePath(`/produtos/${product.slug}`, locale)}>
        <div className={artCover ? 'card-mat' : 'card-mat card-mat--product'}>
          <Picture
            media={cover}
            maxFallback={800}
            maxSrc={artCover ? 800 : Infinity}
            sizes={artCover ? '(max-width: 600px) 46vw, (max-width: 1000px) 30vw, 22vw' : '(max-width: 600px) 92vw, (max-width: 1000px) 46vw, 24vw'}
          />
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
            <span className="card-price">{product.price || t.priceOnRequest}</span>
            <span className="card-tag">{isPrint ? t.print : t.digitalDownload}</span>
          </p>
        </div>
      </a>
    </article>
  )
}

export function PostCard({ post, locale, wide = false }: { post: Post; locale: Locale; wide?: boolean }) {
  const category = typeof post.category === 'object' ? (post.category as Categoria) : null
  const isProduct = post.cover?.kind === 'product'
  return (
    <article className={`card post-card${wide ? ' post-card--wide' : ''}`}>
      <a className="card-link" href={localizePath(`/blog/${post.slug}`, locale)}>
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
            <span className="card-tag">{dict(locale).readingCard(readingMinutes(post.content as any))}</span>
          </p>
        </div>
      </a>
    </article>
  )
}
