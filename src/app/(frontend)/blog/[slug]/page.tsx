import { PostView, postMetadata, postParams } from '@/views/post'

type Props = { params: Promise<{ slug: string }> }

export const generateStaticParams = postParams

export async function generateMetadata({ params }: Props) {
  return postMetadata('pt', (await params).slug)
}

export default async function Page({ params }: Props) {
  return <PostView locale="pt" slug={(await params).slug} />
}
