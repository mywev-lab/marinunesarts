// =========================================================
// Mari Nunes Arts — conteúdo do site
// Edite este arquivo para adicionar obras ou produtos e depois
// rode:  node scripts/build-site.mjs
// As imagens de cada obra ficam em images/art/<arquivo>-480|800|1200.jpg/.webp
// (gere-as com: node scripts/process-images.mjs)
// =========================================================

export const SITE = {
  name: "Mari Nunes Arts",
  author: "Mariane Nunes",
  url: "https://www.marinunesarts.com",
  email: "mawebcontent@gmail.com",
  city: "São Paulo, Brasil",
  instagram: "https://www.instagram.com/marinunesarts/",
  etsy: "https://www.etsy.com/shop/marinunesart",
  pinterest: "", // TODO: cole aqui o link do Pinterest quando existir
};

// Filtros do portfólio (a ordem aqui é a ordem dos botões)
export const FILTERS = [
  { id: "todas", label: "Todas" },
  { id: "aquarela", label: "Aquarela" },
  { id: "giz-pastel", label: "Giz pastel oleoso" },
  { id: "paisagens", label: "Paisagens" },
  { id: "natureza", label: "Animais e natureza" },
  { id: "abstrata", label: "Abstrata e moderna" },
  { id: "colecoes", label: "Coleções" },
];

