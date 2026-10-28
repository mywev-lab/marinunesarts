import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Usuário', plural: 'Usuários' },
  admin: {
    useAsTitle: 'email',
    group: 'Configurações',
  },
  auth: true,
  fields: [{ name: 'name', label: 'Nome', type: 'text' }],
}
