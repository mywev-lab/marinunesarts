export { slugify } from '../fields/slug'

/** Divide um texto em parágrafos (linha em branco separa) */
export const paragraphs = (value?: string | null): string[] =>
  (value || '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)

export const STATUS_LABEL: Record<string, string> = {
  disponivel: 'Disponível',
  'colecao-particular': 'Coleção particular',
  vendida: 'Vendida',
}

export const shortTechnique = (t?: string | null) => (t || '').replace(/ sobre papel$/i, '')

const MONTHS = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']

/** "2026-10-28T…" → "28 de outubro de 2026" (fuso de São Paulo) */
export function formatDate(iso: string): string {
  const d = new Date(iso)
  const parts = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', day: 'numeric', month: 'numeric', year: 'numeric' }).formatToParts(d)
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value)
  return `${get('day')} de ${MONTHS[get('month') - 1]} de ${get('year')}`
}

/** "2026-10-28T…" → "2026-10-28" (fuso de São Paulo) */
export const isoDay = (iso: string) => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date(iso))

export function contactUrl({ assunto, obra }: { assunto?: string; obra?: string } = {}) {
  const q = new URLSearchParams()
  if (assunto) q.set('assunto', assunto)
  if (obra) q.set('obra', obra)
  const s = q.toString()
  return `/contato${s ? `?${s}` : ''}`
}
