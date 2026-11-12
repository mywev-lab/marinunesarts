import { SobreView, sobreMetadata } from '@/views/sobre'

export const generateMetadata = () => sobreMetadata('pt')

export default function Page() {
  return <SobreView locale="pt" />
}
