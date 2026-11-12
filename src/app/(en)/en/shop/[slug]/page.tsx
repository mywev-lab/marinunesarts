import { ProdutoView, produtoMetadata, produtoParams } from '@/views/produto'

type Props = { params: Promise<{ slug: string }> }

export const generateStaticParams = produtoParams

export async function generateMetadata({ params }: Props) {
  return produtoMetadata('en', (await params).slug)
}

export default async function Page({ params }: Props) {
  return <ProdutoView locale="en" slug={(await params).slug} />
}
