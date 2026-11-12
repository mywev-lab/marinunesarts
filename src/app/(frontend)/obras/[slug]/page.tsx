import { ObraView, obraMetadata, obraParams } from '@/views/obra'

type Props = { params: Promise<{ slug: string }> }

export const generateStaticParams = obraParams

export async function generateMetadata({ params }: Props) {
  return obraMetadata('pt', (await params).slug)
}

export default async function Page({ params }: Props) {
  return <ObraView locale="pt" slug={(await params).slug} />
}
