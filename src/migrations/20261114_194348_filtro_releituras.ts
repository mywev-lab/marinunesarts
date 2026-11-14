/** Portfólio: novo filtro "Releituras" (obras inspiradas em pinturas de outros artistas). */
import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_obras_categories" ADD VALUE 'releituras';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DELETE FROM "obras_categories" WHERE "value" = 'releituras';
   ALTER TABLE "obras_categories" ALTER COLUMN "value" SET DATA TYPE text;
  DROP TYPE "public"."enum_obras_categories";
  CREATE TYPE "public"."enum_obras_categories" AS ENUM('aquarela', 'giz-pastel', 'paisagens', 'natureza', 'abstrata', 'colecoes');
  ALTER TABLE "obras_categories" ALTER COLUMN "value" SET DATA TYPE "public"."enum_obras_categories" USING "value"::"public"."enum_obras_categories";`)
}
