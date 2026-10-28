import React from 'react'

import { Page, SocialLinks } from '@/components/ui'
import { getGlobal, getObras, getProdutos, getSettings } from '@/lib/data'
import { pageMetadata } from '@/lib/seo'
import { paragraphs } from '@/lib/text'

export async function generateMetadata() {
  const g = await getGlobal('contato')
  return pageMetadata({ title: g.seo?.title || g.title, description: g.seo?.description, path: '/contato' })
}

export default async function ContatoPage() {
  const [settings, g, obras, produtos] = await Promise.all([getSettings(), getGlobal('contato'), getObras(), getProdutos()])
  return (
    <Page settings={settings} current="contato">
      <section className="contact-page container">
        <div className="contact-intro">
          <h1>{g.title}</h1>
          {paragraphs(g.intro).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          <p className="contact-email">
            <a href={`mailto:${settings.email}`}>{settings.email}</a>
          </p>
          {settings.city ? <p className="contact-location">{settings.city}</p> : null}
          <SocialLinks settings={settings} className="social-links social-links--inline" />
        </div>
        <form className="contact-form" id="contact-form" noValidate data-email={settings.email}>
          <div className="form-row">
            <label htmlFor="nome">Nome</label>
            <input type="text" id="nome" name="nome" autoComplete="name" required />
          </div>
          <div className="form-row">
            <label htmlFor="email">E-mail</label>
            <input type="email" id="email" name="email" autoComplete="email" required />
          </div>
          <div className="form-row">
            <label htmlFor="assunto">Assunto</label>
            <select id="assunto" name="assunto" required defaultValue="">
              <option value="">Selecione</option>
              {(g.subjects || []).map((s) => (
                <option key={s.id || s.text} value={s.text}>
                  {s.text}
                </option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <label htmlFor="obra">
              Obra ou produto <span className="optional">(opcional)</span>
            </label>
            <select id="obra" name="obra" defaultValue="">
              <option value="">Nenhum em especial</option>
              <optgroup label="Obras">
                {obras.map((w) => (
                  <option key={w.id} value={w.title}>
                    {w.title}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Produtos digitais">
                {produtos.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
          <div className="form-row">
            <label htmlFor="mensagem">Mensagem</label>
            <textarea id="mensagem" name="mensagem" rows={6} required />
          </div>
          <button type="submit" className="btn btn-primary">
            Enviar mensagem
          </button>
          <p className="form-note" id="form-note" role="status" aria-live="polite" />
        </form>
      </section>
    </Page>
  )
}
