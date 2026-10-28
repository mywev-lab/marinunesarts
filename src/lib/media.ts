import type { Media } from '@/payload-types'

export type MediaRef = number | Media | null | undefined

export const asMedia = (m: MediaRef): Media | null => (m && typeof m === 'object' ? m : null)

const SIZES = ['small', 'medium', 'large', 'xlarge'] as const

type Variant = { url: string; width: number; height: number }

/** Versões disponíveis da imagem, da menor para a maior (inclui a original) */
export function variants(media: Media): Variant[] {
  const list: Variant[] = []
  for (const key of SIZES) {
    const s = media.sizes?.[key]
    if (s?.url && s.width && s.height) list.push({ url: s.url, width: s.width, height: s.height })
  }
  if (media.url && media.width && media.height && !list.some((v) => v.width >= media.width!)) {
    list.push({ url: media.url, width: media.width, height: media.height })
  }
  return list.sort((a, b) => a.width - b.width)
}

/** Melhor versão até uma largura máxima */
export function pick(media: Media, maxWidth = 800): Variant | null {
  const list = variants(media)
  if (!list.length) return media.url ? { url: media.url, width: media.width || 0, height: media.height || 0 } : null
  return list.filter((v) => v.width <= maxWidth).pop() || list[0]
}

export const srcSet = (media: Media, maxWidth = Infinity) =>
  variants(media)
    .filter((v) => v.width <= maxWidth)
    .map((v) => `${v.url} ${v.width}w`)
    .join(', ')

/** URL absoluta (para Google, redes sociais e dados estruturados) */
export function absoluteUrl(url: string | null | undefined, siteUrl: string): string {
  if (!url) return ''
  if (/^https?:\/\//.test(url)) return url
  return `${siteUrl.replace(/\/$/, '')}${url.startsWith('/') ? '' : '/'}${url}`
}
