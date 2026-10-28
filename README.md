# Mari Nunes Arts

Site de Mariane Nunes: pinturas em aquarela e giz pastel oleoso, impressões e planners digitais.

O site tem um **painel de conteúdo** (Payload CMS) em **`/admin`**: textos, obras, produtos, imagens e artigos do blog são editados por lá, sem mexer em código. Quando você salva, o site atualiza em poucos segundos.

| Parte | Onde fica |
| --- | --- |
| Site e painel | Next.js + Payload CMS, publicado pela Vercel (região São Paulo) |
| Conteúdo (textos, obras, artigos) | Banco de dados Postgres no Supabase (projeto `marinunesarts-cms`) |
| Imagens enviadas pelo painel | Supabase Storage, pasta (bucket) `media` |
| Código | GitHub, `mywev-lab/marinunesarts` |

## Como editar pelo painel

Entre em **https://marinunesarts.vercel.app/admin** com seu e-mail e senha. O menu da esquerda está organizado assim:

| Grupo | O que tem |
| --- | --- |
| **Portfólio e loja** | **Obras** (cada pintura: imagem, técnica, ano, medidas, status, link da Etsy, fotos "na parede") e **Produtos digitais** (planners: preço, fotos, especificações, o que vem incluído) |
| **Blog** | **Artigos** do Diário do Ateliê e **Categorias do blog** |
| **Páginas** | Textos de cada página: Página inicial, Sobre, Portfólio, Produtos, Blog, Contato e Política de privacidade |
| **Configurações** | **Configurações do site** (e-mail, cidade, redes sociais, texto do rodapé, newsletter, imagem de compartilhamento), **Imagens** e **Usuários** |

Algumas dicas:

- **Ordem das obras e produtos:** o campo "Ordem" na lateral define a posição no site (números menores aparecem primeiro).
- **Obras na página inicial e na loja:** na lateral da obra, marque "Mostrar em 'Do ateliê' na página inicial" e "Mostrar na página Produtos (obras à venda)".
- **Imagens:** envie arquivos de até 4 MB (o limite de envio da Vercel); uma foto de 1600 a 2400 px no lado maior costuma ficar bem abaixo disso. Todo envio pede um texto alternativo (descrição da imagem para quem usa leitor de tela e para o Google). O painel gera sozinho as versões menores e mais leves que o site usa.
- **Endereço (slug):** é preenchido a partir do título. Se mudar o slug de uma página que já está no ar, o endereço antigo deixa de funcionar.

### Artigos do blog

1. Em **Blog → Artigos**, clique em **Criar novo**.
2. Aba **Conteúdo**: título, subtítulo, capa e o texto do artigo. No texto, use **Título 2** para as seções (o sumário "Neste artigo" é montado sozinho a partir delas) e o botão **+** para inserir blocos:
   - **Destaque (Em resumo)**: a caixa de resumo
   - **Imagem com legenda**
   - **Linha de obras**: de 2 a 4 imagens lado a lado
   - **Tabela**
3. Aba **Cartão e SEO**: resumo do cartão, título para o Google (até ~60 caracteres), descrição para o Google (até ~160) e palavras-chave.
4. Aba **Fechamento**: chamada no fim do artigo, fontes e até 3 artigos em "Continue lendo".
5. Na lateral, escolha a **categoria**. O campo **Anotações para revisão** não aparece no site: use para lembretes.
6. **Salvar rascunho** guarda sem publicar. **Publicar** coloca no ar; o campo "Publicado em" é preenchido sozinho. Se atualizar um artigo publicado, preencha "Atualizado em".

O painel guarda as versões anteriores de cada artigo (aba **Versões**), e dá para restaurar uma delas.

## Endereços

O site usa endereços sem `.html`: `/portfolio`, `/obras/limoes`, `/produtos/planner-luminous-days`, `/blog/giz-pastel-oleoso`, `/sobre`, `/contato`. Os endereços antigos (`/portfolio.html`, `/obras/limoes.html`, `/blog/giz-pastel-oleoso/`) redirecionam para os novos. O `sitemap.xml` e o `robots.txt` são gerados a partir do conteúdo.

## Estrutura do código

| Pasta ou arquivo | O que tem |
| --- | --- |
| `src/payload.config.ts` | Configuração do painel: banco, imagens, idioma |
| `src/collections/` | Obras, Produtos digitais, Artigos, Categorias, Imagens e Usuários |
| `src/globals/` | Textos das páginas e configurações do site |
| `src/blocks/` | Blocos que podem entrar no texto dos artigos e o editor de texto |
| `src/app/(frontend)/` | Páginas do site e `style.css` (cores, fontes e layout) |
| `src/app/(payload)/` | Painel `/admin` e API (gerado pelo Payload, não precisa editar) |
| `src/components/`, `src/lib/` | Partes reutilizadas: cabeçalho, rodapé, cartões, imagens, SEO, dados estruturados |
| `src/migrations/` | Alterações na estrutura do banco de dados |
| `src/seed/` + `seed/` | Importação inicial: o conteúdo do site antigo e as imagens otimizadas que entraram no painel na primeira publicação |
| `public/` | Ícones e `js/main.js` (menu no celular, filtros do portfólio, galeria e formulários) |

## Publicação

A cada envio para a branch `main`, a Vercel roda `npm run ci`:

1. `npm run migrate` aplica as alterações pendentes na estrutura do banco;
2. `npm run seed` importa o conteúdo inicial, **só se o banco estiver vazio** (depois da primeira publicação, não faz nada);
3. `npm run build` gera o site.

As variáveis vêm da **integração Supabase da Vercel** (Settings → Environment Variables), sem nada para cadastrar à mão: `POSTGRES_URL` (banco), `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` (imagens) e `SUPABASE_JWT_SECRET` (usada para proteger o login do painel). Para trocar alguma delas sem mexer na integração, cadastre `DATABASE_URL` ou `PAYLOAD_SECRET`, que têm preferência. Senhas e chaves nunca vão para o GitHub.

A integração cadastra as variáveis só para o ambiente **Production**: as prévias da Vercel (envios para outras branches) não têm acesso ao banco e a montagem delas falha. Para ter prévias, marque também **Preview** nessas variáveis; nesse caso, as prévias usam o mesmo banco do site no ar, e a migração de uma branch que mude a estrutura do conteúdo é aplicada nesse banco.

## Rodar no computador

Precisa do Node.js 20 ou mais novo.

```bash
npm install
cp .env.example .env    # preencha DATABASE_URL e PAYLOAD_SECRET
npm run migrate
npm run seed            # só preenche se o banco estiver vazio
npm run dev
```

O site abre em http://localhost:3000 e o painel em http://localhost:3000/admin. Sem as variáveis `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`, as imagens enviadas ficam na pasta `media/` do computador. Se o `DATABASE_URL` apontar para o Supabase, as alterações feitas no computador vão direto para o site no ar.

### Mudando a estrutura do conteúdo

Ao criar ou alterar campos em `src/collections/` ou `src/globals/`:

```bash
npm run generate:types                # atualiza os tipos em src/payload-types.ts
npm run migrate:create nome-da-mudanca
```

Envie a migração nova (`src/migrations/`) junto com o código: a Vercel aplica na próxima publicação.

## Imagens originais

Os arquivos em alta resolução (pastas `peças/` e `mockups/`) ficam só no computador e não vão para o GitHub, para proteger os arquivos de impressão. Para o site, envie pelo painel uma versão para web (de 1600 a 2400 px no lado maior é suficiente).
