import type { CollectionConfig } from 'payload'

import { slugField } from '../fields/slug'
import { revalidateAfterChange, revalidateAfterDelete } from '../hooks/revalidate'

export const WORK_CATEGORIES = [
  { label: 'Aquarela', value: 'aquarela' },
  { label: 'Giz pastel oleoso', value: 'giz-pastel' },
  { label: 'Paisagens', value: 'paisagens' },
  { label: 'Animais e natureza', value: 'natureza' },
  { label: 'Abstrata e moderna', value: 'abstrata' },
  { label: 'Coleções', value: 'colecoes' },
]

export const WORK_STATUS = [
  { label: 'Disponível', value: 'disponivel' },
  { label: 'Coleção particular', value: 'colecao-particular' },
  { label: 'Vendida', value: 'vendida' },
]

export const Obras: CollectionConfig = {
  slug: 'obras',
  labels: { singular: 'Obra', plural: 'Obras' },
  admin: {
    useAsTitle: 'title',
    group: 'Portfólio e loja',
    defaultColumns: ['title', 'technique', 'year', 'status', 'order'],
    description: 'Pinturas do portfólio. Cada obra ganha uma página própria em /obras/endereço.',
  },
  defaultSort: 'order',
  access: { read: () => true },
  hooks: { afterChange: [revalidateAfterChange], afterDelete: [revalidateAfterDelete] },
  fields: [
    { name: 'title', label: 'Título', type: 'text', required: true },
    {
      name: 'image',
      label: 'Imagem da obra',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: { description: 'Foto da obra inteira, sem moldura. O texto alternativo é o da imagem.' },
    },
    {
      type: 'row',
      fields: [
        { name: 'technique', label: 'Técnica', type: 'text', required: true, admin: { placeholder: 'Giz pastel oleoso sobre papel' } },
        { name: 'year', label: 'Ano', type: 'text', admin: { width: '20%' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'dimensions', label: 'Dimensões', type: 'text', admin: { placeholder: '24 × 32 cm' } },
        { name: 'format', label: 'Formato', type: 'text', admin: { placeholder: 'Original ou Impressão artística' } },
        { name: 'status', label: 'Situação', type: 'select', options: WORK_STATUS, admin: { description: 'Deixe vazio para mostrar "Consulte a disponibilidade".' } },
      ],
    },
    {
      name: 'categories',
      label: 'Filtros do portfólio',
      type: 'select',
      hasMany: true,
      options: WORK_CATEGORIES,
    },
    {
      name: 'description',
      label: 'Descrição',
      type: 'textarea',
      required: true,
      admin: { description: 'Deixe uma linha em branco para separar parágrafos.' },
    },
    {
      name: 'etsy',
      label: 'Venda na Etsy (opcional)',
      type: 'group',
      fields: [
        { name: 'url', label: 'Link', type: 'text' },
        { name: 'label', label: 'Texto do botão', type: 'text' },
        { name: 'note', label: 'Observação', type: 'text' },
      ],
    },
    { name: 'instagram', label: 'Link da publicação no Instagram', type: 'text' },
    {
      name: 'mockups',
      label: 'Na parede (fotos da obra em ambientes)',
      type: 'array',
      maxRows: 2,
      fields: [{ name: 'image', label: 'Imagem', type: 'upload', relationTo: 'media', required: true }],
    },
    slugField('title'),
    {
      name: 'order',
      label: 'Ordem no portfólio',
      type: 'number',
      defaultValue: 100,
      admin: { position: 'sidebar', description: 'Números menores aparecem primeiro.' },
    },
    { name: 'showOnHome', label: 'Mostrar em "Do ateliê" na página inicial', type: 'checkbox', admin: { position: 'sidebar' } },
    { name: 'forSale', label: 'Mostrar na página Produtos (obras à venda)', type: 'checkbox', admin: { position: 'sidebar' } },
  ],
}
