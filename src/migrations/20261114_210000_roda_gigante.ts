/**
 * Obra nova no portfólio: Roda-Gigante ao Pôr do Sol, em giz pastel oleoso, A4, original disponível
 * (valor sob consulta), com o print na loja, como as demais obras. Em português e inglês.
 */
import { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import path from 'path'

const IMAGES = path.resolve(process.cwd(), 'seed/images/2026-11')
const SLUG = 'roda-gigante-ao-por-do-sol'

const OBRA = {
  title: { pt: 'Roda-Gigante ao Pôr do Sol', en: 'Ferris Wheel at Sunset' },
  technique: { pt: 'Giz pastel oleoso', en: 'Oil pastel' },
  dimensions: { pt: '21 × 29,7 cm (A4)', en: '21 × 29.7 cm (A4)' },
  /** o que a pintura mostra (texto alternativo e resumo do print) */
  mostra: {
    pt: 'uma roda-gigante sobre um píer ao pôr do sol, com o céu rosa e lilás refletido no mar',
    en: 'a Ferris wheel on a pier at sunset, with the pink and lilac sky reflected in the sea',
  },
  description: {
    pt: 'Uma roda-gigante e um píer em silhueta contra o pôr do sol, sob um céu em tons de rosa, lilás e amarelo, salpicado de pequenas estrelas. As cores do céu se refletem no mar e nas ondas que chegam à areia.',
    en: 'A Ferris wheel and a pier silhouetted against the sunset, under a sky in shades of pink, lilac and yellow, dotted with small stars. The colors of the sky are reflected in the sea and in the waves reaching the sand.',
  },
}

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

const ctx = { disableRevalidate: true }

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  const { totalDocs } = await payload.count({ collection: 'obras', where: { slug: { equals: SLUG } }, req })
  if (totalDocs) return // já existe: não duplica

  // ---------- imagem ----------
  const media = await payload.create({
    collection: 'media',
    locale: 'pt',
    data: { alt: `${OBRA.title.pt}: pintura em giz pastel oleoso de ${OBRA.mostra.pt}` },
    filePath: path.join(IMAGES, `${SLUG}.jpg`),
    req,
    context: ctx,
  })
  await payload.update({
    collection: 'media',
    id: media.id,
    locale: 'en',
    data: { alt: `${OBRA.title.en}: oil pastel painting of ${OBRA.mostra.en}` },
    req,
    context: ctx,
  })

  // ---------- obra (logo depois das obras novas de novembro) ----------
  const obra = await payload.create({
    collection: 'obras',
    locale: 'pt',
    data: {
      title: OBRA.title.pt,
      slug: SLUG,
      image: media.id,
      technique: OBRA.technique.pt,
      dimensions: OBRA.dimensions.pt,
      format: 'Original',
      status: 'disponivel',
      categories: ['giz-pastel', 'paisagens'],
      description: OBRA.description.pt,
      order: 6,
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
    data: { title: OBRA.title.en, technique: OBRA.technique.en, dimensions: OBRA.dimensions.en, format: 'Original', description: OBRA.description.en },
    depth: 0,
    req,
    context: ctx,
  })

  // ---------- print ----------
  const { docs: prints } = await payload.find({ collection: 'produtos', where: { type: { equals: 'print' } }, depth: 0, limit: 500, pagination: false, req })
  const print = await payload.create({
    collection: 'produtos',
    locale: 'pt',
    data: {
      type: 'print',
      name: OBRA.title.pt,
      kind: 'Print artístico',
      summary: `Print da pintura em giz pastel oleoso ${OBRA.title.pt}, impresso em papel artístico 300 g/m²: ${OBRA.mostra.pt}. Disponível nos formatos A4 e A3.`,
      cardMeta: 'A4 ou A3',
      specs: SPECS.pt,
      works: [obra.id],
      images: [{ image: media.id }],
      slug: `print-${SLUG}`,
      order: Math.max(220, ...prints.map((p) => p.order || 0)) + 10,
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
      name: OBRA.title.en,
      kind: 'Art print',
      summary: `Print of the oil pastel painting ${OBRA.title.en}, printed on 300 gsm fine art paper: ${OBRA.mostra.en}. Available in A4 and A3.`,
      cardMeta: 'A4 or A3',
      specs: (print.specs || []).map((row: any, i: number) => ({ id: row.id, ...SPECS.en[i] })),
    },
    depth: 0,
    req,
    context: ctx,
  })
  payload.logger.info(`Obra criada: ${SLUG} (obra, imagem e print)`)
}

export async function down({ payload, req }: MigrateDownArgs): Promise<void> {
  await payload.delete({ collection: 'produtos', where: { slug: { equals: `print-${SLUG}` } }, req, context: ctx })
  await payload.delete({ collection: 'obras', where: { slug: { equals: SLUG } }, req, context: ctx })
}
