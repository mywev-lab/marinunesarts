import { RichText as LexicalRichText, type JSXConvertersFunction } from '@payloadcms/richtext-lexical/react'
import React from 'react'

import { slugify } from '@/lib/text'
import { nodeText, type RichTextValue } from '@/lib/lexical'
import { Picture } from './ui'

type Kind = 'art' | 'wide' | 'product'

const FIGURE_SIZES: Record<Kind, string> = {
  art: '(max-width: 760px) 70vw, 340px',
  wide: '(max-width: 760px) 92vw, 820px',
  product: '(max-width: 760px) 92vw, 560px',
}

/** Texto curto (legendas): sem parágrafos em volta */
export function InlineRichText({ data }: { data: RichTextValue }) {
  if (!data?.root?.children?.length) return null
  return (
    <LexicalRichText
      data={data as any}
      disableContainer
      converters={({ defaultConverters }) => ({
        ...defaultConverters,
        paragraph: ({ node, nodesToJSX }) => <>{nodesToJSX({ nodes: (node as any).children })}</>,
      })}
    />
  )
}

export function Figure({
  image,
  caption,
  kind = 'art',
  cls = 'post-figure',
  sizes,
  eager = false,
}: {
  image: any
  caption?: RichTextValue
  kind?: Kind | null
  cls?: string
  sizes?: string
  eager?: boolean
}) {
  const k = (kind || 'art') as Kind
  return (
    <figure className={`${cls} ${cls}--${k}`}>
      <div className={`${cls}-frame`}>
        <Picture media={image} sizes={sizes || FIGURE_SIZES[k]} maxFallback={k === 'wide' ? 1200 : 800} eager={eager} />
      </div>
      {caption?.root?.children?.length ? (
        <figcaption>
          <InlineRichText data={caption} />
        </figcaption>
      ) : null}
    </figure>
  )
}

const converters: JSXConvertersFunction<any> = ({ defaultConverters }) =>
  ({
  ...defaultConverters,
  heading: ({ node, nodesToJSX }: any) => {
    const Tag = (['h2', 'h3', 'h4'].includes(node.tag) ? node.tag : 'h2') as 'h2'
    return <Tag id={slugify(nodeText(node))}>{nodesToJSX({ nodes: node.children })}</Tag>
  },
  link: ({ node, nodesToJSX }: any) => {
    const { url, newTab } = node.fields || {}
    return (
      <a href={url || '#'} {...(newTab ? { target: '_blank', rel: 'noopener' } : {})}>
        {nodesToJSX({ nodes: node.children })}
      </a>
    )
  },
  blocks: {
    callout: ({ node }: any) => (
      <div className="callout">
        <p className="callout-title">{node.fields.title || 'Em resumo'}</p>
        <LexicalRichText data={node.fields.body} disableContainer />
      </div>
    ),
    figura: ({ node }: any) => <Figure image={node.fields.image} caption={node.fields.caption} kind={node.fields.kind} />,
    linhaDeFiguras: ({ node }: any) => (
      <div className="fig-row">
        {(node.fields.figuras || []).map((f: any, i: number) => (
          <Figure key={f.id || i} image={f.image} caption={f.caption} kind="art" sizes="(max-width: 760px) 80vw, 260px" />
        ))}
      </div>
    ),
    tabela: ({ node }: any) => {
      const { caption, header = [], rows = [], firstColumnIsHeader } = node.fields
      return (
        <div className="table-wrap" tabIndex={0} role="region" aria-label={caption}>
          <table>
            <caption>{caption}</caption>
            <thead>
              <tr>
                {header.map((h: any, i: number) => (
                  <th key={i} scope="col">
                    {h.text || <span className="visually-hidden">Item</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r: any, i: number) => (
                <tr key={i}>
                  {(r.cells || []).map((c: any, j: number) =>
                    j === 0 && firstColumnIsHeader ? (
                      <th key={j} scope="row">
                        {c.text}
                      </th>
                    ) : (
                      <td key={j}>{c.text}</td>
                    ),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    },
  },
}) as any

/** Texto completo (artigos e páginas) */
export function RichText({ data }: { data: RichTextValue }) {
  if (!data) return null
  return <LexicalRichText data={data as any} converters={converters} disableContainer />
}
