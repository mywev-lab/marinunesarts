/**
 * Importação inicial: leva o conteúdo do site antigo (seed/legacy e seed/images)
 * para o Payload. Só roda quando o banco ainda não tem nenhuma obra, então é
 * seguro deixar no build: depois da primeira vez, ele não faz nada.
 *
 * Uso: npm run seed
 */
import fs from 'node:fs'
import path from 'node:path'
import { getPayload } from 'payload'

import config from '../payload.config'
import { DIGITAL, HOME_STUDIO, HOW_TO_USE, SHOP_WORKS, SITE, WORKS } from '../../seed/legacy/site-data.mjs'
import { BLOG, CATEGORIES, POSTS } from '../../seed/legacy/blog-data.mjs'
import { cleanHref, extractNotes, fromParagraphs, htmlToLexical, inlineFromHtml, paragraph, root, stripNotes } from './lexical'

const ROOT = process.cwd()
const IMAGES = path.join(ROOT, 'seed/images')
const ctx = { disableRevalidate: true }

const payload = await getPayload({ config })

const existing = await payload.count({ collection: 'obras' })
if (existing.totalDocs > 0) {
  payload.logger.info('Importação: o banco já tem conteúdo, nada a fazer.')
  process.exit(0)
}
payload.logger.info('Importação: começando…')

/* ---------- imagens ---------- */
const WIDTHS = [2400, 1600, 1200, 1000, 800, 640, 600, 480]
function bestFile(base: string): string {
  for (const w of WIDTHS) {
    for (const ext of ['jpg', 'webp']) {
      const file = path.join(IMAGES, `${base}-${w}.${ext}`)
      if (fs.existsSync(file)) return file
    }
  }
  for (const ext of ['jpg', 'png', 'webp']) {
    const file = path.join(IMAGES, `${base}.${ext}`)
    if (fs.existsSync(file)) return file
  }
  throw new Error(`Imagem não encontrada: ${base}`)
}

function altFor(src: string): string {
  const work = WORKS.find((w: any) => `art/${w.file}` === src)
  if (work) return work.alt
  for (const p of DIGITAL) {
    const im = p.images.find((i: any) => i.file === src)
    if (im) return im.alt
  }
  return ''
}

const mediaIds = new Map<string, number>()
async function media(src: string, alt?: string, credit?: string): Promise<number> {
  if (mediaIds.has(src)) return mediaIds.get(src)!
  const doc = await payload.create({
    collection: 'media',
    data: { alt: alt || altFor(src) || src.split('/').pop()!, ...(credit ? { credit } : {}) },
    filePath: bestFile(src),
    context: ctx,
  })
  mediaIds.set(src, doc.id as number)
  payload.logger.info(`  imagem: ${src}`)
  return doc.id as number
}

/* ---------- obras ---------- */
const workIds = new Map<string, number>()
for (const [i, w] of (WORKS as any[]).entries()) {
  const doc = await payload.create({
    collection: 'obras',
    context: ctx,
    data: {
      title: w.title,
      slug: w.slug,
      image: await media(`art/${w.file}`, w.alt),
      technique: w.technique,
      year: w.year || undefined,
      dimensions: w.dimensions || undefined,
      format: w.format || undefined,
      status: w.status || undefined,
      categories: w.categories,
      description: w.description.join('\n\n'),
      etsy: w.etsy ? { url: w.etsy.url, label: w.etsy.label, note: w.etsy.note } : undefined,
      instagram: w.instagram || undefined,
      mockups: await Promise.all((w.mockups || []).map(async (m: any) => ({ image: await media(m.file, m.alt) }))),
      order: (i + 1) * 10,
      showOnHome: HOME_STUDIO.includes(w.slug),
      forSale: SHOP_WORKS.includes(w.slug),
    },
  })
  workIds.set(w.slug, doc.id as number)
  payload.logger.info(`obra: ${w.title}`)
}

