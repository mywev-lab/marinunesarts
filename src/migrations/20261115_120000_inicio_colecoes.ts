/**
 * Página inicial:
 * - a seção Produtos abre com as coleções Rio e Limões em destaque (as pinturas lado a lado, em tamanho grande).
 *   A Coleção Limões (prints de Limões e Limões ao Céu Rosa) passa a existir como produto, igual à Coleção Rio;
 * - "Do ateliê" passa a mostrar as obras publicadas mais recentemente: nenhuma obra fica mais fixada;
 * - os textos das duas seções acompanham a mudança (português e inglês).
 */
import { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'

const META = new Set(['id', 'createdAt', 'updatedAt', 'globalType'])
const strip = (doc: any) => Object.fromEntries(Object.entries(doc).filter(([k]) => !META.has(k)))
const idOf = (v: any) => (typeof v === 'object' && v ? v.id : v)

const TEXTOS = {
  pt: {
    produtosLede: 'Prints e pinturas originais prontos para ganhar uma parede, e planners digitais inspirados em grandes pintores.',
    atelieLede: 'As pinturas mais recentes do ateliê.',
  },
  en: {
    produtosLede: 'Prints and original paintings ready for a wall of their own, and digital planners inspired by great painters.',
    atelieLede: 'The latest paintings from the studio.',
  },
} as const

const LIMOES = {
  slug: 'print-colecao-limoes',
  pt: {
    name: 'Coleção Limões',
    kind: 'Conjunto com 2 prints',
    cardMeta: '2 prints, A4 ou A3',
    summary:
      'Duas pinturas de limões em giz pastel oleoso, impressas em papel artístico 300 g/m²: limões maduros entre folhas verdes, contra um céu azul suave, e três limões no galho, contra um céu que passa do azul ao rosa. Disponível nos formatos A4 e A3.',
    includes: ['Print de Limões', 'Print de Limões ao Céu Rosa'],
  },
  en: {
    name: 'Lemon Collection',
    kind: 'Set of 2 prints',
    cardMeta: '2 prints, A4 or A3',
    summary:
      'Two oil pastel paintings of lemons, printed on 300 gsm fine art paper: ripe lemons among green leaves against a soft blue sky, and three lemons on the branch against a sky that shifts from blue to pink. Available in A4 and A3.',
    includes: ['Print of Lemons', 'Print of Lemons Against a Pink Sky'],
  },
}

const ctx = { disableRevalidate: true }

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  const one = async (collection: 'obras' | 'produtos' | 'media', field: string, value: string) =>
    (await payload.find({ collection, where: { [field]: { equals: value } }, depth: 0, limit: 1, req })).docs[0] as any

  const rio = await one('produtos', 'slug', 'print-colecao-rio')
  const limoes = await one('obras', 'slug', 'limoes')
  const limoesRosa = await one('obras', 'slug', 'limoes-ao-ceu-rosa')
  if (!rio || !limoes || !limoesRosa) return // banco novo, ainda sem conteúdo

  // ---------- 1. Coleção Limões (produto), ao lado da Coleção Rio ----------
  let colecaoLimoes = await one('produtos', 'slug', LIMOES.slug)
  if (!colecaoLimoes) {
    const parede = await one('media', 'filename', 'limoes-par-parede.jpg')
    const rioPt = await payload.findByID({ collection: 'produtos', id: rio.id, locale: 'pt', depth: 0, req })
    const rioEn = await payload.findByID({ collection: 'produtos', id: rio.id, locale: 'en', depth: 0, req })
    colecaoLimoes = await payload.create({
      collection: 'produtos',
      locale: 'pt',
      data: {
        type: 'print',
        name: LIMOES.pt.name,
        kind: LIMOES.pt.kind,
        cardMeta: LIMOES.pt.cardMeta,
        summary: LIMOES.pt.summary,
        specs: (rioPt.specs || []).map(({ label, value }: any) => ({ label, value })),
        includes: LIMOES.pt.includes.map((text) => ({ text })),
        works: [limoes.id, limoesRosa.id],
        // foto das duas emolduradas na parede, depois cada pintura
        images: [parede?.id, idOf(limoes.image), idOf(limoesRosa.image)].filter(Boolean).map((image: number) => ({ image })),
        slug: LIMOES.slug,
        order: (rio.order || 200) + 5,
      },
      depth: 0,
      req,
      context: ctx,
    })
    await payload.update({
      collection: 'produtos',
      id: colecaoLimoes.id,
      locale: 'en',
      data: {
        name: LIMOES.en.name,
        kind: LIMOES.en.kind,
        cardMeta: LIMOES.en.cardMeta,
        summary: LIMOES.en.summary,
        specs: (colecaoLimoes.specs || []).map((row: any, i: number) => ({
          id: row.id,
          label: rioEn.specs?.[i]?.label,
          value: rioEn.specs?.[i]?.value,
        })),
        includes: (colecaoLimoes.includes || []).map((row: any, i: number) => ({ id: row.id, text: LIMOES.en.includes[i] })),
      },
      depth: 0,
      req,
      context: ctx,
    })
    payload.logger.info('Coleção Limões criada')
  }

  // ---------- 2. Página inicial: coleções em destaque e textos ----------
  for (const locale of ['pt', 'en'] as const) {
    const atual: any = await payload.findGlobal({ slug: 'inicio', locale, fallbackLocale: false, depth: 0, req })
    if (!atual?.updatedAt) continue
    await payload.updateGlobal({
      slug: 'inicio',
      locale,
      data: {
        ...strip(atual),
        produtos: { ...(atual.produtos || {}), collections: [rio.id, colecaoLimoes.id], lede: TEXTOS[locale].produtosLede },
        atelie: { ...(atual.atelie || {}), lede: TEXTOS[locale].atelieLede },
      },
      depth: 0,
      req,
      context: ctx,
    })
  }

  // ---------- 3. "Do ateliê" passa a mostrar as mais recentes: nenhuma obra fixada ----------
  await payload.update({ collection: 'obras', where: { showOnHome: { equals: true } }, data: { showOnHome: false }, depth: 0, req, context: ctx })
  payload.logger.info('Página inicial: coleções em destaque e "Do ateliê" com as obras mais recentes')
}

export async function down({ payload, req }: MigrateDownArgs): Promise<void> {
  // Volta a fixar as seis obras que estavam em "Do ateliê" e tira as coleções do destaque
  const antigas = ['dia-de-chuva', 'olhar-felino', 'rio-de-janeiro', 'caminho-ao-entardecer', 'limoes', 'tarde-no-chale']
  await payload.update({ collection: 'obras', where: { slug: { in: antigas } }, data: { showOnHome: true }, depth: 0, req, context: ctx })
  const atual: any = await payload.findGlobal({ slug: 'inicio', locale: 'pt', fallbackLocale: false, depth: 0, req })
  if (atual?.updatedAt) {
    await payload.updateGlobal({
      slug: 'inicio',
      locale: 'pt',
      data: { ...strip(atual), produtos: { ...(atual.produtos || {}), collections: [] } },
      depth: 0,
      req,
      context: ctx,
    })
  }
  await payload.delete({ collection: 'produtos', where: { slug: { equals: LIMOES.slug } }, req, context: ctx })
}
