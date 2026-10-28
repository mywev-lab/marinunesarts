import {
  BlocksFeature,
  FixedToolbarFeature,
  HeadingFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { Callout, Figura, LinhaDeFiguras, Tabela } from './index'

// Recursos do editor que o site não usa (ficam fora para simplificar a barra)
const REMOVED = new Set(['upload', 'relationship', 'checklist', 'inlineCode', 'indent', 'align', 'subscript', 'superscript', 'heading', 'blockquote'])

/** Editor dos artigos: títulos h2/h3, listas, links, negrito, itálico e blocos do site. */
export const articleEditor = lexicalEditor({
  features: ({ defaultFeatures }) => [
    ...defaultFeatures.filter((f) => !REMOVED.has(f.key)),
    HeadingFeature({ enabledHeadingSizes: ['h2', 'h3'] }),
    BlocksFeature({ blocks: [Callout, Figura, LinhaDeFiguras, Tabela] }),
    FixedToolbarFeature(),
  ],
})

/** Editor de textos de página (Sobre, Privacidade): sem blocos. */
export const pageEditor = lexicalEditor({
  features: ({ defaultFeatures }) => [
    ...defaultFeatures.filter((f) => !REMOVED.has(f.key)),
    HeadingFeature({ enabledHeadingSizes: ['h2', 'h3'] }),
    FixedToolbarFeature(),
  ],
})

/** Editor curto (legendas, destaques): só texto, links, negrito e itálico. */
export const inlineEditor = lexicalEditor({
  features: ({ defaultFeatures }) =>
    defaultFeatures.filter((f) => ['paragraph', 'link', 'bold', 'italic', 'underline', 'unorderedList', 'orderedList', 'toolbarInline'].includes(f.key)),
})
