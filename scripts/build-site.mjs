// =========================================================
// Mari Nunes Arts — gerador do site estático
// Uso:  node scripts/build-site.mjs
// Lê o conteúdo de scripts/site-data.mjs e scripts/blog-data.mjs e gera
// todas as páginas HTML: uma para cada obra, cada produto digital e cada
// artigo do blog (texto em content/blog/<slug>.html).
// Não precisa instalar nada além do Node.
// =========================================================

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SITE, FILTERS, WORKS, HOME_STUDIO, SHOP_WORKS, DIGITAL, HOW_TO_USE } from "./site-data.mjs";
import { BLOG, CATEGORIES, POSTS } from "./blog-data.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const YEAR = new Date().getFullYear();

/* ---------------- helpers ---------------- */
const esc = (s = "") =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const abs = (p = "") => `${SITE.url}/${p}`.replace(/\/index\.html$/, "/");
const bySlug = (slug) => WORKS.find((w) => w.slug === slug);
const STATUS = { disponivel: "Disponível", "colecao-particular": "Coleção particular", vendida: "Vendida" };
const shortTechnique = (t) => t.replace(/ sobre papel$/i, "");

function jpegSize(file) {
  try {
    const b = readFileSync(file);
    let i = 2;
    while (i < b.length) {
      if (b[i] !== 0xff) { i++; continue; }
      const m = b[i + 1];
      const len = b.readUInt16BE(i + 2);
      if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) {
        return [b.readUInt16BE(i + 7), b.readUInt16BE(i + 5)];
      }
      i += 2 + len;
    }
  } catch {}
  return null;
}

function contactUrl(root, { assunto, obra } = {}) {
  const q = [];
  if (assunto) q.push("assunto=" + encodeURIComponent(assunto));
  if (obra) q.push("obra=" + encodeURIComponent(obra));
  return `${root}contato.html${q.length ? "?" + q.join("&") : ""}`;
}

/**
 * <picture> com WebP + JPG. Usa só os tamanhos que existem em images/.
 */
function picture({ root, base, widths = [480, 800, 1200], sizes = "100vw", alt = "", eager = false, maxFallback = 800, cls = "" }) {
  const avail = widths.filter((w) => existsSync(path.join(ROOT, "images", `${base}-${w}.jpg`)));
  if (!avail.length) {
    console.warn("  ! imagem não encontrada:", base);
    return "";
  }
  const fb = avail.filter((w) => w <= maxFallback).pop() || avail[0];
  const size = jpegSize(path.join(ROOT, "images", `${base}-${fb}.jpg`));
  const webp = avail.filter((w) => existsSync(path.join(ROOT, "images", `${base}-${w}.webp`)));
  const set = (list, ext) => list.map((w) => `${root}images/${base}-${w}.${ext} ${w}w`).join(", ");
  return `<picture${cls ? ` class="${cls}"` : ""}>${
    webp.length ? `<source type="image/webp" srcset="${set(webp, "webp")}" sizes="${sizes}">` : ""
  }<img src="${root}images/${base}-${fb}.jpg" srcset="${set(avail, "jpg")}" sizes="${sizes}" alt="${esc(alt)}"${
    size ? ` width="${size[0]}" height="${size[1]}"` : ""
  } loading="${eager ? "eager" : "lazy"}" decoding="async"${eager ? ' fetchpriority="high"' : ""}></picture>`;
}

function firstImageUrl(base, widths = [1200, 800, 600, 480]) {
  const w = widths.find((w) => existsSync(path.join(ROOT, "images", `${base}-${w}.jpg`)));
  return w ? `images/${base}-${w}.jpg` : "images/hero/hero-og.jpg";
}

/* ---------------- icons ---------------- */
const ICON = {
  instagram: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="3.8"/><circle cx="17.2" cy="6.8" r=".6" class="fill"/></svg>',
  pinterest: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.7"/><path d="M10.6 19.6l1.3-5.5m-.3-1.2c.4.9 1.2 1.4 2.2 1.4 2.1 0 3.4-1.8 3.4-4.1 0-2-1.6-3.6-4-3.6-2.9 0-4.4 2-4.4 3.8 0 1 .4 1.9 1.2 2.2"/></svg>',
  etsy: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5h8.6l-.4 2.6M8 5v14m0-14H6.5M8 19h8.3l.6-2.8M8 19H6.5M8 12h5.4"/></svg>',
};

function socialLinks(cls = "social-links") {
  const items = [
    ["Instagram", SITE.instagram, ICON.instagram],
    ...(SITE.pinterest ? [["Pinterest", SITE.pinterest, ICON.pinterest]] : []),
    ["Loja na Etsy", SITE.etsy, ICON.etsy],
  ];
  return `<div class="${cls}">${items
    .map(([label, url, icon]) => `<a href="${url}" target="_blank" rel="noopener" aria-label="${label} de Mari Nunes Arts">${icon}</a>`)
    .join("")}</div>`;
}

/* ---------------- layout ---------------- */
const NAV = [
  ["index.html", "Início", "inicio"],
  ["portfolio.html", "Portfólio", "portfolio"],
  ["produtos.html", "Produtos", "produtos"],
  ["blog/", "Blog", "blog"],
  ["sobre.html", "Sobre", "sobre"],
  ["contato.html", "Contato", "contato"],
];

function head({ title, description, canonical, ogImage = "images/hero/hero-og.jpg", root = "", jsonld = [], preload = "", noindex = false, ogType = "website", extraMeta = "" }) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="author" content="${SITE.author}">
<meta name="robots" content="${noindex ? "noindex, follow" : "index, follow"}">
<link rel="canonical" href="${abs(canonical)}">
<meta property="og:type" content="${ogType}">
<meta property="og:site_name" content="${SITE.name}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${abs(canonical)}">
<meta property="og:image" content="${abs(ogImage)}">
<meta property="og:locale" content="pt_BR">
${extraMeta}<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${abs(ogImage)}">
<link rel="icon" type="image/png" sizes="32x32" href="${root}images/icons/favicon-32.png">
<link rel="apple-touch-icon" href="${root}images/icons/apple-touch-icon.png">
<meta name="theme-color" content="#F5F0E6">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400..700;1,400..700&family=Young+Serif&display=swap" rel="stylesheet">
${preload}<link rel="stylesheet" href="${root}css/style.css">
${jsonld.map((j) => `<script type="application/ld+json">\n${JSON.stringify(j, null, 2)}\n</script>`).join("\n")}
</head>`;
}

function header({ root = "", current = "", overlay = false }) {
  return `<a class="skip-link" href="#conteudo">Pular para o conteúdo</a>
<header class="site-header ${overlay ? "site-header--overlay" : "site-header--solid"}">
  <div class="header-inner">
    <a class="brand" href="${root}index.html" aria-label="Mari Nunes Arts, página inicial">Mari Nunes Arts</a>
    <nav class="main-nav" id="main-nav" aria-label="Navegação principal">
      <ul>
${NAV.map(([href, label, id]) => `        <li><a href="${root}${href}"${id === current ? ' aria-current="page"' : ""}>${label}</a></li>`).join("\n")}
      </ul>
      ${socialLinks("social-links social-links--menu")}
    </nav>
    <div class="header-actions">
      ${socialLinks()}
      <button class="nav-toggle" id="nav-toggle" type="button" aria-label="Abrir menu" aria-expanded="false" aria-controls="main-nav"><span></span><span></span></button>
    </div>
  </div>
