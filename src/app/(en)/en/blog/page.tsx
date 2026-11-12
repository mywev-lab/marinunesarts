import { BlogView, blogMetadata } from '@/views/blog'

export const generateMetadata = () => blogMetadata('en')

export default function Page() {
  return <BlogView locale="en" />
}
