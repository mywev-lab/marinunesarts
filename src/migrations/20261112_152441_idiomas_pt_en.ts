import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

/*
 * Idiomas do conteúdo (português e inglês).
 *
 * Cada texto passa da tabela principal para uma tabela "_locales" (uma linha por idioma).
 * Os textos que já existem são copiados como português ANTES de as colunas antigas saírem,
 * então nada se perde: o site em português fica igual. O inglês entra na migração seguinte.
 */

/** Tabela → colunas de texto que passam a ter versão por idioma */
const MOVES: [string, string[]][] = [
  ['obras', ['title', 'technique', 'dimensions', 'format', 'description', 'etsy_label', 'etsy_note']],
  ['produtos_specs', ['label', 'value']],
  ['produtos_includes', ['text']],
  ['produtos', ['name', 'kind', 'category', 'price', 'summary', 'card_meta']],
  ['posts_keywords', ['keyword']],
  ['posts', ['title', 'dek', 'cover_caption', 'content', 'excerpt', 'seo_title', 'description', 'cta_title', 'cta_text', 'cta_label']],
  ['_posts_v_version_keywords', ['keyword']],
  ['_posts_v', ['version_title', 'version_dek', 'version_cover_caption', 'version_content', 'version_excerpt', 'version_seo_title', 'version_description', 'version_cta_title', 'version_cta_text', 'version_cta_label']],
  ['categorias', ['name', 'description']],
  ['media', ['alt']],
  ['inicio', ['seo_title', 'seo_description', 'hero_kicker', 'hero_title', 'hero_subtitle', 'hero_primary_label', 'hero_secondary_label', 'produtos_title', 'produtos_lede', 'produtos_link_label', 'statement_quote', 'statement_text', 'atelie_title', 'atelie_lede', 'atelie_link_label', 'sobre_title', 'sobre_text', 'sobre_link_label']],
  ['sobre_processo_steps', ['title', 'text']],
  ['sobre_influencias_groups_items', ['name', 'text']],
  ['sobre_influencias_groups', ['title']],
  ['sobre', ['seo_title', 'seo_description', 'kicker', 'title', 'body', 'pull_quote', 'processo_title', 'processo_lede', 'processo_caption', 'influencias_title', 'cta_title', 'cta_text', 'cta_label']],
  ['pagina_portfolio', ['seo_title', 'seo_description', 'title', 'lede']],
  ['pagina_produtos_how_to_use', ['text']],
  ['pagina_produtos', ['seo_title', 'seo_description', 'title', 'lede', 'digital_lede', 'works_lede', 'works_title', 'prints_title', 'prints_lede', 'print_note', 'commission_title', 'commission_text', 'commission_label', 'purchase_note', 'digital_note']],
  ['contato_subjects', ['text']],
  ['contato', ['seo_title', 'seo_description', 'title', 'intro']],
  ['privacidade', ['title', 'body']],
  ['pagina_blog', ['seo_title', 'seo_description', 'title', 'intro']],
  ['configuracoes', ['city', 'footer_text', 'person_job_title', 'person_description', 'person_author_bio', 'newsletter_title', 'newsletter_text', 'newsletter_button_label', 'cookies_text', 'cookies_accept_label', 'cookies_reject_label']],
]

/** Colunas obrigatórias (para desfazer a migração com as mesmas regras) */
const REQUIRED: Record<string, string[]> = {
  'obras': ['title', 'technique', 'description'],
  'produtos_specs': ['label', 'value'],
  'produtos_includes': ['text'],
  'produtos': ['name', 'kind', 'summary'],
  'posts_keywords': [],
  'categorias': ['name'],
  'media': ['alt'],
  'inicio': ['hero_title'],
  'sobre_processo_steps': ['title'],
  'sobre_influencias_groups_items': ['name'],
  'sobre_influencias_groups': ['title'],
  'sobre': ['title'],
  'pagina_portfolio': ['title'],
  'pagina_produtos_how_to_use': ['text'],
  'pagina_produtos': ['title'],
  'contato_subjects': ['text'],
  'contato': ['title'],
  'privacidade': ['title'],
  'pagina_blog': ['title'],
}

