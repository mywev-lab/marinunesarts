import type { CollectionConfig } from 'payload'

import { slugField } from '../fields/slug'
import { revalidateAfterChange, revalidateAfterDelete } from '../hooks/revalidate'

export const Produtos: CollectionConfig = {
  slug: 'produtos',
  labels: { singular: 'Produto digital', plural: 'Produtos digitais' },
  admin: {
    useAsTitle: 'name',
    group: 'Portfólio e loja',
    defaultColumns: ['name', 'kind', 'price', 'order'],
    description: 'Planners e outros produtos digitais vendidos na Etsy. Cada um ganha uma página em /produtos/endereço.',
  },
  defaultSort: 'order',
  access: { read: () => true },
  hooks: { afterChange: [revalidateAfterChange], afterDelete: [revalidateAfterDelete] },
  fields: [
    { name: 'name', label: 'Nome', type: 'text', required: true },
    {
      type: 'row',
      fields: [
        { name: 'kind', label: 'Tipo', type: 'text', required: true, admin: { placeholder: 'Planner digital inspirado em Van Gogh' } },
        {
          name: 'category',
          label: 'Categoria',
          type: 'text',
          defaultValue: 'Planners',
          admin: { width: '30%', description: 'Agrupa os produtos na página Produtos (ex.: Planners, Cadernos, Convites).' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'price', label: 'Preço (como aparece)', type: 'text', required: true, admin: { placeholder: 'US$ 10' } },
        { name: 'priceValue', label: 'Preço (número)', type: 'number', admin: { description: 'Para o Google. Ex.: 10' } },
        {
          name: 'currency',
          label: 'Moeda',
          type: 'select',
          defaultValue: 'USD',
          options: [
            { label: 'Dólar (USD)', value: 'USD' },
            { label: 'Real (BRL)', value: 'BRL' },
          ],
        },
      ],
    },
    { name: 'etsy', label: 'Link da Etsy', type: 'text', required: true },
    {
      name: 'images',
      label: 'Imagens',
      type: 'array',
      minRows: 1,
      admin: { description: 'A primeira imagem é a capa.' },
      fields: [{ name: 'image', label: 'Imagem', type: 'upload', relationTo: 'media', required: true }],
    },
    { name: 'summary', label: 'Resumo', type: 'textarea', required: true },
    { name: 'cardMeta', label: 'Linha curta do cartão', type: 'text', admin: { placeholder: '71 páginas, sem datas' } },
    {
      name: 'specs',
      label: 'Ficha técnica',
      type: 'array',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'label', label: 'Item', type: 'text', required: true },
            { name: 'value', label: 'Valor', type: 'text', required: true },
          ],
        },
      ],
    },
    {
      name: 'includes',
      label: 'O que vem no produto',
      type: 'array',
      fields: [{ name: 'text', label: 'Item', type: 'text', required: true }],
    },
    slugField('name'),
    { name: 'order', label: 'Ordem', type: 'number', defaultValue: 100, admin: { position: 'sidebar' } },
  ],
}
