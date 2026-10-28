import { postgresAdapter } from '@payloadcms/db-postgres'
import { s3Storage } from '@payloadcms/storage-s3'
import { pt } from '@payloadcms/translations/languages/pt'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { pageEditor } from './blocks/editors'
import { Categorias } from './collections/Categorias'
import { Media } from './collections/Media'
import { Obras } from './collections/Obras'
import { Posts } from './collections/Posts'
import { Produtos } from './collections/Produtos'
import { Users } from './collections/Users'
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

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Imagens: no ar ficam no Supabase Storage (S3). Sem as variáveis S3_*, ficam na pasta /media (uso local).
const S3_ENDPOINT = process.env.S3_ENDPOINT || ''
const S3_BUCKET = process.env.S3_BUCKET || ''
const useS3 = Boolean(S3_ENDPOINT && S3_BUCKET && process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY)
// https://<projeto>.supabase.co/storage/v1/s3 → https://<projeto>.supabase.co/storage/v1/object/public/<bucket>
const publicMediaBase = S3_ENDPOINT.replace(/\/storage\/v1\/s3\/?$/, `/storage/v1/object/public/${S3_BUCKET}`)

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
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
      max: Number(process.env.DATABASE_POOL_MAX || 5),
    },
    migrationDir: path.resolve(dirname, 'migrations'),
  }),
  sharp,
  plugins: useS3
    ? [
        s3Storage({
          collections: {
            media: {
              disablePayloadAccessControl: true,
              generateFileURL: ({ filename, prefix }) => [publicMediaBase, prefix, filename].filter(Boolean).join('/'),
            },
          },
          bucket: S3_BUCKET,
          config: {
            endpoint: S3_ENDPOINT,
            region: process.env.S3_REGION || 'sa-east-1',
            forcePathStyle: true,
            credentials: {
              accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
              secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
            },
          },
        }),
      ]
    : [],
})