// status: "disponivel" | "colecao-particular" | "vendida" | null (sem selo)
export const WORKS = [
  {
    slug: "refugio-violeta",
    file: "refugio-violeta",
    title: "Refúgio Violeta",
    technique: "Aquarela sobre papel",
    dimensions: "28 × 38 cm",
    year: "2025",
    format: "Original",
    status: "disponivel",
    categories: ["aquarela", "paisagens", "colecoes"],
    alt: "Refúgio Violeta: aquarela de uma casa de campo diante de uma grande montanha violeta ao entardecer, com campo verde e flores silvestres",
    description: [
      "Uma casa simples se abriga aos pés de uma montanha violeta enquanto o céu se incendeia em tons de pôr do sol — pintada de memória, após uma tarde observando como a luz muda uma paisagem em minutos.",
    ],
    mockups: [
      { file: "mockup/refugio-violeta-ambiente", alt: "Refúgio Violeta emoldurada e exposta em uma sala de estar aconchegante" },
      { file: "mockup/refugio-violeta-ambiente-2", alt: "Refúgio Violeta emoldurada em uma sala de jantar" },
    ],
  },
  {
    slug: "veneza-ao-entardecer",
    file: "venezia-ao-entardecer",
    title: "Veneza ao Entardecer",
    technique: "Giz pastel oleoso sobre papel",
    dimensions: "24 × 32 cm",
    year: "2025",
    format: "Original",
    status: "disponivel",
    categories: ["giz-pastel", "paisagens"],
    alt: "Veneza ao Entardecer: giz pastel oleoso retratando uma gôndola atracada em Veneza sob um céu intenso em tons de laranja e azul",
    description: [
      "Uma lembrança de viagem registrada em giz pastel oleoso: a textura densa do material traduz o calor do entardecer refletido na água do canal.",
    ],
    mockups: [{ file: "mockup/veneza-ambiente", alt: "Veneza ao Entardecer emoldurada em um ambiente residencial" }],
  },
  {
    slug: "entre-flores-douradas",
    file: "entre-flores-douradas",
    title: "Entre Flores Douradas",
    technique: "Técnica mista",
    dimensions: null,
    year: "2025",
    format: "Impressão artística",
    status: "disponivel",
    categories: ["abstrata", "colecoes"],
    alt: "Entre Flores Douradas: figura de vestido rosa de costas em um campo de flores amarelas, pintura em técnica mista com efeito de espátula",
    description: [
      "Uma figura de costas, entre flores douradas — sobre pertencer a uma paisagem maior do que nós, e sobre a coragem discreta de simplesmente estar.",
      "Disponível como impressão artística de alta qualidade.",
    ],
    etsy: {
      url: "https://www.etsy.com/listing/4549071298/wildflower-reverie-digital-print", // TODO: trocar pelo link do Share & Save
      label: "Comprar a versão para imprimir na Etsy",
      note: "Também está à venda como arte digital para imprimir em casa.",
    },
    mockups: [{ file: "mockup/entre-flores-douradas-ambiente", alt: "Entre Flores Douradas emoldurada em um quarto" }],
  },
  {
    slug: "dia-de-chuva",
    file: "dia-de-chuva",
    title: "Dia de Chuva",
    technique: "Giz pastel oleoso sobre papel",
    dimensions: null,
    year: "2026",
    format: null,
    status: null,
    categories: ["giz-pastel", "paisagens"],
    alt: "Dia de Chuva: giz pastel oleoso de uma figura de capa amarela com guarda-chuva preto, sentada num pequeno barco em mar cinzento, com uma gaivota no céu",
    description: [
      "Uma pequena figura de capa amarela se abriga sob o guarda-chuva, sentada num barco entre ondas cinzentas. Um estudo sobre calma no meio do temporal, com a textura do giz pastel marcando as ondas.",
    ],
    instagram: "https://www.instagram.com/marinunesarts/p/Dc_2r8Xviqz/",
  },
  {
    slug: "olhar-felino",
    file: "olhar-felino",
    title: "Olhar Felino",
    technique: "Giz pastel oleoso sobre papel",
    dimensions: null,
    year: "2026",
    format: null,
    status: null,
    categories: ["giz-pastel", "natureza"],
    alt: "Olhar Felino: giz pastel oleoso de um felino de pelagem pintada espiando entre folhas verdes altas",
    description: [
      "Um felino de pelagem pintada espia entre folhas altas. O verde intenso emoldura o olhar atento — e dá vontade de chamar com um “pspsps”.",
    ],
    instagram: "https://www.instagram.com/marinunesarts/p/Db4dsS5tCIp/",
  },
  {
    slug: "rio-de-janeiro",
    file: "rio-de-janeiro",
    title: "Rio de Janeiro em Aquarela",
    technique: "Aquarela sobre papel",
    dimensions: null,
    year: "2026",
    format: null,
    status: null,
    categories: ["aquarela", "paisagens"],
    alt: "Rio de Janeiro em Aquarela: o Pão de Açúcar visto da praia, com mar azul e guarda-sóis coloridos na areia",
    description: [
      "O Pão de Açúcar visto da areia, com guarda-sóis coloridos e o mar azul: um dia de praia no Rio de Janeiro, em aquarela.",
    ],
    instagram: "https://www.instagram.com/marinunesarts/p/Dbo4eEev-z6/",
  },
  {
    slug: "caminho-ao-entardecer",
    file: "caminho-ao-entardecer",
    title: "Caminho ao Entardecer",
    technique: "Giz pastel oleoso sobre papel",
    dimensions: null,
    year: "2026",
    format: null,
    status: null,
    categories: ["giz-pastel", "paisagens"],
    alt: "Caminho ao Entardecer: giz pastel oleoso de um caminho de terra entre campos verdes, com montanhas azuis e céu alaranjado",
    description: [
      "Um caminho de terra serpenteia entre campos verdes até as montanhas azuis, sob um céu alaranjado de fim de tarde.",
    ],
    instagram: "https://www.instagram.com/marinunesarts/reel/Db1aoCbvgBy/",
  },
  {
    slug: "limoes",
    file: "limoes",
    title: "Limões",
    technique: "Giz pastel oleoso sobre papel",
    dimensions: null,
    year: "2026",
    format: null,
    status: null,
    categories: ["giz-pastel", "natureza"],
    alt: "Limões: giz pastel oleoso de dois limões maduros entre folhas verdes, contra um céu azul suave",
    description: [
      "Limões maduros entre folhas verdes, contra um céu azul suave. O giz pastel oleoso deixa a casca quase em relevo.",
    ],
    instagram: "https://www.instagram.com/marinunesarts/p/Dc_2UgFvDaW/",
  },
  {
    slug: "tarde-no-chale",
    file: "tarde-no-chale",
    title: "Tarde no Chalé",
    technique: "Giz pastel oleoso sobre papel",
    dimensions: null,
    year: "2026",
    format: null,
    status: null,
    categories: ["giz-pastel", "paisagens"],
    alt: "Tarde no Chalé: giz pastel oleoso de uma moça de chapéu de palha e vestido amarelo com um buquê, diante de um chalé branco de telhado vermelho",
    description: [
      "Uma moça de chapéu de palha e vestido amarelo segura um buquê diante de um chalé de telhado vermelho.",
      "Moro numa cidade grande, e pintar cenas de chalé é uma pequena fuga do dia a dia: por um momento, entro nesses lugares tranquilos que eu mesma crio.",
    ],
    instagram: "https://www.instagram.com/marinunesarts/reel/Db220mGBw2K/",
  },
  {
    slug: "gatinho-no-galho",
    file: "gatinho-no-galho",
    title: "Gatinho no Galho",
    technique: "Giz pastel oleoso sobre papel", // TODO: confirmar a técnica
    dimensions: null,
    year: "2026",
    format: null,
    status: null,
    categories: ["giz-pastel", "natureza"],
    alt: "Gatinho no Galho: pintura de um gatinho rajado deitado num galho de árvore, com fundo verde",
    description: [
      "Pintado no Dia Internacional do Gato: um gatinho rajado descansa num galho e observa tudo com calma.",
    ],
    instagram: "https://www.instagram.com/marinunesarts/p/DbzXJqUthN5/",
  },
  {
    slug: "eu-quero-acreditar",
    file: "eu-quero-acreditar",
    title: "Eu Quero Acreditar",
    technique: "Giz pastel oleoso sobre papel",
    dimensions: null,
    year: "2026",
    format: null,
    status: null,
    categories: ["giz-pastel", "paisagens"],
    alt: "Eu Quero Acreditar: giz pastel oleoso de um disco voador sobre um deserto com cactos e arbustos vermelhos",
    description: [
      "Um disco voador paira sobre um deserto de cactos e arbustos vermelhos. Uma pintura bem-humorada para quem ainda olha para o céu esperando alguma coisa.",
    ],
    instagram: "https://www.instagram.com/marinunesarts/p/Db4fSSBtrgm/",
  },
  {
    slug: "entre-o-vermelho-e-o-azul",
    file: "campo-vermelho",
    title: "Entre o Vermelho e o Azul",
    technique: "Giz pastel oleoso sobre papel",
    dimensions: "30 × 40 cm",
    year: "2024",
    format: "Original",
    status: "colecao-particular",
    categories: ["giz-pastel", "abstrata", "paisagens", "colecoes"],
    alt: "Entre o Vermelho e o Azul: pintura de campos vermelho e dourado, uma árvore e uma pequena casa sob céu azul com nuvens",
    description: [
      "Um experimento com cor pura: campos vermelho e dourado dissolvem a paisagem em blocos de sensação, entre o real e o abstrato.",
    ],
    mockups: [{ file: "mockup/campo-vermelho-ambiente", alt: "Entre o Vermelho e o Azul emoldurada em uma sala de estar" }],
  },
  {
    slug: "solidao",
    file: "solidao",
    title: "Solidão",
    technique: "Aquarela sobre papel",
    dimensions: null,
    year: "2025",
    format: "Impressão artística",
    status: "disponivel",
    categories: ["aquarela", "abstrata", "paisagens", "colecoes"],
    alt: "Solidão: aquarela minimalista em tons de cinza e oliva de uma pessoa sentada em uma colina observando o mar e uma pequena ilha",
    description: [
      "Uma figura contempla o mar e uma pequena ilha, em tons quase monocromáticos — um estudo sobre silêncio, pausa e a beleza de estar só com a própria paisagem interior.",
    ],
    mockups: [{ file: "mockup/solidao-ambiente", alt: "Solidão emoldurada sobre um aparador, ao lado de uma vela acesa" }],
  },
];

