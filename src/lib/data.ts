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

export const getGlobal = cache(async <S extends keyof GlobalMap>(slug: S): Promise<GlobalMap[S]> => {
  const payload = await getClient()
  return (await payload.findGlobal({ slug, depth: 2 })) as unknown as GlobalMap[S]
})

export const getSettings = () => getGlobal('configuracoes')

export const getObras = cache(async (): Promise<Obra[]> => {
  const payload = await getClient()
  const { docs } = await payload.find({ collection: 'obras', sort: 'order', limit: 500, depth: 1, pagination: false })
  return docs
})

export const getProdutos = cache(async (): Promise<Produto[]> => {
  const payload = await getClient()
  const { docs } = await payload.find({ collection: 'produtos', sort: 'order', limit: 200, depth: 1, pagination: false })
  return docs
})

export const getCategorias = cache(async (): Promise<Categoria[]> => {
  const payload = await getClient()
  const { docs } = await payload.find({ collection: 'categorias', sort: 'order', limit: 100, depth: 0, pagination: false })
  return docs
})

export const getPosts = cache(async (): Promise<Post[]> => {
  const payload = await getClient()
  const { docs } = await payload.find({
    collection: 'posts',
    where: { _status: { equals: 'published' } },
    sort: '-publishedAt',
    limit: 500,
    depth: 2,
    pagination: false,
  })
  return docs
})

export const getObra = async (slug: string) => (await getObras()).find((o) => o.slug === slug)
export const getProduto = async (slug: string) => (await getProdutos()).find((p) => p.slug === slug)
export const getPost = async (slug: string) => (await getPosts()).find((p) => p.slug === slug)
