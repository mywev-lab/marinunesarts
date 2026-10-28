/**
 * Guarda as imagens enviadas pelo painel no Supabase Storage, usando a API do próprio Supabase
 * (as variáveis SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY vêm da integração Supabase da Vercel).
 * O bucket é público: o site mostra as imagens direto do endereço público do Supabase.
 */
import type { Adapter } from '@payloadcms/plugin-cloud-storage/types'
import { buildStoragePathData } from '@payloadcms/plugin-cloud-storage/utilities'
import { readFile } from 'fs/promises'

type Options = {
  /** https://<projeto>.supabase.co */
  url: string
  /** chave secreta (service_role ou sb_secret_...): só no servidor */
  key: string
  bucket: string
}

const encodePath = (value: string) => value.split('/').map(encodeURIComponent).join('/')

export function supabaseStorage({ url, key, bucket }: Options): Adapter {
  const api = `${url.replace(/\/+$/, '')}/storage/v1`
  // As chaves novas (sb_secret_...) não são JWT: vão só no cabeçalho apikey
  const auth: Record<string, string> = key.startsWith('sb_') ? { apikey: key } : { apikey: key, Authorization: `Bearer ${key}` }
  const objectURL = (filePath: string) => `${api}/object/${bucket}/${encodePath(filePath)}`
  const publicURL = (filePath: string) => `${api}/object/public/${bucket}/${encodePath(filePath)}`

  return ({ prefix: collectionPrefix }) => {
    const filePathOf = (filename: string, prefix?: string) =>
      buildStoragePathData({ collectionPrefix, docPrefix: prefix, filename }).storageFilePath

    return {
      name: 'supabase-storage',

      generateURL: ({ filename, prefix }) => publicURL(filePathOf(filename, prefix)),

      handleUpload: async ({ file, storageFilePath }) => {
        const body = file.tempFilePath ? await readFile(file.tempFilePath) : file.buffer
        const res = await fetch(objectURL(storageFilePath), {
          method: 'POST',
          headers: { ...auth, 'Content-Type': file.mimeType, 'x-upsert': 'true', 'cache-control': 'max-age=86400' },
          body: new Uint8Array(body),
        })
        if (!res.ok) {
          throw new Error(`Supabase Storage: não foi possível enviar ${storageFilePath} (${res.status} ${await res.text()})`)
        }
      },

      handleDelete: async ({ storageFilePath }) => {
        const res = await fetch(objectURL(storageFilePath), { method: 'DELETE', headers: auth })
        if (!res.ok && res.status !== 404) {
          throw new Error(`Supabase Storage: não foi possível apagar ${storageFilePath} (${res.status} ${await res.text()})`)
        }
      },

      // Os endereços das imagens já apontam para o Supabase; isto só cobre links antigos /api/media/file/...
      staticHandler: (_req, { params }) => Response.redirect(publicURL(filePathOf(params.filename, params.prefix)), 302),
    }
  }
}
