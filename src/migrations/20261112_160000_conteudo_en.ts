/**
 * Versão em inglês do conteúdo (efugioatelier.com/en).
 *
 * As traduções ficam em data/20261112_conteudo_en.json. Para cada página, obra, produto, categoria,
 * artigo e imagem, preenche só os campos em inglês que ainda estão vazios: o português não muda e
 * nada que já tenha sido escrito em inglês no painel é substituído. Conteúdo que não está no arquivo
 * (por exemplo, uma obra cadastrada depois) continua aparecendo em português até ganhar tradução.
 *
 * Também devolve três legendas de imagens dos artigos (em português) que se perderam na importação
 * do site antigo, e tira dois trechos soltos que sobraram dela no artigo sobre planner digital.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

import { inlineFromHtml, paragraph, root } from '../seed/lexical'

type Json = any

const DATA: Json = JSON.parse(fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), 'data', '20261112_conteudo_en.json'), 'utf8'))

const ctx = { disableRevalidate: true }
const META = new Set(['id', 'createdAt', 'updatedAt', 'globalType', 'sizes', 'url', 'thumbnailURL'])

const isRich = (v: Json) => Boolean(v && typeof v === 'object' && !Array.isArray(v) && 'root' in v)
const isEmpty = (v: Json) => v === null || v === undefined || (typeof v === 'string' && !v.trim()) || (isRich(v) && !v.root?.children?.length)

/**
 * Coloca a tradução onde o campo em inglês está vazio (listas: item a item, na mesma ordem).
 * Um campo em inglês igual ao português também recebe a tradução: é o valor padrão do campo
 * (ex.: "Cartas do ateliê"), que o painel mostra quando ainda não há texto em inglês.
 */
function overlay(current: Json, translation: Json, pt: Json): Json {
  if (translation === undefined) return current
  if (typeof translation === 'string' || isRich(translation) || translation === null) {
    return isEmpty(current) || (typeof current === 'string' && current === pt) ? translation : current
  }
  if (Array.isArray(translation)) {
    if (!Array.isArray(current)) return current
    return current.map((row, i) => (i < translation.length ? overlay(row, translation[i], pt?.[i]) : row))
  }
  const out: Json = { ...(current || {}) }
  for (const [k, v] of Object.entries(translation)) out[k] = overlay(out[k], v, pt?.[k])
  return out
}

const strip = (doc: Json) => Object.fromEntries(Object.entries(doc).filter(([k]) => !META.has(k)))

/** Blocos do texto (destaque, imagem, linha de obras, tabela), na ordem em que aparecem */
const blocksOf = (value: Json): Json[] => (value?.root?.children || []).filter((n: Json) => n.type === 'block')

/**
 * Texto do artigo em inglês: a estrutura vem da tradução; imagens e opções de cada bloco vêm do
 * bloco correspondente em português (assim as imagens são as mesmas do site no ar).
 */
function englishContent(translation: Json, pt: Json): Json | null {
  const ptBlocks = blocksOf(pt)
  const children: Json[] = []
  for (const node of translation.root.children) {
    if (node.type !== 'block') {
      children.push(node)
      continue
    }
    const { __ptIndex, ...tr } = node.fields
    const base = ptBlocks[__ptIndex]
    if (!base || base.fields.blockType !== tr.blockType) return null // texto em português mudou: não arrisca
    const f = structuredClone(base.fields)
    if (tr.blockType === 'callout') Object.assign(f, { title: tr.title, body: tr.body })
    if (tr.blockType === 'figura') f.caption = tr.caption
    if (tr.blockType === 'linhaDeFiguras') f.figuras = (f.figuras || []).map((g: Json, i: number) => ({ ...g, caption: tr.figuras?.[i]?.caption ?? g.caption }))
    if (tr.blockType === 'tabela') {
      f.caption = tr.caption
      f.header = (tr.header || []).map((h: Json, i: number) => ({ ...(f.header?.[i] || {}), text: h.text }))
      f.rows = (tr.rows || []).map((r: Json, i: number) => ({
        ...(f.rows?.[i] || {}),
        cells: (r.cells || []).map((c: Json, j: number) => ({ ...(f.rows?.[i]?.cells?.[j] || {}), text: c.text })),
      }))
    }
    children.push({ ...base, fields: f })
  }
  return { root: { ...translation.root, children } }
}

