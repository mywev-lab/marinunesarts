// =========================================================
// Mari Nunes Arts — gera as imagens otimizadas do site
// Uso:  npm install   (uma vez, para instalar o sharp)
//       npm run images
// Lê os arquivos originais (peças/, mockups/) e grava em images/
// versões WebP + JPG em vários tamanhos. Depois rode  npm run build.
// =========================================================

import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT = path.join(ROOT, "images");

const WIDTHS = {
  art: [480, 800, 1200],
  product: [600, 1200],
  wide: [640, 1000, 1600, 2200],
  portrait: [480, 800, 1100],
};

async function ensure(dir) {
  await mkdir(dir, { recursive: true });
}

/** Abre a imagem já girada e, se pedido, recortada (cropTop = fração da altura a manter, a partir do topo). */
async function open(srcPath, { cropTop } = {}) {
  const img = sharp(srcPath, { limitInputPixels: false }).rotate();
  if (!cropTop) return img;
  const meta = await sharp(srcPath, { limitInputPixels: false }).metadata();
  return img.extract({ left: 0, top: 0, width: meta.width, height: Math.round(meta.height * cropTop) });
}

async function makeSet(srcPath, outBase, widths, { quality = 82, cropTop } = {}) {
  await ensure(path.dirname(path.join(OUT, outBase)));
  const meta = await sharp(srcPath, { limitInputPixels: false }).metadata();
  const done = [];
  for (const w of widths) {
    if (meta.width && w > meta.width) continue; // nunca amplia
    const base = await open(srcPath, { cropTop });
    await base.clone().resize({ width: w }).webp({ quality }).toFile(path.join(OUT, `${outBase}-${w}.webp`));
    await base.clone().resize({ width: w }).jpeg({ quality: quality - 2, mozjpeg: true }).toFile(path.join(OUT, `${outBase}-${w}.jpg`));
    done.push(w);
  }
  return done;
}

const jobs = [
  // Obras (arquivos em alta resolução)
  { src: "peças/mountain-watercolor-print.png", out: "art/refugio-violeta", widths: WIDTHS.art },
  { src: "peças/WhatsApp Image 2026-08-02 at 18.55.00 (1).jpeg", out: "art/venezia-ao-entardecer", widths: WIDTHS.art },
  { src: "peças/woman-between-the-flowers.png", out: "art/entre-flores-douradas", widths: WIDTHS.art },
  { src: "peças/mountain-watercolor-house-red-blue-34.png", out: "art/campo-vermelho", widths: WIDTHS.art },
  { src: "mockups/mountain-solitude-watercolor-print.webp", out: "art/solidao", widths: WIDTHS.art },

  // Obras publicadas no Instagram
  { src: "peças/instagram/ig-dia-de-chuva.jpg", out: "art/dia-de-chuva", widths: WIDTHS.art },
  { src: "peças/instagram/ig-limoes.jpg", out: "art/limoes", widths: WIDTHS.art },
  { src: "peças/instagram/ig-i-want-to-believe.jpg", out: "art/eu-quero-acreditar", widths: WIDTHS.art },
  { src: "peças/instagram/ig-onca.jpg", out: "art/olhar-felino", widths: WIDTHS.art },
  { src: "peças/instagram/ig-chale.jpg", out: "art/tarde-no-chale", widths: WIDTHS.art, cropTop: 0.705 },
  { src: "peças/instagram/ig-caminho.jpg", out: "art/caminho-ao-entardecer", widths: WIDTHS.art },
  { src: "peças/instagram/ig-gatinho.jpg", out: "art/gatinho-no-galho", widths: WIDTHS.art },
  { src: "peças/instagram/ig-rio-de-janeiro.jpg", out: "art/rio-de-janeiro", widths: WIDTHS.art },

  // Planners digitais (fotos da Etsy)
  ...[1, 2, 3, 4, 5].map((n) => ({ src: `peças/planners/planner-van-gogh-${n}.jpg`, out: `products/luminous-days-${n}`, widths: WIDTHS.product })),
  ...[1, 2, 3, 4, 5, 6].map((n) => ({ src: `peças/planners/planner-en-plein-air-${n}.jpg`, out: `products/en-plein-air-${n}`, widths: WIDTHS.product })),

  // Obras na parede
  { src: "mockups/red-mountain-sala-de-estar.png", out: "mockup/campo-vermelho-ambiente", widths: WIDTHS.wide },
  { src: "mockups/purple-moutain-sala.png", out: "mockup/refugio-violeta-ambiente", widths: WIDTHS.wide },
  { src: "mockups/purple-moutain-sala-de-jantar.png", out: "mockup/refugio-violeta-ambiente-2", widths: WIDTHS.wide },
  { src: "mockups/woman-between-the-flowers-mockup-bedroom.png", out: "mockup/entre-flores-douradas-ambiente", widths: WIDTHS.wide },
  { src: "mockups/solitude-mockup.png", out: "mockup/solidao-ambiente", widths: WIDTHS.wide },
  { src: "mockups/WhatsApp Image 2026-08-02 at 18.54.58.jpeg", out: "mockup/veneza-ambiente", widths: WIDTHS.wide },

  // Foto da página Sobre
  { src: "minha-foto-para-sobre-mim.jpeg", out: "profile/mariane", widths: WIDTHS.portrait },
];

for (const job of jobs) {
  try {
    const sizes = await makeSet(path.join(ROOT, job.src), job.out, job.widths, { cropTop: job.cropTop });
    console.log("ok ", job.out, sizes.join(", "));
  } catch (err) {
    console.error("ERRO", job.src, err.message);
  }
}

// Fundo do hero (Refúgio Violeta em tela cheia) + imagem para compartilhamento
const HERO_SRC = path.join(ROOT, "peças/mountain-watercolor-print.png");
await ensure(path.join(OUT, "hero"));
for (const w of [1000, 1600, 2400]) {
  await sharp(HERO_SRC, { limitInputPixels: false }).rotate().resize({ width: w }).webp({ quality: 80 }).toFile(path.join(OUT, `hero/hero-bg-${w}.webp`));
}
await sharp(HERO_SRC, { limitInputPixels: false }).rotate().resize({ width: 1600 }).jpeg({ quality: 80, mozjpeg: true }).toFile(path.join(OUT, "hero/hero-bg-1600.jpg"));
await sharp(HERO_SRC, { limitInputPixels: false }).rotate().resize({ width: 1200 }).jpeg({ quality: 82, mozjpeg: true }).toFile(path.join(OUT, "hero/hero-og.jpg"));

// Ícones (recorte quadrado de "Entre o Vermelho e o Azul")
await ensure(path.join(OUT, "icons"));
await sharp(path.join(ROOT, "peças/mountain-watercolor-house-red-blue-34.png"), { limitInputPixels: false })
  .rotate()
  .resize(512, 512, { fit: "cover" })
  .png()
  .toFile(path.join(OUT, "icons/favicon-512.png"));
await sharp(path.join(OUT, "icons/favicon-512.png")).resize(32, 32).toFile(path.join(OUT, "icons/favicon-32.png"));
await sharp(path.join(OUT, "icons/favicon-512.png")).resize(180, 180).toFile(path.join(OUT, "icons/apple-touch-icon.png"));

console.log("Imagens prontas. Agora rode: npm run build");
