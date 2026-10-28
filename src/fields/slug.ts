import type { Field, FieldHook } from 'payload'

/** "Veneza ao Entardecer" → "veneza-ao-entardecer" */
export const slugify = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const fillSlug =
  (from: string): FieldHook =>
  ({ value, data }) => {
    if (typeof value === 'string' && value.trim()) return slugify(value)
    const source = data?.[from]
    return typeof source === 'string' && source.trim() ? slugify(source) : value
  }

export const slugField = (from = 'title'): Field => ({
  name: 'slug',
  label: 'Endereço (slug)',
  type: 'text',
  required: true,
  unique: true,
  index: true,
  admin: {
    position: 'sidebar',
    description: 'Final do endereço da página. Se ficar em branco, é criado a partir do título. Mudar depois quebra links antigos.',
  },
  hooks: { beforeValidate: [fillSlug(from)] },
})