const TYPES: Record<string, string> = {
  'obras.title': 'varchar',
  'obras.technique': 'varchar',
  'obras.dimensions': 'varchar',
  'obras.format': 'varchar',
  'obras.description': 'varchar',
  'obras.etsy_label': 'varchar',
  'obras.etsy_note': 'varchar',
  'produtos_specs.label': 'varchar',
  'produtos_specs.value': 'varchar',
  'produtos_includes.text': 'varchar',
  'produtos.name': 'varchar',
  'produtos.kind': 'varchar',
  'produtos.category': 'varchar',
  'produtos.price': 'varchar',
  'produtos.summary': 'varchar',
  'produtos.card_meta': 'varchar',
  'posts_keywords.keyword': 'varchar',
  'posts.title': 'varchar',
  'posts.dek': 'varchar',
  'posts.cover_caption': 'jsonb',
  'posts.content': 'jsonb',
  'posts.excerpt': 'varchar',
  'posts.seo_title': 'varchar',
  'posts.description': 'varchar',
  'posts.cta_title': 'varchar',
  'posts.cta_text': 'varchar',
  'posts.cta_label': 'varchar',
  '_posts_v_version_keywords.keyword': 'varchar',
  '_posts_v.version_title': 'varchar',
  '_posts_v.version_dek': 'varchar',
  '_posts_v.version_cover_caption': 'jsonb',
  '_posts_v.version_content': 'jsonb',
  '_posts_v.version_excerpt': 'varchar',
  '_posts_v.version_seo_title': 'varchar',
  '_posts_v.version_description': 'varchar',
  '_posts_v.version_cta_title': 'varchar',
  '_posts_v.version_cta_text': 'varchar',
  '_posts_v.version_cta_label': 'varchar',
  'categorias.name': 'varchar',
  'categorias.description': 'varchar',
  'media.alt': 'varchar',
  'inicio.seo_title': 'varchar',
  'inicio.seo_description': 'varchar',
  'inicio.hero_kicker': 'varchar',
  'inicio.hero_title': 'varchar',
  'inicio.hero_subtitle': 'varchar',
  'inicio.hero_primary_label': 'varchar',
  'inicio.hero_secondary_label': 'varchar',
  'inicio.produtos_title': 'varchar',
  'inicio.produtos_lede': 'varchar',
  'inicio.produtos_link_label': 'varchar',
  'inicio.statement_quote': 'varchar',
  'inicio.statement_text': 'varchar',
  'inicio.atelie_title': 'varchar',
  'inicio.atelie_lede': 'varchar',
  'inicio.atelie_link_label': 'varchar',
  'inicio.sobre_title': 'varchar',
  'inicio.sobre_text': 'varchar',
  'inicio.sobre_link_label': 'varchar',
  'sobre_processo_steps.title': 'varchar',
  'sobre_processo_steps.text': 'varchar',
  'sobre_influencias_groups_items.name': 'varchar',
  'sobre_influencias_groups_items.text': 'varchar',
  'sobre_influencias_groups.title': 'varchar',
  'sobre.seo_title': 'varchar',
  'sobre.seo_description': 'varchar',
  'sobre.kicker': 'varchar',
  'sobre.title': 'varchar',
  'sobre.body': 'jsonb',
  'sobre.pull_quote': 'varchar',
  'sobre.processo_title': 'varchar',
  'sobre.processo_lede': 'varchar',
  'sobre.processo_caption': 'varchar',
  'sobre.influencias_title': 'varchar',
  'sobre.cta_title': 'varchar',
  'sobre.cta_text': 'varchar',
  'sobre.cta_label': 'varchar',
  'pagina_portfolio.seo_title': 'varchar',
  'pagina_portfolio.seo_description': 'varchar',
  'pagina_portfolio.title': 'varchar',
  'pagina_portfolio.lede': 'varchar',
  'pagina_produtos_how_to_use.text': 'varchar',
  'pagina_produtos.seo_title': 'varchar',
  'pagina_produtos.seo_description': 'varchar',
  'pagina_produtos.title': 'varchar',
  'pagina_produtos.lede': 'varchar',
  'pagina_produtos.digital_lede': 'varchar',
  'pagina_produtos.works_lede': 'varchar',
  'pagina_produtos.works_title': 'varchar',
  'pagina_produtos.prints_title': 'varchar',
  'pagina_produtos.prints_lede': 'varchar',
  'pagina_produtos.print_note': 'varchar',
  'pagina_produtos.commission_title': 'varchar',
  'pagina_produtos.commission_text': 'varchar',
  'pagina_produtos.commission_label': 'varchar',
  'pagina_produtos.purchase_note': 'varchar',
  'pagina_produtos.digital_note': 'varchar',
  'contato_subjects.text': 'varchar',
  'contato.seo_title': 'varchar',
  'contato.seo_description': 'varchar',
  'contato.title': 'varchar',
  'contato.intro': 'varchar',
  'privacidade.title': 'varchar',
  'privacidade.body': 'jsonb',
  'pagina_blog.seo_title': 'varchar',
  'pagina_blog.seo_description': 'varchar',
  'pagina_blog.title': 'varchar',
  'pagina_blog.intro': 'varchar',
  'configuracoes.city': 'varchar',
  'configuracoes.footer_text': 'varchar',
  'configuracoes.person_job_title': 'varchar',
  'configuracoes.person_description': 'varchar',
  'configuracoes.person_author_bio': 'varchar',
  'configuracoes.newsletter_title': 'varchar',
  'configuracoes.newsletter_text': 'varchar',
  'configuracoes.newsletter_button_label': 'varchar',
  'configuracoes.cookies_text': 'varchar',
  'configuracoes.cookies_accept_label': 'varchar',
  'configuracoes.cookies_reject_label': 'varchar',
}