</header>`;
}

function newsletter() {
  return `<section class="newsletter" aria-labelledby="newsletter-title">
  <div class="newsletter-inner">
    <div>
      <h2 id="newsletter-title">Cartas do ateliê</h2>
      <p>Novas pinturas, lançamentos de planners e histórias do processo criativo, direto no seu e-mail.</p>
    </div>
    <form class="newsletter-form" id="newsletter-form">
      <label class="visually-hidden" for="newsletter-email">Seu e-mail</label>
      <input type="email" id="newsletter-email" name="email" placeholder="seu@email.com" autocomplete="email" required>
      <button type="submit" class="btn btn-light">Quero receber</button>
      <p class="form-note" id="newsletter-note" role="status" aria-live="polite"></p>
    </form>
  </div>
</section>`;
}

function footer({ root = "" }) {
  return `<footer class="site-footer">
  <div class="footer-inner">
    <div class="footer-brand">
      <p class="footer-name">Mari Nunes Arts</p>
      <p>Pinturas, impressões e produtos digitais de Mariane Nunes.</p>
      <p>${SITE.city}</p>
    </div>
    <nav class="footer-col" aria-label="Rodapé">
      <p class="footer-heading">Navegue</p>
${NAV.map(([href, label]) => `      <a href="${root}${href}">${label}</a>`).join("\n")}
    </nav>
    <div class="footer-col">
      <p class="footer-heading">Acompanhe</p>
      <a href="${SITE.instagram}" target="_blank" rel="noopener">Instagram</a>
${SITE.pinterest ? `      <a href="${SITE.pinterest}" target="_blank" rel="noopener">Pinterest</a>\n` : ""}      <a href="${SITE.etsy}" target="_blank" rel="noopener">Loja na Etsy</a>
      <a href="mailto:${SITE.email}">${SITE.email}</a>
    </div>
  </div>
  <div class="footer-bottom">
    <p>© <span data-year>${YEAR}</span> Mariane Nunes. Todos os direitos reservados.</p>
    <a href="${root}privacidade.html">Política de privacidade</a>
  </div>
</footer>
<script src="${root}js/main.js" defer></script>
</body>
</html>
`;
}

function page({ root = "", current = "", overlay = false, bodyClass = "", main, headOpts }) {
  return `${head({ root, ...headOpts })}
<body class="${bodyClass}">
${header({ root, current, overlay })}
<main id="conteudo">
${main}
</main>
${footer({ root })}`;
}

/* ---------------- cards ---------------- */
function workCard(w, root, { variant = "portfolio" } = {}) {
  const details = [w.dimensions, w.year].filter(Boolean).join(", ");
  const isShop = variant === "shop";
  const meta = isShop
    ? `${shortTechnique(w.technique)}${w.format ? `, ${w.format.toLowerCase()}` : ""}`
    : shortTechnique(w.technique);
  const foot = isShop
    ? `<span class="card-price">Valor sob consulta</span>`
    : w.status
      ? `<span class="card-status card-status--${w.status}">${STATUS[w.status]}</span>`
      : "";
  return `<article class="card" data-categories="${w.categories.join(" ")}">
  <a class="card-link" href="${root}obras/${w.slug}.html">
    <div class="card-mat">${picture({ root, base: `art/${w.file}`, widths: [480, 800], sizes: "(max-width: 600px) 46vw, (max-width: 1000px) 30vw, 22vw", alt: w.alt })}</div>
    <div class="card-body">
      <h3 class="card-title">${esc(w.title)}</h3>
      <p class="card-meta">${esc(meta)}${details && !isShop ? `<br>${esc(details)}` : isShop && w.dimensions ? `<br>${esc(w.dimensions)}` : ""}</p>
      ${foot ? `<p class="card-foot">${foot}</p>` : ""}
    </div>
  </a>
</article>`;
}

function digitalCard(p, root) {
  return `<article class="card">
  <a class="card-link" href="${root}produtos/${p.slug}.html">
    <div class="card-mat card-mat--product">${picture({ root, base: p.images[0].file, widths: [600, 1200], sizes: "(max-width: 600px) 92vw, (max-width: 1000px) 46vw, 24vw", alt: p.images[0].alt, maxFallback: 600 })}</div>
    <div class="card-body">
      <h3 class="card-title">${esc(p.name)}</h3>
      <p class="card-meta">${esc(p.kind)}<br>${esc(p.cardMeta)}</p>
      <p class="card-foot"><span class="card-price">${esc(p.price)}</span><span class="card-tag">Download digital</span></p>
    </div>
  </a>
</article>`;
}

function sectionHead({ id, title, lede = "", link }) {
  return `<div class="section-head">
    <div>
      <h2 id="${id}">${title}</h2>
      ${lede ? `<p class="section-lede">${lede}</p>` : ""}
    </div>
    ${link ? `<a class="text-link" href="${link[0]}">${link[1]}</a>` : ""}
  </div>`;
}

const breadcrumb = (root, items) =>
  `<nav class="breadcrumb" aria-label="Você está em"><ol>${items
    .map(([href, label], i) =>
      i === items.length - 1 ? `<li aria-current="page">${esc(label)}</li>` : `<li><a href="${root}${href}">${esc(label)}</a></li>`
    )
    .join("")}</ol></nav>`;

const breadcrumbLd = (items) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map(([href, label], i) => ({ "@type": "ListItem", position: i + 1, name: label, item: abs(href) })),
});

// Identificador único da autora, usado em todas as páginas (Sobre, blog, artigos)
const PERSON_ID = `${SITE.url}/sobre.html#mariane-nunes`;
const authorRef = { "@type": "Person", "@id": PERSON_ID, name: "Mariane Nunes", url: abs("sobre.html") };

const personLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": PERSON_ID,
  name: "Mariane Nunes",
  alternateName: SITE.name,
  jobTitle: "Artista visual",
  description:
    "Artista brasileira de aquarela e giz pastel oleoso, inspirada no impressionismo, que também cria planners digitais inspirados em grandes pintores.",
  url: SITE.url + "/",
  image: SITE.url + "/images/profile/mariane-480.jpg",
  email: "mailto:" + SITE.email,
  address: { "@type": "PostalAddress", addressLocality: "São Paulo", addressRegion: "SP", addressCountry: "BR" },
  sameAs: [SITE.instagram, SITE.etsy, ...(SITE.pinterest ? [SITE.pinterest] : [])],
};

/* ---------------- blog: helpers ---------------- */
const postBySlug = (slug) => POSTS.find((p) => p.slug === slug);
const categoryById = (id) => CATEGORIES.find((c) => c.id === id);

// Artigo do blog que explica a técnica de uma obra (usado nas páginas das obras)
function techniquePost(w) {
  if (/^giz pastel oleoso/i.test(w.technique)) return postBySlug("giz-pastel-oleoso");
  if (/^aquarela/i.test(w.technique)) return postBySlug("pintura-aquarela-iniciantes");
  return null;
}

// Tamanhos gerados para cada pasta de imagens
const widthsFor = (src) =>
  src.startsWith("products/") ? [600, 1200] : src.startsWith("blog/") ? [480, 800, 1200, 1600] : [480, 800, 1200];

