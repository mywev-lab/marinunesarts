import config from '@payload-config'
import { getPayload } from 'payload'
import { cache } from 'react'

import type {
  Categoria,
  Configuracoe,
  Contato,
  Inicio,
  Obra,
  PaginaBlog,
  PaginaPortfolio,
  PaginaProduto,
  Post,
  Privacidade,
  Produto,
  Sobre,
} from '@/payload-types'
import type { Locale } from './i18n'

export type Configuracoes = Configuracoe
export type PaginaProdutos = PaginaProduto

export const getClient = cache(() => getPayload({ config }))

type GlobalMap = {
  configuracoes: Configuracoes
  inicio: Inicio
  sobre: Sobre
  'pagina-portfolio': PaginaPortfolio
  'pagina-produtos': PaginaProdutos
  'pagina-blog': PaginaBlog
  contato: Contato
  privacidade: Privacidade
}

// Textos sem versão em inglês aparecem em português (fallback do painel)
export const getGlobal = cache(async <S extends keyof GlobalMap>(slug: S, locale: Locale): Promise<GlobalMap[S]> => {
  const payload = await getClient()
  return (await payload.findGlobal({ slug, depth: 2, locale })) as unknown as GlobalMap[S]
})

export const getSettings = (locale: Locale) => getGlobal('configuracoes', locale)

export const getObras = cache(async (locale: Locale): Promise<Obra[]> => {
  const payload = await getClient()
  const { docs } = await payload.find({ collection: 'obras', sort: 'order', limit: 500, depth: 1, pagination: false, locale })
  return docs
})

export const getProdutos = cache(async (locale: Locale): Promise<Produto[]> => {
  const payload = await getClient()
  const { docs } = await payload.find({ collection: 'produtos', sort: 'order', limit: 200, depth: 1, pagination: false, locale })
  return docs
})

export const getCategorias = cache(async (locale: Locale): Promise<Categoria[]> => {
  const payload = await getClient()
  const { docs } = await payload.find({ collection: 'categorias', sort: 'order', limit: 100, depth: 0, pagination: false, locale })
  return docs
})

export const getPosts = cache(async (locale: Locale): Promise<Post[]> => {
  const payload = await getClient()
  const { docs } = await payload.find({
    collection: 'posts',
    where: { _status: { equals: 'published' } },
    sort: '-publishedAt',
    limit: 500,
    depth: 2,
    pagination: false,
    locale,
  })
  return docs
})

export const getObra = async (slug: string, locale: Locale) => (await getObras(locale)).find((o) => o.slug === slug)
export const getProduto = async (slug: string, locale: Locale) => (await getProdutos(locale)).find((p) => p.slug === slug)
export const getPost = async (slug: string, locale: Locale) => (await getPosts(locale)).find((p) => p.slug === slug)
