import type { Field, GlobalConfig } from 'payload'

import { pageEditor } from '../blocks/editors'
import { revalidateGlobal } from '../hooks/revalidate'

const hooks = { afterChange: [revalidateGlobal] }
const access = { read: () => true }

const seo: Field = {
  name: 'seo',
  label: 'Google e redes sociais',
  type: 'group',
  fields: [
    { name: 'title', label: 'Título da página', type: 'text', admin: { description: 'Até cerca de 60 caracteres.' } },
    { name: 'description', label: 'Descrição', type: 'textarea', admin: { description: 'Até cerca de 160 caracteres.' } },
  ],
}

const paragraphsHelp = { description: 'Deixe uma linha em branco para separar parágrafos.' }

export const Configuracoes: GlobalConfig = {
  slug: 'configuracoes',
  label: 'Configurações do site',
  admin: { group: 'Configurações' },
  access,
  hooks,
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'siteName', label: 'Nome do site', type: 'text', required: true, defaultValue: 'Mari Nunes Arts' },
        { name: 'authorName', label: 'Nome da artista', type: 'text', required: true, defaultValue: 'Mariane Nunes' },
      ],
    },
    {
      name: 'siteUrl',
      label: 'Endereço oficial do site',
      type: 'text',
      required: true,
      defaultValue: 'https://www.marinunesarts.com',
      admin: { description: 'Usado nos links para o Google e as redes sociais.' },
    },
    {
      type: 'row',
      fields: [
        { name: 'email', label: 'E-mail de contato', type: 'email', required: true },
        { name: 'city', label: 'Cidade', type: 'text', defaultValue: 'São Paulo, Brasil' },
      ],
    },
    {
      name: 'social',
      label: 'Redes e loja',
      type: 'group',
      fields: [
        { name: 'instagram', label: 'Instagram', type: 'text' },
        { name: 'etsy', label: 'Loja na Etsy', type: 'text' },
        { name: 'pinterest', label: 'Pinterest', type: 'text', admin: { description: 'O ícone só aparece quando houver um link.' } },
      ],
    },
    { name: 'footerText', label: 'Texto do rodapé', type: 'text' },
    {
      name: 'person',
      label: 'Sobre a artista (para o Google)',
      type: 'group',
      fields: [
        { name: 'jobTitle', label: 'Profissão', type: 'text', defaultValue: 'Artista visual' },
        { name: 'description', label: 'Descrição curta', type: 'textarea' },
        { name: 'authorBio', label: 'Texto "Sobre a autora" nos artigos', type: 'textarea' },
        { name: 'photo', label: 'Foto', type: 'upload', relationTo: 'media' },
      ],
    },
    {
      name: 'newsletter',
      label: 'Newsletter',
      type: 'group',
      fields: [
        { name: 'title', label: 'Título', type: 'text', defaultValue: 'Cartas do ateliê' },
        { name: 'text', label: 'Texto', type: 'textarea' },
        { name: 'buttonLabel', label: 'Texto do botão', type: 'text', defaultValue: 'Quero receber' },
      ],
    },
    { name: 'ogImage', label: 'Imagem padrão para compartilhamento', type: 'upload', relationTo: 'media' },
  ],
}

export const Inicio: GlobalConfig = {
  slug: 'inicio',
  label: 'Página inicial',
  admin: { group: 'Páginas' },
  access,
  hooks,
  fields: [
    seo,
    {
      name: 'hero',
      label: 'Abertura (imagem de fundo e chamada)',
      type: 'group',
      fields: [
        { name: 'image', label: 'Pintura de fundo', type: 'upload', relationTo: 'media', required: true },
        { name: 'kicker', label: 'Linha acima do título', type: 'text' },
        { name: 'title', label: 'Título', type: 'textarea', required: true },
        { name: 'subtitle', label: 'Texto', type: 'textarea' },
        {
          type: 'row',
          fields: [
            { name: 'primaryLabel', label: 'Botão 1: texto', type: 'text' },
            { name: 'primaryLink', label: 'Botão 1: link', type: 'text' },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'secondaryLabel', label: 'Botão 2: texto', type: 'text' },
            { name: 'secondaryLink', label: 'Botão 2: link', type: 'text' },
          ],
        },
        {
          name: 'featuredWork',
          label: 'Obra indicada no canto (etiqueta de museu)',
          type: 'relationship',
          relationTo: 'obras',
          admin: { description: 'Normalmente a mesma pintura do fundo.' },
        },
      ],
    },
    {
      name: 'produtos',
      label: 'Seção Produtos',
      type: 'group',
      fields: [
        { name: 'title', label: 'Título', type: 'text' },
        { name: 'lede', label: 'Texto', type: 'textarea' },
        { name: 'linkLabel', label: 'Texto do link', type: 'text' },
        { name: 'digital', label: 'Produtos digitais em destaque', type: 'relationship', relationTo: 'produtos', hasMany: true },
        { name: 'works', label: 'Obras à venda em destaque', type: 'relationship', relationTo: 'obras', hasMany: true },
      ],
    },
    {
      name: 'statement',
      label: 'Frase em destaque (faixa verde)',
      type: 'group',
      admin: { description: 'Aparece na página inicial e na página Sobre.' },
      fields: [
        { name: 'quote', label: 'Frase', type: 'textarea' },
        { name: 'text', label: 'Texto ao lado', type: 'textarea' },
      ],
    },
    {
      name: 'atelie',
      label: 'Seção "Do ateliê"',
      type: 'group',
      admin: { description: 'As obras desta seção são as marcadas com "Mostrar em Do ateliê" em Obras.' },
      fields: [
        { name: 'title', label: 'Título', type: 'text' },
        { name: 'lede', label: 'Texto', type: 'textarea' },
        { name: 'linkLabel', label: 'Texto do link', type: 'text' },
      ],
    },
    {
      name: 'sobre',
      label: 'Resumo "Sobre"',
      type: 'group',
      fields: [
        { name: 'title', label: 'Título', type: 'text' },
        { name: 'text', label: 'Texto', type: 'textarea', admin: paragraphsHelp },
        { name: 'linkLabel', label: 'Texto do link', type: 'text' },
      ],
    },
  ],
}

