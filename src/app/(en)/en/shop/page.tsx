import { ProdutosView, produtosMetadata } from '@/views/produtos'

export const generateMetadata = () => produtosMetadata('en')

export default function Page() {
  return <ProdutosView locale="en" />
}
