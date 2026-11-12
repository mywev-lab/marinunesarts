import { ContatoView, contatoMetadata } from '@/views/contato'

export const generateMetadata = () => contatoMetadata('en')

export default function Page() {
  return <ContatoView locale="en" />
}
