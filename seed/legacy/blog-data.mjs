// =========================================================
// Mari Nunes Arts — conteúdo do blog "Diário do Ateliê"
//
// Cada artigo tem:
//   • os dados abaixo (título, SEO, categoria, imagem de capa, fontes...)
//   • o texto em content/blog/<slug>.html
//
// No texto dos artigos:
//   {{root}}                        → caminho até a raiz do site (para links internos)
//   {{fig src="art/limoes" ...}}    → figura com imagem otimizada (ver build-site.mjs)
//   <!-- REVISAR: ... -->           → anotação para a Mari; NÃO aparece no site publicado
//
// Datas: preencha "published" (e "updated", se houver) no formato AAAA-MM-DD
// no dia em que o artigo for publicado. Enquanto estiverem vazias, nenhuma
// data aparece na página nem nos dados estruturados.
// =========================================================

export const BLOG = {
  title: "Diário do Ateliê",
  seoTitle: "Diário do Ateliê: blog de arte da Mari Nunes Arts",
  description:
    "Técnicas de pintura, história da arte e organização com arte: textos de Mariane Nunes sobre aquarela, giz pastel oleoso, impressionismo e planners digitais.",
  intro:
    "Um caderno aberto sobre o que acontece antes, durante e depois de uma pintura: técnicas e materiais, artistas que inspiram e pequenas formas de levar arte para a rotina.",
};

// A ordem aqui é a ordem das seções na página do blog
export const CATEGORIES = [
  {
    id: "tecnicas-e-materiais",
    name: "Técnicas e materiais artísticos",
    short: "Técnicas e materiais",
    description: "Guias práticos sobre aquarela, giz pastel oleoso e os materiais que fazem diferença no papel.",
  },
  {
    id: "historia-da-arte",
    name: "História da arte e inspiração",
    short: "História da arte",
    description: "Movimentos, artistas e obras que ajudam a olhar a pintura com mais atenção.",
  },
  {
    id: "arte-e-organizacao",
    name: "Arte e organização digital",
    short: "Organização digital",
    description: "Planners digitais, rotina e pequenas formas de levar arte para o dia a dia.",
  },
];

