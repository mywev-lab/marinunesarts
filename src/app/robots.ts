import type { MetadataRoute } from 'next'

import { getSettings } from '@/lib/data'

export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await getSettings('pt')
  return {
    // /instagram guarda só as imagens dos posts (o Instagram busca de lá); não precisa aparecer em buscas
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api', '/instagram'] }],
    sitemap: `${settings.siteUrl.replace(/\/$/, '')}/sitemap.xml`,
  }
}
