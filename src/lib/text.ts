import { localizePath, type Locale } from './i18n'

export { slugify } from '../fields/slug'

/** Divide um texto em parágrafos (linha em branco separa) */
export const paragraphs = (value?: string | null): string[] =>
  (value || '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)

/** "Giz pastel oleoso sobre papel" → "Giz pastel oleoso" (e "Oil pastel on paper" → "Oil pastel") */
export const shortTechnique = (t?: string | null) => (t || '').replace(/ (?:sobre papel|on paper)$/i, '')

const MONTHS = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']

/** "2026-10-28T…" → "28 de outubro de 2026" / "October 28, 2026" (fuso de São Paulo) */
export function formatDate(iso: string, locale: Locale = 'pt'): string {
  const d = new Date(iso)
  if (locale === 'en') {
    return new Intl.DateTimeFormat('en-US', { timeZone: 'America/Sao_Paulo', day: 'numeric', month: 'long', year: 'numeric' }).format(d)
  }
  const parts = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', day: 'numeric', month: 'numeric', year: 'numeric' }).formatToParts(d)
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value)
  return `${get('day')} de ${MONTHS[get('month') - 1]} de ${get('year')}`
}

/** "2026-10-28T…" → "2026-10-28" (fuso de São Paulo) */
export const isoDay = (iso: string) => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date(iso))

/** Link para o formulário de contato já com assunto e obra escolhidos */
export function contactUrl({ assunto, obra }: { assunto?: string; obra?: string } = {}, locale: Locale = 'pt') {
  const q = new URLSearchParams()
  if (assunto) q.set('assunto', assunto)
  if (obra) q.set('obra', obra)
  const s = q.toString()
  return `${localizePath('/contato', locale)}${s ? `?${s}` : ''}`
}
