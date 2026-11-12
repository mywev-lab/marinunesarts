import { notFound } from 'next/navigation'

/** Endereços em /en que não existem mostram a página "Page not found" em inglês */
export default function Missing() {
  notFound()
}
