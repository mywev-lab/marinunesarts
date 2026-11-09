/** Endereço oficial do site passa a ser o domínio próprio (canonical, sitemap, dados para o Google) */
import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`update configuracoes set site_url = 'https://www.efugioatelier.com'`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`update configuracoes set site_url = 'https://marinunesarts.vercel.app'`)
}
