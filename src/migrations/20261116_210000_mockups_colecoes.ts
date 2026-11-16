/**
 * Página inicial: os cartões da Coleção Rio e da Coleção Limões passam a mostrar os mockups
 * (as duas pinturas emolduradas na parede) no lugar das pinturas soltas.
 * O enquadramento usa o ponto de foco da imagem; na foto dos limões ele sobe um pouco para não cortar as molduras.
 */
import { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'

const MOCKUPS = [
  { produto: 'print-colecao-rio', arquivo: 'colecao-rio-parede.jpg', foco: { focalX: 54, focalY: 50 } },
  { produto: 'print-colecao-limoes', arquivo: 'limoes-par-parede.jpg', foco: { focalX: 50, focalY: 38 } },
]

const ctx = { disableRevalidate: true }

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  for (const m of MOCKUPS) {
    const produto = (await payload.find({ collection: 'produtos', where: { slug: { equals: m.produto } }, depth: 0, limit: 1, req })).docs[0]
    const media = (await payload.find({ collection: 'media', where: { filename: { equals: m.arquivo } }, depth: 0, limit: 1, req })).docs[0]
    if (!produto || !media) continue // banco novo, ainda sem conteúdo
    await payload.update({ collection: 'media', id: media.id, data: m.foco, depth: 0, req, context: ctx })
    await payload.update({ collection: 'produtos', id: produto.id, data: { mockup: media.id }, depth: 0, req, context: ctx })
    payload.logger.info(`Mockup na página inicial: ${m.produto}`)
  }
}

export async function down({ payload, req }: MigrateDownArgs): Promise<void> {
  await payload.update({
    collection: 'produtos',
    where: { slug: { in: MOCKUPS.map((m) => m.produto) } },
    data: { mockup: null },
    depth: 0,
    req,
    context: ctx,
  })
}
