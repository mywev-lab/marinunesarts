import type { Block } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

// editor simples para textos dentro dos blocos (evita importação circular com editors.ts)
const simple = lexicalEditor({
  features: ({ defaultFeatures }) =>
    defaultFeatures.filter((f) => ['paragraph', 'link', 'bold', 'italic', 'underline', 'unorderedList', 'orderedList', 'toolbarInline'].includes(f.key)),
})

export const FIGURE_KINDS = [
  { label: 'Obra (com passe-partout)', value: 'art' },
  { label: 'Imagem inteira', value: 'wide' },
  { label: 'Produto (quadrada)', value: 'product' },
]

export const Callout: Block = {
  slug: 'callout',
  labels: { singular: 'Destaque (Em resumo)', plural: 'Destaques' },
  fields: [
    { name: 'title', label: 'Título', type: 'text', defaultValue: 'Em resumo' },
    { name: 'body', label: 'Texto', type: 'richText', editor: simple, required: true },
  ],
}

export const Figura: Block = {
  slug: 'figura',
  labels: { singular: 'Imagem com legenda', plural: 'Imagens com legenda' },
  fields: [
    { name: 'image', label: 'Imagem', type: 'upload', relationTo: 'media', required: true },
    { name: 'kind', label: 'Estilo', type: 'select', defaultValue: 'art', options: FIGURE_KINDS },
    { name: 'caption', label: 'Legenda', type: 'richText', editor: simple },
  ],
}

export const LinhaDeFiguras: Block = {
  slug: 'linhaDeFiguras',
  labels: { singular: 'Linha de obras', plural: 'Linhas de obras' },
  fields: [
    {
      name: 'figuras',
      label: 'Obras',
      type: 'array',
      minRows: 2,
      maxRows: 4,
      fields: [
        { name: 'image', label: 'Imagem', type: 'upload', relationTo: 'media', required: true },
        { name: 'caption', label: 'Legenda', type: 'richText', editor: simple },
      ],
    },
  ],
}

export const Tabela: Block = {
  slug: 'tabela',
  labels: { singular: 'Tabela', plural: 'Tabelas' },
  fields: [
    { name: 'caption', label: 'Título da tabela', type: 'text', required: true },
    {
      name: 'firstColumnIsHeader',
      label: 'A primeira coluna é o nome de cada linha',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'header',
      label: 'Cabeçalho (colunas)',
      type: 'array',
      minRows: 2,
      fields: [{ name: 'text', label: 'Texto', type: 'text' }],
    },
    {
      name: 'rows',
      label: 'Linhas',
      type: 'array',
      fields: [
        {
          name: 'cells',
          label: 'Células',
          type: 'array',
          fields: [{ name: 'text', label: 'Texto', type: 'text' }],
        },
      ],
    },
  ],
}
