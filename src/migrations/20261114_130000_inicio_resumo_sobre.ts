/**
 * Página inicial: o resumo "Sobre" passa a acompanhar o novo texto da página Sobre
 * (frases tiradas do próprio texto da Mariane), em português e em inglês.
 */
import { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'

const TEXTO = {
  pt: 'Durante muito tempo, acreditei que a arte não era um caminho possível para mim. Foi em um dos momentos mais delicados da minha vida, às vésperas de completar 30 anos, que encontrei nela um lugar de acolhimento: primeiro no giz pastel oleoso, depois na aquarela.\n\nHoje pinto casas, jardins, paisagens naturais e pessoas em momentos de contemplação, inspirada pela luz e pelas cores de Monet, Degas e Van Gogh. Não pinto apenas o que vejo: pinto o que sinto.',
  en: 'For a long time, I believed art was not a possible path for me. It was during one of the most delicate moments of my life, on the eve of turning 30, that I found in it a place of comfort: first in oil pastel, then in watercolor.\n\nToday I paint houses, gardens, natural landscapes and people in moments of contemplation, inspired by the light and colors of Monet, Degas and Van Gogh. I do not paint only what I see: I paint what I feel.',
} as const

const META = new Set(['id', 'createdAt', 'updatedAt', 'globalType'])
const strip = (doc: any) => Object.fromEntries(Object.entries(doc).filter(([k]) => !META.has(k)))

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  for (const locale of ['pt', 'en'] as const) {
    const atual: any = await payload.findGlobal({ slug: 'inicio', locale, fallbackLocale: false, depth: 0, req })
    if (!atual?.updatedAt) continue // banco novo, ainda sem conteúdo
    await payload.updateGlobal({
      slug: 'inicio',
      locale,
      data: { ...strip(atual), sobre: { ...(atual.sobre || {}), text: TEXTO[locale] } },
      depth: 0,
      req,
      context: { disableRevalidate: true },
    })
    payload.logger.info(`Página inicial: resumo Sobre atualizado (${locale})`)
  }
}

export async function down(_: MigrateDownArgs): Promise<void> {
  // o resumo anterior fica no histórico do Git; nada a desfazer aqui
}
