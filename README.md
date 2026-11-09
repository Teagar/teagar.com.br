# teagar.com.br

## Português

### O que é

Site pessoal e empresarial de Thiago Cerqueira (Teagar) e da Teagar Company, publicado em https://teagar.com.br. Site estático, sem framework e sem dependências de runtime, com versão em português (`/`) e em inglês (`/en/`).

### Estrutura

- `src/content/*.json`: todo o texto do site (pt-BR e en).
- `src/template.mjs`: template HTML que gera cada página e a página 404.
- `src/styles/`: CSS em camadas (tokens, base, layout e componentes).
- `src/scripts/`: JavaScript do cliente (tema, idioma e formulário).
- `public/`: assets copiados para o build (imagens, fontes, `og-image.jpg`).
- `scripts/build.mjs`: gera `dist/` (páginas, sitemap, robots, 404).
- `scripts/serve.mjs`: servidor local para desenvolvimento.
- [`docs/content-brief.md`](docs/content-brief.md): briefing de conteúdo e tom de voz.
- `deploy/`: exemplos de configuração do Caddy e do Docker Compose.

### Desenvolvimento

Requer Node.js 20 ou superior. Não há dependências para instalar.

```sh
npm run dev   # gera o build e sobe o servidor em http://localhost:4321
```

### Testes

```sh
npm test
```

### Build

```sh
npm run build   # gera os arquivos estáticos em dist/
```

### Deploy

O servidor executa Caddy em Docker, na rede externa `teagar_proxy`, que termina TLS. Para publicar:

1. Gere o build com `npm run build`.
2. Copie `dist/` para o diretório do servidor montado no Caddy, por exemplo:
   `rsync -az --delete dist/ <servidor>:<diretorio-do-compose>/teagar.com.br/dist/`
3. Garanta que o Caddy monte esse diretório como `/srv/teagar.com.br` (veja `deploy/docker-compose.example.yml`) e que o bloco do site em `deploy/Caddyfile.example` esteja mesclado ao Caddyfile existente, sem alterar os demais blocos.

Os nomes `<servidor>` e `<diretorio-do-compose>` são placeholders. Não há credenciais no repositório.

### Idioma e tema

- **Idioma:** a raiz `/` redireciona para `/en/` somente quando não há preferência de idioma salva e o idioma principal do navegador não é português. A escolha manual feita pelo seletor de idioma é salva no navegador e tem prioridade sobre a detecção.
- **Tema:** segue `prefers-color-scheme` do sistema até que o usuário alterne o tema manualmente. A escolha manual é salva no navegador.

### Fontes

Instrument Serif e Instrument Sans (self-hosted). As fontes em `public/fonts/` são distribuídas sob a licença SIL Open Font License 1.1. Veja `public/fonts/LICENSE-OFL.txt`.

---

## English

### What it is

Personal and business site of Thiago Cerqueira (Teagar) and Teagar Company, published at https://teagar.com.br. It is a static site with no framework and no runtime dependencies, available in Portuguese (`/`) and English (`/en/`).

### Structure

- `src/content/*.json`: all site copy (pt-BR and en).
- `src/template.mjs`: HTML template that renders every page and the 404 page.
- `src/styles/`: layered CSS (tokens, base, layout and components).
- `src/scripts/`: client-side JavaScript (theme, language and form).
- `public/`: assets copied into the build (images, fonts, `og-image.jpg`).
- `scripts/build.mjs`: generates `dist/` (pages, sitemap, robots, 404).
- `scripts/serve.mjs`: local development server.
- [`docs/content-brief.md`](docs/content-brief.md): content brief and tone of voice.
- `deploy/`: example Caddy and Docker Compose configuration.

### Develop

Requires Node.js 20 or newer. There is nothing to install.

```sh
npm run dev   # builds and serves at http://localhost:4321
```

### Test

```sh
npm test
```

### Build

```sh
npm run build   # writes static files to dist/
```

### Deploy

The server runs Caddy in Docker on the external network `teagar_proxy`, and Caddy terminates TLS. To publish:

1. Build with `npm run build`.
2. Copy `dist/` to the server directory mounted into Caddy, for example:
   `rsync -az --delete dist/ <server>:<compose-directory>/teagar.com.br/dist/`
3. Make sure Caddy mounts that directory at `/srv/teagar.com.br` (see `deploy/docker-compose.example.yml`) and that the site block in `deploy/Caddyfile.example` is merged into the existing Caddyfile without changing other site blocks.

`<server>` and `<compose-directory>` are placeholders. The repository contains no credentials.

### Language and theme detection

- **Language:** the root `/` redirects to `/en/` only when there is no stored language preference and the browser's primary language is not Portuguese. A manual choice made with the language switcher is stored in the browser and takes precedence over detection.
- **Theme:** follows `prefers-color-scheme` until the user toggles the theme manually. The manual choice is stored in the browser.

### Fonts

Instrument Serif and Instrument Sans (self-hosted). The fonts in `public/fonts/` are distributed under the SIL Open Font License 1.1. See `public/fonts/LICENSE-OFL.txt`.