// Obras que aparecem na seção "Do ateliê" da página inicial
export const HOME_STUDIO = ["dia-de-chuva", "olhar-felino", "rio-de-janeiro", "caminho-ao-entardecer", "limoes", "tarde-no-chale"];

// Obras vendidas pelo site (aparecem em Produtos)
export const SHOP_WORKS = ["refugio-violeta", "veneza-ao-entardecer", "entre-flores-douradas", "solidao"];

// Produtos digitais. Para criar uma nova categoria no futuro (agendas,
// cadernos, convites), adicione itens com outro "category".
export const DIGITAL = [
  {
    slug: "planner-luminous-days",
    category: "Planners",
    name: "Luminous Days",
    kind: "Planner digital inspirado em Van Gogh",
    price: "US$ 10",
    priceValue: "10.00",
    currency: "USD",
    etsy: "https://www.etsy.com/listing/4549346023/van-gogh-digital-planner-undated", // TODO: trocar pelo link do Share & Save
    images: [
      { file: "products/luminous-days-1", alt: "Capa do planner Luminous Days aberta em três tablets, com obras de Van Gogh em azul e dourado" },
      { file: "products/luminous-days-2", alt: "Páginas diária, semanal e mensal do planner Luminous Days" },
      { file: "products/luminous-days-3", alt: "Diário de leitura do planner Luminous Days, com um retrato de Van Gogh e uma lista de livros" },
      { file: "products/luminous-days-4", alt: "Diário de cinema do planner Luminous Days, com páginas de notas e avaliações de filmes" },
      { file: "products/luminous-days-5", alt: "Guia de observação de arte do planner Luminous Days, com a pintura Íris de Van Gogh" },
    ],
    summary:
      "Um planner sem datas, com 71 páginas, que junta organização e arte: planejamento diário, semanal e mensal, diários de leitura e de cinema e exercícios de observação com obras de Vincent van Gogh.",
    cardMeta: "71 páginas, sem datas",
    specs: [
      ["Páginas", "71"],
      ["Datas", "Sem datas, use em qualquer ano"],
      ["Arquivo", "1 PDF em alta resolução"],
      ["Idioma", "Inglês"],
      ["Apps", "Goodnotes, Notability, Noteshelf, Xodo e outros que abrem PDF com links"],
    ],
    includes: [
      "Planejamento diário, semanal e mensal",
      "Visão geral do ano",
      "Datas importantes e aniversários",
      "Lista de leitura e diário de livros",
      "Diário de cinema e notas de filmes",
      "Seis encontros guiados com obras de Van Gogh, como Íris, Girassóis e Amendoeira em Flor",
      "Páginas de notas e reflexão",
      "Abas clicáveis para ir direto a cada seção",
      "Links para criar eventos no Google Agenda e no Apple/iCloud",
    ],
  },
  {
    slug: "planner-en-plein-air",
    category: "Planners",
    name: "En Plein Air",
    kind: "Planner digital impressionista",
    price: "US$ 6",
    priceValue: "6.00",
    currency: "USD",
    etsy: "https://www.etsy.com/listing/4547119483/impressionist-printable-planner-undated", // TODO: trocar pelo link do Share & Save
    images: [
      { file: "products/en-plein-air-1", alt: "Capa do planner En Plein Air em três tablets, com paisagens impressionistas" },
      { file: "products/en-plein-air-2", alt: "Páginas diária, semanal e mensal do planner En Plein Air" },
      { file: "products/en-plein-air-3", alt: "Diário de cinema do planner En Plein Air, com uma pintura e uma lista de filmes" },
      { file: "products/en-plein-air-4", alt: "Diário de leitura do planner En Plein Air, com uma pintura de uma pessoa num campo" },
      { file: "products/en-plein-air-5", alt: "Guia de observação de arte do planner En Plein Air, com a pintura de uma ponte" },
      { file: "products/en-plein-air-6", alt: "Folhas de adesivos digitais En Plein Air, com ilustrações de materiais de arte e paisagens" },
    ],
    summary:
      "Um planner sem datas, com 76 páginas, inspirado na pintura impressionista: planejamento diário, semanal e mensal, diários de leitura e de cinema, exercícios de observação de obras e uma folha de adesivos digitais de brinde.",
    cardMeta: "76 páginas, em 3 idiomas",
    specs: [
      ["Páginas", "76"],
      ["Datas", "Sem datas, use em qualquer ano"],
      ["Arquivo", "PDF para usar no tablet ou imprimir"],
      ["Idiomas", "Inglês, espanhol e português"],
      ["Apps", "Goodnotes, Notability, Noteshelf, Xodo e outros que abrem PDF com links"],
    ],
    includes: [
      "Planejamento diário, semanal e mensal",
      "Metas, prioridades e listas de tarefas",
      "Registro de humor e energia",
      "Páginas de observação de obras impressionistas, com perguntas e curiosidades",
      "Sugestões de livros e filmes sobre impressionismo e grandes artistas",
      "Diário de leitura e diário de filmes",
      "Abas clicáveis para ir direto a cada seção",
      "Links para criar eventos no Google Agenda e no Apple Calendar",
      "Folha de adesivos digitais de brinde",
    ],
  },
];

export const HOW_TO_USE = [
  "Compre na Etsy e baixe o arquivo em PDF.",
  "Importe o PDF no seu app de anotações, como Goodnotes ou Notability.",
  "Use as abas para navegar e duplique as páginas sempre que precisar.",
  "Toque nos links de agenda para criar eventos e lembretes.",
];
