import { slugify } from '../fields/slug'

type Node = { type?: string; text?: string; tag?: string; children?: Node[]; fields?: Record<string, any> }
export type RichTextValue = { root: Node } | null | undefined

/** Texto puro de um conjunto de nós */
export const nodeText = (node: Node): string =>
  node.type === 'text' ? node.text || '' : (node.children || []).map(nodeText).join('')

/** Títulos h2 do artigo, para o sumário "Neste artigo" */
export function headingsOf(value: RichTextValue): { id: string; text: string }[] {
  return (value?.root.children || [])
    .filter((n) => n.type === 'heading' && n.tag === 'h2')
    .map((n) => {
      const text = nodeText(n).trim()
      return { id: slugify(text), text }
    })
}

/** Número de palavras (texto, legendas e tabelas) para o tempo de leitura */
export function wordCount(value: RichTextValue): number {
  let words = 0
  const count = (s: string) => (words += s.split(/\s+/).filter(Boolean).length)
  const walk = (n: any): void => {
    if (!n || typeof n !== 'object') return
    if (n.type === 'text' && typeof n.text === 'string') count(n.text)
    if (Array.isArray(n)) n.forEach(walk)
    else
      for (const [k, v] of Object.entries(n)) {
        if (k === 'text' && n.type === 'text') continue
        if (k === 'text' && typeof v === 'string') count(v)
        else if (k === 'caption' && typeof v === 'string') count(v)
        else if (v && typeof v === 'object') walk(v)
      }
  }
  walk(value?.root)
  return words
}

export const readingMinutes = (value: RichTextValue) => Math.max(1, Math.round(wordCount(value) / 200))