/* ---------- produtos digitais ---------- */
const productIds = new Map<string, number>()
for (const [i, p] of (DIGITAL as any[]).entries()) {
  const doc = await payload.create({
    collection: 'produtos',
    context: ctx,
    data: {
      name: p.name,
      slug: p.slug,
      kind: p.kind,
      category: p.category,
      price: p.price,
      priceValue: Number(p.priceValue),
      currency: p.currency,
      etsy: p.etsy,
      images: await Promise.all(p.images.map(async (im: any) => ({ image: await media(im.file, im.alt) }))),
      summary: p.summary,
      cardMeta: p.cardMeta,
      specs: p.specs.map(([label, value]: [string, string]) => ({ label, value })),
      includes: p.includes.map((t: string) => ({ text: t })),
      order: (i + 1) * 10,
    },
  })
  productIds.set(p.slug, doc.id as number)
  payload.logger.info(`produto: ${p.name}`)
}

/* ---------- blog ---------- */
const categoryIds = new Map<string, number>()
for (const [i, c] of (CATEGORIES as any[]).entries()) {
  const doc = await payload.create({
    collection: 'categorias',
    context: ctx,
    data: { name: c.name, slug: c.id, description: c.description, order: (i + 1) * 10 },
  })
  categoryIds.set(c.id, doc.id as number)
}

const MONET_CREDIT: Record<string, string> = {
  'blog/monet-caminhada-pourville': 'The Art Institute of Chicago (domínio público)',
  'blog/monet-primavera': 'The Walters Art Museum (domínio público)',
}

const postIds = new Map<string, number>()
for (const p of POSTS as any[]) {
  const rawHtml = fs.readFileSync(path.join(ROOT, 'seed/legacy/blog', `${p.slug}.html`), 'utf8')
  const content = await htmlToLexical(stripNotes(rawHtml), {
    media: (src, alt) => media(src, alt, MONET_CREDIT[src]),
  })
  const doc = await payload.create({
    collection: 'posts',
    context: ctx,
    draft: false,
    data: {
      _status: 'published',
      title: p.title,
      slug: p.slug,
      dek: p.dek,
      cover: {
        image: await media(p.cover.src, p.cover.alt, MONET_CREDIT[p.cover.src]),
        kind: p.cover.kind,
        caption: p.cover.caption ? root([paragraph(inlineFromHtml(p.cover.caption))]) : undefined,
      },
      content,
      excerpt: p.excerpt,
      seoTitle: p.seoTitle,
      description: p.description,
      keywords: p.keywords.map((k: string) => ({ keyword: k })),
      cta: { ...p.cta, href: cleanHref(p.cta.href) },
      sources: p.sources,
      category: categoryIds.get(p.category),
      publishedAt: p.published ? new Date(`${p.published}T12:00:00-03:00`).toISOString() : undefined,
      editorNotes: extractNotes(rawHtml).join('\n\n') || undefined,
    } as any,
  })
  postIds.set(p.slug, doc.id as number)
  payload.logger.info(`artigo: ${p.title}`)
}
for (const p of POSTS as any[]) {
  await payload.update({
    collection: 'posts',
    id: postIds.get(p.slug)!,
    context: ctx,
    draft: false,
    data: { related: p.related.map((s: string) => postIds.get(s)).filter(Boolean) } as any,
  })
}

/* ---------- páginas ---------- */
const profile = await media('profile/mariane', 'Retrato de Mariane Nunes, artista da Mari Nunes Arts')

await payload.updateGlobal({
  slug: 'configuracoes',
  context: ctx,
  data: {
    siteName: SITE.name,
    authorName: SITE.author,
    siteUrl: SITE.url,
    email: SITE.email,
    city: SITE.city,
    social: { instagram: SITE.instagram, etsy: SITE.etsy, pinterest: SITE.pinterest || '' },
    footerText: 'Pinturas, impressões e produtos digitais de Mariane Nunes.',
    person: {
      jobTitle: 'Artista visual',
      description:
        'Artista brasileira de aquarela e giz pastel oleoso, inspirada no impressionismo, que também cria planners digitais inspirados em grandes pintores.',
      authorBio:
        'Mariane Nunes é artista visual em São Paulo. Pinta principalmente em aquarela e giz pastel oleoso, inspirada em Monet, Degas e Van Gogh, e cria planners digitais inspirados em grandes pintores.',
      photo: profile,
    },
    newsletter: {
      title: 'Cartas do ateliê',
      text: 'Novas pinturas, lançamentos de planners e histórias do processo criativo, direto no seu e-mail.',
      buttonLabel: 'Quero receber',
    },
    ogImage: await media('hero/hero-og', 'Refúgio Violeta, aquarela de Mariane Nunes'),
  },
})