/* ---------- legendas perdidas na importação (português) ---------- */
const cap = (html: string) => root([paragraph(inlineFromHtml(html))])
const LEGENDAS_PT: Record<string, { block: number; captions: string[] }> = {
  'giz-pastel-oleoso': {
    block: 2,
    captions: [
      '<a href="/obras/dia-de-chuva">Dia de Chuva</a>: o amarelo da capa se destaca contra o cinza do mar, e a textura do pastel marca as ondas.',
      '<a href="/obras/caminho-ao-entardecer">Caminho ao Entardecer</a>: campos verdes, montanhas azuis e céu alaranjado em cores puras.',
      '<a href="/obras/olhar-felino">Olhar Felino</a>: o verde intenso das folhas emoldura a pelagem pintada do felino.',
    ],
  },
  'pintura-aquarela-iniciantes': {
    block: 2,
    captions: [
      '<a href="/obras/refugio-violeta">Refúgio Violeta</a>: no céu, as cores do pôr do sol passam de um tom a outro, enquanto a montanha e a casa têm contornos definidos.',
      '<a href="/obras/rio-de-janeiro">Rio de Janeiro em Aquarela</a>: o azul do mar e o volume do Pão de Açúcar contrastam com os guarda-sóis coloridos na areia.',
      '<a href="/obras/solidao">Solidão</a>: uma paleta quase monocromática, em cinzas e oliva, mostra como poucas cores bastam para criar atmosfera.',
    ],
  },
  'como-usar-planner-digital': {
    block: 2,
    captions: ['Páginas diária, semanal e mensal do planner <a href="/produtos/planner-luminous-days">Luminous Days</a>.'],
  },
}
const SOBRAS = ['produtos/planner-luminous-days.html">Luminous Days', '."}}']
const textOf = (n: Json): string => (n.type === 'text' ? n.text || '' : (n.children || []).map(textOf).join(''))

