import { PortfolioView, portfolioMetadata } from '@/views/portfolio'

export const generateMetadata = () => portfolioMetadata('pt')

export default function Page() {
  return <PortfolioView locale="pt" />
}
