/** Configurações: campo "WhatsApp" em Redes e loja (link do botão flutuante). */
import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "configuracoes" ADD COLUMN "social_whatsapp" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "configuracoes" DROP COLUMN "social_whatsapp";`)
}
