import { ContatoView, contatoMetadata } from '@/views/contato'

export const generateMetadata = () => contatoMetadata('pt')

export default function Page() {
  return <ContatoView locale="pt" />
}
