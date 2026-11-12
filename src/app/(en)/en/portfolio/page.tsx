import { PortfolioView, portfolioMetadata } from '@/views/portfolio'

export const generateMetadata = () => portfolioMetadata('en')

export default function Page() {
  return <PortfolioView locale="en" />
}
