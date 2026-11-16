/**
 * Prints: a ficha técnica de todos os prints (inclusive as coleções) ganha a linha da moldura opcional,
 * informada pela Mariane: branca, preta ou madeira, com vidro ou acetato. Em português e inglês.
 * No formulário de contato, a escolha da moldura vira um campo próprio (código, não banco).
 */
import { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'

const MOLDURA = {
  pt: { label: 'Moldura (opcional)', value: 'Branca, preta ou madeira, com vidro ou acetato' },
  en: { label: 'Frame (optional)', value: 'White, black or wood, with glass or acetate' },
}

const ctx = { disableRevalidate: true }
type Row = { id?: string | null; label: string; value: string }

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  const { docs } = await payload.find({ collection: 'produtos', where: { type: { equals: 'print' } }, depth: 0, limit: 500, pagination: false, locale: 'pt', req })
  for (const doc of docs) {
    const ptRows = (doc.specs || []) as Row[]
    if (ptRows.some((r) => r.label === MOLDURA.pt.label)) continue // já tem

    const en = await payload.findByID({ collection: 'produtos', id: doc.id, locale: 'en', fallbackLocale: false, depth: 0, req })
    const enRows = (en.specs || []) as Row[]

    const atualizado = await payload.update({
      collection: 'produtos',
      id: doc.id,
      locale: 'pt',
      data: { specs: [...ptRows.map(({ id, label, value }) => ({ id, label, value })), MOLDURA.pt] },
      depth: 0,
      req,
      context: ctx,
    })
    const ids = ((atualizado.specs || []) as Row[]).map((r) => r.id)
    await payload.update({
      collection: 'produtos',
      id: doc.id,
      locale: 'en',
      data: {
        specs: ids.map((id, i) =>
          i < ptRows.length
            ? { id, label: enRows[i]?.label ?? ptRows[i].label, value: enRows[i]?.value ?? ptRows[i].value }
            : { id, ...MOLDURA.en },
        ),
      },
      depth: 0,
      req,
      context: ctx,
    })
  }
  payload.logger.info(`Prints: moldura opcional na ficha técnica (${docs.length} prints)`)
}

export async function down({ payload, req }: MigrateDownArgs): Promise<void> {
  const { docs } = await payload.find({ collection: 'produtos', where: { type: { equals: 'print' } }, depth: 0, limit: 500, pagination: false, locale: 'pt', req })
  for (const doc of docs) {
    const rows = (doc.specs || []) as Row[]
    if (!rows.some((r) => r.label === MOLDURA.pt.label)) continue
    await payload.update({
      collection: 'produtos',
      id: doc.id,
      locale: 'pt',
      data: { specs: rows.filter((r) => r.label !== MOLDURA.pt.label) },
      depth: 0,
      req,
      context: ctx,
    })
  }
}
