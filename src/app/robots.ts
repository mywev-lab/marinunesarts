import type { MetadataRoute } from 'next'

import { getSettings } from '@/lib/data'

export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await getSettings('pt')
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api'] }],
    sitemap: `${settings.siteUrl.replace(/\/$/, '')}/sitemap.xml`,
  }
}
