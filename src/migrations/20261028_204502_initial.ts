import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_obras_categories" AS ENUM('aquarela', 'giz-pastel', 'paisagens', 'natureza', 'abstrata', 'colecoes');
  CREATE TYPE "public"."enum_obras_status" AS ENUM('disponivel', 'colecao-particular', 'vendida');
  CREATE TYPE "public"."enum_produtos_currency" AS ENUM('USD', 'BRL');
  CREATE TYPE "public"."enum_posts_cover_kind" AS ENUM('art', 'wide', 'product');
  CREATE TYPE "public"."enum_posts_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__posts_v_version_cover_kind" AS ENUM('art', 'wide', 'product');
  CREATE TYPE "public"."enum__posts_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "obras_categories" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_obras_categories",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "obras_mockups" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL
  );
  
  CREATE TABLE "obras" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"image_id" integer NOT NULL,
  	"technique" varchar NOT NULL,
  	"year" varchar,
  	"dimensions" varchar,
  	"format" varchar,
  	"status" "enum_obras_status",
  	"description" varchar NOT NULL,
  	"etsy_url" varchar,
  	"etsy_label" varchar,
  	"etsy_note" varchar,
  	"instagram" varchar,
  	"slug" varchar NOT NULL,
  	"order" numeric DEFAULT 100,
  	"show_on_home" boolean,
  	"for_sale" boolean,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "produtos_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL
  );
  
  CREATE TABLE "produtos_specs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"value" varchar NOT NULL
  );
  
  CREATE TABLE "produtos_includes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "produtos" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"kind" varchar NOT NULL,
  	"category" varchar DEFAULT 'Planners',
  	"price" varchar NOT NULL,
  	"price_value" numeric,
  	"currency" "enum_produtos_currency" DEFAULT 'USD',
  	"etsy" varchar NOT NULL,
  	"summary" varchar NOT NULL,
  	"card_meta" varchar,
  	"slug" varchar NOT NULL,
  	"order" numeric DEFAULT 100,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "posts_keywords" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"keyword" varchar
  );
  
  CREATE TABLE "posts_sources" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"publisher" varchar,
  	"url" varchar
  );
  
  CREATE TABLE "posts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"dek" varchar,
  	"cover_image_id" integer,
  	"cover_kind" "enum_posts_cover_kind" DEFAULT 'art',
  	"cover_caption" jsonb,
  	"content" jsonb,
  	"excerpt" varchar,
  	"seo_title" varchar,
  	"description" varchar,
  	"cta_title" varchar,
  	"cta_text" varchar,
  	"cta_label" varchar,
  	"cta_href" varchar,
  	"slug" varchar,
  	"category_id" integer,
  	"published_at" timestamp(3) with time zone,
  	"revised_at" timestamp(3) with time zone,
  	"editor_notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_posts_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "posts_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"posts_id" integer
  );
  
  CREATE TABLE "_posts_v_version_keywords" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"keyword" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_posts_v_version_sources" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"publisher" varchar,
  	"url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_posts_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_dek" varchar,
  	"version_cover_image_id" integer,
  	"version_cover_kind" "enum__posts_v_version_cover_kind" DEFAULT 'art',
  	"version_cover_caption" jsonb,
  	"version_content" jsonb,
  	"version_excerpt" varchar,
  	"version_seo_title" varchar,
  	"version_description" varchar,
  	"version_cta_title" varchar,
  	"version_cta_text" varchar,
  	"version_cta_label" varchar,
  	"version_cta_href" varchar,
  	"version_slug" varchar,
  	"version_category_id" integer,
  	"version_published_at" timestamp(3) with time zone,
  	"version_revised_at" timestamp(3) with time zone,
  	"version_editor_notes" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__posts_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_posts_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"posts_id" integer
  );
  
  CREATE TABLE "categorias" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"description" varchar,
  	"slug" varchar NOT NULL,
  	"order" numeric DEFAULT 100,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"credit" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_small_url" varchar,
  	"sizes_small_width" numeric,
  	"sizes_small_height" numeric,
  	"sizes_small_mime_type" varchar,
  	"sizes_small_filesize" numeric,
  	"sizes_small_filename" varchar,
  	"sizes_medium_url" varchar,
  	"sizes_medium_width" numeric,
  	"sizes_medium_height" numeric,
  	"sizes_medium_mime_type" varchar,
  	"sizes_medium_filesize" numeric,
  	"sizes_medium_filename" varchar,
  	"sizes_large_url" varchar,
  	"sizes_large_width" numeric,
  	"sizes_large_height" numeric,
  	"sizes_large_mime_type" varchar,
  	"sizes_large_filesize" numeric,
  	"sizes_large_filename" varchar,
  	"sizes_xlarge_url" varchar,
  	"sizes_xlarge_width" numeric,
  	"sizes_xlarge_height" numeric,
  	"sizes_xlarge_mime_type" varchar,
  	"sizes_xlarge_filesize" numeric,
  	"sizes_xlarge_filename" varchar
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"obras_id" integer,
  	"produtos_id" integer,
  	"posts_id" integer,
  	"categorias_id" integer,
  	"media_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "inicio" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"hero_image_id" integer NOT NULL,
  	"hero_kicker" varchar,
  	"hero_title" varchar NOT NULL,
  	"hero_subtitle" varchar,
  	"hero_primary_label" varchar,
  	"hero_primary_link" varchar,
  	"hero_secondary_label" varchar,
  	"hero_secondary_link" varchar,
  	"hero_featured_work_id" integer,
  	"produtos_title" varchar,
  	"produtos_lede" varchar,
  	"produtos_link_label" varchar,
  	"statement_quote" varchar,
  	"statement_text" varchar,
  	"atelie_title" varchar,
  	"atelie_lede" varchar,
  	"atelie_link_label" varchar,
  	"sobre_title" varchar,
  	"sobre_text" varchar,
  	"sobre_link_label" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "inicio_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"produtos_id" integer,
  	"obras_id" integer
  );
  
  CREATE TABLE "sobre_processo_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "sobre_processo_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL
  );
  
  CREATE TABLE "sobre_influencias_groups_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "sobre_influencias_groups" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL
  );
  
  CREATE TABLE "sobre" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"kicker" varchar,
  	"title" varchar NOT NULL,
  	"photo_id" integer,
  	"body" jsonb,
  	"pull_quote" varchar,
  	"processo_title" varchar,
  	"processo_lede" varchar,
  	"processo_caption" varchar,
  	"influencias_title" varchar,
  	"cta_title" varchar,
  	"cta_text" varchar,
  	"cta_label" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "pagina_portfolio" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"title" varchar NOT NULL,
  	"lede" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "pagina_produtos_how_to_use" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "pagina_produtos" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"title" varchar NOT NULL,
  	"lede" varchar,
  	"digital_lede" varchar,
  	"works_lede" varchar,
  	"works_title" varchar,
  	"commission_title" varchar,
  	"commission_text" varchar,
  	"commission_label" varchar,
  	"purchase_note" varchar,
  	"digital_note" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "contato_subjects" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "contato" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"title" varchar NOT NULL,
  	"intro" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "privacidade" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"body" jsonb,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "pagina_blog" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"title" varchar DEFAULT 'Diário do Ateliê' NOT NULL,
  	"intro" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "configuracoes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"site_name" varchar DEFAULT 'Mari Nunes Arts' NOT NULL,
  	"author_name" varchar DEFAULT 'Mariane Nunes' NOT NULL,
  	"site_url" varchar DEFAULT 'https://www.marinunesarts.com' NOT NULL,
  	"email" varchar NOT NULL,
  	"city" varchar DEFAULT 'São Paulo, Brasil',
  	"social_instagram" varchar,
  	"social_etsy" varchar,
  	"social_pinterest" varchar,
  	"footer_text" varchar,
  	"person_job_title" varchar DEFAULT 'Artista visual',
  	"person_description" varchar,
  	"person_author_bio" varchar,
  	"person_photo_id" integer,
  	"newsletter_title" varchar DEFAULT 'Cartas do ateliê',
  	"newsletter_text" varchar,
  	"newsletter_button_label" varchar DEFAULT 'Quero receber',
  	"og_image_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "obras_categories" ADD CONSTRAINT "obras_categories_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."obras"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "obras_mockups" ADD CONSTRAINT "obras_mockups_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "obras_mockups" ADD CONSTRAINT "obras_mockups_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."obras"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "obras" ADD CONSTRAINT "obras_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "produtos_images" ADD CONSTRAINT "produtos_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "produtos_images" ADD CONSTRAINT "produtos_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."produtos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "produtos_specs" ADD CONSTRAINT "produtos_specs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."produtos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "produtos_includes" ADD CONSTRAINT "produtos_includes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."produtos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_keywords" ADD CONSTRAINT "posts_keywords_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_sources" ADD CONSTRAINT "posts_sources_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_cover_image_id_media_id_fk" FOREIGN KEY ("cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_category_id_categorias_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categorias"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_version_keywords" ADD CONSTRAINT "_posts_v_version_keywords_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_version_sources" ADD CONSTRAINT "_posts_v_version_sources_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_parent_id_posts_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_cover_image_id_media_id_fk" FOREIGN KEY ("version_cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_category_id_categorias_id_fk" FOREIGN KEY ("version_category_id") REFERENCES "public"."categorias"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_obras_fk" FOREIGN KEY ("obras_id") REFERENCES "public"."obras"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_produtos_fk" FOREIGN KEY ("produtos_id") REFERENCES "public"."produtos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_categorias_fk" FOREIGN KEY ("categorias_id") REFERENCES "public"."categorias"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "inicio" ADD CONSTRAINT "inicio_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "inicio" ADD CONSTRAINT "inicio_hero_featured_work_id_obras_id_fk" FOREIGN KEY ("hero_featured_work_id") REFERENCES "public"."obras"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "inicio_rels" ADD CONSTRAINT "inicio_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."inicio"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "inicio_rels" ADD CONSTRAINT "inicio_rels_produtos_fk" FOREIGN KEY ("produtos_id") REFERENCES "public"."produtos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "inicio_rels" ADD CONSTRAINT "inicio_rels_obras_fk" FOREIGN KEY ("obras_id") REFERENCES "public"."obras"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sobre_processo_steps" ADD CONSTRAINT "sobre_processo_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sobre"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sobre_processo_gallery" ADD CONSTRAINT "sobre_processo_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "sobre_processo_gallery" ADD CONSTRAINT "sobre_processo_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sobre"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sobre_influencias_groups_items" ADD CONSTRAINT "sobre_influencias_groups_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sobre_influencias_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sobre_influencias_groups" ADD CONSTRAINT "sobre_influencias_groups_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sobre"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sobre" ADD CONSTRAINT "sobre_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pagina_produtos_how_to_use" ADD CONSTRAINT "pagina_produtos_how_to_use_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pagina_produtos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contato_subjects" ADD CONSTRAINT "contato_subjects_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contato"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "configuracoes" ADD CONSTRAINT "configuracoes_person_photo_id_media_id_fk" FOREIGN KEY ("person_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "configuracoes" ADD CONSTRAINT "configuracoes_og_image_id_media_id_fk" FOREIGN KEY ("og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "obras_categories_order_idx" ON "obras_categories" USING btree ("order");
  CREATE INDEX "obras_categories_parent_idx" ON "obras_categories" USING btree ("parent_id");
  CREATE INDEX "obras_mockups_order_idx" ON "obras_mockups" USING btree ("_order");
  CREATE INDEX "obras_mockups_parent_id_idx" ON "obras_mockups" USING btree ("_parent_id");
  CREATE INDEX "obras_mockups_image_idx" ON "obras_mockups" USING btree ("image_id");
  CREATE INDEX "obras_image_idx" ON "obras" USING btree ("image_id");
  CREATE UNIQUE INDEX "obras_slug_idx" ON "obras" USING btree ("slug");
  CREATE INDEX "obras_updated_at_idx" ON "obras" USING btree ("updated_at");
  CREATE INDEX "obras_created_at_idx" ON "obras" USING btree ("created_at");
  CREATE INDEX "produtos_images_order_idx" ON "produtos_images" USING btree ("_order");
  CREATE INDEX "produtos_images_parent_id_idx" ON "produtos_images" USING btree ("_parent_id");
  CREATE INDEX "produtos_images_image_idx" ON "produtos_images" USING btree ("image_id");
  CREATE INDEX "produtos_specs_order_idx" ON "produtos_specs" USING btree ("_order");
  CREATE INDEX "produtos_specs_parent_id_idx" ON "produtos_specs" USING btree ("_parent_id");
  CREATE INDEX "produtos_includes_order_idx" ON "produtos_includes" USING btree ("_order");
  CREATE INDEX "produtos_includes_parent_id_idx" ON "produtos_includes" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "produtos_slug_idx" ON "produtos" USING btree ("slug");
  CREATE INDEX "produtos_updated_at_idx" ON "produtos" USING btree ("updated_at");
  CREATE INDEX "produtos_created_at_idx" ON "produtos" USING btree ("created_at");
  CREATE INDEX "posts_keywords_order_idx" ON "posts_keywords" USING btree ("_order");
  CREATE INDEX "posts_keywords_parent_id_idx" ON "posts_keywords" USING btree ("_parent_id");
  CREATE INDEX "posts_sources_order_idx" ON "posts_sources" USING btree ("_order");
  CREATE INDEX "posts_sources_parent_id_idx" ON "posts_sources" USING btree ("_parent_id");
  CREATE INDEX "posts_cover_cover_image_idx" ON "posts" USING btree ("cover_image_id");
  CREATE UNIQUE INDEX "posts_slug_idx" ON "posts" USING btree ("slug");
  CREATE INDEX "posts_category_idx" ON "posts" USING btree ("category_id");
  CREATE INDEX "posts_updated_at_idx" ON "posts" USING btree ("updated_at");
  CREATE INDEX "posts_created_at_idx" ON "posts" USING btree ("created_at");
  CREATE INDEX "posts__status_idx" ON "posts" USING btree ("_status");
  CREATE INDEX "posts_rels_order_idx" ON "posts_rels" USING btree ("order");
  CREATE INDEX "posts_rels_parent_idx" ON "posts_rels" USING btree ("parent_id");
  CREATE INDEX "posts_rels_path_idx" ON "posts_rels" USING btree ("path");
  CREATE INDEX "posts_rels_posts_id_idx" ON "posts_rels" USING btree ("posts_id");
  CREATE INDEX "_posts_v_version_keywords_order_idx" ON "_posts_v_version_keywords" USING btree ("_order");
  CREATE INDEX "_posts_v_version_keywords_parent_id_idx" ON "_posts_v_version_keywords" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_version_sources_order_idx" ON "_posts_v_version_sources" USING btree ("_order");
  CREATE INDEX "_posts_v_version_sources_parent_id_idx" ON "_posts_v_version_sources" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_parent_idx" ON "_posts_v" USING btree ("parent_id");
  CREATE INDEX "_posts_v_version_cover_version_cover_image_idx" ON "_posts_v" USING btree ("version_cover_image_id");
  CREATE INDEX "_posts_v_version_version_slug_idx" ON "_posts_v" USING btree ("version_slug");
  CREATE INDEX "_posts_v_version_version_category_idx" ON "_posts_v" USING btree ("version_category_id");
  CREATE INDEX "_posts_v_version_version_updated_at_idx" ON "_posts_v" USING btree ("version_updated_at");
  CREATE INDEX "_posts_v_version_version_created_at_idx" ON "_posts_v" USING btree ("version_created_at");
  CREATE INDEX "_posts_v_version_version__status_idx" ON "_posts_v" USING btree ("version__status");
  CREATE INDEX "_posts_v_created_at_idx" ON "_posts_v" USING btree ("created_at");
  CREATE INDEX "_posts_v_updated_at_idx" ON "_posts_v" USING btree ("updated_at");
  CREATE INDEX "_posts_v_latest_idx" ON "_posts_v" USING btree ("latest");
  CREATE INDEX "_posts_v_rels_order_idx" ON "_posts_v_rels" USING btree ("order");
  CREATE INDEX "_posts_v_rels_parent_idx" ON "_posts_v_rels" USING btree ("parent_id");
  CREATE INDEX "_posts_v_rels_path_idx" ON "_posts_v_rels" USING btree ("path");
  CREATE INDEX "_posts_v_rels_posts_id_idx" ON "_posts_v_rels" USING btree ("posts_id");
  CREATE UNIQUE INDEX "categorias_slug_idx" ON "categorias" USING btree ("slug");
  CREATE INDEX "categorias_updated_at_idx" ON "categorias" USING btree ("updated_at");
  CREATE INDEX "categorias_created_at_idx" ON "categorias" USING btree ("created_at");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_small_sizes_small_filename_idx" ON "media" USING btree ("sizes_small_filename");
  CREATE INDEX "media_sizes_medium_sizes_medium_filename_idx" ON "media" USING btree ("sizes_medium_filename");
  CREATE INDEX "media_sizes_large_sizes_large_filename_idx" ON "media" USING btree ("sizes_large_filename");
  CREATE INDEX "media_sizes_xlarge_sizes_xlarge_filename_idx" ON "media" USING btree ("sizes_xlarge_filename");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_obras_id_idx" ON "payload_locked_documents_rels" USING btree ("obras_id");
  CREATE INDEX "payload_locked_documents_rels_produtos_id_idx" ON "payload_locked_documents_rels" USING btree ("produtos_id");
  CREATE INDEX "payload_locked_documents_rels_posts_id_idx" ON "payload_locked_documents_rels" USING btree ("posts_id");
  CREATE INDEX "payload_locked_documents_rels_categorias_id_idx" ON "payload_locked_documents_rels" USING btree ("categorias_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "inicio_hero_hero_image_idx" ON "inicio" USING btree ("hero_image_id");
  CREATE INDEX "inicio_hero_hero_featured_work_idx" ON "inicio" USING btree ("hero_featured_work_id");
  CREATE INDEX "inicio_rels_order_idx" ON "inicio_rels" USING btree ("order");
  CREATE INDEX "inicio_rels_parent_idx" ON "inicio_rels" USING btree ("parent_id");
  CREATE INDEX "inicio_rels_path_idx" ON "inicio_rels" USING btree ("path");
  CREATE INDEX "inicio_rels_produtos_id_idx" ON "inicio_rels" USING btree ("produtos_id");
  CREATE INDEX "inicio_rels_obras_id_idx" ON "inicio_rels" USING btree ("obras_id");
  CREATE INDEX "sobre_processo_steps_order_idx" ON "sobre_processo_steps" USING btree ("_order");
  CREATE INDEX "sobre_processo_steps_parent_id_idx" ON "sobre_processo_steps" USING btree ("_parent_id");
  CREATE INDEX "sobre_processo_gallery_order_idx" ON "sobre_processo_gallery" USING btree ("_order");
  CREATE INDEX "sobre_processo_gallery_parent_id_idx" ON "sobre_processo_gallery" USING btree ("_parent_id");
  CREATE INDEX "sobre_processo_gallery_image_idx" ON "sobre_processo_gallery" USING btree ("image_id");
  CREATE INDEX "sobre_influencias_groups_items_order_idx" ON "sobre_influencias_groups_items" USING btree ("_order");
  CREATE INDEX "sobre_influencias_groups_items_parent_id_idx" ON "sobre_influencias_groups_items" USING btree ("_parent_id");
  CREATE INDEX "sobre_influencias_groups_order_idx" ON "sobre_influencias_groups" USING btree ("_order");
  CREATE INDEX "sobre_influencias_groups_parent_id_idx" ON "sobre_influencias_groups" USING btree ("_parent_id");
  CREATE INDEX "sobre_photo_idx" ON "sobre" USING btree ("photo_id");
  CREATE INDEX "pagina_produtos_how_to_use_order_idx" ON "pagina_produtos_how_to_use" USING btree ("_order");
  CREATE INDEX "pagina_produtos_how_to_use_parent_id_idx" ON "pagina_produtos_how_to_use" USING btree ("_parent_id");
  CREATE INDEX "contato_subjects_order_idx" ON "contato_subjects" USING btree ("_order");
  CREATE INDEX "contato_subjects_parent_id_idx" ON "contato_subjects" USING btree ("_parent_id");
  CREATE INDEX "configuracoes_person_person_photo_idx" ON "configuracoes" USING btree ("person_photo_id");
  CREATE INDEX "configuracoes_og_image_idx" ON "configuracoes" USING btree ("og_image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "obras_categories" CASCADE;
  DROP TABLE "obras_mockups" CASCADE;
  DROP TABLE "obras" CASCADE;
  DROP TABLE "produtos_images" CASCADE;
  DROP TABLE "produtos_specs" CASCADE;
  DROP TABLE "produtos_includes" CASCADE;
  DROP TABLE "produtos" CASCADE;
  DROP TABLE "posts_keywords" CASCADE;
  DROP TABLE "posts_sources" CASCADE;
  DROP TABLE "posts" CASCADE;
  DROP TABLE "posts_rels" CASCADE;
  DROP TABLE "_posts_v_version_keywords" CASCADE;
  DROP TABLE "_posts_v_version_sources" CASCADE;
  DROP TABLE "_posts_v" CASCADE;
  DROP TABLE "_posts_v_rels" CASCADE;
  DROP TABLE "categorias" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "inicio" CASCADE;
  DROP TABLE "inicio_rels" CASCADE;
  DROP TABLE "sobre_processo_steps" CASCADE;
  DROP TABLE "sobre_processo_gallery" CASCADE;
  DROP TABLE "sobre_influencias_groups_items" CASCADE;
  DROP TABLE "sobre_influencias_groups" CASCADE;
  DROP TABLE "sobre" CASCADE;
  DROP TABLE "pagina_portfolio" CASCADE;
  DROP TABLE "pagina_produtos_how_to_use" CASCADE;
  DROP TABLE "pagina_produtos" CASCADE;
  DROP TABLE "contato_subjects" CASCADE;
  DROP TABLE "contato" CASCADE;
  DROP TABLE "privacidade" CASCADE;
  DROP TABLE "pagina_blog" CASCADE;
  DROP TABLE "configuracoes" CASCADE;
  DROP TYPE "public"."enum_obras_categories";
  DROP TYPE "public"."enum_obras_status";
  DROP TYPE "public"."enum_produtos_currency";
  DROP TYPE "public"."enum_posts_cover_kind";
  DROP TYPE "public"."enum_posts_status";
  DROP TYPE "public"."enum__posts_v_version_cover_kind";
  DROP TYPE "public"."enum__posts_v_version_status";`)
}
