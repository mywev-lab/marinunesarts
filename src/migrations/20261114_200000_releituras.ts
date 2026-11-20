/**
 * Três releituras da Mariane entram no portfólio (filtro "Releituras"), cada uma com o seu print na loja:
 * Noite Estrelada e Girassóis (Van Gogh) e O Beijo (Klimt). Todas em A3; original disponível, valor sob consulta.
 * Técnicas informadas pela Mariane: Noite Estrelada e O Beijo em tinta acrílica, Girassóis em giz pastel oleoso.
 */
import { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import path from 'path'

const IMAGES = path.resolve(process.cwd(), 'seed/images/2026-11')

type Texto = { pt: string; en: string }
type Releitura = {
  slug: string
  arquivo: string
  title: Texto
  technique: Texto
  /** o que a pintura mostra (usado no texto alternativo e no resumo do print) */
  mostra: Texto
  description: Texto
  categories: ('releituras' | 'paisagens' | 'giz-pastel')[]
  order: number
}

const ACRILICA: Texto = { pt: 'Tinta acrílica', en: 'Acrylic' }
const GIZ: Texto = { pt: 'Giz pastel oleoso', en: 'Oil pastel' }

const RELEITURAS: Releitura[] = [
  {
    slug: 'noite-estrelada-releitura-van-gogh',
    arquivo: 'releitura-noite-estrelada-van-gogh.jpg',
    title: { pt: 'Noite Estrelada (releitura de Van Gogh)', en: 'The Starry Night (after Van Gogh)' },
    technique: ACRILICA,
    mostra: {
      pt: 'um céu em espirais com estrelas douradas sobre uma vila à beira de um lago, com um cipreste alto e um campo de flores amarelas',
      en: 'a swirling sky with golden stars over a lakeside village, with a tall cypress and a field of yellow flowers',
    },
    description: {
      pt: 'Releitura de A Noite Estrelada (1889), de Vincent van Gogh. Nesta versão, o céu em espirais, com estrelas amarelas e douradas, se estende sobre uma vila à beira de um lago, com montanhas ao fundo; em primeiro plano, um cipreste alto e um campo de flores amarelas.',
      en: 'A reinterpretation of The Starry Night (1889) by Vincent van Gogh. In this version, the swirling sky, with yellow and golden stars, stretches over a lakeside village with mountains in the distance; in the foreground, a tall cypress and a field of yellow flowers.',
    },
    categories: ['releituras', 'paisagens'],
    order: 140,
  },
  {
    slug: 'girassois-releitura-van-gogh',
    arquivo: 'releitura-girassois-van-gogh.jpg',
    title: { pt: 'Girassóis (releitura de Van Gogh)', en: 'Sunflowers (after Van Gogh)' },
    technique: GIZ,
    mostra: {
      pt: 'um vaso amarelo com girassóis sobre uma mesa laranja, contra um fundo azul-claro',
      en: 'a yellow vase of sunflowers on an orange table, against a light blue background',
    },
    description: {
      pt: 'Releitura de Girassóis (1888), de Vincent van Gogh: um vaso amarelo com girassóis sobre uma mesa laranja, contra um fundo azul-claro.',
      en: 'A reinterpretation of Sunflowers (1888) by Vincent van Gogh: a yellow vase of sunflowers on an orange table, against a light blue background.',
    },
    categories: ['releituras', 'giz-pastel'],
    order: 150,
  },
  {
    slug: 'o-beijo-releitura-klimt',
    arquivo: 'releitura-o-beijo-klimt.jpg',
    title: { pt: 'O Beijo (releitura de Klimt)', en: 'The Kiss (after Klimt)' },
    technique: ACRILICA,
    mostra: {
      pt: 'um casal abraçado, envolto em mantos dourados cheios de padrões, sobre um campo de flores e contra um fundo ocre',
      en: 'an embracing couple wrapped in golden, richly patterned robes, above a field of flowers and against an ochre background',
    },
    description: {
      pt: 'Releitura de O Beijo (1907–1908), de Gustav Klimt: o casal abraçado, envolto em mantos dourados cheios de padrões, sobre um campo de flores e contra um fundo ocre.',
      en: 'A reinterpretation of The Kiss (1907–1908) by Gustav Klimt: the embracing couple wrapped in golden, richly patterned robes, above a field of flowers and against an ochre background.',
    },
    categories: ['releituras'],
    order: 160,
  },
]

const DIMENSOES: Texto = { pt: '29,7 × 42 cm (A3)', en: '29.7 × 42 cm (A3)' }

const SPECS = {
  pt: [
    { label: 'Formatos', value: 'A4 (21 × 29,7 cm) ou A3 (29,7 × 42 cm)' },
    { label: 'Papel', value: 'Papel artístico 300 g/m²' },
    { label: 'Impressão', value: 'Alta qualidade' },
  ],
  en: [
    { label: 'Sizes', value: 'A4 (21 × 29.7 cm) or A3 (29.7 × 42 cm)' },
    { label: 'Paper', value: '300 gsm fine art paper' },
    { label: 'Printing', value: 'High quality' },
  ],
}

/** "Print da pintura em tinta acrílica Noite Estrelada (...)" */
const printDe = (r: Releitura) =>
  r.technique === GIZ
    ? { pt: `Print da pintura em giz pastel oleoso ${r.title.pt}`, en: `Print of the oil pastel painting ${r.title.en}` }
    : { pt: `Print da pintura em tinta acrílica ${r.title.pt}`, en: `Print of the acrylic painting ${r.title.en}` }

const ctx = { disableRevalidate: true }

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  const { docs: prints } = await payload.find({ collection: 'produtos', where: { type: { equals: 'print' } }, depth: 0, limit: 500, pagination: false, req })
  let printOrder = Math.max(220, ...prints.map((p) => p.order || 0))

  for (const r of RELEITURAS) {
    const { totalDocs } = await payload.count({ collection: 'obras', where: { slug: { equals: r.slug } }, req })
    if (totalDocs) continue // já existe: não duplica

    // ---------- imagem ----------
    const tecnicaMin = { pt: r.technique.pt.toLowerCase(), en: r.technique.en.toLowerCase() }
    const media = await payload.create({
      collection: 'media',
      locale: 'pt',
      data: { alt: `${r.title.pt}: pintura em ${tecnicaMin.pt} de ${r.mostra.pt}` },
      filePath: path.join(IMAGES, r.arquivo),
      req,
      context: ctx,
    })
    await payload.update({
      collection: 'media',
      id: media.id,
      locale: 'en',
      data: { alt: `${r.title.en}: ${tecnicaMin.en} painting of ${r.mostra.en}` },
      req,
      context: ctx,
    })
    // O plugin de armazenamento guarda o primeiro arquivo enviado em req.context e o reenviaria nas próximas
    // imagens (ver 20261120_120000_releituras_imagens): limpa aqui para cada releitura usar o próprio arquivo.
    if (req.context) delete (req.context as Record<string, unknown>)._payloadCloudStorage

    // ---------- obra ----------
    const obra = await payload.create({
      collection: 'obras',
      locale: 'pt',
      data: {
        title: r.title.pt,
        slug: r.slug,
        image: media.id,
        technique: r.technique.pt,
        dimensions: DIMENSOES.pt,
        format: 'Original',
        status: 'disponivel',
        categories: r.categories,
        description: r.description.pt,
        order: r.order,
        forSale: true,
        showOnHome: false,
      },
      depth: 0,
      req,
      context: ctx,
    })
    await payload.update({
      collection: 'obras',
      id: obra.id,
      locale: 'en',
      data: { title: r.title.en, technique: r.technique.en, dimensions: DIMENSOES.en, format: 'Original', description: r.description.en },
      depth: 0,
      req,
      context: ctx,
    })

    // ---------- print ----------
    printOrder += 10
    const de = printDe(r)
    const print = await payload.create({
      collection: 'produtos',
      locale: 'pt',
      data: {
        type: 'print',
        name: r.title.pt,
        kind: 'Print artístico',
        summary: `${de.pt}, impresso em papel artístico 300 g/m²: ${r.mostra.pt}. Disponível nos formatos A4 e A3.`,
        cardMeta: 'A4 ou A3',
        specs: SPECS.pt,
        works: [obra.id],
        images: [{ image: media.id }],
        slug: `print-${r.slug}`,
        order: printOrder,
      },
      depth: 0,
      req,
      context: ctx,
    })
    await payload.update({
      collection: 'produtos',
      id: print.id,
      locale: 'en',
      data: {
        name: r.title.en,
        kind: 'Art print',
        summary: `${de.en}, printed on 300 gsm fine art paper: ${r.mostra.en}. Available in A4 and A3.`,
        cardMeta: 'A4 or A3',
        specs: (print.specs || []).map((row: any, i: number) => ({ id: row.id, ...SPECS.en[i] })),
      },
      depth: 0,
      req,
      context: ctx,
    })
    payload.logger.info(`Releitura criada: ${r.slug} (obra, imagem e print)`)
  }
}

export async function down({ payload, req }: MigrateDownArgs): Promise<void> {
  const slugs = RELEITURAS.map((r) => r.slug)
  await payload.delete({ collection: 'produtos', where: { slug: { in: slugs.map((s) => `print-${s}`) } }, req, context: ctx })
  await payload.delete({ collection: 'obras', where: { slug: { in: slugs } }, req, context: ctx })
}