// Texto alternativo automático para obras e fotos de produtos já cadastradas
function altFor(src) {
  const w = WORKS.find((o) => `art/${o.file}` === src);
  if (w) return w.alt;
  for (const p of DIGITAL) {
    const im = p.images.find((i) => i.file === src);
    if (im) return im.alt;
  }
  return "";
}

/**
 * Figura dos artigos. kind: "art" (obra no passe-partout), "wide" (imagem inteira), "product" (quadrada).
 */
function figure({ root, src, alt, caption = "", kind, widths, sizes, eager = false, cls = "post-figure" }) {
  const k = kind || (src.startsWith("products/") ? "product" : src.startsWith("art/") ? "art" : "wide");
  const defaultSizes = { art: "(max-width: 760px) 70vw, 340px", wide: "(max-width: 760px) 92vw, 680px", product: "(max-width: 760px) 92vw, 560px" };
  const pic = picture({
    root,
    base: src,
    widths: widths || widthsFor(src),
    sizes: sizes || defaultSizes[k],
    alt: alt ?? altFor(src),
    eager,
    maxFallback: k === "wide" ? 1200 : 800,
  });
  return `<figure class="${cls} ${cls}--${k}"><div class="${cls}-frame">${pic}</div>${caption ? `<figcaption>${caption}</figcaption>` : ""}</figure>`;
}

const MONTHS = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
const fmtDate = (iso) => {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} de ${MONTHS[m - 1]} de ${y}`;
};

/**
 * Lê content/blog/<slug>.html, troca {{root}} e {{fig ...}}, remove as anotações
 * <!-- REVISAR --> e devolve o HTML, o sumário (h2) e o número de palavras.
 */
function renderPostBody(post, root) {
  const file = path.join(ROOT, "content/blog", `${post.slug}.html`);
  let html = readFileSync(file, "utf8");
  const notes = [];
  html = html.replace(/<!--\s*REVISAR([\s\S]*?)-->\s*/g, (_, t) => {
    notes.push(t.replace(/^\s*\(Mari\)/, "").replace(/^\s*:\s*/, "").trim());
    return "";
  });
  html = html.replaceAll("{{root}}", root);
  html = html.replace(/\{\{fig\s+([\s\S]*?)\}\}/g, (_, attrs) => {
    const a = {};
    attrs.replace(/(\w+)="([^"]*)"/g, (__, k, v) => {
      a[k] = v.replace(/&quot;/g, '"');
    });
    return figure({
      root,
      src: a.src,
      alt: a.alt,
      caption: a.caption || "",
      kind: a.kind,
      widths: a.widths ? a.widths.split(",").map(Number) : undefined,
    });
  });
  // tabelas largas rolam para os lados no celular: a área precisa ser acessível pelo teclado
  html = html.replace(/<div class="table-wrap">(\s*<table>\s*<caption>([^<]*)<\/caption>)/g, (_, rest, cap) => `<div class="table-wrap" tabindex="0" role="region" aria-label="${esc(cap)}">${rest}`);
  const toc = [...html.matchAll(/<h2 id="([^"]+)">([\s\S]*?)<\/h2>/g)].map((m) => [m[1], m[2].replace(/<[^>]+>/g, "")]);
  const words = html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  return { html, toc, words, notes };
}

// Pré-processa os artigos (o tempo de leitura aparece nos cards)
for (const post of POSTS) {
  post.rendered = renderPostBody(post, "../../");
  post.readingTime = Math.max(1, Math.round(post.rendered.words / 200));
}

function postCard(post, root, { wide = false } = {}) {
  const cat = categoryById(post.category);
  const isProduct = post.cover.kind === "product";
  return `<article class="card post-card${wide ? " post-card--wide" : ""}">
  <a class="card-link" href="${root}blog/${post.slug}/">
    <div class="card-mat${isProduct ? " card-mat--product" : ""}">${picture({
      root,
      base: post.cover.src,
      widths: isProduct ? [600, 1200] : [480, 800],
      sizes: wide ? "(max-width: 760px) 92vw, 36vw" : "(max-width: 600px) 92vw, (max-width: 1000px) 46vw, 30vw",
      alt: post.cover.alt,
      maxFallback: isProduct ? 600 : 800,
    })}</div>
    <div class="card-body">
      <p class="post-card-cat">${esc(cat.name)}</p>
      <h3 class="card-title">${esc(post.title)}</h3>
      <p class="card-meta">${esc(post.excerpt)}</p>
      <p class="card-foot"><span class="card-tag">Leitura de ${post.readingTime} min</span></p>
    </div>
  </a>
</article>`;
}

/* ---------------- pages ---------------- */
const out = [];
function write(rel, html) {
  const file = path.join(ROOT, rel);
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, html);
  out.push(rel);
}

const ABOUT_TITLE = "A arte sempre me chamou. Um dia, eu respondi.";

/* ---- Início ---- */
{
  const root = "";
  const hero = `<section class="hero" aria-labelledby="hero-title">
  <div class="hero-media" aria-hidden="true">
    <picture>
      <source type="image/webp" srcset="images/hero/hero-bg-1000.webp 1000w, images/hero/hero-bg-1600.webp 1600w, images/hero/hero-bg-2400.webp 2400w" sizes="100vw">
      <img src="images/hero/hero-bg-1600.jpg" alt="" width="1600" height="1757" fetchpriority="high" decoding="async">
    </picture>
  </div>
  <div class="hero-inner">
    <div class="hero-copy">
      <p class="hero-kicker">Mariane Nunes, artista visual</p>
      <h1 id="hero-title">Arte que nasce da natureza, da memória e da liberdade de sentir.</h1>
      <p class="hero-sub">Pinturas em aquarela e giz pastel oleoso, impressões e planners digitais inspirados na arte.</p>
      <div class="hero-actions">
        <a class="btn btn-light" href="produtos.html">Ver produtos</a>
        <a class="btn btn-outline-light" href="portfolio.html">Conhecer o portfólio</a>
      </div>
    </div>
    <a class="hero-label" href="obras/refugio-violeta.html">
      <span class="hero-label-title">Refúgio Violeta</span>
      <span class="hero-label-meta">Aquarela sobre papel, 2025</span>
    </a>
  </div>
</section>`;

  const products = `<section class="section" aria-labelledby="produtos-title">
  <div class="container">
  ${sectionHead({ id: "produtos-title", title: "Produtos", lede: "Planners digitais inspirados em grandes pintores e obras prontas para ganhar uma parede.", link: ["produtos.html", "Ver todos os produtos"] })}
  <div class="grid grid--4">
${DIGITAL.map((p) => digitalCard(p, root)).join("\n")}
${["refugio-violeta", "veneza-ao-entardecer"].map((s) => workCard(bySlug(s), root, { variant: "shop" })).join("\n")}
  </div>
  </div>
</section>`;

  const statement = `<section class="statement" aria-label="Manifesto">
  <div class="container statement-inner">
    <p class="statement-quote">A arte não precisa ser perfeita para ser bonita. Ela precisa ser sentida.</p>
    <p class="statement-text">Em cada pintura, procuro registrar não apenas aquilo que vejo, mas também a emoção que uma paisagem, uma cor ou um instante desperta em mim.</p>
  </div>
