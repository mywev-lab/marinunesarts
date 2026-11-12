import type { Viewport } from 'next'
import React from 'react'

import { SiteDocument, documentMetadata } from '@/components/Document'
import '../(frontend)/style.css'

export const viewport: Viewport = { themeColor: '#F5F0E6' }

export const generateMetadata = () => documentMetadata('en')

/** Site em inglês (efugioatelier.com/en). Os textos vêm da versão "English" de cada conteúdo do painel. */
export default function EnglishLayout({ children }: { children: React.ReactNode }) {
  return <SiteDocument locale="en">{children}</SiteDocument>
}
