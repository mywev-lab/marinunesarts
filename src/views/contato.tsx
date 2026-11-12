import React from 'react'

import { Page, SocialLinks } from '@/components/ui'
import { getGlobal, getObras, getProdutos, getSettings } from '@/lib/data'
import { dict, type Locale } from '@/lib/i18n'
import { pageMetadata } from '@/lib/seo'
import { paragraphs } from '@/lib/text'

export async function contatoMetadata(locale: Locale) {
  const g = await getGlobal('contato', locale)
  return pageMetadata({ locale, title: g.seo?.title || g.title, description: g.seo?.description, path: '/contato' })
}

export async function ContatoView({ locale }: { locale: Locale }) {
  const [settings, g, obras, produtos] = await Promise.all([getSettings(locale), getGlobal('contato', locale), getObras(locale), getProdutos(locale)])
  const f = dict(locale).form
  return (
    <Page settings={settings} locale={locale} path="/contato" current="contato">
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
          <SocialLinks settings={settings} locale={locale} className="social-links social-links--inline" />
        </div>
        <form
          className="contact-form"
          id="contact-form"
          noValidate
          data-email={settings.email}
          data-missing={f.missing}
          data-opening={f.opening}
          data-labels={JSON.stringify(f.mailLabels)}
        >
          <div className="form-row">
            <label htmlFor="nome">{f.name}</label>
            <input type="text" id="nome" name="nome" autoComplete="name" required />
          </div>
          <div className="form-row">
            <label htmlFor="email">{f.email}</label>
            <input type="email" id="email" name="email" autoComplete="email" required />
          </div>
          <div className="form-row">
            <label htmlFor="assunto">{f.subject}</label>
            <select id="assunto" name="assunto" required defaultValue="">
              <option value="">{f.select}</option>
              {(g.subjects || []).map((s) => (
                <option key={s.id || s.text} value={s.text}>
                  {s.text}
                </option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <label htmlFor="obra">
              {f.workOrProduct} <span className="optional">{f.optional}</span>
            </label>
            <select id="obra" name="obra" defaultValue="">
              <option value="">{f.none}</option>
              <optgroup label={f.works}>
                {obras.map((w) => (
                  <option key={w.id} value={w.title}>
                    {w.title}
                  </option>
                ))}
              </optgroup>
              <optgroup label={f.products}>
                {/* prints com o mesmo nome de uma obra já aparecem em "Obras" */}
                {produtos.filter((p) => !obras.some((w) => w.title === p.name)).map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
          <div className="form-row">
            <label htmlFor="mensagem">{f.message}</label>
            <textarea id="mensagem" name="mensagem" rows={6} required />
          </div>
          <button type="submit" className="btn btn-primary">
            {f.send}
          </button>
          <p className="form-note" id="form-note" role="status" aria-live="polite" />
        </form>
      </section>
    </Page>
  )
}
