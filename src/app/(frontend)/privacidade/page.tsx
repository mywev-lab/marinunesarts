import { PrivacidadeView, privacidadeMetadata } from '@/views/privacidade'

export const generateMetadata = () => privacidadeMetadata('pt')

export default function Page() {
  return <PrivacidadeView locale="pt" />
}