</section>`;

  const studio = `<section class="section" aria-labelledby="atelie-title">
  <div class="container">
  ${sectionHead({ id: "atelie-title", title: "Do ateliê", lede: "Pinturas recentes em aquarela e giz pastel oleoso.", link: ["portfolio.html", "Ver o portfólio completo"] })}
  <div class="grid grid--3">
${HOME_STUDIO.map((s) => workCard(bySlug(s), root)).join("\n")}
  </div>
  </div>
</section>`;

  const about = `<section class="section section--mist" aria-labelledby="sobre-title">
  <div class="container about-teaser">
    <div class="about-photo">${picture({ root, base: "profile/mariane", widths: [480], sizes: "(max-width: 860px) 70vw, 30vw", alt: "Retrato de Mariane Nunes, artista da Mari Nunes Arts" })}</div>
    <div class="about-copy">
      <h2 id="sobre-title">${ABOUT_TITLE}</h2>
      <p>Por muito tempo achei que a arte não era um caminho possível para mim. Até que deixei o medo de lado e fiz meus primeiros desenhos. Foi no giz pastel oleoso que encontrei minha primeira paixão; depois vieram a aquarela, os cursos e muitas experiências com materiais.</p>
      <p>Hoje pinto paisagens, memórias e pequenos instantes, inspirada em Monet, Degas e Van Gogh, e levo essa paixão também para planners digitais.</p>
      <a class="text-link" href="sobre.html">Conheça minha história</a>
    </div>
  </div>
</section>`;

  write(
    "index.html",
    page({
      root,
      current: "inicio",
      overlay: true,
      bodyClass: "page-home",
      headOpts: {
        title: "Mari Nunes Arts | Pinturas, impressões e planners digitais",
        description:
          "Pinturas em aquarela e giz pastel oleoso de Mariane Nunes, impressões artísticas e planners digitais inspirados em Van Gogh e no impressionismo.",
        canonical: "index.html",
        preload: `<link rel="preload" as="image" type="image/webp" imagesrcset="images/hero/hero-bg-1000.webp 1000w, images/hero/hero-bg-1600.webp 1600w, images/hero/hero-bg-2400.webp 2400w" imagesizes="100vw">\n`,
        jsonld: [personLd],
      },
      main: [hero, products, statement, studio, about, newsletter()].join("\n\n"),
    })
  );
}

/* ---- Portfólio ---- */
{
  const root = "";
  const main = `<section class="page-intro">
  <div class="container">
    <h1>Portfólio</h1>
    <p class="page-lede">Paisagens, memórias e pequenos instantes em aquarela, giz pastel oleoso e técnica mista. Clique numa obra para ver detalhes e disponibilidade.</p>
  </div>
</section>
<section class="section section--tight" aria-label="Obras">
  <div class="container">
    <div class="filters" role="group" aria-label="Filtrar obras">
${FILTERS.map((f, i) => `      <button type="button" class="filter-btn" data-filter="${f.id}" aria-pressed="${i === 0}">${f.label}</button>`).join("\n")}
    </div>
    <div class="grid grid--3" id="gallery">
${WORKS.map((w) => workCard(w, root)).join("\n")}
    </div>
    <p class="gallery-empty" id="gallery-empty" hidden>Ainda não há obras nesta categoria.</p>
  </div>
</section>`;
  write(
    "portfolio.html",
    page({
      root,
      current: "portfolio",
      headOpts: {
        title: "Portfólio | Mari Nunes Arts",
        description: "Todas as pinturas de Mariane Nunes em aquarela, giz pastel oleoso e técnica mista: paisagens, animais e memórias.",
        canonical: "portfolio.html",
        jsonld: [
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            itemListElement: WORKS.map((w, i) => ({ "@type": "ListItem", position: i + 1, url: abs(`obras/${w.slug}.html`), name: w.title })),
          },
        ],
      },
      main,
    })
  );
}

/* ---- Página de cada obra ---- */
WORKS.forEach((w, i) => {
  const root = "../";
  const prev = WORKS[(i - 1 + WORKS.length) % WORKS.length];
  const next = WORKS[(i + 1) % WORKS.length];
  const specs = [
    ["Técnica", w.technique],
    ["Dimensões", w.dimensions],
    ["Ano", w.year],
    ["Formato", w.format],
    ["Situação", w.status ? STATUS[w.status] : "Consulte a disponibilidade"],
  ].filter(([, v]) => v);

  let actions = "";
  if (w.status === "disponivel") {
    actions = `<a class="btn btn-primary" href="${contactUrl(root, { assunto: "Comprar uma obra", obra: w.title })}">Tenho interesse nesta obra</a>`;
  } else if (w.status === "colecao-particular" || w.status === "vendida") {
    actions = `<a class="btn btn-primary" href="${contactUrl(root, { assunto: "Solicitar uma encomenda", obra: w.title })}">Encomendar uma obra parecida</a>`;
  } else {
    actions = `<a class="btn btn-primary" href="${contactUrl(root, { assunto: "Comprar uma obra", obra: w.title })}">Perguntar sobre esta obra</a>`;
  }
  if (w.etsy) actions += `<a class="btn btn-outline" href="${w.etsy.url}" target="_blank" rel="noopener">${esc(w.etsy.label)}</a>`;

  const related = WORKS.filter((o) => o.slug !== w.slug && o.categories.some((c) => w.categories.includes(c) && c !== "colecoes")).slice(0, 3);

  const mockups = (w.mockups || []).filter((m) => existsSync(path.join(ROOT, "images", `${m.file}-1000.jpg`)));
  const main = `<div class="container">
  ${breadcrumb(root, [["index.html", "Início"], ["portfolio.html", "Portfólio"], [`obras/${w.slug}.html`, w.title]])}
</div>
<article class="work container">
  <div class="work-media">${picture({ root, base: `art/${w.file}`, widths: [480, 800, 1200], sizes: "(max-width: 960px) 92vw, 55vw", alt: w.alt, eager: true, maxFallback: 1200 })}</div>
  <div class="work-info">
    <h1>${esc(w.title)}</h1>
    <dl class="specs">
