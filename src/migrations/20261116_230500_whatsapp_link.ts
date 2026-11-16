/**
 * Configurações: o WhatsApp da Mariane (https://wa.me/5511983072921) liga o botão flutuante em todas as páginas
 * e os links do rodapé e da página de contato. O número fica no painel, em Configurações → Redes e loja.
 */
import { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'

const WHATSAPP = 'https://wa.me/5511983072921'
const META = new Set(['id', 'createdAt', 'updatedAt', 'globalType'])
const strip = (doc: any) => Object.fromEntries(Object.entries(doc).filter(([k]) => !META.has(k)))

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  const atual: any = await payload.findGlobal({ slug: 'configuracoes', locale: 'pt', fallbackLocale: false, depth: 0, req })
  if (!atual?.updatedAt) return // banco novo, ainda sem conteúdo
  if (atual.social?.whatsapp) return // já preenchido no painel
  await payload.updateGlobal({
    slug: 'configuracoes',
    locale: 'pt',
    data: { ...strip(atual), social: { ...(atual.social || {}), whatsapp: WHATSAPP } },
    depth: 0,
    req,
    context: { disableRevalidate: true },
  })
  payload.logger.info('Configurações: WhatsApp preenchido')
}

export async function down(_: MigrateDownArgs): Promise<void> {
  // a coluna sai na migração 20261116_230000_whatsapp; nada a desfazer aqui
}
