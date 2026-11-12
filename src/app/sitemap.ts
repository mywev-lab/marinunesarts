import type { MetadataRoute } from 'next'

import { getObras, getPosts, getProdutos, getSettings } from '@/lib/data'
import { HTML_LANG, alternatePaths } from '@/lib/i18n'
import { isoDay } from '@/lib/text'

type Entry = MetadataRoute.Sitemap[number]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [settings, obras, produtos, posts] = await Promise.all([getSettings('pt'), getObras('pt'), getProdutos('pt'), getPosts('pt')])
  const base = settings.siteUrl.replace(/\/$/, '')
  const u = (path: string) => `${base}${path}`

  // cada página aparece em português e em inglês, com o endereço da outra versão (hreflang)
  const both = (path: string, extra: Omit<Entry, 'url'>): Entry[] => {
    const paths = alternatePaths(path)
    const languages = { [HTML_LANG.pt]: u(paths.pt), [HTML_LANG.en]: u(paths.en) }
    return [
      { url: u(paths.pt), ...extra, alternates: { languages } },
      { url: u(paths.en), ...extra, alternates: { languages } },
    ]
  }

  return [
    ...both('/', { changeFrequency: 'weekly', priority: 1 }),
    ...both('/produtos', { changeFrequency: 'weekly', priority: 0.9 }),
    ...both('/portfolio', { changeFrequency: 'weekly', priority: 0.9 }),
    ...produtos.flatMap((p) => both(`/produtos/${p.slug}`, { changeFrequency: 'monthly', priority: 0.8 })),
    ...obras.flatMap((o) => both(`/obras/${o.slug}`, { changeFrequency: 'monthly', priority: 0.7 })),
    ...both('/blog', { changeFrequency: 'weekly', priority: 0.8 }),
    ...posts.flatMap((p) =>
      both(`/blog/${p.slug}`, {
        changeFrequency: 'monthly',
        priority: 0.7,
        ...(p.revisedAt || p.publishedAt ? { lastModified: isoDay((p.revisedAt || p.publishedAt)!) } : {}),
      }),
    ),
    ...both('/sobre', { changeFrequency: 'monthly', priority: 0.6 }),
    ...both('/contato', { changeFrequency: 'yearly', priority: 0.5 }),
  ]
}
