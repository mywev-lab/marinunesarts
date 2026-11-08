import type { CollectionConfig } from 'payload'

import { slugField } from '../fields/slug'
import { revalidateAfterChange, revalidateAfterDelete } from '../hooks/revalidate'

export const Produtos: CollectionConfig = {
  slug: 'produtos',
  labels: { singular: 'Produto', plural: 'Produtos' },
  admin: {
    useAsTitle: 'name',
    group: 'Portfólio e loja',
    defaultColumns: ['name', 'type', 'kind', 'price', 'order'],
    description:
      'Planners digitais e prints das obras. Cada produto ganha uma página em /produtos/endereço. Sem preço, aparece "Valor sob consulta"; sem link da Etsy, o botão leva ao contato.',
  },
  defaultSort: 'order',
  access: { read: () => true },
  hooks: { afterChange: [revalidateAfterChange], afterDelete: [revalidateAfterDelete] },
  fields: [
    {
      name: 'type',
      label: 'Tipo de produto',
      type: 'select',
      required: true,
      defaultValue: 'digital',
      options: [
        { label: 'Digital (download)', value: 'digital' },
        { label: 'Print (impressão)', value: 'print' },
      ],
      admin: { position: 'sidebar', description: 'Prints aparecem na seção "Prints artísticos" da página Produtos.' },
    },
    { name: 'name', label: 'Nome', type: 'text', required: true },
    {
      type: 'row',
      fields: [
        { name: 'kind', label: 'Descrição curta', type: 'text', required: true, admin: { placeholder: 'Planner digital inspirado em Van Gogh' } },
        {
          name: 'category',
          label: 'Categoria',
          type: 'text',
          defaultValue: 'Planners',
          admin: {
            width: '30%',
            description: 'Agrupa os produtos digitais na página Produtos (ex.: Planners, Cadernos, Convites).',
            condition: (data) => data?.type !== 'print',
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'price', label: 'Preço (como aparece)', type: 'text', admin: { placeholder: 'US$ 10', description: 'Vazio: "Valor sob consulta".' } },
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
    { name: 'etsy', label: 'Link da Etsy', type: 'text', admin: { description: 'Vazio: o botão leva ao formulário de contato.' } },
    {
      name: 'works',
      label: 'Obras deste produto',
      type: 'relationship',
      relationTo: 'obras',
      hasMany: true,
      admin: { description: 'Para prints: as obras impressas. A página da obra ganha um link para o print.', condition: (data) => data?.type === 'print' },
    },
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
