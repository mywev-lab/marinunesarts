# Mari Nunes Arts

Site de Mariane Nunes: pinturas em aquarela e giz pastel oleoso, impressões e planners digitais.

É um site estático (só HTML, CSS e JavaScript), então pode ser publicado em qualquer hospedagem de arquivos, como GitHub Pages, Netlify ou Vercel.

## Estrutura

| Pasta ou arquivo | O que tem |
| --- | --- |
| `index.html`, `portfolio.html`, `produtos.html`, `sobre.html`, `contato.html` | Páginas principais |
| `obras/` | Uma página para cada obra |
| `produtos/` | Uma página para cada planner digital |
| `css/style.css` | Cores, fontes e layout |
| `js/main.js` | Menu no celular, filtros do portfólio, galeria e formulários |
| `images/` | Imagens otimizadas (WebP + JPG) usadas no site |
| `scripts/site-data.mjs` | **Todo o conteúdo**: obras, planners, textos, preços e links |
| `scripts/build-site.mjs` | Gera as páginas HTML a partir do conteúdo |
| `scripts/process-images.mjs` | Gera as imagens otimizadas a partir dos originais |

## Como editar

1. Altere textos, preços ou links em `scripts/site-data.mjs`.
2. Gere as páginas de novo:

   ```bash
   npm run build
   ```

3. Para ver o site no computador, abra o `index.html` no navegador ou rode `npm start`.

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
