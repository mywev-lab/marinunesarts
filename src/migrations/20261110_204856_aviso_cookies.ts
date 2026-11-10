import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "configuracoes" ALTER COLUMN "site_url" SET DEFAULT 'https://efugioatelier.com';
  ALTER TABLE "configuracoes" ADD COLUMN "cookies_text" varchar;
  ALTER TABLE "configuracoes" ADD COLUMN "cookies_accept_label" varchar;
  ALTER TABLE "configuracoes" ADD COLUMN "cookies_reject_label" varchar;`)

  // Política de privacidade: o trecho sobre cookies passa a explicar o Google Tag Manager e o aviso de cookies
  const antigo = 'Este site não usa cookies de rastreamento próprios além dos necessários para o seu funcionamento básico.'
  const novo =
    'Além dos cookies necessários para o funcionamento básico, este site usa o Google Tag Manager para carregar ferramentas de medição e marketing do Google, como o Google Analytics, que ajudam a entender de forma agregada como as páginas são visitadas. Essas ferramentas só usam cookies se você aceitar no aviso de cookies. Você pode mudar sua escolha a qualquer momento em Preferências de cookies, no rodapé do site, e também apagar ou bloquear cookies nas configurações do seu navegador.'
  await db.execute(sql`update privacidade set body = replace(body::text, ${antigo}, ${novo})::jsonb`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "configuracoes" ALTER COLUMN "site_url" SET DEFAULT 'https://marinunesarts.vercel.app';
  ALTER TABLE "configuracoes" DROP COLUMN "cookies_text";
  ALTER TABLE "configuracoes" DROP COLUMN "cookies_accept_label";
  ALTER TABLE "configuracoes" DROP COLUMN "cookies_reject_label";`)
}
