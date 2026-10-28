import type { CollectionConfig } from 'payload'

import { articleEditor, inlineEditor } from '../blocks/editors'
import { FIGURE_KINDS } from '../blocks'
import { slugField } from '../fields/slug'
import { revalidateAfterChange, revalidateAfterDelete } from '../hooks/revalidate'

export const Posts: CollectionConfig = {
  slug: 'posts',
  labels: { singular: 'Artigo', plural: 'Artigos' },
  admin: {
    useAsTitle: 'title',
    group: 'Blog',
    defaultColumns: ['title', 'category', 'publishedAt', '_status'],
    description: 'Artigos do Diário do Ateliê. Use "Salvar rascunho" enquanto escreve e "Publicar" quando estiver pronto.',
  },
  defaultSort: '-publishedAt',
  versions: { drafts: true, maxPerDoc: 30 },
  access: {
    read: ({ req }) => (req.user ? true : { _status: { equals: 'published' } }),
  },
  hooks: { afterChange: [revalidateAfterChange], afterDelete: [revalidateAfterDelete] },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Conteúdo',
          fields: [
            { name: 'title', label: 'Título', type: 'text', required: true },
            { name: 'dek', label: 'Subtítulo', type: 'textarea', required: true, admin: { description: 'Aparece logo abaixo do título.' } },
            {
              name: 'cover',
              label: 'Capa',
              type: 'group',
              fields: [
                { name: 'image', label: 'Imagem', type: 'upload', relationTo: 'media', required: true },
                { name: 'kind', label: 'Estilo', type: 'select', defaultValue: 'art', options: FIGURE_KINDS },
                { name: 'caption', label: 'Legenda', type: 'richText', editor: inlineEditor },
              ],
            },
            {
              name: 'content',
              label: 'Texto do artigo',
              type: 'richText',
              editor: articleEditor,
              required: true,
              admin: {
                description:
                  'Use "Título 2" para as seções (elas formam o sumário "Neste artigo") e "Título 3" para subseções. Os blocos "Destaque", "Imagem com legenda", "Linha de obras" e "Tabela" ficam no botão +.',
              },
            },
          ],
        },
        {
          label: 'Cartão e SEO',
          fields: [
            { name: 'excerpt', label: 'Resumo do cartão', type: 'textarea', required: true, admin: { description: 'Aparece nos cartões da página do blog.' } },
            { name: 'seoTitle', label: 'Título para o Google', type: 'text', admin: { description: 'Até cerca de 60 caracteres. Se ficar vazio, usa o título.' } },
            { name: 'description', label: 'Descrição para o Google', type: 'textarea', required: true, admin: { description: 'Até cerca de 160 caracteres.' } },
            {
              name: 'keywords',
              label: 'Palavras-chave',
              type: 'array',
              fields: [{ name: 'keyword', label: 'Palavra-chave', type: 'text', required: true }],
            },
          ],
        },
        {
          label: 'Fechamento',
          fields: [
            {
              name: 'cta',
              label: 'Chamada no fim do artigo',
              type: 'group',
              fields: [
                { name: 'title', label: 'Título', type: 'text' },
                { name: 'text', label: 'Texto', type: 'textarea' },
                {
                  type: 'row',
                  fields: [
                    { name: 'label', label: 'Texto do botão', type: 'text' },
                    { name: 'href', label: 'Link do botão', type: 'text', admin: { placeholder: '/portfolio#giz-pastel' } },
                  ],
                },
              ],
            },
            {
              name: 'sources',
              label: 'Fontes',
              type: 'array',
              fields: [
                { name: 'title', label: 'Título', type: 'text', required: true },
                { name: 'publisher', label: 'Instituição ou site', type: 'text', required: true },
                { name: 'url', label: 'Link', type: 'text', required: true },
              ],
            },
            {
              name: 'related',
              label: 'Continue lendo',
              type: 'relationship',
              relationTo: 'posts',
              hasMany: true,
              maxRows: 3,
              filterOptions: ({ id }) => ({ id: { not_equals: id } }),
            },
          ],
        },
      ],
    },
    slugField('title'),
    { name: 'category', label: 'Categoria', type: 'relationship', relationTo: 'categorias', required: true, admin: { position: 'sidebar' } },
    {
      name: 'publishedAt',
      label: 'Publicado em',
      type: 'date',
      admin: { position: 'sidebar', date: { pickerAppearance: 'dayOnly', displayFormat: 'dd/MM/yyyy' } },
      hooks: {
        beforeChange: [({ value, siblingData }) => (!value && siblingData?._status === 'published' ? new Date().toISOString() : value)],
      },
    },
    {
      name: 'revisedAt',
      label: 'Atualizado em',
      type: 'date',
      admin: { position: 'sidebar', description: 'Preencha quando fizer uma revisão importante no texto.', date: { pickerAppearance: 'dayOnly', displayFormat: 'dd/MM/yyyy' } },
    },
    {
      name: 'editorNotes',
      label: 'Anotações para revisão',
      type: 'textarea',
      admin: { position: 'sidebar', description: 'Só aparecem aqui no painel, nunca no site.' },
    },
  ],
}