${specs.map(([k, v]) => `      <div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join("\n")}
    </dl>
    <div class="work-desc">${w.description.map((p) => `<p>${esc(p)}</p>`).join("")}</div>
    ${w.etsy?.note ? `<p class="work-note">${esc(w.etsy.note)}</p>` : ""}
    <div class="work-actions">${actions}</div>
    ${w.instagram ? `<a class="text-link" href="${w.instagram}" target="_blank" rel="noopener">Ver a publicação no Instagram</a>` : ""}
    ${techniquePost(w) ? `<p class="work-read">Sobre a técnica, no Diário do Ateliê: <a href="${root}blog/${techniquePost(w).slug}/">${esc(techniquePost(w).title)}</a></p>` : ""}
  </div>
</article>
${
  mockups.length
    ? `<section class="section section--tight" aria-labelledby="parede-title">
  <div class="container">
    <h2 id="parede-title" class="h3">Na parede</h2>
    <div class="wall-grid wall-grid--${mockups.length}">
${mockups.map((m) => `      <figure>${picture({ root, base: m.file, widths: [640, 1000], sizes: "(max-width: 700px) 92vw, 45vw", alt: m.alt, maxFallback: 1000 })}</figure>`).join("\n")}
    </div>
  </div>
</section>`
    : ""
}
<nav class="container work-nav" aria-label="Outras obras">
  <a href="${prev.slug}.html" rel="prev"><span>Obra anterior</span>${esc(prev.title)}</a>
  <a href="${next.slug}.html" rel="next"><span>Próxima obra</span>${esc(next.title)}</a>
</nav>
${
  related.length
    ? `<section class="section section--mist" aria-labelledby="relacionadas-title">
  <div class="container">
  ${sectionHead({ id: "relacionadas-title", title: "Outras obras", link: [`${root}portfolio.html`, "Ver o portfólio completo"] })}
  <div class="grid grid--3">
${related.map((o) => workCard(o, root)).join("\n")}
  </div>
  </div>
</section>`
    : ""
}`;

  write(
    `obras/${w.slug}.html`,
    page({
      root,
      current: "portfolio",
      bodyClass: "page-work",
      headOpts: {
        title: `${w.title} | Mari Nunes Arts`,
        description: `${w.title}, ${w.technique.toLowerCase()}${w.year ? `, ${w.year}` : ""}. ${w.description[0]}`.slice(0, 300),
        canonical: `obras/${w.slug}.html`,
        ogImage: firstImageUrl(`art/${w.file}`),
        ogType: "article",
        jsonld: [
          {
            "@context": "https://schema.org",
            "@type": "VisualArtwork",
            name: w.title,
            artform: "Pintura",
            artMedium: w.technique,
            ...(w.year ? { dateCreated: w.year } : {}),
            creator: authorRef,
            image: abs(firstImageUrl(`art/${w.file}`)),
            description: w.description.join(" "),
            url: abs(`obras/${w.slug}.html`),
          },
          breadcrumbLd([["index.html", "Início"], ["portfolio.html", "Portfólio"], [`obras/${w.slug}.html`, w.title]]),
        ],
      },
      main,
    })
  );
});

/* ---- Produtos ---- */
{
  const root = "";
  const categories = [...new Set(DIGITAL.map((p) => p.category))];
  const main = `<section class="page-intro">
  <div class="container">
    <h1>Produtos</h1>
    <p class="page-lede">Planners digitais inspirados em grandes pintores, obras originais e impressões das minhas pinturas.</p>
  </div>
</section>
${categories
  .map(
    (cat) => `<section class="section section--tight" aria-labelledby="digitais-title">
  <div class="container">
  ${sectionHead({ id: "digitais-title", title: `${cat} digitais`, lede: "Para organizar a rotina com arte. Compra segura e download imediato pela Etsy." })}
  <div class="grid grid--4">
${DIGITAL.filter((p) => p.category === cat).map((p) => digitalCard(p, root)).join("\n")}
  </div>
  </div>
</section>`
  )
  .join("\n")}
<section class="section section--tight" aria-labelledby="obras-title">
  <div class="container">
  ${sectionHead({ id: "obras-title", title: "Obras originais e impressões", lede: "Peças prontas para encontrar um novo lar. O valor é combinado diretamente comigo." })}
  <div class="grid grid--4">
${SHOP_WORKS.map((s) => workCard(bySlug(s), root, { variant: "shop" })).join("\n")}
  </div>
  </div>
</section>
<section class="section">
  <div class="container commission">
    <h2>Quer uma obra feita para você?</h2>
    <p>Conte qual paisagem, lembrança ou cor você gostaria de ver na sua parede e eu respondo com prazos e valores.</p>
    <a class="btn btn-primary" href="${contactUrl(root, { assunto: "Solicitar uma encomenda" })}">Solicitar uma encomenda</a>
  </div>
</section>`;
  write(
    "produtos.html",
    page({
      root,
      current: "produtos",
      headOpts: {
        title: "Produtos | Planners digitais, obras e impressões | Mari Nunes Arts",
        description: "Planners digitais inspirados em Van Gogh e no impressionismo, obras originais e impressões artísticas de Mariane Nunes.",
        canonical: "produtos.html",
      },
      main,
    })
  );
}

