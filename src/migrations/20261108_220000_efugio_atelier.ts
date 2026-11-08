/**
 * Conteúdo de novembro de 2026: o site passa a se chamar Efúgio Atelier, entram cinco obras novas,
 * fotos novas de obras que já estavam no site e a seção de prints na loja.
 * Roda uma única vez (como as outras migrações) quando a Vercel publica o site.
 */
import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'
import path from 'path'

const IMAGES = path.resolve(process.cwd(), 'seed/images/2026-11')
const OLD = 'Mari Nunes Arts'
const NEW = 'Efúgio Atelier'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // ---------- 1. Nome do site em todos os textos ----------
  // "da Mari Nunes Arts" → "do Efúgio Atelier"; depois, as demais ocorrências
  const swap = (column: string) => `replace(replace(${column}, 'da ${OLD}', 'do ${NEW}'), '${OLD}', '${NEW}')`
  const swapJson = (column: string) => `${swap(`${column}::text`)}::jsonb`
  const statements = [
    `update configuracoes set site_name = '${NEW}', site_url = 'https://marinunesarts.vercel.app'`,
    ...['inicio', 'sobre', 'pagina_portfolio', 'pagina_produtos', 'pagina_blog', 'contato'].map(
      (t) => `update ${t} set seo_title = ${swap('seo_title')} where seo_title like '%${OLD}%'`,
    ),
    `update media set alt = ${swap('alt')} where alt like '%${OLD}%'`,
    `update posts set content = ${swapJson('content')}, cta_title = ${swap('cta_title')}`,
    `update _posts_v set version_content = ${swapJson('version_content')}, version_cta_title = ${swap('version_cta_title')}`,
    `update privacidade set body = ${swapJson('body')}`,
  ]
  for (const statement of statements) await db.execute(sql.raw(statement))

  const ctx = { disableRevalidate: true }

  // ---------- 2. Imagens ----------
  const media = async (file: string, alt: string) =>
    (await payload.create({ collection: 'media', data: { alt }, filePath: path.join(IMAGES, file), req, context: ctx })).id

  const img = {
    gaivotas: await media('gaivotas-ao-por-do-sol.jpg', 'Gaivotas ao Pôr do Sol: giz pastel oleoso de gaivotas voando sobre o mar ao entardecer, com ondas chegando à areia'),
    montanha: await media('montanha-em-brasa.jpg', 'Montanha em Brasa: giz pastel oleoso de uma montanha magenta ao pôr do sol, acima de encostas azuis e pinheiros'),
    montanhaParede: await media('montanha-em-brasa-parede.jpg', 'Montanha em Brasa emoldurada sobre uma estante, ao lado de um vaso de flores secas'),
    rosa: await media('rosa-mediterraneo.jpg', 'Rosa Mediterrâneo: aquarela de duas casas cor-de-rosa diante do mar azul, sob o céu do entardecer'),
    rosaParede: await media('rosa-mediterraneo-parede.jpg', 'Rosa Mediterrâneo emoldurada sobre um móvel verde, numa sala de parede rosa'),
    limoesRosa: await media('limoes-ao-ceu-rosa.jpg', 'Limões ao Céu Rosa: giz pastel oleoso de três limões entre folhas verdes, contra um céu azul e rosa'),
    coqueiros: await media('coqueiros-do-rio.jpg', 'Coqueiros do Rio: aquarela de coqueiros altos à beira de uma enseada, com o Pão de Açúcar ao fundo'),
    limoesPar: await media('limoes-par-parede.jpg', 'Limões e Limões ao Céu Rosa emolduradas lado a lado, acima de um aparador com uma tigela de limões'),
    rioPar: await media('colecao-rio-parede.jpg', 'Rio de Janeiro em Aquarela e Coqueiros do Rio emolduradas lado a lado na parede de uma sala'),
    rioPrints: await media('colecao-rio-prints-a3.jpg', 'Coleção Rio: conjunto com 2 prints das aquarelas Rio de Janeiro em Aquarela e Coqueiros do Rio'),
    caminhoParede: await media('caminho-ao-entardecer-parede.jpg', 'Caminho ao Entardecer emoldurada sobre um aparador, ao lado de um vaso com planta'),
    caminhoPrint: await media('caminho-ao-entardecer-print-a4.jpg', 'Print artístico de Caminho ao Entardecer emoldurado, com as informações do print'),
    tardeParede: await media('tarde-no-chale-parede.jpg', 'Tarde no Chalé emoldurada sobre um aparador, ao lado de um vaso com margaridas'),
    tardePrint: await media('tarde-no-chale-print-a3.jpg', 'Print artístico de Tarde no Chalé emoldurado, com as informações do print'),
  }

  // ---------- 3. Obras novas ----------
  type Cat = 'aquarela' | 'giz-pastel' | 'paisagens' | 'natureza' | 'abstrata' | 'colecoes'
  const obra = async (data: {
    title: string
    slug: string
    image: number
    technique: string
    categories: Cat[]
    description: string
    order: number
    mockups?: number[]
  }) =>
    (
      await payload.create({
        collection: 'obras',
        data: {
          ...data,
          year: '2026',
          dimensions: '21 × 29,7 cm (A4)',
          format: 'Original',
          status: 'disponivel',
          forSale: true,
          showOnHome: false,
          mockups: (data.mockups || []).map((image) => ({ image })),
        },
        req,
        context: ctx,
      })
    ).id

  await obra({
    title: 'Gaivotas ao Pôr do Sol',
    slug: 'gaivotas-ao-por-do-sol',
    image: img.gaivotas,
    technique: 'Giz pastel oleoso sobre papel',
    categories: ['giz-pastel', 'paisagens', 'natureza'],
    description: 'Gaivotas cruzam o céu alaranjado do fim de tarde, enquanto as ondas chegam em camadas de espuma até a areia dourada.',
    order: 1,
  })
  await obra({
    title: 'Montanha em Brasa',
    slug: 'montanha-em-brasa',
    image: img.montanha,
    technique: 'Giz pastel oleoso sobre papel',
    categories: ['giz-pastel', 'paisagens'],
    description: 'O último sol acende o cume da montanha em magenta, acima das encostas azuis e dos pinheiros já na sombra.',
    order: 2,
    mockups: [img.montanhaParede],
  })
  await obra({
    title: 'Rosa Mediterrâneo',
    slug: 'rosa-mediterraneo',
    image: img.rosa,
    technique: 'Aquarela sobre papel',
    categories: ['aquarela', 'paisagens'],
    description: 'Duas casas cor-de-rosa emolduram um pedaço de mar azul sob o céu do entardecer, com três ciprestes no alto do muro.',
    order: 3,
    mockups: [img.rosaParede],
  })
  await obra({
    title: 'Limões ao Céu Rosa',
    slug: 'limoes-ao-ceu-rosa',
    image: img.limoesRosa,
    technique: 'Giz pastel oleoso sobre papel',
    categories: ['giz-pastel', 'natureza'],
    description: 'Três limões pendem do galho entre folhas verdes, contra um céu que passa do azul ao rosa. Faz par com Limões.',
    order: 4,
    mockups: [img.limoesPar],
  })
  const coqueiros = await obra({
    title: 'Coqueiros do Rio',
    slug: 'coqueiros-do-rio',
    image: img.coqueiros,
    technique: 'Aquarela sobre papel',
    categories: ['aquarela', 'paisagens'],
    description: 'Coqueiros altos à beira de uma enseada, com o Pão de Açúcar ao fundo e o mar azul do Rio de Janeiro. Faz par com Rio de Janeiro em Aquarela.',
    order: 5,
    mockups: [img.rioPar],
  })

  // ---------- 4. Fotos novas das obras que já estavam no site ----------
  const bySlug = async (slug: string) =>
    (await payload.find({ collection: 'obras', where: { slug: { equals: slug } }, limit: 1, depth: 0, req })).docs[0]
  const addMockup = async (slug: string, image: number) => {
    const w = await bySlug(slug)
    if (!w) return null
    const current = (w.mockups || []).map((m) => ({ image: typeof m.image === 'object' ? m.image.id : m.image }))
    if (current.length >= 2) return w.id
    await payload.update({ collection: 'obras', id: w.id, data: { mockups: [...current, { image }] }, req, context: ctx })
    return w.id
  }
  await addMockup('limoes', img.limoesPar)
  const rio = await addMockup('rio-de-janeiro', img.rioPar)
  const caminho = await addMockup('caminho-ao-entardecer', img.caminhoParede)
  const tarde = await addMockup('tarde-no-chale', img.tardeParede)

  // ---------- 5. Prints na loja ----------
  const formats = [
    { label: 'Formatos', value: 'A4 (21 × 29,7 cm) ou A3 (29,7 × 42 cm)' },
    { label: 'Papel', value: 'Papel artístico 300 g/m²' },
    { label: 'Impressão', value: 'Alta qualidade' },
  ]
  const print = (data: { name: string; slug: string; kind: string; cardMeta: string; summary: string; images: number[]; works: (number | null)[]; order: number; includes?: string[] }) =>
    payload.create({
      collection: 'produtos',
      data: {
        type: 'print',
        name: data.name,
        slug: data.slug,
        kind: data.kind,
        cardMeta: data.cardMeta,
        summary: data.summary,
        images: data.images.map((image) => ({ image })),
        works: data.works.filter((id): id is number => typeof id === 'number'),
        specs: formats,
        includes: (data.includes || []).map((text) => ({ text })),
        order: data.order,
      },
      req,
      context: ctx,
    })

  await print({
    name: 'Coleção Rio',
    slug: 'print-colecao-rio',
    kind: 'Conjunto com 2 prints',
    cardMeta: '2 prints, A4 ou A3',
    summary:
      'Duas paisagens do Rio de Janeiro em aquarela, impressas em papel artístico 300 g/m²: o Pão de Açúcar visto da areia, com guarda-sóis coloridos, e os coqueiros à beira da enseada. Disponível nos formatos A4 e A3.',
    images: [img.rioPrints, img.rioPar],
    works: [rio, coqueiros],
    order: 200,
    includes: ['Print de Rio de Janeiro em Aquarela', 'Print de Coqueiros do Rio'],
  })
  await print({
    name: 'Caminho ao Entardecer',
    slug: 'print-caminho-ao-entardecer',
    kind: 'Print artístico',
    cardMeta: 'A4 ou A3',
    summary:
      'Print da pintura em giz pastel oleoso Caminho ao Entardecer, impresso em papel artístico 300 g/m²: um caminho de terra entre campos verdes, com montanhas azuis e céu alaranjado. Disponível nos formatos A4 e A3.',
    images: [img.caminhoPrint, img.caminhoParede],
    works: [caminho],
    order: 210,
  })
  await print({
    name: 'Tarde no Chalé',
    slug: 'print-tarde-no-chale',
    kind: 'Print artístico',
    cardMeta: 'A4 ou A3',
    summary:
      'Print da pintura em giz pastel oleoso Tarde no Chalé, impresso em papel artístico 300 g/m²: uma moça de vestido amarelo e chapéu de palha diante de um chalé de telhado vermelho. Disponível nos formatos A4 e A3.',
    images: [img.tardePrint, img.tardeParede],
    works: [tarde],
    order: 220,
  })

  // ---------- 6. Textos da loja e assunto "Comprar um print" no contato ----------
  await db.execute(sql`
    update pagina_produtos set
      prints_title = 'Prints artísticos',
      prints_lede = 'Todas as obras do portfólio estão disponíveis em print, nos formatos A4 (21 × 29,7 cm) e A3 (29,7 × 42 cm), em papel artístico 300 g/m². O valor é combinado diretamente comigo.',
      print_note = 'Esta obra também está disponível em print A4 ou A3, em papel artístico 300 g/m². Valor sob consulta.',
      works_title = case when works_title = 'Obras originais e impressões' then 'Obras originais' else works_title end;
    update contato_subjects set _order = _order + 1 where _order >= 2;
    insert into contato_subjects (_order, _parent_id, id, text)
      select 2, c.id, md5(random()::text), 'Comprar um print' from contato c
      where not exists (select 1 from contato_subjects where text = 'Comprar um print');
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Volta o nome do site; obras, imagens e prints novos ficam (podem ser apagados pelo painel)
  const back = (column: string) => `replace(replace(${column}, 'do ${NEW}', 'da ${OLD}'), '${NEW}', '${OLD}')`
  await db.execute(sql.raw(`update configuracoes set site_name = '${OLD}'`))
  for (const t of ['inicio', 'sobre', 'pagina_portfolio', 'pagina_produtos', 'pagina_blog', 'contato'])
    await db.execute(sql.raw(`update ${t} set seo_title = ${back('seo_title')}`))
  await db.execute(sql.raw(`update posts set content = ${back('content::text')}::jsonb, cta_title = ${back('cta_title')}`))
  await db.execute(sql.raw(`update privacidade set body = ${back('body::text')}::jsonb`))
}
