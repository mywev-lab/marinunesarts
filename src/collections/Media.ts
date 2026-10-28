import type { CollectionConfig } from 'payload'

import { revalidateAfterChange, revalidateAfterDelete } from '../hooks/revalidate'

const webp = { format: 'webp' as const, options: { quality: 80 } }

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Imagem', plural: 'Imagens' },
  admin: {
    group: 'Configurações',
    description: 'Todas as imagens do site. Ao enviar uma imagem, o painel cria sozinho as versões menores e mais leves.',
    defaultColumns: ['filename', 'alt', 'updatedAt'],
  },
  access: { read: () => true },
  hooks: { afterChange: [revalidateAfterChange], afterDelete: [revalidateAfterDelete] },
  fields: [
    {
      name: 'alt',
      label: 'Texto alternativo',
      type: 'text',
      required: true,
      admin: { description: 'Descreva o que aparece na imagem. É lido por leitores de tela e pelo Google.' },
    },
    { name: 'credit', label: 'Crédito', type: 'text' },
  ],
  upload: {
    mimeTypes: ['image/*'],
    focalPoint: true,
    adminThumbnail: 'small',
    imageSizes: [
      { name: 'small', width: 480, formatOptions: webp },
      { name: 'medium', width: 800, formatOptions: webp },
      { name: 'large', width: 1200, formatOptions: webp },
      { name: 'xlarge', width: 1600, formatOptions: webp },
    ],
  },
}
