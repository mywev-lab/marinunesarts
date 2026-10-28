import { revalidatePath } from 'next/cache'
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, GlobalAfterChangeHook } from 'payload'

/**
 * Depois de salvar qualquer conteúdo no painel, o site inteiro é regenerado
 * na próxima visita. Assim as mudanças aparecem em segundos, sem novo deploy.
 */
function revalidateAll(context: Record<string, unknown> | undefined) {
  if (context?.disableRevalidate) return
  try {
    revalidatePath('/', 'layout')
  } catch {
    // fora do Next (scripts de importação), não há o que revalidar
  }
}

export const revalidateAfterChange: CollectionAfterChangeHook = ({ doc, req }) => {
  revalidateAll(req.context)
  return doc
}

export const revalidateAfterDelete: CollectionAfterDeleteHook = ({ doc, req }) => {
  revalidateAll(req.context)
  return doc
}

export const revalidateGlobal: GlobalAfterChangeHook = ({ doc, req }) => {
  revalidateAll(req.context)
  return doc
}