const ABOUT_TITLE = 'A arte sempre me chamou. Um dia, eu respondi.'
const STATEMENT = {
  quote: 'A arte não precisa ser perfeita para ser bonita. Ela precisa ser sentida.',
  text: 'Em cada pintura, procuro registrar não apenas aquilo que vejo, mas também a emoção que uma paisagem, uma cor ou um instante desperta em mim.',
}

await payload.updateGlobal({
  slug: 'inicio',
  context: ctx,
  data: {
    seo: {
      title: 'Mari Nunes Arts | Pinturas, impressões e planners digitais',
      description:
        'Pinturas em aquarela e giz pastel oleoso de Mariane Nunes, impressões artísticas e planners digitais inspirados em Van Gogh e no impressionismo.',
    },
    hero: {
      image: await media('hero/hero-bg', 'Refúgio Violeta: aquarela de uma casa de campo diante de uma montanha violeta ao entardecer'),
      kicker: 'Mariane Nunes, artista visual',
      title: 'Arte que nasce da natureza, da memória e da liberdade de sentir.',
      subtitle: 'Pinturas em aquarela e giz pastel oleoso, impressões e planners digitais inspirados na arte.',
      primaryLabel: 'Ver produtos',
      primaryLink: '/produtos',
      secondaryLabel: 'Conhecer o portfólio',
      secondaryLink: '/portfolio',
      featuredWork: workIds.get('refugio-violeta'),
    },
    produtos: {
      title: 'Produtos',
      lede: 'Planners digitais inspirados em grandes pintores e obras prontas para ganhar uma parede.',
      linkLabel: 'Ver todos os produtos',
      digital: [...productIds.values()],
      works: ['refugio-violeta', 'veneza-ao-entardecer'].map((s) => workIds.get(s)!),
    },
    statement: STATEMENT,
    atelie: { title: 'Do ateliê', lede: 'Pinturas recentes em aquarela e giz pastel oleoso.', linkLabel: 'Ver o portfólio completo' },
    sobre: {
      title: ABOUT_TITLE,
      text:
        'Por muito tempo achei que a arte não era um caminho possível para mim. Até que deixei o medo de lado e fiz meus primeiros desenhos. Foi no giz pastel oleoso que encontrei minha primeira paixão; depois vieram a aquarela, os cursos e muitas experiências com materiais.\n\nHoje pinto paisagens, memórias e pequenos instantes, inspirada em Monet, Degas e Van Gogh, e levo essa paixão também para planners digitais.',
      linkLabel: 'Conheça minha história',
    },
  },
})

const ABOUT_PARAGRAPHS = [
  'Meu nome é Mariane e, desde sempre, a arte exerce um fascínio profundo sobre mim. Eu poderia passar horas observando artistas transformarem uma folha em branco em algo capaz de despertar sentimentos, memórias e novas formas de enxergar o mundo.',
  'Durante muito tempo, porém, acreditei que a arte não era um caminho possível para mim. Por quase 30 anos, admirei pinturas e desenhos à distância, convencida de que não tinha talento suficiente para criar. Eu me encantava com o processo, mas não me permitia experimentar.',
  'Até que, aos 30 anos, decidi deixar o medo de lado e fazer meus primeiros desenhos e pinturas. Foi no giz pastel oleoso que encontrei minha primeira grande paixão: suas cores intensas, sua textura e a liberdade de criar sem buscar formas absolutamente perfeitas despertaram algo que sempre esteve dentro de mim.',
  'Depois vieram a aquarela e a tinta acrílica. Estudei técnicas, fiz cursos, experimentei materiais e busquei compreender melhor não apenas como pintar, mas como encontrar minha própria maneira de me expressar.',
  'Hoje, sinto que chegou o momento de compartilhar com o mundo tudo o que venho construindo. Minha produção está concentrada principalmente na aquarela e no giz pastel oleoso. Gosto de retratar paisagens naturais e encontro inspiração no movimento, na luz e nas cores de artistas impressionistas como Monet, Degas e Van Gogh. Também exploro a arte abstrata e moderna, permitindo que cada obra encontre seu próprio caminho.',
  'Essa paixão também virou produtos digitais: planners inspirados em grandes pintores, para que a arte faça parte da rotina de quem organiza os próprios dias.',
  'Para mim, a arte vai muito além do realismo. Não pinto apenas o que vejo: pinto o que sinto. Procuro criar com liberdade, sem me prender à perfeição das formas, transformando cores, paisagens e emoções em registros de um instante.',
  'Minha história com a arte também é uma história sobre recomeços. Sobre perceber que nunca é tarde para experimentar, aprender e dar espaço àquilo que sempre nos chamou por dentro.',
]