export const Sobre: GlobalConfig = {
  slug: 'sobre',
  label: 'Página Sobre',
  admin: { group: 'Páginas' },
  access,
  hooks,
  fields: [
    seo,
    { name: 'kicker', label: 'Linha acima do título', type: 'text' },
    { name: 'title', label: 'Título', type: 'text', required: true },
    { name: 'photo', label: 'Foto', type: 'upload', relationTo: 'media' },
    { name: 'body', label: 'Texto', type: 'richText', editor: pageEditor },
    { name: 'pullQuote', label: 'Frase em destaque', type: 'textarea' },
    {
      name: 'processo',
      label: 'Processo criativo',
      type: 'group',
      fields: [
        { name: 'title', label: 'Título', type: 'text' },
        { name: 'lede', label: 'Texto', type: 'textarea' },
        {
          name: 'steps',
          label: 'Etapas',
          type: 'array',
          maxRows: 5,
          fields: [
            { name: 'title', label: 'Etapa', type: 'text', required: true },
            { name: 'text', label: 'Texto', type: 'textarea' },
          ],
        },
        {
          name: 'gallery',
          label: 'Fotos',
          type: 'array',
          maxRows: 3,
          fields: [{ name: 'image', label: 'Imagem', type: 'upload', relationTo: 'media', required: true }],
        },
        { name: 'caption', label: 'Legenda das fotos', type: 'text' },
      ],
    },
    {
      name: 'influencias',
      label: 'Influências',
      type: 'group',
      fields: [
        { name: 'title', label: 'Título', type: 'text' },
        {
          name: 'groups',
          label: 'Grupos',
          type: 'array',
          fields: [
            { name: 'title', label: 'Nome do grupo', type: 'text', required: true },
            {
              name: 'items',
              label: 'Itens',
              type: 'array',
              fields: [
                { name: 'name', label: 'Nome', type: 'text', required: true },
                { name: 'text', label: 'Texto', type: 'textarea' },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'cta',
      label: 'Chamada final',
      type: 'group',
      fields: [
        { name: 'title', label: 'Título', type: 'text' },
        { name: 'text', label: 'Texto', type: 'textarea' },
        { name: 'label', label: 'Texto do botão', type: 'text' },
      ],
    },
  ],
}

export const PaginaPortfolio: GlobalConfig = {
  slug: 'pagina-portfolio',
  label: 'Página Portfólio',
  admin: { group: 'Páginas' },
  access,
  hooks,
  fields: [
    seo,
    { name: 'title', label: 'Título', type: 'text', required: true },
    { name: 'lede', label: 'Texto', type: 'textarea' },
  ],
}

export const PaginaProdutos: GlobalConfig = {
  slug: 'pagina-produtos',
  label: 'Página Produtos',
  admin: { group: 'Páginas' },
  access,
  hooks,
  fields: [
    seo,
    { name: 'title', label: 'Título', type: 'text', required: true },
    { name: 'lede', label: 'Texto', type: 'textarea' },
    {
      type: 'row',
      fields: [
        { name: 'digitalLede', label: 'Texto da seção de produtos digitais', type: 'textarea' },
        { name: 'worksLede', label: 'Texto da seção de obras', type: 'textarea' },
      ],
    },
    { name: 'worksTitle', label: 'Título da seção de obras', type: 'text' },
    {
      name: 'commission',
      label: 'Encomendas',
      type: 'group',
      fields: [
        { name: 'title', label: 'Título', type: 'text' },
        { name: 'text', label: 'Texto', type: 'textarea' },
        { name: 'label', label: 'Texto do botão', type: 'text' },
      ],
    },
    {
      name: 'howToUse',
      label: 'Como usar (aparece na página de cada produto digital)',
      type: 'array',
      fields: [{ name: 'text', label: 'Passo', type: 'text', required: true }],
    },
    { name: 'purchaseNote', label: 'Aviso abaixo do botão de compra', type: 'textarea' },
    { name: 'digitalNote', label: 'Aviso sobre produto digital', type: 'textarea' },
  ],
}

export const PaginaBlog: GlobalConfig = {
  slug: 'pagina-blog',
  label: 'Página do blog',
  admin: { group: 'Blog' },
  access,
  hooks,
  fields: [
    seo,
    { name: 'title', label: 'Título', type: 'text', required: true, defaultValue: 'Diário do Ateliê' },
    { name: 'intro', label: 'Introdução', type: 'textarea' },
  ],
}

export const Contato: GlobalConfig = {
  slug: 'contato',
  label: 'Página Contato',
  admin: { group: 'Páginas' },
  access,
  hooks,
  fields: [
    seo,
    { name: 'title', label: 'Título', type: 'text', required: true },
    { name: 'intro', label: 'Texto', type: 'textarea' },
    {
      name: 'subjects',
      label: 'Assuntos do formulário',
      type: 'array',
      fields: [{ name: 'text', label: 'Assunto', type: 'text', required: true }],
    },
  ],
}

export const Privacidade: GlobalConfig = {
  slug: 'privacidade',
  label: 'Política de privacidade',
  admin: { group: 'Páginas' },
  access,
  hooks,
  fields: [
    { name: 'title', label: 'Título', type: 'text', required: true },
    { name: 'body', label: 'Texto', type: 'richText', editor: pageEditor },
  ],
}
