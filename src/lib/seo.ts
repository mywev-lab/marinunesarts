import type { Metadata } from 'next'

import { getSettings } from './data'
import { HTML_LANG, OG_LOCALE, alternatePaths, localizePath, type Locale } from './i18n'
import { absoluteUrl, asMedia, pick, type MediaRef } from './media'

export async function pageMetadata({
  locale,
  title,
  description,
  path,
  image,
  type = 'website',
  article,
  noindex = false,
  brand = false,
}: {
  locale: Locale
  title: string
  /** acrescenta " | Nome do site" ao título */
  brand?: boolean
  description?: string | null
  /** endereço da página em português (o inglês é calculado) */
  path: string
  image?: MediaRef
  type?: 'website' | 'article'
  article?: { publishedTime?: string; modifiedTime?: string; section?: string }
  noindex?: boolean
}): Promise<Metadata> {
  const settings = await getSettings(locale)
  if (brand) title = `${title} | ${settings.siteName}`
  const media = asMedia(image) || asMedia(settings.ogImage)
  const imageUrl = media ? absoluteUrl(pick(media, 1200)?.url, settings.siteUrl) : undefined
  const paths = alternatePaths(path)
  const url = paths[locale]
  return {
    title,
    description: description || undefined,
    alternates: {
      canonical: url,
      languages: { [HTML_LANG.pt]: paths.pt, [HTML_LANG.en]: paths.en, 'x-default': paths.pt },
    },
    robots: noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      title,
      description: description || undefined,
      url,
      siteName: settings.siteName,
      locale: OG_LOCALE[locale],
      alternateLocale: OG_LOCALE[locale === 'pt' ? 'en' : 'pt'],
      type,
      images: imageUrl ? [{ url: imageUrl }] : undefined,
      ...(type === 'article' && article
        ? {
            publishedTime: article.publishedTime,
            modifiedTime: article.modifiedTime,
            section: article.section,
            authors: [absoluteUrl(localizePath('/sobre', locale), settings.siteUrl)],
          }
        : {}),
    },
    twitter: { card: 'summary_large_image', title, description: description || undefined, images: imageUrl ? [imageUrl] : undefined },
  }
}

/** Autora (mesmo identificador em todas as páginas e nos dois idiomas) */
export async function authorRef(locale: Locale) {
  const s = await getSettings(locale)
  return { '@type': 'Person', '@id': absoluteUrl('/sobre#mariane-nunes', s.siteUrl), name: s.authorName, url: absoluteUrl(localizePath('/sobre', locale), s.siteUrl) }
}

export async function personLd(locale: Locale) {
  const s = await getSettings(locale)
  const photo = asMedia(s.person?.photo)
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': absoluteUrl('/sobre#mariane-nunes', s.siteUrl),
    name: s.authorName,
    alternateName: s.siteName,
    jobTitle: s.person?.jobTitle || undefined,
    description: s.person?.description || undefined,
    url: absoluteUrl(localizePath('/', locale), s.siteUrl),
    image: photo ? absoluteUrl(pick(photo, 800)?.url, s.siteUrl) : undefined,
    email: `mailto:${s.email}`,
    address: { '@type': 'PostalAddress', addressLocality: 'São Paulo', addressRegion: 'SP', addressCountry: 'BR' },
    sameAs: [s.social?.instagram, s.social?.etsy, s.social?.pinterest].filter(Boolean),
  }
}

/** Trilha de navegação: endereços em português, convertidos para o idioma da página */
export async function breadcrumbLd(items: [string, string][], locale: Locale) {
  const s = await getSettings(locale)
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map(([href, name], i) => ({ '@type': 'ListItem', position: i + 1, name, item: absoluteUrl(localizePath(href, locale), s.siteUrl) })),
  }
}
