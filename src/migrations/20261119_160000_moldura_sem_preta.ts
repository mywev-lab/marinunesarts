/**
 * Prints: a Mariane não trabalha com moldura preta. A linha "Moldura (opcional)" da ficha técnica
 * passa a dizer só branca ou madeira, com vidro ou acetato (português e inglês).
 */
import { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'

const DE = {
  pt: 'Branca, preta ou madeira, com vidro ou acetato',
  en: 'White, black or wood, with glass or acetate',
}
const PARA = {
  pt: 'Branca ou madeira, com vidro ou acetato',
  en: 'White or wood, with glass or acetate',
}

const ctx = { disableRevalidate: true }
type Row = { id?: string | null; label: string; value: string }

async function trocar(payload: MigrateUpArgs['payload'], req: MigrateUpArgs['req'], de: typeof DE, para: typeof PARA) {
  const { docs } = await payload.find({ collection: 'produtos', where: { type: { equals: 'print' } }, depth: 0, limit: 500, pagination: false, locale: 'pt', req })
  let n = 0
  for (const doc of docs) {
    for (const locale of ['pt', 'en'] as const) {
      const atual = await payload.findByID({ collection: 'produtos', id: doc.id, locale, fallbackLocale: false, depth: 0, req })
      const rows = (atual.specs || []) as Row[]
      if (!rows.some((r) => r.value === de[locale])) continue
      await payload.update({
        collection: 'produtos',
        id: doc.id,
        locale,
        data: { specs: rows.map(({ id, label, value }) => ({ id, label, value: value === de[locale] ? para[locale] : value })) },
        depth: 0,
        req,
        context: ctx,
      })
      n++
    }
  }
  return n
}

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  const n = await trocar(payload, req, DE, PARA)
  payload.logger.info(`Prints: moldura sem a opção preta (${n} fichas atualizadas)`)
}

export async function down({ payload, req }: MigrateDownArgs): Promise<void> {
  await trocar(payload, req, PARA, DE)
}
