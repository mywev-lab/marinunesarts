/** Produtos: campo "Mockup para a página inicial" (foto do produto na parede). */
import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "produtos" ADD COLUMN "mockup_id" integer;
  ALTER TABLE "produtos" ADD CONSTRAINT "produtos_mockup_id_media_id_fk" FOREIGN KEY ("mockup_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "produtos_mockup_idx" ON "produtos" USING btree ("mockup_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "produtos" DROP CONSTRAINT "produtos_mockup_id_media_id_fk";
  
  DROP INDEX "produtos_mockup_idx";
  ALTER TABLE "produtos" DROP COLUMN "mockup_id";`)
}
