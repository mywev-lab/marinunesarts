import React from 'react'

import { Page } from '@/components/ui'
import { getSettings } from '@/lib/data'

export default async function NotFound() {
  const settings = await getSettings()
  return (
    <Page settings={settings}>
      <section className="page-intro">
        <div className="container">
          <h1>Página não encontrada</h1>
          <p className="page-lede">O endereço pode ter mudado. Que tal continuar pelo portfólio ou pelo blog?</p>
          <p style={{ marginTop: '2rem', display: 'flex', gap: '.8rem', flexWrap: 'wrap' }}>
            <a className="btn btn-primary" href="/portfolio">
              Ver o portfólio
            </a>
            <a className="btn btn-outline" href="/blog">
              Ler o blog
            </a>
          </p>
        </div>
      </section>
      <div style={{ height: '6rem' }} />
    </Page>
  )
}
