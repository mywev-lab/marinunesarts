import { ProdutosView, produtosMetadata } from '@/views/produtos'

export const generateMetadata = () => produtosMetadata('pt')

export default function Page() {
  return <ProdutosView locale="pt" />
}
