import { postgresAdapter } from '@payloadcms/db-postgres'
import { cloudStoragePlugin } from '@payloadcms/plugin-cloud-storage'
import { pt } from '@payloadcms/translations/languages/pt'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import tls from 'tls'
import { fileURLToPath } from 'url'

import { pageEditor } from './blocks/editors'
import { Categorias } from './collections/Categorias'
import { Media } from './collections/Media'
import { Obras } from './collections/Obras'
import { Posts } from './collections/Posts'
import { Produtos } from './collections/Produtos'
import { Users } from './collections/Users'
import { SUPABASE_ROOT_CA } from './db/supabase-ca'
import {
  Configuracoes,
  Contato,
  Inicio,
  PaginaBlog,
  PaginaPortfolio,
  PaginaProdutos,
  Privacidade,
  Sobre,
} from './globals'
import { supabaseStorage } from './storage/supabase'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

/*
 * Banco de dados: DATABASE_URL ou, no ar, a POSTGRES_URL criada pela integração Supabase da Vercel.
 * A conexão é criptografada e conferida com o certificado raiz do Supabase (além dos certificados
 * públicos de costume). O sslmode do endereço é retirado para valer a configuração abaixo.
 */
function databaseConfig() {
  const raw = process.env.DATABASE_URL || process.env.POSTGRES_URL || ''
  if (!raw) return { connectionString: '' }
  const url = new URL(raw)
  url.searchParams.delete('sslmode')
  url.searchParams.delete('supa')
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)
  return {
    connectionString: url.toString(),
    ssl: local ? undefined : { ca: [...tls.rootCertificates, SUPABASE_ROOT_CA] },
  }
}

// Imagens: no ar ficam no Supabase Storage. Sem as variáveis do Supabase, ficam na pasta /media (uso local).
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || ''
const useSupabaseStorage = Boolean(SUPABASE_URL && SUPABASE_KEY)

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || '',
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: { titleSuffix: ' | Mari Nunes Arts' },
    dateFormat: 'dd/MM/yyyy HH:mm',
  },
  i18n: { supportedLanguages: { pt }, fallbackLanguage: 'pt' },
  collections: [Obras, Produtos, Posts, Categorias, Media, Users],
  globals: [Inicio, Sobre, PaginaPortfolio, PaginaProdutos, Contato, Privacidade, PaginaBlog, Configuracoes],
  editor: pageEditor,
  // PAYLOAD_SECRET, se existir; senão, a chave secreta do Supabase criada pela integração da Vercel
  secret: process.env.PAYLOAD_SECRET || process.env.SUPABASE_JWT_SECRET || '',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: postgresAdapter({
    pool: { ...databaseConfig(), max: Number(process.env.DATABASE_POOL_MAX || 5) },
    migrationDir: path.resolve(dirname, 'migrations'),
  }),
  sharp,
  plugins: [
    cloudStoragePlugin({
      enabled: useSupabaseStorage,
      // os campos do armazenamento ficam no banco com ou sem o Supabase (no computador e no ar)
      alwaysInsertFields: true,
      collections: {
        media: {
          adapter: useSupabaseStorage
            ? supabaseStorage({ url: SUPABASE_URL, key: SUPABASE_KEY, bucket: process.env.SUPABASE_STORAGE_BUCKET || 'media' })
            : null,
          disablePayloadAccessControl: true,
        },
      },
    }),
  ],
})