await payload.updateGlobal({
  slug: 'sobre',
  context: ctx,
  data: {
    seo: {
      title: 'Sobre Mariane Nunes | Mari Nunes Arts',
      description: 'A história de Mariane Nunes, artista de aquarela e giz pastel oleoso que um dia decidiu responder ao chamado da arte.',
    },
    kicker: 'Sobre a Mari',
    title: ABOUT_TITLE,
    photo: profile,
    body: fromParagraphs(ABOUT_PARAGRAPHS.join('\n\n')),
    pullQuote: 'Não pinto apenas o que vejo: pinto o que sinto.',
    processo: {
      title: 'Entre cores e sensações',
      lede: 'Meu processo começa com uma sensação: a luz de uma paisagem, a combinação inesperada de duas cores ou uma lembrança que desejo preservar. A partir disso, construo cada obra de forma intuitiva, deixando que o material também participe da criação.',
      steps: [
        { title: 'Referência', text: 'Uma paisagem, uma foto ou uma memória que pede para ser registrada.' },
        { title: 'Paleta de cores', text: 'Testes livres até encontrar a combinação que traduz a sensação certa.' },
        { title: 'Primeiras camadas', text: 'A água ou o giz encontram o papel, ainda sem compromisso com a forma final.' },
        { title: 'Textura e movimento', text: 'Camadas se sobrepõem, o pastel se funde, a aquarela se espalha por conta própria.' },
        { title: 'Obra finalizada', text: 'O instante fica registrado, pronto para ganhar um novo lar.' },
      ],
      gallery: [
        { image: await media('mockup/refugio-violeta-ambiente', 'Refúgio Violeta emoldurada e exposta em uma sala de estar aconchegante') },
        { image: await media('mockup/veneza-ambiente', 'Veneza ao Entardecer emoldurada em um ambiente residencial') },
        { image: await media('mockup/solidao-ambiente', 'Solidão emoldurada sobre um aparador, ao lado de uma vela acesa') },
      ],
      caption: 'Do papel à parede: cada obra ganha um novo lar e continua contando sua história.',
    },
    influencias: {
      title: 'Influências e inspirações',
      groups: [
        {
          title: 'Lugares e temas',
          items: [
            { name: 'Natureza e jardins', text: 'Canteiros, folhagens e o crescimento silencioso das plantas.' },
            { name: 'Paisagens rurais', text: 'Casas simples, campos abertos e o horizonte ao entardecer.' },
            { name: 'Céus e luz natural', text: 'A forma como a luz muda uma paisagem em minutos.' },
          ],
        },
        {
          title: 'Artistas',
          items: [
            { name: 'Claude Monet', text: 'A luz como protagonista: cada instante do dia merece sua própria paleta.' },
            { name: 'Edgar Degas', text: 'Movimento capturado com liberdade, sem medo do gesto imperfeito.' },
            { name: 'Vincent van Gogh', text: 'Cor e textura como extensão direta da emoção.' },
          ],
        },
        {
          title: 'Linguagens',
          items: [
            { name: 'Impressionismo', text: 'A pintura como sensação, não como cópia fiel do real.' },
            { name: 'Arte abstrata e moderna', text: 'Espaço para que cada obra encontre sua própria forma.' },
          ],
        },
      ],
    },
    cta: {
      title: 'Vamos criar algo juntas?',
      text: 'Encomendas, licenciamento, parcerias e exposições: me conte sua ideia.',
      label: 'Entrar em contato',
    },
  },
})

await payload.updateGlobal({
  slug: 'pagina-portfolio',
  context: ctx,
  data: {
    seo: {
      title: 'Portfólio | Mari Nunes Arts',
      description: 'Todas as pinturas de Mariane Nunes em aquarela, giz pastel oleoso e técnica mista: paisagens, animais e memórias.',
    },
    title: 'Portfólio',
    lede: 'Paisagens, memórias e pequenos instantes em aquarela, giz pastel oleoso e técnica mista. Clique numa obra para ver detalhes e disponibilidade.',
  },
})

