import { PrivacidadeView, privacidadeMetadata } from '@/views/privacidade'

export const generateMetadata = () => privacidadeMetadata('en')

export default function Page() {
  return <PrivacidadeView locale="en" />
}
