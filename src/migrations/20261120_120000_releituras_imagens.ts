/**
 * Corrige a imagem principal de Girassóis e de O Beijo: no armazenamento, os dois arquivos .jpg tinham
 * recebido por engano a imagem da Noite Estrelada (as versões menores .webp estavam certas).
 *
 * Causa: a migração das releituras criou as três imagens com o mesmo `req`. O plugin de armazenamento guarda
 * o primeiro arquivo enviado em `req.context` e, quando a imagem é atualizada depois (o texto alternativo em
 * inglês), reenvia esse arquivo guardado no lugar do .jpg da imagem atual.
 *
 * Aqui as duas imagens são reenviadas a partir dos arquivos certos do repositório. O Payload dá um nome novo
 * ao arquivo (…-1.jpg), o que também evita que navegadores e o CDN continuem mostrando a imagem antiga.
 */
import { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import path from 'path'

const IMAGES = path.resolve(process.cwd(), 'seed/images/2026-11')
const ARQUIVOS = ['releitura-girassois-van-gogh.jpg', 'releitura-o-beijo-klimt.jpg']

/** apaga o arquivo que o plugin de armazenamento guardou no req, para nunca reenviar a imagem de outra obra */
const limparArquivoGuardado = (req: MigrateUpArgs['req']) => {
  if (req.context) delete (req.context as Record<string, unknown>)._payloadCloudStorage
}

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  for (const arquivo of ARQUIVOS) {
    const media = (await payload.find({ collection: 'media', where: { filename: { equals: arquivo } }, depth: 0, limit: 1, req })).docs[0]
    if (!media) {
      payload.logger.info(`Imagem ${arquivo} não encontrada (já corrigida?): nada a fazer`)
      continue
    }
    limparArquivoGuardado(req)
    const atualizada = await payload.update({
      collection: 'media',
      id: media.id,
      data: {},
      filePath: path.join(IMAGES, arquivo),
      depth: 0,
      req,
      context: { disableRevalidate: true },
    })
    limparArquivoGuardado(req)
    payload.logger.info(`Imagem reenviada: ${arquivo} → ${atualizada.filename}`)
  }
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Nada a desfazer: voltar ao arquivo errado não faz sentido.
}
