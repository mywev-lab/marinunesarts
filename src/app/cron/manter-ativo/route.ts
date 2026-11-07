/**
 * Chamado uma vez por dia pela Vercel (vercel.json → crons).
 * No plano gratuito, o Supabase pausa o projeto depois de uma semana sem uso do banco,
 * e aí as imagens do site param de carregar. Como as páginas ficam prontas em cache,
 * as visitas não chegam ao banco: esta consulta diária mantém o projeto ativo.
 */
import config from '@payload-config'
import { getPayload } from 'payload'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  // A Vercel envia este cabeçalho quando a variável CRON_SECRET existe
  const secret = process.env.CRON_SECRET
  if (secret && request.headers.get('authorization') !== `Bearer ${secret}`) {
    return new Response('Não autorizado', { status: 401 })
  }

  const payload = await getPayload({ config })
  const { totalDocs } = await payload.count({ collection: 'obras' })
  return Response.json({ ok: true, obras: totalDocs, verificadoEm: new Date().toISOString() })
}
