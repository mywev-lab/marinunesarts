import { PostView, postMetadata, postParams } from '@/views/post'

type Props = { params: Promise<{ slug: string }> }

export const generateStaticParams = postParams

export async function generateMetadata({ params }: Props) {
  return postMetadata('en', (await params).slug)
}

export default async function Page({ params }: Props) {
  return <PostView locale="en" slug={(await params).slug} />
}
