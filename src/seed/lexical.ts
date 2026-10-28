/**
 * Ferramentas para montar o conteúdo do editor (Lexical) a partir do HTML
 * dos textos antigos do site. Usado só pela importação inicial (seed).
 */
import { parse, NodeType, type HTMLElement, type Node as HtmlNode } from 'node-html-parser'

export type LexicalNode = Record<string, any>

const element = { format: '' as const, indent: 0, version: 1, direction: 'ltr' as const }
const BOLD = 1
const ITALIC = 2

const objectId = () =>
  [...crypto.getRandomValues(new Uint8Array(12))].map((b) => b.toString(16).padStart(2, '0')).join('')

export const text = (value: string, format = 0): LexicalNode => ({
  type: 'text',
  text: value,
  format,
  style: '',
  mode: 'normal',
  detail: 0,
  version: 1,
})
export const paragraph = (children: LexicalNode[]): LexicalNode => ({ type: 'paragraph', ...element, textFormat: 0, textStyle: '', children })
export const heading = (tag: 'h2' | 'h3', children: LexicalNode[]): LexicalNode => ({ type: 'heading', tag, ...element, children })
export const list = (ordered: boolean, items: LexicalNode[][]): LexicalNode => ({
  type: 'list',
  listType: ordered ? 'number' : 'bullet',
  tag: ordered ? 'ol' : 'ul',
  start: 1,
  ...element,
  children: items.map((children, i) => ({ type: 'listitem', value: i + 1, ...element, children })),
})
export const link = (url: string, children: LexicalNode[]): LexicalNode => ({
  type: 'link',
  version: 3,
  format: '',
  indent: 0,
  direction: 'ltr',
  id: objectId(),
  fields: { linkType: 'custom', url, newTab: /^https?:/.test(url) },
  children,
})
export const block = (blockType: string, fields: Record<string, unknown>): LexicalNode => ({
  type: 'block',
  version: 2,
  format: '',
  fields: { id: objectId(), blockName: '', blockType, ...fields },
})
export const root = (children: LexicalNode[]) => ({ root: { type: 'root', ...element, children } })

/** Texto simples, com parágrafos separados por linha em branco */
export const fromParagraphs = (value: string) =>
  root(
    value
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p) => paragraph([text(p)])),
  )

/** Links antigos (.html, ../, {{root}}) → endereços novos (/obras/limoes, /blog/slug) */
export function cleanHref(href = ''): string {
  if (/^(https?:|mailto:|tel:)/.test(href)) return href
  let value = href.replace(/^\{\{root\}\}/, '/').replace(/^(\.\.\/)+/, '/')
  if (!value.startsWith('/') && !value.startsWith('#')) value = '/' + value
  const [pathPart, hash] = value.split('#')
  let pathname = pathPart.replace(/\.html$/, '').replace(/\/index$/, '')
  if (pathname.length > 1) pathname = pathname.replace(/\/$/, '')
  if (pathname === '') pathname = '/'
  return hash !== undefined ? `${pathname}#${hash}` : pathname
}

const collapse = (value: string) => value.replace(/\s+/g, ' ')

function inline(nodes: HtmlNode[], format = 0): LexicalNode[] {
  const out: LexicalNode[] = []
  for (const node of nodes) {
    if (node.nodeType === NodeType.TEXT_NODE) {
      const value = collapse(node.text)
      if (value) out.push(text(value, format))
      continue
    }
    if (node.nodeType !== NodeType.ELEMENT_NODE) continue
    const el = node as HTMLElement
    const tag = el.tagName.toLowerCase()
    if (tag === 'strong' || tag === 'b') out.push(...inline(el.childNodes, format | BOLD))
    else if (tag === 'em' || tag === 'i') out.push(...inline(el.childNodes, format | ITALIC))
    else if (tag === 'a') out.push(link(cleanHref(el.getAttribute('href')), inline(el.childNodes, format)))
    else if (tag === 'br') out.push({ type: 'linebreak', version: 1 })
    else if (el.classList.contains('visually-hidden')) continue
    else out.push(...inline(el.childNodes, format))
  }
  return out
}

/** Remove espaços sobrando no começo e no fim de um bloco de texto */
function trimEdges(nodes: LexicalNode[]): LexicalNode[] {
  const first = (list: LexicalNode[]): LexicalNode | undefined => {
    const n = list[0]
    return n?.type === 'link' ? first(n.children) : n
  }
  const last = (list: LexicalNode[]): LexicalNode | undefined => {
    const n = list[list.length - 1]
    return n?.type === 'link' ? last(n.children) : n
  }
  const a = first(nodes)
  if (a?.type === 'text') a.text = a.text.replace(/^\s+/, '')
  const b = last(nodes)
  if (b?.type === 'text') b.text = b.text.replace(/\s+$/, '')
  return nodes.filter((n) => !(n.type === 'text' && n.text === ''))
}