const DEFAULTS: Record<string, string> = {
  'produtos.category': "'Planners'",
  'pagina_produtos.prints_title': "'Prints artísticos'",
  'pagina_blog.title': "'Diário do Ateliê'",
  'configuracoes.person_job_title': "'Artista visual'",
  'configuracoes.newsletter_title': "'Cartas do ateliê'",
  'configuracoes.newsletter_button_label': "'Quero receber'",
}

const q = (name: string) => `"${name}"`

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // 1. tabelas de idiomas
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('pt', 'en');
  CREATE TYPE "public"."enum__posts_v_published_locale" AS ENUM('pt', 'en');
  CREATE TABLE "obras_locales" (
  	"title" varchar NOT NULL,
  	"technique" varchar NOT NULL,
  	"dimensions" varchar,
  	"format" varchar,
  	"description" varchar NOT NULL,
  	"etsy_label" varchar,
  	"etsy_note" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "produtos_specs_locales" (
  	"label" varchar NOT NULL,
  	"value" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "produtos_includes_locales" (
  	"text" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "produtos_locales" (
  	"name" varchar NOT NULL,
  	"kind" varchar NOT NULL,
  	"category" varchar DEFAULT 'Planners',
  	"price" varchar,
  	"summary" varchar NOT NULL,
  	"card_meta" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "posts_keywords_locales" (
  	"keyword" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "posts_locales" (
  	"title" varchar,
  	"dek" varchar,
  	"cover_caption" jsonb,
  	"content" jsonb,
  	"excerpt" varchar,
  	"seo_title" varchar,
  	"description" varchar,
  	"cta_title" varchar,
  	"cta_text" varchar,
  	"cta_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_posts_v_version_keywords_locales" (
  	"keyword" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_posts_v_locales" (
  	"version_title" varchar,
  	"version_dek" varchar,
  	"version_cover_caption" jsonb,
  	"version_content" jsonb,
  	"version_excerpt" varchar,
  	"version_seo_title" varchar,
  	"version_description" varchar,
  	"version_cta_title" varchar,
  	"version_cta_text" varchar,
  	"version_cta_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "categorias_locales" (
  	"name" varchar NOT NULL,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "media_locales" (
  	"alt" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "inicio_locales" (
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"hero_kicker" varchar,
  	"hero_title" varchar NOT NULL,
  	"hero_subtitle" varchar,
  	"hero_primary_label" varchar,
  	"hero_secondary_label" varchar,
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
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "sobre_processo_steps_locales" (
  	"title" varchar NOT NULL,
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "sobre_influencias_groups_items_locales" (
  	"name" varchar NOT NULL,
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "sobre_influencias_groups_locales" (
  	"title" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "sobre_locales" (
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"kicker" varchar,
  	"title" varchar NOT NULL,
  	"body" jsonb,
  	"pull_quote" varchar,
  	"processo_title" varchar,
  	"processo_lede" varchar,
  	"processo_caption" varchar,
  	"influencias_title" varchar,
  	"cta_title" varchar,
  	"cta_text" varchar,
  	"cta_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "pagina_portfolio_locales" (
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"title" varchar NOT NULL,
  	"lede" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "pagina_produtos_how_to_use_locales" (
  	"text" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pagina_produtos_locales" (
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"title" varchar NOT NULL,
  	"lede" varchar,
  	"digital_lede" varchar,
  	"works_lede" varchar,
  	"works_title" varchar,
  	"prints_title" varchar DEFAULT 'Prints artísticos',
  	"prints_lede" varchar,
  	"print_note" varchar,
  	"commission_title" varchar,
  	"commission_text" varchar,
  	"commission_label" varchar,
  	"purchase_note" varchar,
  	"digital_note" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "contato_subjects_locales" (
  	"text" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "contato_locales" (
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"title" varchar NOT NULL,
  	"intro" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "privacidade_locales" (
  	"title" varchar NOT NULL,
  	"body" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "pagina_blog_locales" (
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"title" varchar DEFAULT 'Diário do Ateliê' NOT NULL,
  	"intro" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "configuracoes_locales" (
  	"city" varchar DEFAULT 'São Paulo, Brasil',
  	"footer_text" varchar,
  	"person_job_title" varchar DEFAULT 'Artista visual',
  	"person_description" varchar,
  	"person_author_bio" varchar,
  	"newsletter_title" varchar DEFAULT 'Cartas do ateliê',
  	"newsletter_text" varchar,
  	"newsletter_button_label" varchar DEFAULT 'Quero receber',
  	"cookies_text" varchar,
  	"cookies_accept_label" varchar,
  	"cookies_reject_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "_posts_v" ADD COLUMN "snapshot" boolean;
  ALTER TABLE "_posts_v" ADD COLUMN "published_locale" "enum__posts_v_published_locale";
  ALTER TABLE "obras_locales" ADD CONSTRAINT "obras_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."obras"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "produtos_specs_locales" ADD CONSTRAINT "produtos_specs_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."produtos_specs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "produtos_includes_locales" ADD CONSTRAINT "produtos_includes_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."produtos_includes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "produtos_locales" ADD CONSTRAINT "produtos_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."produtos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_keywords_locales" ADD CONSTRAINT "posts_keywords_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts_keywords"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_locales" ADD CONSTRAINT "posts_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_version_keywords_locales" ADD CONSTRAINT "_posts_v_version_keywords_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v_version_keywords"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_locales" ADD CONSTRAINT "_posts_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "categorias_locales" ADD CONSTRAINT "categorias_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."categorias"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_locales" ADD CONSTRAINT "media_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "inicio_locales" ADD CONSTRAINT "inicio_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."inicio"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sobre_processo_steps_locales" ADD CONSTRAINT "sobre_processo_steps_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sobre_processo_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sobre_influencias_groups_items_locales" ADD CONSTRAINT "sobre_influencias_groups_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sobre_influencias_groups_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sobre_influencias_groups_locales" ADD CONSTRAINT "sobre_influencias_groups_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sobre_influencias_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sobre_locales" ADD CONSTRAINT "sobre_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sobre"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pagina_portfolio_locales" ADD CONSTRAINT "pagina_portfolio_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pagina_portfolio"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pagina_produtos_how_to_use_locales" ADD CONSTRAINT "pagina_produtos_how_to_use_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pagina_produtos_how_to_use"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pagina_produtos_locales" ADD CONSTRAINT "pagina_produtos_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pagina_produtos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contato_subjects_locales" ADD CONSTRAINT "contato_subjects_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contato_subjects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contato_locales" ADD CONSTRAINT "contato_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contato"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "privacidade_locales" ADD CONSTRAINT "privacidade_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."privacidade"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pagina_blog_locales" ADD CONSTRAINT "pagina_blog_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pagina_blog"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "configuracoes_locales" ADD CONSTRAINT "configuracoes_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."configuracoes"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "obras_locales_locale_parent_id_unique" ON "obras_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "obras_locales_parent_id_idx" ON "obras_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "produtos_specs_locales_locale_parent_id_unique" ON "produtos_specs_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "produtos_specs_locales_parent_id_idx" ON "produtos_specs_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "produtos_includes_locales_locale_parent_id_unique" ON "produtos_includes_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "produtos_includes_locales_parent_id_idx" ON "produtos_includes_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "produtos_locales_locale_parent_id_unique" ON "produtos_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "produtos_locales_parent_id_idx" ON "produtos_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "posts_keywords_locales_locale_parent_id_unique" ON "posts_keywords_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "posts_keywords_locales_parent_id_idx" ON "posts_keywords_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "posts_locales_locale_parent_id_unique" ON "posts_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "posts_locales_parent_id_idx" ON "posts_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_posts_v_version_keywords_locales_locale_parent_id_unique" ON "_posts_v_version_keywords_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_posts_v_version_keywords_locales_parent_id_idx" ON "_posts_v_version_keywords_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_posts_v_locales_locale_parent_id_unique" ON "_posts_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_posts_v_locales_parent_id_idx" ON "_posts_v_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "categorias_locales_locale_parent_id_unique" ON "categorias_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "categorias_locales_parent_id_idx" ON "categorias_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "media_locales_locale_parent_id_unique" ON "media_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "media_locales_parent_id_idx" ON "media_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "inicio_locales_locale_parent_id_unique" ON "inicio_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "inicio_locales_parent_id_idx" ON "inicio_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "sobre_processo_steps_locales_locale_parent_id_unique" ON "sobre_processo_steps_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "sobre_processo_steps_locales_parent_id_idx" ON "sobre_processo_steps_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "sobre_influencias_groups_items_locales_locale_parent_id_uniq" ON "sobre_influencias_groups_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "sobre_influencias_groups_items_locales_parent_id_idx" ON "sobre_influencias_groups_items_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "sobre_influencias_groups_locales_locale_parent_id_unique" ON "sobre_influencias_groups_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "sobre_influencias_groups_locales_parent_id_idx" ON "sobre_influencias_groups_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "sobre_locales_locale_parent_id_unique" ON "sobre_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "sobre_locales_parent_id_idx" ON "sobre_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pagina_portfolio_locales_locale_parent_id_unique" ON "pagina_portfolio_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pagina_portfolio_locales_parent_id_idx" ON "pagina_portfolio_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pagina_produtos_how_to_use_locales_locale_parent_id_unique" ON "pagina_produtos_how_to_use_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pagina_produtos_how_to_use_locales_parent_id_idx" ON "pagina_produtos_how_to_use_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pagina_produtos_locales_locale_parent_id_unique" ON "pagina_produtos_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pagina_produtos_locales_parent_id_idx" ON "pagina_produtos_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "contato_subjects_locales_locale_parent_id_unique" ON "contato_subjects_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "contato_subjects_locales_parent_id_idx" ON "contato_subjects_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "contato_locales_locale_parent_id_unique" ON "contato_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "contato_locales_parent_id_idx" ON "contato_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "privacidade_locales_locale_parent_id_unique" ON "privacidade_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "privacidade_locales_parent_id_idx" ON "privacidade_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pagina_blog_locales_locale_parent_id_unique" ON "pagina_blog_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pagina_blog_locales_parent_id_idx" ON "pagina_blog_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "configuracoes_locales_locale_parent_id_unique" ON "configuracoes_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "configuracoes_locales_parent_id_idx" ON "configuracoes_locales" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_snapshot_idx" ON "_posts_v" USING btree ("snapshot");
  CREATE INDEX "_posts_v_published_locale_idx" ON "_posts_v" USING btree ("published_locale");`)

  // 2. textos atuais → português
  for (const [table, cols] of MOVES) {
    const list = cols.map(q).join(', ')
    await db.execute(
      sql.raw(`INSERT INTO ${q(`${table}_locales`)} (${list}, "_locale", "_parent_id") SELECT ${list}, 'pt', "id" FROM ${q(table)};`),
    )
  }

  // 3. confere a cópia antes de apagar as colunas antigas
  for (const [table] of MOVES) {
    const res = await db.execute(
      sql.raw(`SELECT (SELECT count(*) FROM ${q(table)})::int AS total, (SELECT count(*) FROM ${q(`${table}_locales`)} WHERE "_locale" = 'pt')::int AS copiados`),
    )
    const row = (res as any).rows?.[0] ?? (res as any)[0]
    if (Number(row.total) !== Number(row.copiados)) {
      throw new Error(`Cópia incompleta em ${table}: ${row.copiados} de ${row.total} linhas`)
    }
  }

  // 4. colunas antigas
  await db.execute(sql`
  ALTER TABLE "obras" DROP COLUMN "title";
  ALTER TABLE "obras" DROP COLUMN "technique";
  ALTER TABLE "obras" DROP COLUMN "dimensions";
  ALTER TABLE "obras" DROP COLUMN "format";
  ALTER TABLE "obras" DROP COLUMN "description";
  ALTER TABLE "obras" DROP COLUMN "etsy_label";
  ALTER TABLE "obras" DROP COLUMN "etsy_note";
  ALTER TABLE "produtos_specs" DROP COLUMN "label";
  ALTER TABLE "produtos_specs" DROP COLUMN "value";
  ALTER TABLE "produtos_includes" DROP COLUMN "text";
  ALTER TABLE "produtos" DROP COLUMN "name";
  ALTER TABLE "produtos" DROP COLUMN "kind";
  ALTER TABLE "produtos" DROP COLUMN "category";
  ALTER TABLE "produtos" DROP COLUMN "price";
  ALTER TABLE "produtos" DROP COLUMN "summary";
  ALTER TABLE "produtos" DROP COLUMN "card_meta";
  ALTER TABLE "posts_keywords" DROP COLUMN "keyword";
  ALTER TABLE "posts" DROP COLUMN "title";
  ALTER TABLE "posts" DROP COLUMN "dek";
  ALTER TABLE "posts" DROP COLUMN "cover_caption";
  ALTER TABLE "posts" DROP COLUMN "content";
  ALTER TABLE "posts" DROP COLUMN "excerpt";
  ALTER TABLE "posts" DROP COLUMN "seo_title";
  ALTER TABLE "posts" DROP COLUMN "description";
  ALTER TABLE "posts" DROP COLUMN "cta_title";
  ALTER TABLE "posts" DROP COLUMN "cta_text";
  ALTER TABLE "posts" DROP COLUMN "cta_label";
  ALTER TABLE "_posts_v_version_keywords" DROP COLUMN "keyword";
  ALTER TABLE "_posts_v" DROP COLUMN "version_title";
  ALTER TABLE "_posts_v" DROP COLUMN "version_dek";
  ALTER TABLE "_posts_v" DROP COLUMN "version_cover_caption";
  ALTER TABLE "_posts_v" DROP COLUMN "version_content";
  ALTER TABLE "_posts_v" DROP COLUMN "version_excerpt";
  ALTER TABLE "_posts_v" DROP COLUMN "version_seo_title";
  ALTER TABLE "_posts_v" DROP COLUMN "version_description";
  ALTER TABLE "_posts_v" DROP COLUMN "version_cta_title";
  ALTER TABLE "_posts_v" DROP COLUMN "version_cta_text";
  ALTER TABLE "_posts_v" DROP COLUMN "version_cta_label";
  ALTER TABLE "categorias" DROP COLUMN "name";
  ALTER TABLE "categorias" DROP COLUMN "description";
  ALTER TABLE "media" DROP COLUMN "alt";
  ALTER TABLE "inicio" DROP COLUMN "seo_title";
  ALTER TABLE "inicio" DROP COLUMN "seo_description";
  ALTER TABLE "inicio" DROP COLUMN "hero_kicker";
  ALTER TABLE "inicio" DROP COLUMN "hero_title";
  ALTER TABLE "inicio" DROP COLUMN "hero_subtitle";
  ALTER TABLE "inicio" DROP COLUMN "hero_primary_label";
  ALTER TABLE "inicio" DROP COLUMN "hero_secondary_label";
  ALTER TABLE "inicio" DROP COLUMN "produtos_title";
  ALTER TABLE "inicio" DROP COLUMN "produtos_lede";
  ALTER TABLE "inicio" DROP COLUMN "produtos_link_label";
  ALTER TABLE "inicio" DROP COLUMN "statement_quote";
  ALTER TABLE "inicio" DROP COLUMN "statement_text";
  ALTER TABLE "inicio" DROP COLUMN "atelie_title";
  ALTER TABLE "inicio" DROP COLUMN "atelie_lede";
  ALTER TABLE "inicio" DROP COLUMN "atelie_link_label";
  ALTER TABLE "inicio" DROP COLUMN "sobre_title";
  ALTER TABLE "inicio" DROP COLUMN "sobre_text";
  ALTER TABLE "inicio" DROP COLUMN "sobre_link_label";
  ALTER TABLE "sobre_processo_steps" DROP COLUMN "title";
  ALTER TABLE "sobre_processo_steps" DROP COLUMN "text";
  ALTER TABLE "sobre_influencias_groups_items" DROP COLUMN "name";
  ALTER TABLE "sobre_influencias_groups_items" DROP COLUMN "text";
  ALTER TABLE "sobre_influencias_groups" DROP COLUMN "title";
  ALTER TABLE "sobre" DROP COLUMN "seo_title";
  ALTER TABLE "sobre" DROP COLUMN "seo_description";
  ALTER TABLE "sobre" DROP COLUMN "kicker";
  ALTER TABLE "sobre" DROP COLUMN "title";
  ALTER TABLE "sobre" DROP COLUMN "body";
  ALTER TABLE "sobre" DROP COLUMN "pull_quote";
  ALTER TABLE "sobre" DROP COLUMN "processo_title";
  ALTER TABLE "sobre" DROP COLUMN "processo_lede";
  ALTER TABLE "sobre" DROP COLUMN "processo_caption";
  ALTER TABLE "sobre" DROP COLUMN "influencias_title";
  ALTER TABLE "sobre" DROP COLUMN "cta_title";
  ALTER TABLE "sobre" DROP COLUMN "cta_text";
  ALTER TABLE "sobre" DROP COLUMN "cta_label";
  ALTER TABLE "pagina_portfolio" DROP COLUMN "seo_title";
  ALTER TABLE "pagina_portfolio" DROP COLUMN "seo_description";
  ALTER TABLE "pagina_portfolio" DROP COLUMN "title";
  ALTER TABLE "pagina_portfolio" DROP COLUMN "lede";
  ALTER TABLE "pagina_produtos_how_to_use" DROP COLUMN "text";
  ALTER TABLE "pagina_produtos" DROP COLUMN "seo_title";
  ALTER TABLE "pagina_produtos" DROP COLUMN "seo_description";
  ALTER TABLE "pagina_produtos" DROP COLUMN "title";
  ALTER TABLE "pagina_produtos" DROP COLUMN "lede";
  ALTER TABLE "pagina_produtos" DROP COLUMN "digital_lede";
  ALTER TABLE "pagina_produtos" DROP COLUMN "works_lede";
  ALTER TABLE "pagina_produtos" DROP COLUMN "works_title";
  ALTER TABLE "pagina_produtos" DROP COLUMN "prints_title";
  ALTER TABLE "pagina_produtos" DROP COLUMN "prints_lede";
  ALTER TABLE "pagina_produtos" DROP COLUMN "print_note";
  ALTER TABLE "pagina_produtos" DROP COLUMN "commission_title";
  ALTER TABLE "pagina_produtos" DROP COLUMN "commission_text";
  ALTER TABLE "pagina_produtos" DROP COLUMN "commission_label";
  ALTER TABLE "pagina_produtos" DROP COLUMN "purchase_note";
  ALTER TABLE "pagina_produtos" DROP COLUMN "digital_note";
  ALTER TABLE "contato_subjects" DROP COLUMN "text";
  ALTER TABLE "contato" DROP COLUMN "seo_title";
  ALTER TABLE "contato" DROP COLUMN "seo_description";
  ALTER TABLE "contato" DROP COLUMN "title";
  ALTER TABLE "contato" DROP COLUMN "intro";
  ALTER TABLE "privacidade" DROP COLUMN "title";
  ALTER TABLE "privacidade" DROP COLUMN "body";
  ALTER TABLE "pagina_blog" DROP COLUMN "seo_title";
  ALTER TABLE "pagina_blog" DROP COLUMN "seo_description";
  ALTER TABLE "pagina_blog" DROP COLUMN "title";
  ALTER TABLE "pagina_blog" DROP COLUMN "intro";
  ALTER TABLE "configuracoes" DROP COLUMN "city";
  ALTER TABLE "configuracoes" DROP COLUMN "footer_text";
  ALTER TABLE "configuracoes" DROP COLUMN "person_job_title";
  ALTER TABLE "configuracoes" DROP COLUMN "person_description";
  ALTER TABLE "configuracoes" DROP COLUMN "person_author_bio";
  ALTER TABLE "configuracoes" DROP COLUMN "newsletter_title";
  ALTER TABLE "configuracoes" DROP COLUMN "newsletter_text";
  ALTER TABLE "configuracoes" DROP COLUMN "newsletter_button_label";
  ALTER TABLE "configuracoes" DROP COLUMN "cookies_text";
  ALTER TABLE "configuracoes" DROP COLUMN "cookies_accept_label";
  ALTER TABLE "configuracoes" DROP COLUMN "cookies_reject_label";`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // devolve as colunas com o texto em português e remove as tabelas de idiomas (o inglês se perde)
  for (const [table, cols] of MOVES) {
    for (const col of cols) {
      const def = DEFAULTS[`${table}.${col}`]
      await db.execute(sql.raw(`ALTER TABLE ${q(table)} ADD COLUMN ${q(col)} ${TYPES[`${table}.${col}`]}${def ? ` DEFAULT ${def}` : ''};`))
    }
    const set = cols.map((c) => `${q(c)} = l.${q(c)}`).join(', ')
    await db.execute(
      sql.raw(`UPDATE ${q(table)} t SET ${set} FROM ${q(`${table}_locales`)} l WHERE l."_parent_id" = t."id" AND l."_locale" = 'pt';`),
    )
    for (const col of REQUIRED[table] || []) {
      await db.execute(sql.raw(`ALTER TABLE ${q(table)} ALTER COLUMN ${q(col)} SET NOT NULL;`))
    }
    await db.execute(sql.raw(`DROP TABLE ${q(`${table}_locales`)} CASCADE;`))
  }
  await db.execute(sql`
  DROP INDEX IF EXISTS "_posts_v_snapshot_idx";
  DROP INDEX IF EXISTS "_posts_v_published_locale_idx";
  ALTER TABLE "_posts_v" DROP COLUMN "snapshot";
  ALTER TABLE "_posts_v" DROP COLUMN "published_locale";
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum__posts_v_published_locale";`)
}