// cover.kind: "art" (obra no passe-partout), "wide" (imagem horizontal inteira), "product" (foto quadrada de produto)
export const POSTS = [
  {
    slug: "giz-pastel-oleoso",
    category: "tecnicas-e-materiais",
    title: "Giz pastel oleoso: o que é, como usar e técnicas para iniciantes",
    seoTitle: "Giz pastel oleoso: o que é, como usar e técnicas",
    description:
      "Entenda o que é o giz pastel oleoso, quais materiais escolher e como aplicar, misturar e sobrepor cores, com técnicas e erros comuns para quem está começando.",
    dek: "Cor intensa, textura cremosa e quase nenhum pó: um guia para entender o material e dar os primeiros passos com camadas, misturas e sgraffito.",
    excerpt: "O que é, como se diferencia do pastel seco e do giz de cera, quais materiais escolher e as técnicas básicas para começar.",
    keywords: ["giz pastel oleoso", "técnicas de giz pastel oleoso", "como pintar com giz pastel oleoso", "materiais para pastel oleoso"],
    cover: {
      src: "art/venezia-ao-entardecer",
      kind: "art",
      alt: "Veneza ao Entardecer: giz pastel oleoso retratando uma gôndola atracada em Veneza sob um céu intenso em tons de laranja e azul",
      caption: 'Veneza ao Entardecer (2025), giz pastel oleoso sobre papel. <a href="{{root}}obras/veneza-ao-entardecer.html">Ver a obra</a>',
    },
    published: "2026-10-28",
    updated: null,
    related: ["pintura-aquarela-iniciantes", "o-que-e-impressionismo"],
    cta: {
      title: "Veja o giz pastel oleoso em obras finalizadas",
      text: "Paisagens, frutas e animais pintados com a cor intensa e a textura do pastel oleoso.",
      href: "portfolio.html#giz-pastel",
      label: "Ver obras em giz pastel",
    },
    sources: [
      { title: "History of SAKURA (100 anos do Cray-Pas)", publisher: "Sakura Color Products", url: "https://sakuracraypas.com/100th-anniversary/history/" },
      {
        title: "From Cézanne to Picasso: secret stories of Sennelier colours",
        publisher: "Sennelier",
        url: "https://www.sennelier-colors.com/en/From-cezanne-picasso-secret-stories-sennelier-colours_fiche_18356.html",
      },
    ],
  },
  {
    slug: "pintura-aquarela-iniciantes",
    category: "tecnicas-e-materiais",
    title: "Pintura em aquarela para iniciantes: materiais e primeiras técnicas",
    seoTitle: "Aquarela para iniciantes: materiais e primeiras técnicas",
    description:
      "Pintura em aquarela para iniciantes: papel, tintas e pincéis essenciais, como dosar água e pigmento e as técnicas molhado sobre molhado e molhado sobre seco.",
    dek: "O que comprar, como preparar o papel, como equilibrar água e pigmento e quais técnicas praticar nas primeiras semanas.",
    excerpt: "Materiais essenciais, preparação do papel, molhado sobre molhado, molhado sobre seco, camadas e exercícios para começar.",
    keywords: ["pintura em aquarela para iniciantes", "técnicas de aquarela", "materiais para aquarela", "como pintar com aquarela"],
    cover: {
      src: "art/refugio-violeta",
      kind: "art",
      alt: "Refúgio Violeta: aquarela de uma casa de campo diante de uma grande montanha violeta ao entardecer, com campo verde e flores silvestres",
      caption: 'Refúgio Violeta (2025), aquarela sobre papel. <a href="{{root}}obras/refugio-violeta.html">Ver a obra</a>',
    },
    published: "2026-10-28",
    updated: null,
    related: ["giz-pastel-oleoso", "o-que-e-impressionismo"],
    cta: {
      title: "Aquarelas da Mari Nunes Arts",
      text: "Paisagens em aquarela, do pôr do sol de Refúgio Violeta à praia do Rio de Janeiro.",
      href: "portfolio.html#aquarela",
      label: "Ver obras em aquarela",
    },
    sources: [
      {
        title: "Professional Watercolour Paper, 300gsm (140lb)",
        publisher: "Winsor & Newton",
        url: "https://www.winsornewton.com/products/professional-watercolour-paper-sheet-300gsm-140lb",
      },
      {
        title: "Picking Watercolor Paper Weight and Texture",
        publisher: "Dummies (Wiley)",
        url: "https://www.dummies.com/article/academics-the-arts/art-architecture/painting/picking-watercolor-paper-weight-and-texture-199759",
      },
    ],
  },
  {
    slug: "o-que-e-impressionismo",
    category: "historia-da-arte",
    title: "O que é impressionismo? Características, artistas e obras famosas",
    seoTitle: "O que é impressionismo? Características e artistas",
    description:
      "Saiba o que é impressionismo: a origem em 1874, características como luz, cor e pinceladas soltas, os principais pintores e onde Van Gogh entra nessa história.",
    dek: "Como um grupo de pintores independentes mudou o jeito de pintar a luz, de onde veio o nome do movimento e por que Van Gogh é considerado pós-impressionista.",
    excerpt: "A origem do movimento, suas características, os principais pintores impressionistas e a diferença para o pós-impressionismo.",
    keywords: ["o que é impressionismo", "características do impressionismo", "pintores impressionistas", "Claude Monet", "Vincent van Gogh", "história do impressionismo"],
    cover: {
      src: "blog/monet-caminhada-pourville",
      kind: "wide",
      alt: "Pintura de Claude Monet: duas mulheres, uma delas com sombrinha, sobre um penhasco gramado diante de um mar verde-azulado com veleiros, sob céu azul com nuvens",
      caption:
        "Claude Monet, <em>Caminhada no penhasco em Pourville</em>, 1882. Óleo sobre tela. The Art Institute of Chicago, coleção memorial Mr. and Mrs. Lewis Larned Coburn (domínio público).",
    },
    published: "2026-10-28",
    updated: null,
    related: ["giz-pastel-oleoso", "como-usar-planner-digital"],
    cta: {
      title: "Arte impressionista na sua rotina",
      text: "O planner En Plein Air traz páginas de observação de obras impressionistas, com perguntas e curiosidades.",
      href: "produtos/planner-en-plein-air.html",
      label: "Conhecer o planner En Plein Air",
    },
    sources: [
      { title: "Paris 1874: The Impressionist Moment (comunicado de imprensa)", publisher: "National Gallery of Art", url: "https://www.nga.gov/press/exhibitions/exhibitions-2024/5649.html" },
      { title: "Impression, soleil levant", publisher: "Musée Marmottan Monet", url: "https://www.marmottan.fr/en/notice/4014/" },
      { title: "Impressionism: Art and Modernity", publisher: "The Metropolitan Museum of Art", url: "https://www.metmuseum.org/toah/hd/imml/hd_imml.htm" },
      { title: "Vincent van Gogh (1853–1890)", publisher: "The Metropolitan Museum of Art", url: "https://www.metmuseum.org/toah/hd/gogh/hd_gogh.htm" },
      { title: "Post-impressionism", publisher: "Tate", url: "https://www.tate.org.uk/art/art-terms/p/post-impressionism" },
      { title: "Cliff Walk at Pourville", publisher: "The Art Institute of Chicago", url: "https://www.artic.edu/artworks/14620/cliff-walk-at-pourville" },
      { title: "Springtime", publisher: "The Walters Art Museum", url: "https://purl.thewalters.org/art/37.11" },
      { title: "John Goffe Rand", publisher: "Linda Hall Library", url: "https://www.lindahall.org/about/news/scientist-of-the-day/john-goffe-rand" },
    ],
  },
  {
    slug: "como-usar-planner-digital",
    category: "arte-e-organizacao",
    title: "Como usar planner digital: guia para organizar sua rotina",
    seoTitle: "Como usar planner digital: guia para organizar a rotina",
    description:
      "Aprenda como usar um planner digital no tablet: como funciona o PDF com links, como planejar o mês e a semana e o que muda em relação ao planner de papel.",
    dek: "Do download à primeira semana planejada: como funciona um planner digital, como organizar mês, semana e dia e como manter o hábito.",
    excerpt: "Como funciona um planner digital, o que é preciso para começar, como organizar a rotina e as diferenças em relação ao planner de papel.",
    keywords: ["como usar planner digital", "planner digital para tablet", "planner digital sem data", "como funciona planner digital", "organização com planner digital"],
    cover: {
      src: "products/en-plein-air-2",
      kind: "product",
      alt: "Páginas diária, semanal e mensal do planner digital En Plein Air abertas em três tablets",
      caption: 'Páginas diária, semanal e mensal do planner <a href="{{root}}produtos/planner-en-plein-air.html">En Plein Air</a>.',
    },
    published: "2026-10-28",
    updated: null,
    related: ["o-que-e-impressionismo", "giz-pastel-oleoso"],
    cta: {
      title: "Planners digitais inspirados em grandes pintores",
      text: "Luminous Days, inspirado em Van Gogh, e En Plein Air, inspirado no impressionismo. Sem datas, para começar quando quiser.",
      href: "produtos.html",
      label: "Ver os planners",
    },
    sources: [],
  },
];