export const inlineFromHtml = (html: string): LexicalNode[] => trimEdges(inline(parse(html).childNodes))

export type FigureSpec = { src: string; alt?: string; caption?: string; kind?: string }
export type ConvertContext = {
  /** devolve o id da imagem (cria a imagem na primeira vez) */
  media: (src: string, alt?: string) => Promise<number>
}

const captionToLexical = (html?: string) => (html ? root([paragraph(inlineFromHtml(html))]) : undefined)

/** Converte o HTML de um artigo em conteúdo do editor */
export async function htmlToLexical(source: string, ctx: ConvertContext) {
  const figs: FigureSpec[] = []
  // {{fig src="..." caption="..."}} → <x-fig data-i="0">
  const html = source.replace(/\{\{fig\s+([\s\S]*?)\}\}/g, (_, attrs: string) => {
    const spec: Record<string, string> = {}
    attrs.replace(/(\w+)="([^"]*)"/g, (__: string, k: string, v: string) => {
      spec[k] = v.replace(/&quot;/g, '"')
      return ''
    })
    figs.push(spec as FigureSpec)
    return `<x-fig data-i="${figs.length - 1}"></x-fig>`
  })

  const figureFields = async (el: HTMLElement) => {
    const spec = figs[Number(el.getAttribute('data-i'))]
    return {
      image: await ctx.media(spec.src, spec.alt),
      kind: spec.kind || (spec.src.startsWith('art/') ? 'art' : spec.src.startsWith('products/') ? 'product' : 'wide'),
      caption: captionToLexical(spec.caption),
    }
  }

  async function blocks(nodes: HtmlNode[]): Promise<LexicalNode[]> {
    const out: LexicalNode[] = []
    for (const node of nodes) {
      if (node.nodeType === NodeType.TEXT_NODE) {
        if (node.text.trim()) out.push(paragraph(trimEdges(inline([node]))))
        continue
      }
      if (node.nodeType !== NodeType.ELEMENT_NODE) continue
      const el = node as HTMLElement
      const tag = el.tagName.toLowerCase()
      if (tag === 'p') out.push(paragraph(trimEdges(inline(el.childNodes))))
      else if (tag === 'h2' || tag === 'h3') out.push(heading(tag, trimEdges(inline(el.childNodes))))
      else if (tag === 'ul' || tag === 'ol') {
        const items = el.childNodes.filter((c) => c.nodeType === NodeType.ELEMENT_NODE && (c as HTMLElement).tagName === 'LI')
        out.push(list(tag === 'ol', items.map((li) => trimEdges(inline(li.childNodes)))))
      } else if (tag === 'blockquote') out.push(paragraph(trimEdges(inline(el.childNodes))))
      else if (tag === 'x-fig') out.push(block('figura', await figureFields(el)))
      else if (el.classList.contains('callout')) {
        const title = el.querySelector('.callout-title')
        const rest = el.childNodes.filter((c) => c !== title)
        out.push(block('callout', { title: title?.text.trim() || 'Em resumo', body: root(await blocks(rest)) }))
      } else if (el.classList.contains('fig-row')) {
        const figuras = []
        for (const f of el.querySelectorAll('x-fig')) {
          const { image, caption } = await figureFields(f)
          figuras.push({ image, caption })
        }
        out.push(block('linhaDeFiguras', { figuras }))
      } else if (el.classList.contains('table-wrap')) {
        const table = el.querySelector('table')!
        const cellText = (c: HTMLElement) => collapse(c.childNodes.filter((n) => !(n as HTMLElement).classList?.contains('visually-hidden')).map((n) => n.text).join('')).trim()
        const header = table.querySelectorAll('thead th').map((th) => ({ text: cellText(th) }))
        const rows = table.querySelectorAll('tbody tr').map((tr) => ({
          cells: tr.childNodes
            .filter((c) => c.nodeType === NodeType.ELEMENT_NODE)
            .map((c) => ({ text: cellText(c as HTMLElement) })),
        }))
        out.push(
          block('tabela', {
            caption: table.querySelector('caption')?.text.trim() || '',
            firstColumnIsHeader: Boolean(table.querySelector('tbody th')),
            header,
            rows,
          }),
        )
      } else out.push(...(await blocks(el.childNodes)))
    }
    return out
  }

  return root(await blocks(parse(html).childNodes))
}

/** Anotações <!-- REVISAR: ... --> (viram o campo "Anotações para revisão") */
export const extractNotes = (html: string): string[] =>
  [...html.matchAll(/<!--\s*REVISAR([\s\S]*?)-->/g)].map((m) => m[1].replace(/^\s*\(Mari\)/, '').replace(/^\s*:\s*/, '').trim())

export const stripNotes = (html: string) => html.replace(/<!--[\s\S]*?-->/g, '')
