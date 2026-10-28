import type { MetadataRoute } from 'next'

import { getObras, getPosts, getProdutos, getSettings } from '@/lib/data'
import { isoDay } from '@/lib/text'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [settings, obras, produtos, posts] = await Promise.all([getSettings(), getObras(), getProdutos(), getPosts()])
  const base = settings.siteUrl.replace(/\/$/, '')
  const u = (path: string) => `${base}${path}`
  return [
    { url: u('/'), changeFrequency: 'weekly', priority: 1 },
    { url: u('/produtos'), changeFrequency: 'weekly', priority: 0.9 },
    { url: u('/portfolio'), changeFrequency: 'weekly', priority: 0.9 },
    ...produtos.map((p) => ({ url: u(`/produtos/${p.slug}`), changeFrequency: 'monthly' as const, priority: 0.8 })),
    ...obras.map((o) => ({ url: u(`/obras/${o.slug}`), changeFrequency: 'monthly' as const, priority: 0.7 })),
    { url: u('/blog'), changeFrequency: 'weekly', priority: 0.8 },
    ...posts.map((p) => ({
      url: u(`/blog/${p.slug}`),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
      ...(p.revisedAt || p.publishedAt ? { lastModified: isoDay((p.revisedAt || p.publishedAt)!) } : {}),
    })),
    { url: u('/sobre'), changeFrequency: 'monthly', priority: 0.6 },
    { url: u('/contato'), changeFrequency: 'yearly', priority: 0.5 },
  ]
}
