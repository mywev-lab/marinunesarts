import { SobreView, sobreMetadata } from '@/views/sobre'

export const generateMetadata = () => sobreMetadata('en')

export default function Page() {
  return <SobreView locale="en" />
}
