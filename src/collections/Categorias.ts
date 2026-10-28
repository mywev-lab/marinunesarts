import type { CollectionConfig } from 'payload'

import { slugField } from '../fields/slug'
import { revalidateAfterChange, revalidateAfterDelete } from '../hooks/revalidate'

export const Categorias: CollectionConfig = {
  slug: 'categorias',
  labels: { singular: 'Categoria do blog', plural: 'Categorias do blog' },
  admin: { useAsTitle: 'name', group: 'Blog', defaultColumns: ['name', 'order'] },
  defaultSort: 'order',
  access: { read: () => true },
  hooks: { afterChange: [revalidateAfterChange], afterDelete: [revalidateAfterDelete] },
  fields: [
    { name: 'name', label: 'Nome', type: 'text', required: true },
    { name: 'description', label: 'Descrição', type: 'textarea' },
    slugField('name'),
    { name: 'order', label: 'Ordem', type: 'number', defaultValue: 100, admin: { position: 'sidebar' } },
  ],
}
