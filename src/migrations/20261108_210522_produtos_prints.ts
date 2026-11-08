import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_produtos_type" AS ENUM('digital', 'print');
  CREATE TABLE "produtos_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"obras_id" integer
  );
  
  ALTER TABLE "produtos" ALTER COLUMN "price" DROP NOT NULL;
  ALTER TABLE "produtos" ALTER COLUMN "etsy" DROP NOT NULL;
  ALTER TABLE "configuracoes" ALTER COLUMN "site_name" SET DEFAULT 'Efúgio Atelier';
  ALTER TABLE "configuracoes" ALTER COLUMN "site_url" SET DEFAULT 'https://marinunesarts.vercel.app';
  ALTER TABLE "produtos" ADD COLUMN "type" "enum_produtos_type" DEFAULT 'digital' NOT NULL;
  ALTER TABLE "pagina_produtos" ADD COLUMN "prints_title" varchar DEFAULT 'Prints artísticos';
  ALTER TABLE "pagina_produtos" ADD COLUMN "prints_lede" varchar;
  ALTER TABLE "pagina_produtos" ADD COLUMN "print_note" varchar;
  ALTER TABLE "produtos_rels" ADD CONSTRAINT "produtos_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."produtos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "produtos_rels" ADD CONSTRAINT "produtos_rels_obras_fk" FOREIGN KEY ("obras_id") REFERENCES "public"."obras"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "produtos_rels_order_idx" ON "produtos_rels" USING btree ("order");
  CREATE INDEX "produtos_rels_parent_idx" ON "produtos_rels" USING btree ("parent_id");
  CREATE INDEX "produtos_rels_path_idx" ON "produtos_rels" USING btree ("path");
  CREATE INDEX "produtos_rels_obras_id_idx" ON "produtos_rels" USING btree ("obras_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "produtos_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "produtos_rels" CASCADE;
  ALTER TABLE "produtos" ALTER COLUMN "price" SET NOT NULL;
  ALTER TABLE "produtos" ALTER COLUMN "etsy" SET NOT NULL;
  ALTER TABLE "configuracoes" ALTER COLUMN "site_name" SET DEFAULT 'Mari Nunes Arts';
  ALTER TABLE "configuracoes" ALTER COLUMN "site_url" SET DEFAULT 'https://www.marinunesarts.com';
  ALTER TABLE "produtos" DROP COLUMN "type";
  ALTER TABLE "pagina_produtos" DROP COLUMN "prints_title";
  ALTER TABLE "pagina_produtos" DROP COLUMN "prints_lede";
  ALTER TABLE "pagina_produtos" DROP COLUMN "print_note";
  DROP TYPE "public"."enum_produtos_type";`)
}
