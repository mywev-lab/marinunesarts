/** Endereço oficial do site passa a ser efugioatelier.com (sem www); o www redireciona para ele */
import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`update configuracoes set site_url = 'https://efugioatelier.com'`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`update configuracoes set site_url = 'https://www.efugioatelier.com'`)
}
