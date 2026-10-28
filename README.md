# Mari Nunes Arts

Site de Mariane Nunes: pinturas em aquarela e giz pastel oleoso, impressões e planners digitais.

É um site estático (só HTML, CSS e JavaScript), publicado pela Vercel: a cada envio para a branch `main`, a Vercel roda `node scripts/export-site.mjs` e publica a pasta `public/`.

## Estrutura

| Pasta ou arquivo | O que tem |
| --- | --- |
| `index.html`, `portfolio.html`, `produtos.html`, `sobre.html`, `contato.html` | Páginas principais |
| `obras/` | Uma página para cada obra |
| `produtos/` | Uma página para cada planner digital |
| `blog/` | Diário do Ateliê: página do blog e um endereço por artigo (`/blog/<slug>/`) |
| `content/blog/` | **Texto dos artigos** do blog, um arquivo HTML por artigo |
| `css/style.css` | Cores, fontes e layout |
| `js/main.js` | Menu no celular, filtros do portfólio, galeria e formulários |
| `images/` | Imagens otimizadas (WebP + JPG) usadas no site |
| `scripts/site-data.mjs` | **Conteúdo do site**: obras, planners, textos, preços e links |
| `scripts/blog-data.mjs` | **Dados do blog**: categorias e, para cada artigo, título, SEO, capa, fontes e data |
| `scripts/build-site.mjs` | Gera as páginas HTML a partir do conteúdo |
| `scripts/process-images.mjs` | Gera as imagens otimizadas a partir dos originais |
| `scripts/export-site.mjs` + `vercel.json` | Publicação na Vercel: gera as páginas e copia só os arquivos do site para `public/` |

## Como editar

1. Altere textos, preços ou links em `scripts/site-data.mjs`.
2. Gere as páginas de novo:

   ```bash
   npm run build
   ```

3. Para ver o site no computador, abra o `index.html` no navegador ou rode `npm start`. (Os endereços do blog terminam em `/`; quando o site é aberto direto do arquivo, o `js/main.js` completa esses links com `index.html` para eles funcionarem.)

## Blog (Diário do Ateliê)

Para publicar um artigo novo:

1. Crie o texto em `content/blog/<slug>.html`, usando os artigos existentes como modelo: cada seção é um `<h2 id="...">`, e o sumário "Neste artigo" é montado sozinho a partir deles.
2. Cadastre o artigo em `POSTS`, em `scripts/blog-data.mjs`: título, título de SEO (até ~60 caracteres), descrição (até ~160), categoria, capa, artigos relacionados, chamada final e fontes.
3. No dia da publicação, preencha `published` com a data (`AAAA-MM-DD`). Se atualizar o texto depois, preencha `updated`.
4. Rode `npm run build`.

Recursos dentro do texto dos artigos:

- `{{root}}` antes de links internos, por exemplo `<a href="{{root}}obras/limoes.html">`.
- `{{fig src="art/limoes" caption="..."}}` para inserir uma imagem otimizada. Para obras e fotos de produtos, o texto alternativo é preenchido sozinho.
- `<!-- REVISAR: ... -->` para anotações: elas não aparecem no site, e o `npm run build` lista todas no final.

## Imagens

Os arquivos originais em alta resolução (pastas `peças/` e `mockups/`) ficam só no computador e não vão para o GitHub, para proteger os arquivos de impressão. Para gerar as imagens do site a partir deles:

```bash
npm install
npm run images
npm run build
```

## Pendências

- Trocar os links da Etsy pelos links do programa Share & Save (`scripts/site-data.mjs`).
- Adicionar o link do Pinterest em `SITE.pinterest` para o ícone aparecer.
- Conectar o formulário da newsletter a um serviço de e-mail (`js/main.js`).
- Blog: revisar as anotações `REVISAR` dos artigos e preencher a data de publicação (`published`) em `scripts/blog-data.mjs`.