/* ---- Página de cada produto digital ---- */
DIGITAL.forEach((p) => {
  const root = "../";
  const others = DIGITAL.filter((o) => o.slug !== p.slug);
  const gallery = `<div class="product-gallery" data-gallery>
    <div class="product-main card-mat--product">${picture({ root, base: p.images[0].file, widths: [600, 1200], sizes: "(max-width: 960px) 92vw, 50vw", alt: p.images[0].alt, eager: true, maxFallback: 1200 })}</div>
    <ul class="product-thumbs" aria-label="Mais imagens">
${p.images
  .map(
    (im, i) => `      <li><button type="button" aria-label="Ver imagem ${i + 1} de ${p.images.length}" aria-current="${i === 0}" data-full="${root}images/${im.file}-1200.jpg" data-full-webp="${root}images/${im.file}-1200.webp" data-alt="${esc(im.alt)}">${picture({ root, base: im.file, widths: [600], sizes: "120px", alt: "" })}</button></li>`
  )
  .join("\n")}
    </ul>
  </div>`;
  const main = `<div class="container">
  ${breadcrumb(root, [["index.html", "Início"], ["produtos.html", "Produtos"], [`produtos/${p.slug}.html`, p.name]])}
</div>
<article class="work product container">
  ${gallery}
  <div class="work-info">
    <p class="product-kind">${esc(p.kind)}</p>
    <h1>${esc(p.name)}</h1>
    <p class="product-price">${esc(p.price)} <span>download digital</span></p>
    <div class="work-desc"><p>${esc(p.summary)}</p></div>
    <div class="work-actions">
      <a class="btn btn-primary" href="${p.etsy}" target="_blank" rel="noopener">Comprar na Etsy</a>
    </div>
    <p class="work-note">O pagamento e o download acontecem pela Etsy. O arquivo fica disponível assim que a compra é confirmada.</p>
    <dl class="specs">
${p.specs.map(([k, v]) => `      <div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join("\n")}
    </dl>
  </div>
</article>
<section class="section section--tight" aria-labelledby="inclui-title">
  <div class="container product-details">
    <div>
      <h2 id="inclui-title" class="h3">O que vem no planner</h2>
      <ul class="check-list">
${p.includes.map((t) => `        <li>${esc(t)}</li>`).join("\n")}
      </ul>
    </div>
    <div>
      <h2 class="h3">Como usar</h2>
      <ol class="step-list">
${HOW_TO_USE.map((t) => `        <li>${esc(t)}</li>`).join("\n")}
      </ol>
      <p class="work-note">Produto digital: nada é enviado pelo correio. O tablet, a caneta e os apps não estão incluídos.</p>
      ${postBySlug("como-usar-planner-digital") ? `<p class="work-read">Guia completo, no Diário do Ateliê: <a href="${root}blog/como-usar-planner-digital/">${esc(postBySlug("como-usar-planner-digital").title)}</a></p>` : ""}
    </div>
  </div>
</section>
${
  others.length
    ? `<section class="section section--mist" aria-labelledby="outros-title">
  <div class="container">
  ${sectionHead({ id: "outros-title", title: "Você também pode gostar", link: [`${root}produtos.html`, "Ver todos os produtos"] })}
  <div class="grid grid--4">
${others.map((o) => digitalCard(o, root)).join("\n")}
  </div>
  </div>
</section>`
    : ""
}`;
  write(
    `produtos/${p.slug}.html`,
    page({
      root,
      current: "produtos",
      bodyClass: "page-product",
      headOpts: {
        title: `${p.name}: ${p.kind} | Mari Nunes Arts`,
        description: p.summary.slice(0, 300),
        canonical: `produtos/${p.slug}.html`,
        ogImage: `images/${p.images[0].file}-1200.jpg`,
        ogType: "product",
        jsonld: [
          {
            "@context": "https://schema.org",
            "@type": "Product",
            name: `${p.name} — ${p.kind}`,
            description: p.summary,
            image: p.images.map((im) => abs(`images/${im.file}-1200.jpg`)),
            brand: { "@type": "Brand", name: SITE.name },
            offers: { "@type": "Offer", price: p.priceValue, priceCurrency: p.currency, availability: "https://schema.org/InStock", url: p.etsy },
          },
          breadcrumbLd([["index.html", "Início"], ["produtos.html", "Produtos"], [`produtos/${p.slug}.html`, p.name]]),
        ],
      },
      main,
    })
  );
});

/* ---- Sobre ---- */
{
  const root = "";
  const steps = [
    ["Referência", "Uma paisagem, uma foto ou uma memória que pede para ser registrada."],
    ["Paleta de cores", "Testes livres até encontrar a combinação que traduz a sensação certa."],
    ["Primeiras camadas", "A água ou o giz encontram o papel, ainda sem compromisso com a forma final."],
    ["Textura e movimento", "Camadas se sobrepõem, o pastel se funde, a aquarela se espalha por conta própria."],
    ["Obra finalizada", "O instante fica registrado, pronto para ganhar um novo lar."],
  ];
  const influences = [
    ["Lugares e temas", [["Natureza e jardins", "Canteiros, folhagens e o crescimento silencioso das plantas."], ["Paisagens rurais", "Casas simples, campos abertos e o horizonte ao entardecer."], ["Céus e luz natural", "A forma como a luz muda uma paisagem em minutos."]]],
    ["Artistas", [["Claude Monet", "A luz como protagonista: cada instante do dia merece sua própria paleta."], ["Edgar Degas", "Movimento capturado com liberdade, sem medo do gesto imperfeito."], ["Vincent van Gogh", "Cor e textura como extensão direta da emoção."]]],
    ["Linguagens", [["Impressionismo", "A pintura como sensação, não como cópia fiel do real."], ["Arte abstrata e moderna", "Espaço para que cada obra encontre sua própria forma."]]],
  ];
  const main = `<section class="about-page container">
  <div class="about-photo about-photo--sticky">${picture({ root, base: "profile/mariane", widths: [480], sizes: "(max-width: 900px) 70vw, 340px", alt: "Retrato de Mariane Nunes, artista da Mari Nunes Arts", eager: true })}</div>
  <div class="about-copy prose">
    <p class="page-kicker">Sobre a Mari</p>
    <h1>${ABOUT_TITLE}</h1>
    <p>Meu nome é Mariane e, desde sempre, a arte exerce um fascínio profundo sobre mim. Eu poderia passar horas observando artistas transformarem uma folha em branco em algo capaz de despertar sentimentos, memórias e novas formas de enxergar o mundo.</p>
    <p>Durante muito tempo, porém, acreditei que a arte não era um caminho possível para mim. Por quase 30 anos, admirei pinturas e desenhos à distância, convencida de que não tinha talento suficiente para criar. Eu me encantava com o processo, mas não me permitia experimentar.</p>
    <p>Até que, aos 30 anos, decidi deixar o medo de lado e fazer meus primeiros desenhos e pinturas. Foi no giz pastel oleoso que encontrei minha primeira grande paixão: suas cores intensas, sua textura e a liberdade de criar sem buscar formas absolutamente perfeitas despertaram algo que sempre esteve dentro de mim.</p>
    <p>Depois vieram a aquarela e a tinta acrílica. Estudei técnicas, fiz cursos, experimentei materiais e busquei compreender melhor não apenas como pintar, mas como encontrar minha própria maneira de me expressar.</p>
    <p>Hoje, sinto que chegou o momento de compartilhar com o mundo tudo o que venho construindo. Minha produção está concentrada principalmente na aquarela e no giz pastel oleoso. Gosto de retratar paisagens naturais e encontro inspiração no movimento, na luz e nas cores de artistas impressionistas como Monet, Degas e Van Gogh. Também exploro a arte abstrata e moderna, permitindo que cada obra encontre seu próprio caminho.</p>
    <p>Essa paixão também virou produtos digitais: planners inspirados em grandes pintores, para que a arte faça parte da rotina de quem organiza os próprios dias.</p>
    <p>Para mim, a arte vai muito além do realismo. Não pinto apenas o que vejo: pinto o que sinto. Procuro criar com liberdade, sem me prender à perfeição das formas, transformando cores, paisagens e emoções em registros de um instante.</p>
    <p>Minha história com a arte também é uma história sobre recomeços. Sobre perceber que nunca é tarde para experimentar, aprender e dar espaço àquilo que sempre nos chamou por dentro.</p>
    <blockquote class="pull-quote">Não pinto apenas o que vejo: pinto o que sinto.</blockquote>
  </div>
</section>
<section class="statement" aria-label="Manifesto">
  <div class="container statement-inner">
    <p class="statement-quote">A arte não precisa ser perfeita para ser bonita. Ela precisa ser sentida.</p>
    <p class="statement-text">Em cada pintura, procuro registrar não apenas aquilo que vejo, mas também a emoção que uma paisagem, uma cor ou um instante desperta em mim.</p>
  </div>
</section>
<section class="section" aria-labelledby="processo-title">
  <div class="container">
    ${sectionHead({ id: "processo-title", title: "Entre cores e sensações", lede: "Meu processo começa com uma sensação: a luz de uma paisagem, a combinação inesperada de duas cores ou uma lembrança que desejo preservar. A partir disso, construo cada obra de forma intuitiva, deixando que o material também participe da criação." })}
    <ol class="process-steps">
${steps.map(([t, d], i) => `      <li><span class="step-swatch step-swatch--${i + 1}" aria-hidden="true"></span><h3>${t}</h3><p>${d}</p></li>`).join("\n")}
    </ol>
    <div class="process-gallery">
      <figure>${picture({ root, base: "mockup/refugio-violeta-ambiente", widths: [640, 1000], sizes: "(max-width: 700px) 92vw, 30vw", alt: "Refúgio Violeta emoldurada e exposta em uma sala de estar aconchegante", maxFallback: 1000 })}</figure>
      <figure>${picture({ root, base: "mockup/veneza-ambiente", widths: [640, 1000], sizes: "(max-width: 700px) 92vw, 30vw", alt: "Veneza ao Entardecer emoldurada em um ambiente residencial", maxFallback: 1000 })}</figure>
      <figure>${picture({ root, base: "mockup/solidao-ambiente", widths: [640, 1000], sizes: "(max-width: 700px) 92vw, 30vw", alt: "Solidão emoldurada sobre um aparador, ao lado de uma vela acesa", maxFallback: 1000 })}</figure>
    </div>
    <p class="process-caption">Do papel à parede: cada obra ganha um novo lar e continua contando sua história.</p>
  </div>
</section>
<section class="section section--mist" aria-labelledby="influencias-title">
  <div class="container">
    ${sectionHead({ id: "influencias-title", title: "Influências e inspirações" })}
    <div class="influences">
${influences
  .map(
    ([group, items]) => `      <div class="influence-group">
        <h3>${group}</h3>
        <dl>
${items.map(([t, d]) => `          <div><dt>${t}</dt><dd>${d}</dd></div>`).join("\n")}
        </dl>
      </div>`
  )
  .join("\n")}
    </div>
  </div>
</section>
<section class="section">
  <div class="container commission">
    <h2>Vamos criar algo juntas?</h2>
    <p>Encomendas, licenciamento, parcerias e exposições: me conte sua ideia.</p>
    <a class="btn btn-primary" href="contato.html">Entrar em contato</a>
  </div>
</section>`;
  write(
    "sobre.html",
    page({
      root,
      current: "sobre",
      headOpts: {
        title: "Sobre Mariane Nunes | Mari Nunes Arts",
        description: "A história de Mariane Nunes, artista de aquarela e giz pastel oleoso que um dia decidiu responder ao chamado da arte.",
        canonical: "sobre.html",
        ogImage: "images/profile/mariane-480.jpg",
        jsonld: [personLd],
      },
      main,
    })
  );
}

/* ---- Contato ---- */
{
  const root = "";
  const subjects = ["Comprar uma obra", "Solicitar uma encomenda", "Dúvida sobre um produto digital", "Licenciamento", "Parcerias", "Exposições", "Outros"];
  const main = `<section class="contact-page container">
  <div class="contact-intro">
    <h1>Vamos conversar</h1>
    <p>Se alguma obra despertou uma lembrança, uma sensação ou simplesmente fez você querer observá-la por mais tempo, vou adorar conversar. Também respondo sobre encomendas, planners e parcerias.</p>
    <p class="contact-email"><a href="mailto:${SITE.email}">${SITE.email}</a></p>
    <p class="contact-location">${SITE.city}</p>
    ${socialLinks("social-links social-links--inline")}
  </div>
  <form class="contact-form" id="contact-form" novalidate>
    <div class="form-row">
      <label for="nome">Nome</label>
      <input type="text" id="nome" name="nome" autocomplete="name" required>
    </div>
    <div class="form-row">
      <label for="email">E-mail</label>
      <input type="email" id="email" name="email" autocomplete="email" required>
    </div>
    <div class="form-row">
      <label for="assunto">Assunto</label>
      <select id="assunto" name="assunto" required>
        <option value="">Selecione</option>
${subjects.map((s) => `        <option value="${s}">${s}</option>`).join("\n")}
      </select>
    </div>
    <div class="form-row">
      <label for="obra">Obra ou produto <span class="optional">(opcional)</span></label>
      <select id="obra" name="obra">
        <option value="">Nenhum em especial</option>
        <optgroup label="Obras">
${WORKS.map((w) => `          <option value="${esc(w.title)}">${esc(w.title)}</option>`).join("\n")}
        </optgroup>
        <optgroup label="Produtos digitais">
${DIGITAL.map((p) => `          <option value="${esc(p.name)}">${esc(p.name)}</option>`).join("\n")}
        </optgroup>
      </select>
    </div>
    <div class="form-row">
      <label for="mensagem">Mensagem</label>
      <textarea id="mensagem" name="mensagem" rows="6" required></textarea>
    </div>
    <button type="submit" class="btn btn-primary">Enviar mensagem</button>
    <p class="form-note" id="form-note" role="status" aria-live="polite"></p>
  </form>
</section>`;
  write(
    "contato.html",
    page({
      root,
      current: "contato",
      headOpts: {
        title: "Contato | Mari Nunes Arts",
        description: "Fale com Mariane Nunes sobre compra de obras, encomendas, planners digitais, licenciamento e parcerias.",
        canonical: "contato.html",
      },
      main,
    })
  );
}

/* ---- Privacidade ---- */
{
  const root = "";
  const main = `<section class="legal container prose">
  <h1>Política de privacidade</h1>
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
  <p>Este site não usa cookies de rastreamento próprios além dos necessários para o seu funcionamento básico.</p>
</section>`;
  write(
    "privacidade.html",
    page({
      root,
      headOpts: {
        title: "Política de privacidade | Mari Nunes Arts",
        description: "Política de privacidade do site Mari Nunes Arts.",
        canonical: "privacidade.html",
        noindex: true,
      },
      main,
    })
  );
}

/* ---- Blog: página principal ---- */
const BLOG_ID = `${abs("blog/")}#blog`;
{
  const root = "../";
  const activeCats = CATEGORIES.filter((c) => POSTS.some((p) => p.category === c.id));
  const count = (id) => POSTS.filter((p) => p.category === id).length;
  const main = `<section class="page-intro blog-intro">
  <div class="container">
    <h1>${esc(BLOG.title)}</h1>
    <p class="page-lede">${esc(BLOG.intro)}</p>
    <nav class="blog-cats" aria-label="Categorias do blog">
      <ul>
${activeCats
  .map(
    (c) =>
      `        <li><a href="#${c.id}">${esc(c.name)}<span class="blog-cats-count">${count(c.id)}<span class="visually-hidden"> ${count(c.id) === 1 ? "artigo" : "artigos"}</span></span></a></li>`
  )
  .join("\n")}
      </ul>
    </nav>
  </div>
</section>
${activeCats
  .map((c) => {
    const posts = POSTS.filter((p) => p.category === c.id);
    return `<section class="section section--tight blog-section" id="${c.id}" aria-labelledby="${c.id}-title">
  <div class="container">
  ${sectionHead({ id: `${c.id}-title`, title: esc(c.name), lede: esc(c.description) })}
  <div class="post-grid${posts.length === 1 ? " post-grid--single" : ""}">
${posts.map((p) => postCard(p, root, { wide: posts.length === 1 })).join("\n")}
  </div>
  </div>
</section>`;
  })
  .join("\n")}
${newsletter()}`;
  write(
    "blog/index.html",
    page({
      root,
      current: "blog",
      bodyClass: "page-blog",
      headOpts: {
        title: BLOG.seoTitle,
        description: BLOG.description,
        canonical: "blog/",
        ogImage: firstImageUrl(POSTS[0].cover.src),
        jsonld: [
          {
            "@context": "https://schema.org",
            "@type": "Blog",
            "@id": BLOG_ID,
            name: BLOG.title,
            description: BLOG.description,
            url: abs("blog/"),
            inLanguage: "pt-BR",
            author: authorRef,
            publisher: authorRef,
            blogPost: POSTS.map((p) => ({
              "@type": "BlogPosting",
              "@id": `${abs(`blog/${p.slug}/`)}#artigo`,
              headline: p.title,
              url: abs(`blog/${p.slug}/`),
              image: abs(firstImageUrl(p.cover.src)),
              author: authorRef,
              ...(p.published ? { datePublished: p.published } : {}),
            })),
          },
          breadcrumbLd([["index.html", "Início"], ["blog/", "Blog"]]),
        ],
      },
      main,
    })
  );
}

/* ---- Blog: página de cada artigo ---- */
POSTS.forEach((post) => {
  const root = "../../";
  const cat = categoryById(post.category);
  const { html, toc, words } = post.rendered;
  const related = post.related.map(postBySlug).filter(Boolean);
  const url = `blog/${post.slug}/`;
  const crumbs = [["index.html", "Início"], ["blog/", "Blog"], [url, post.title]];
  const coverSizes = { wide: "(max-width: 1000px) 92vw, 820px", art: "(max-width: 760px) 80vw, 460px", product: "(max-width: 760px) 92vw, 600px" };
  const dateLine = post.published
    ? `<span>${post.updated ? "Atualizado em " : "Publicado em "}<time datetime="${post.updated || post.published}">${fmtDate(post.updated || post.published)}</time></span>`
    : "";
  const sources = post.sources.length
    ? `<section class="post-sources" aria-labelledby="fontes-title">
        <h2 id="fontes-title">Fontes</h2>
        <ol>
${post.sources.map((s) => `          <li><a href="${s.url}" target="_blank" rel="noopener">${esc(s.title)}</a>, ${esc(s.publisher)}</li>`).join("\n")}
        </ol>
      </section>`
    : "";
  const main = `<div class="post-wrap post-top">
  ${breadcrumb(root, crumbs)}
</div>
<article class="post">
  <header class="post-wrap post-header">
    <a class="post-category" href="${root}blog/#${cat.id}">${esc(cat.name)}</a>
    <h1>${esc(post.title)}</h1>
    <p class="post-dek">${esc(post.dek)}</p>
    <p class="post-byline"><span>Por <a href="${root}sobre.html" rel="author">Mariane Nunes</a></span>${dateLine}<span>Leitura de ${post.readingTime} minutos</span></p>
  </header>
  <div class="post-wrap post-layout">
    ${figure({
      root,
      src: post.cover.src,
      alt: post.cover.alt,
      caption: (post.cover.caption || "").replaceAll("{{root}}", root),
      kind: post.cover.kind,
      sizes: coverSizes[post.cover.kind],
      eager: true,
      cls: "post-cover",
    })}
    <nav class="post-toc" aria-labelledby="toc-title">
      <p class="post-toc-title" id="toc-title">Neste artigo</p>
      <ol>
${toc.map(([id, t]) => `        <li><a href="#${id}">${esc(t)}</a></li>`).join("\n")}
      </ol>
    </nav>
    <div class="post-body">
${html}
      ${sources}
      <aside class="author-box" aria-labelledby="autora-title">
        ${picture({ root, base: "profile/mariane", widths: [480], sizes: "96px", alt: "Retrato de Mariane Nunes" })}
        <div>
          <h2 class="h3" id="autora-title">Sobre a autora</h2>
          <p>Mariane Nunes é artista visual em São Paulo. Pinta principalmente em aquarela e giz pastel oleoso, inspirada em Monet, Degas e Van Gogh, e cria planners digitais inspirados em grandes pintores.</p>
          <a class="text-link" href="${root}sobre.html">Conheça a história da Mari</a>
        </div>
      </aside>
    </div>
  </div>
</article>
<section class="section section--tight" aria-labelledby="cta-title">
  <div class="container commission post-cta">
    <h2 id="cta-title">${esc(post.cta.title)}</h2>
    <p>${esc(post.cta.text)}</p>
    <a class="btn btn-primary" href="${root}${post.cta.href}">${esc(post.cta.label)}</a>
  </div>
</section>
${
  related.length
    ? `<section class="section section--mist" aria-labelledby="continue-title">
  <div class="container">
  ${sectionHead({ id: "continue-title", title: "Continue lendo", link: [`${root}blog/`, "Ver todos os artigos"] })}
  <div class="post-grid">
${related.map((r) => postCard(r, root)).join("\n")}
  </div>
  </div>
</section>`
    : ""
}`;

  const lastDate = post.updated || post.published;
  write(
    `${url}index.html`,
    page({
      root,
      current: "blog",
      bodyClass: "page-post",
      headOpts: {
        title: post.seoTitle,
        description: post.description,
        canonical: url,
        ogImage: firstImageUrl(post.cover.src),
        ogType: "article",
        extraMeta: [
          `<meta property="article:section" content="${esc(cat.name)}">`,
          `<meta property="article:author" content="${abs("sobre.html")}">`,
          post.published ? `<meta property="article:published_time" content="${post.published}">` : "",
          lastDate ? `<meta property="article:modified_time" content="${lastDate}">` : "",
        ]
          .filter(Boolean)
          .map((m) => m + "\n")
          .join(""),
        jsonld: [
          {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "@id": `${abs(url)}#artigo`,
            headline: post.title,
            description: post.description,
            image: [abs(firstImageUrl(post.cover.src))],
            author: authorRef,
            publisher: authorRef,
            url: abs(url),
            mainEntityOfPage: abs(url),
            inLanguage: "pt-BR",
            articleSection: cat.name,
            keywords: post.keywords.join(", "),
            wordCount: words,
            isPartOf: { "@type": "Blog", "@id": BLOG_ID, name: BLOG.title, url: abs("blog/") },
            ...(post.published ? { datePublished: post.published } : {}),
            ...(lastDate ? { dateModified: lastDate } : {}),
            ...(post.sources.length
              ? {
                  citation: post.sources.map((s) => ({
                    "@type": "CreativeWork",
                    name: s.title,
                    url: s.url,
                    publisher: { "@type": "Organization", name: s.publisher },
                  })),
                }
              : {}),
          },
          breadcrumbLd(crumbs),
        ],
      },
      main,
    })
  );
});

/* ---- Sitemap ---- */
{
  const urls = [
    ["", "weekly", "1.0"],
    ["produtos.html", "weekly", "0.9"],
    ["portfolio.html", "weekly", "0.9"],
    ...DIGITAL.map((p) => [`produtos/${p.slug}.html`, "monthly", "0.8"]),
    ...WORKS.map((w) => [`obras/${w.slug}.html`, "monthly", "0.7"]),
    ["blog/", "weekly", "0.8"],
    ...POSTS.map((p) => [`blog/${p.slug}/`, "monthly", "0.7", p.updated || p.published]),
    ["sobre.html", "monthly", "0.6"],
    ["contato.html", "yearly", "0.5"],
  ];
  writeFileSync(
    path.join(ROOT, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    ([u, f, p, lastmod]) =>
      `  <url>\n    <loc>${SITE.url}/${u}</loc>\n${lastmod ? `    <lastmod>${lastmod}</lastmod>\n` : ""}    <changefreq>${f}</changefreq>\n    <priority>${p}</priority>\n  </url>`
  )
  .join("\n")}
</urlset>
`
  );
  out.push("sitemap.xml");
}

console.log(`Site gerado: ${out.length} arquivos`);
out.forEach((f) => console.log("  " + f));

// Anotações para revisão nos artigos (não aparecem no site)
const pending = POSTS.flatMap((p) => p.rendered.notes.map((n) => `  [${p.slug}] ${n}`));
const undated = POSTS.filter((p) => !p.published).map((p) => p.slug);
if (pending.length) console.log(`\nAnotações REVISAR nos artigos (${pending.length}):\n${pending.join("\n")}`);
if (undated.length) console.log(`\nArtigos sem data de publicação (preencha "published" em scripts/blog-data.mjs ao publicar): ${undated.join(", ")}`);
