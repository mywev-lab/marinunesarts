import React from 'react'

import { DigitalCard, JsonLd, Newsletter, Page, Picture, SectionHead, WorkCard } from '@/components/ui'
import { getGlobal, getObras, getSettings } from '@/lib/data'
import { dict, localizePath, type Locale } from '@/lib/i18n'
import { asMedia } from '@/lib/media'
import { pageMetadata, personLd } from '@/lib/seo'
import { paragraphs } from '@/lib/text'
import type { Obra, Produto } from '@/payload-types'

export async function homeMetadata(locale: Locale) {
  const [home, settings] = await Promise.all([getGlobal('inicio', locale), getSettings(locale)])
  return pageMetadata({ locale, title: home.seo?.title || settings.siteName, description: home.seo?.description, path: '/' })
}

const docs = <T,>(list: (number | T)[] | null | undefined): T[] => (list || []).filter((x): x is T => typeof x === 'object' && x !== null)

export async function HomeView({ locale }: { locale: Locale }) {
  const [settings, home, obras] = await Promise.all([getSettings(locale), getGlobal('inicio', locale), getObras(locale)])
  const t = dict(locale)
  const L = (p: string) => localizePath(p, locale)
  const { hero, produtos, statement, atelie, sobre } = home
  const featured = typeof hero.featuredWork === 'object' ? (hero.featuredWork as Obra) : null
  const studio = obras.filter((o) => o.showOnHome)
  const photo = asMedia(settings.person?.photo)

  return (
    <Page settings={settings} locale={locale} path="/" current="inicio" overlay>
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-media" aria-hidden="true">
          <Picture media={hero.image} alt="" sizes="100vw" eager maxFallback={1600} />
        </div>
        <div className="hero-inner">
          <div className="hero-copy">
            {hero.kicker ? <p className="hero-kicker">{hero.kicker}</p> : null}
            <h1 id="hero-title">{hero.title}</h1>
            {hero.subtitle ? <p className="hero-sub">{hero.subtitle}</p> : null}
            <div className="hero-actions">
              {hero.primaryLabel ? (
                <a className="btn btn-light" href={L(hero.primaryLink || '/produtos')}>
                  {hero.primaryLabel}
                </a>
              ) : null}
              {hero.secondaryLabel ? (
                <a className="btn btn-outline-light" href={L(hero.secondaryLink || '/portfolio')}>
                  {hero.secondaryLabel}
                </a>
              ) : null}
            </div>
          </div>
          {featured ? (
            <a className="hero-label" href={L(`/obras/${featured.slug}`)}>
              <span className="hero-label-title">{featured.title}</span>
              <span className="hero-label-meta">{[featured.technique, featured.year].filter(Boolean).join(', ')}</span>
            </a>
          ) : null}
        </div>
      </section>

      <section className="section" aria-labelledby="produtos-title">
        <div className="container">
          <SectionHead
            id="produtos-title"
            locale={locale}
            title={produtos?.title || t.homeProducts}
            lede={produtos?.lede}
            link={['/produtos', produtos?.linkLabel || t.seeAllProducts]}
          />
          <div className="grid grid--4">
            {docs<Produto>(produtos?.digital).map((p) => (
              <DigitalCard key={p.id} product={p} locale={locale} />
            ))}
            {docs<Obra>(produtos?.works).map((w) => (
              <WorkCard key={w.id} work={w} locale={locale} variant="shop" />
            ))}
          </div>
        </div>
      </section>

      {statement?.quote ? (
        <section className="statement" aria-label={t.manifesto}>
          <div className="container statement-inner">
            <p className="statement-quote">{statement.quote}</p>
            {statement.text ? <p className="statement-text">{statement.text}</p> : null}
          </div>
        </section>
      ) : null}

      {studio.length ? (
        <section className="section" aria-labelledby="atelie-title">
          <div className="container">
            <SectionHead
              id="atelie-title"
              locale={locale}
              title={atelie?.title || t.fromStudio}
              lede={atelie?.lede}
              link={['/portfolio', atelie?.linkLabel || t.seeFullPortfolio]}
            />
            <div className="grid grid--3">
              {studio.map((w) => (
                <WorkCard key={w.id} work={w} locale={locale} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="section section--mist" aria-labelledby="sobre-title">
        <div className="container about-teaser">
          {photo ? (
            <div className="about-photo">
              <Picture media={photo} sizes="(max-width: 860px) 70vw, 30vw" />
            </div>
          ) : null}
          <div className="about-copy">
            <h2 id="sobre-title">{sobre?.title}</h2>
            {paragraphs(sobre?.text).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            <a className="text-link" href={L('/sobre')}>
              {sobre?.linkLabel || t.readMyStory}
            </a>
          </div>
        </div>
      </section>

      <Newsletter settings={settings} locale={locale} />
      <JsonLd data={await personLd(locale)} />
    </Page>
  )
}
