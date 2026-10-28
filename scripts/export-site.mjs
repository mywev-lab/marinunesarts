// =========================================================
// Mari Nunes Arts — prepara a pasta public/ para publicação
// Uso:  node scripts/export-site.mjs   (a Vercel roda isso sozinha)
// Gera as páginas de novo e copia só o que o site precisa para public/.
// Assim scripts, originais e arquivos de configuração não vão para o ar.
// =========================================================

import { readdirSync, rmSync, mkdirSync, cpSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "public");

// 1. gera as páginas a partir de scripts/site-data.mjs
await import("./build-site.mjs");

// 2. copia para public/ só o que faz parte do site
const DIRS = ["obras", "produtos", "blog", "css", "js", "images"];
const FILES = ["robots.txt", "sitemap.xml"];
const pages = readdirSync(ROOT).filter((f) => f.endsWith(".html"));

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT);
for (const item of [...pages, ...FILES, ...DIRS]) {
  const src = path.join(ROOT, item);
  if (existsSync(src)) cpSync(src, path.join(OUT, item), { recursive: true });
}

console.log(`Pasta public/ pronta: ${pages.length} páginas na raiz + ${DIRS.join(", ")}`);