await payload.updateGlobal({
  slug: 'pagina-produtos',
  context: ctx,
  data: {
    seo: {
      title: 'Produtos | Planners digitais, obras e impressões | Mari Nunes Arts',
      description: 'Planners digitais inspirados em Van Gogh e no impressionismo, obras originais e impressões artísticas de Mariane Nunes.',
    },
    title: 'Produtos',
    lede: 'Planners digitais inspirados em grandes pintores, obras originais e impressões das minhas pinturas.',
    digitalLede: 'Para organizar a rotina com arte. Compra segura e download imediato pela Etsy.',
    worksTitle: 'Obras originais e impressões',
    worksLede: 'Peças prontas para encontrar um novo lar. O valor é combinado diretamente comigo.',
    commission: {
      title: 'Quer uma obra feita para você?',
      text: 'Conte qual paisagem, lembrança ou cor você gostaria de ver na sua parede e eu respondo com prazos e valores.',
      label: 'Solicitar uma encomenda',
    },
    howToUse: (HOW_TO_USE as string[]).map((t) => ({ text: t })),
    purchaseNote: 'O pagamento e o download acontecem pela Etsy. O arquivo fica disponível assim que a compra é confirmada.',
    digitalNote: 'Produto digital: nada é enviado pelo correio. O tablet, a caneta e os apps não estão incluídos.',
  },
})

await payload.updateGlobal({
  slug: 'pagina-blog',
  context: ctx,
  data: { seo: { title: BLOG.seoTitle, description: BLOG.description }, title: BLOG.title, intro: BLOG.intro },
})

await payload.updateGlobal({
  slug: 'contato',
  context: ctx,
  data: {
    seo: {
      title: 'Contato | Mari Nunes Arts',
      description: 'Fale com Mariane Nunes sobre compra de obras, encomendas, planners digitais, licenciamento e parcerias.',
    },
    title: 'Vamos conversar',
    intro:
      'Se alguma obra despertou uma lembrança, uma sensação ou simplesmente fez você querer observá-la por mais tempo, vou adorar conversar. Também respondo sobre encomendas, planners e parcerias.',
    subjects: ['Comprar uma obra', 'Solicitar uma encomenda', 'Dúvida sobre um produto digital', 'Licenciamento', 'Parcerias', 'Exposições', 'Outros'].map(
      (text) => ({ text }),
    ),
  },
})

const PRIVACY_HTML = `
<p>Esta página explica, de forma simples, como o site Mari Nunes Arts trata as informações fornecidas pelos visitantes.</p>
<h2>Quais dados são coletados</h2>
<p>O site coleta apenas as informações que você preenche nos formulários de contato e de newsletter: nome, e-mail, assunto, obra ou produto de interesse e mensagem.</p>
<h2>Como os dados são usados</h2>
<ul>
  <li>O formulário de contato abre o seu aplicativo de e-mail com a mensagem já preenchida, endereçada a <a href="mailto:${SITE.email}">${SITE.email}</a>. Os dados não passam por servidores próprios do site.</li>
  <li>O e-mail informado na newsletter é usado apenas para o envio de novidades sobre obras, produtos e lançamentos da Mari Nunes Arts.</li>
</ul>
<h2>Compras na Etsy</h2>
<p>Os produtos digitais são vendidos pela Etsy. Ao clicar em “Comprar na Etsy”, você vai para o site da Etsy, e os dados da compra seguem a política de privacidade da própria Etsy.</p>
<h2>Compartilhamento</h2>
<p>Nenhum dado pessoal é vendido ou compartilhado com terceiros para fins de publicidade.</p>
<h2>Seus direitos</h2>
<p>Você pode pedir a qualquer momento a remoção do seu e-mail da newsletter ou esclarecimentos sobre o uso dos seus dados, escrevendo para <a href="mailto:${SITE.email}">${SITE.email}</a>.</p>
<h2>Cookies</h2>
<p>Este site não usa cookies de rastreamento próprios além dos necessários para o seu funcionamento básico.</p>`

await payload.updateGlobal({
  slug: 'privacidade',
  context: ctx,
  data: { title: 'Política de privacidade', body: await htmlToLexical(PRIVACY_HTML, { media }) },
})

payload.logger.info(`Importação concluída: ${workIds.size} obras, ${productIds.size} produtos, ${postIds.size} artigos, ${mediaIds.size} imagens.`)
process.exit(0)
