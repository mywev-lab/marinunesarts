/**
 * Todas as obras do portfólio ganham um print na loja (seção "Prints artísticos"), com página própria,
 * nos formatos A4 e A3 e valor sob consulta. Os originais continuam sob consulta, como antes.
 *
 * Cada print usa as imagens da própria obra (a pintura e as fotos "na parede") e o nome da obra nos
 * dois idiomas. Obras que já têm um print só delas (Caminho ao Entardecer e Tarde no Chalé) ficam como
 * estão; Rio de Janeiro e Coqueiros do Rio ganham o print individual além do conjunto Coleção Rio.
 */
import { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'

type Tecnica = 'giz' | 'aquarela' | 'mista'

/** Obra → técnica e descrição curta da pintura (a mesma do texto alternativo da imagem), em português e inglês */
const PRINTS: [slug: string, tecnica: Tecnica, pt: string, en: string][] = [
  ['gaivotas-ao-por-do-sol', 'giz', 'gaivotas voando sobre o mar ao entardecer, com ondas chegando à areia', 'seagulls flying over the sea at dusk, with waves reaching the sand'],
  ['montanha-em-brasa', 'giz', 'uma montanha magenta ao pôr do sol, acima de encostas azuis e pinheiros', 'a magenta mountain at sunset, above blue slopes and pine trees'],
  ['rosa-mediterraneo', 'aquarela', 'duas casas cor-de-rosa diante do mar azul, sob o céu do entardecer', 'two pink houses in front of the blue sea, under the evening sky'],
  ['limoes-ao-ceu-rosa', 'giz', 'três limões entre folhas verdes, contra um céu azul e rosa', 'three lemons among green leaves, against a blue and pink sky'],
  ['coqueiros-do-rio', 'aquarela', 'coqueiros altos à beira de uma enseada, com o Pão de Açúcar ao fundo', 'tall coconut palms beside a cove, with Sugarloaf Mountain in the background'],
  ['refugio-violeta', 'aquarela', 'uma casa de campo diante de uma grande montanha violeta ao entardecer, com campo verde e flores silvestres', 'a country house in front of a large violet mountain at dusk, with a green field and wildflowers'],
  ['veneza-ao-entardecer', 'giz', 'uma gôndola atracada em Veneza sob um céu intenso em tons de laranja e azul', 'a gondola moored in Venice under an intense orange and blue sky'],
  ['entre-flores-douradas', 'mista', 'uma figura de vestido rosa, de costas, em um campo de flores amarelas', 'a figure in a pink dress, seen from behind, in a field of yellow flowers'],
  ['dia-de-chuva', 'giz', 'uma figura de capa amarela com guarda-chuva preto, sentada num pequeno barco em mar cinzento, com uma gaivota no céu', 'a figure in a yellow raincoat with a black umbrella, sitting in a small boat on a gray sea, with a seagull in the sky'],
  ['olhar-felino', 'giz', 'um felino de pelagem pintada espiando entre folhas verdes altas', 'a spotted cat peeking out between tall green leaves'],
  ['rio-de-janeiro', 'aquarela', 'o Pão de Açúcar visto da praia, com mar azul e guarda-sóis coloridos na areia', 'Sugarloaf Mountain seen from the beach, with blue sea and colorful umbrellas on the sand'],
  ['limoes', 'giz', 'dois limões maduros entre folhas verdes, contra um céu azul suave', 'two ripe lemons among green leaves, against a soft blue sky'],
  ['gatinho-no-galho', 'giz', 'um gatinho rajado deitado num galho de árvore, com fundo verde', 'a tabby kitten lying on a tree branch, with a green background'],
  ['entre-o-vermelho-e-o-azul', 'giz', 'campos vermelho e dourado, uma árvore e uma pequena casa sob céu azul com nuvens', 'red and golden fields, a tree and a small house under a blue sky with clouds'],
  ['solidao', 'aquarela', 'uma pessoa sentada em uma colina observando o mar e uma pequena ilha, em tons de cinza e oliva', 'a person sitting on a hill looking out at the sea and a small island, in shades of gray and olive'],
]

const DE: Record<Tecnica, { pt: (t: string) => string; en: (t: string) => string }> = {
  giz: { pt: (t) => `Print da pintura em giz pastel oleoso ${t}`, en: (t) => `Print of the oil pastel painting ${t}` },
  aquarela: { pt: (t) => `Print da aquarela ${t}`, en: (t) => `Print of the watercolor ${t}` },
  mista: { pt: (t) => `Print da pintura em técnica mista ${t}`, en: (t) => `Print of the mixed media painting ${t}` },
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
const id = (v: any) => (v && typeof v === 'object' ? v.id : v)

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  const { docs: existentes } = await payload.find({ collection: 'produtos', where: { type: { equals: 'print' } }, depth: 0, limit: 500, pagination: false, req })
  let order = Math.max(220, ...existentes.map((p) => p.order || 0))

  for (const [slug, tecnica, pt, en] of PRINTS) {
    const printSlug = `print-${slug}`
    const { docs } = await payload.find({ collection: 'obras', where: { slug: { equals: slug } }, locale: 'pt', depth: 0, limit: 1, req })
    const obra = docs[0]
    if (!obra) continue
    // já tem um print só desta obra (ou um com o mesmo endereço): não duplica
    const jaTem = existentes.some((p) => p.slug === printSlug || ((p.works || []).length === 1 && id(p.works![0]) === obra.id))
    if (jaTem) continue

    const tituloEn = ((await payload.findByID({ collection: 'obras', id: obra.id, locale: 'en', depth: 0, req })) as any).title || obra.title
    const images = [obra.image, ...(obra.mockups || []).map((m: any) => m.image)].filter(Boolean).map((image) => ({ image: id(image) }))

    order += 10
    const doc = await payload.create({
      collection: 'produtos',
      locale: 'pt',
      data: {
        type: 'print',
        name: obra.title,
        kind: 'Print artístico',
        summary: `${DE[tecnica].pt(obra.title)}, impresso em papel artístico 300 g/m²: ${pt}. Disponível nos formatos A4 e A3.`,
        cardMeta: 'A4 ou A3',
        specs: SPECS.pt,
        works: [obra.id],
        images,
        slug: printSlug,
        order,
      },
      depth: 0,
      req,
      context: ctx,
    })

    // versão em inglês (mesmas linhas da ficha técnica, com o texto traduzido)
    await payload.update({
      collection: 'produtos',
      id: doc.id,
      locale: 'en',
      data: {
        name: tituloEn,
        kind: 'Art print',
        summary: `${DE[tecnica].en(tituloEn)}, printed on 300 gsm fine art paper: ${en}. Available in A4 and A3.`,
        cardMeta: 'A4 or A3',
        specs: (doc.specs || []).map((row: any, i: number) => ({ id: row.id, ...SPECS.en[i] })),
      },
      depth: 0,
      req,
      context: ctx,
    })
    payload.logger.info(`Print criado: ${printSlug}`)
  }
}

export async function down({ payload, req }: MigrateDownArgs): Promise<void> {
  // remove só os prints criados aqui (pelo endereço)
  await payload.delete({
    collection: 'produtos',
    where: { slug: { in: PRINTS.map(([slug]) => `print-${slug}`) } },
    req,
    context: ctx,
  })
}
