import type { Viewport } from 'next'
import React from 'react'

import { SiteDocument, documentMetadata } from '@/components/Document'
import './style.css'

export const viewport: Viewport = { themeColor: '#F5F0E6' }

export const generateMetadata = () => documentMetadata('pt')

/** Site em português (endereços sem prefixo). A versão em inglês fica em src/app/(en)/en. */
export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return <SiteDocument locale="pt">{children}</SiteDocument>
}
