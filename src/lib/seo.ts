import type { Metadata } from 'next'

import { getSettings } from './data'
import { absoluteUrl, asMedia, pick, type MediaRef } from './media'

export async function pageMetadata({
  title,
  description,
  path,
  image,
  type = 'website',
  article,
  noindex = false,
}: {
  title: string
  description?: string | null
  path: string
  image?: MediaRef
  type?: 'website' | 'article'
  article?: { publishedTime?: string; modifiedTime?: string; section?: string }
  noindex?: boolean
}): Promise<Metadata> {
  const settings = await getSettings()
  const media = asMedia(image) || asMedia(settings.ogImage)
  const imageUrl = media ? absoluteUrl(pick(media, 1200)?.url, settings.siteUrl) : undefined
  return {
    title,
    description: description || undefined,
    alternates: { canonical: path },
    robots: noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      title,
      description: description || undefined,
      url: path,
      siteName: settings.siteName,
      locale: 'pt_BR',
      type,
      images: imageUrl ? [{ url: imageUrl }] : undefined,
      ...(type === 'article' && article
        ? {
            publishedTime: article.publishedTime,
            modifiedTime: article.modifiedTime,
            section: article.section,
            authors: [absoluteUrl('/sobre', settings.siteUrl)],
          }
        : {}),
    },
    twitter: { card: 'summary_large_image', title, description: description || undefined, images: imageUrl ? [imageUrl] : undefined },
  }
}

/** Autora (mesmo identificador em todas as páginas) */
export async function authorRef() {
  const s = await getSettings()
  return { '@type': 'Person', '@id': absoluteUrl('/sobre#mariane-nunes', s.siteUrl), name: s.authorName, url: absoluteUrl('/sobre', s.siteUrl) }
}

export async function personLd() {
  const s = await getSettings()
  const photo = asMedia(s.person?.photo)
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': absoluteUrl('/sobre#mariane-nunes', s.siteUrl),
    name: s.authorName,
    alternateName: s.siteName,
    jobTitle: s.person?.jobTitle || undefined,
    description: s.person?.description || undefined,
    url: absoluteUrl('/', s.siteUrl),
    image: photo ? absoluteUrl(pick(photo, 800)?.url, s.siteUrl) : undefined,
    email: `mailto:${s.email}`,
    address: { '@type': 'PostalAddress', addressLocality: 'São Paulo', addressRegion: 'SP', addressCountry: 'BR' },
    sameAs: [s.social?.instagram, s.social?.etsy, s.social?.pinterest].filter(Boolean),
  }
}

export async function breadcrumbLd(items: [string, string][]) {
  const s = await getSettings()
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map(([href, name], i) => ({ '@type': 'ListItem', position: i + 1, name, item: absoluteUrl(href, s.siteUrl) })),
  }
}
