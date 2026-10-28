import React from 'react'

import { RichText } from '@/components/RichText'
import { Page } from '@/components/ui'
import { getGlobal, getSettings } from '@/lib/data'
import { pageMetadata } from '@/lib/seo'

export async function generateMetadata() {
  const g = await getGlobal('privacidade')
  return pageMetadata({ title: `${g.title} | Mari Nunes Arts`, description: 'Política de privacidade do site Mari Nunes Arts.', path: '/privacidade', noindex: true })
}

export default async function PrivacidadePage() {
  const [settings, g] = await Promise.all([getSettings(), getGlobal('privacidade')])
  return (
    <Page settings={settings}>
      <section className="legal container prose">
        <h1>{g.title}</h1>
        <RichText data={g.body as any} />
      </section>
    </Page>
  )
}