function fixPortuguese(slug: string, content: Json): Json | null {
  const fix = LEGENDAS_PT[slug]
  if (!fix || !content?.root) return null
  let changed = false
  const children = content.root.children.filter((n: Json) => {
    const sobra = n.type === 'paragraph' && SOBRAS.includes(textOf(n).trim())
    if (sobra) changed = true
    return !sobra
  })
  const block = blocksOf(content)[fix.block]
  if (block?.fields.blockType === 'figura' && isEmpty(block.fields.caption)) {
    block.fields.caption = cap(fix.captions[0])
    changed = true
  }
  if (block?.fields.blockType === 'linhaDeFiguras' && (block.fields.figuras || []).length === fix.captions.length) {
    block.fields.figuras.forEach((f: Json, i: number) => {
      if (isEmpty(f.caption)) {
        f.caption = cap(fix.captions[i])
        changed = true
      }
    })
  }
  return changed ? { root: { ...content.root, children } } : null
}

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  const log = (msg: string) => payload.logger.info(`Conteúdo em inglês: ${msg}`)

  // ---------- páginas (globais) ----------
  for (const [slug, translation] of Object.entries<Json>(DATA.globals)) {
    const pt: Json = await payload.findGlobal({ slug: slug as any, locale: 'pt', depth: 0, req })
    if (!pt?.updatedAt) continue // banco novo, ainda sem conteúdo
    const en: Json = await payload.findGlobal({ slug: slug as any, locale: 'en', fallbackLocale: false, depth: 0, req })
    await payload.updateGlobal({ slug: slug as any, locale: 'en', data: strip(overlay(en, translation, pt)), depth: 0, req, context: ctx })
    log(`página ${slug}`)
  }

  // ---------- obras, produtos e categorias (pelo endereço) ----------
  for (const collection of ['obras', 'produtos', 'categorias'] as const) {
    for (const [slug, translation] of Object.entries<Json>(DATA[collection])) {
      const { docs } = await payload.find({ collection, where: { slug: { equals: slug } }, locale: 'en', fallbackLocale: false, depth: 0, limit: 1, req })
      if (!docs[0]) continue
      const pt = await payload.findByID({ collection, id: docs[0].id, locale: 'pt', depth: 0, req })
      await payload.update({ collection, id: docs[0].id, locale: 'en', data: strip(overlay(docs[0], translation, pt)), depth: 0, req, context: ctx })
    }
    log(collection)
  }

  // ---------- imagens: texto alternativo (pelo nome do arquivo) ----------
  const { docs: media } = await payload.find({ collection: 'media', locale: 'en', fallbackLocale: false, depth: 0, limit: 1000, pagination: false, req })
  const { docs: mediaPt } = await payload.find({ collection: 'media', locale: 'pt', depth: 0, limit: 1000, pagination: false, req })
  const ptAlt = new Map(mediaPt.map((m: Json) => [m.id, m.alt]))
  for (const m of media as Json[]) {
    const alt = DATA.media[m.filename]
    if (alt && (isEmpty(m.alt) || m.alt === ptAlt.get(m.id))) await payload.update({ collection: 'media', id: m.id, locale: 'en', data: { alt }, depth: 0, req, context: ctx })
  }
  log('imagens')

  // ---------- artigos ----------
  for (const [slug, translation] of Object.entries<Json>(DATA.posts)) {
    const found = await payload.find({ collection: 'posts', where: { slug: { equals: slug } }, locale: 'pt', depth: 0, limit: 1, req })
    const ptDoc: Json = found.docs[0]
    if (!ptDoc) continue

    // legendas perdidas na importação, no texto em português
    const fixed = fixPortuguese(slug, ptDoc.content)
    if (fixed) {
      await payload.update({ collection: 'posts', id: ptDoc.id, locale: 'pt', data: { ...strip(ptDoc), content: fixed }, depth: 0, req, context: ctx })
      ptDoc.content = fixed
      log(`legendas em português de ${slug}`)
    }

    const content = englishContent(translation.content, ptDoc.content)
    const tr = { ...translation, content: content ?? undefined }
    const en: Json = (await payload.findByID({ collection: 'posts', id: ptDoc.id, locale: 'en', fallbackLocale: false, depth: 0, req })) as Json
    await payload.update({ collection: 'posts', id: ptDoc.id, locale: 'en', data: strip(overlay(en, tr, ptDoc)), depth: 0, req, context: ctx })
    log(`artigo ${slug}${content ? '' : ' (sem o texto: o português mudou)'}`)
  }
}

const LOCALE_TABLES = [
  'obras_locales',
  'produtos_locales',
  'produtos_specs_locales',
  'produtos_includes_locales',
  'categorias_locales',
  'media_locales',
  'posts_locales',
  'posts_keywords_locales',
  '_posts_v_locales',
  '_posts_v_version_keywords_locales',
  'inicio_locales',
  'sobre_locales',
  'sobre_processo_steps_locales',
  'sobre_influencias_groups_locales',
  'sobre_influencias_groups_items_locales',
  'pagina_portfolio_locales',
  'pagina_produtos_locales',
  'pagina_produtos_how_to_use_locales',
  'pagina_blog_locales',
  'contato_locales',
  'contato_subjects_locales',
  'privacidade_locales',
  'configuracoes_locales',
]

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // remove os textos em inglês (o site em /en volta a mostrar o português); as legendas devolvidas ficam
  for (const table of LOCALE_TABLES) await db.execute(sql.raw(`DELETE FROM "${table}" WHERE "_locale" = 'en';`))
}
