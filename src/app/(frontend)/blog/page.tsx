import { BlogView, blogMetadata } from '@/views/blog'

export const generateMetadata = () => blogMetadata('pt')

export default function Page() {
  return <BlogView locale="pt" />
}
