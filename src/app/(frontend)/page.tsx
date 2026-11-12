import { HomeView, homeMetadata } from '@/views/home'

export const generateMetadata = () => homeMetadata('pt')

export default function Page() {
  return <HomeView locale="pt" />
}
