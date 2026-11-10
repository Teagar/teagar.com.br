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

O site roda na VPS da Teagar. O Caddy compartilhado (`teagar-caddy`, rede externa `teagar_proxy`) termina TLS e faz proxy para o container `teagar-site`, que serve os arquivos de `dist/`.

- `deploy/compose.yaml` e `deploy/Caddyfile`: o container `teagar-site` (Caddy só de arquivos, somente leitura), em `/opt/apps/teagar.com.br`.
- `deploy/proxy-site-block.example`: os blocos `teagar.com.br` e `www` já incluídos no Caddyfile compartilhado. Para alterá-lo, siga o runbook da VPS (backup, `caddy validate`, escrita no lugar e `USR1`), sem tocar nos outros blocos.

Para publicar uma nova versão:

```sh
DEPLOY_HOST=<usuario>@<servidor> scripts/deploy.sh
```

O script gera o build, roda os testes, envia `dist/` por SSH e recria só o `teagar-site`. O Caddy compartilhado não reinicia. `<usuario>` e `<servidor>` são placeholders; não há credenciais no repositório.

### Idioma e tema

- **Idioma:** a raiz `/` redireciona para `/en/` somente quando não há preferência de idioma salva e o idioma principal do navegador não é português. A escolha manual feita pelo seletor de idioma é salva no navegador e tem prioridade sobre a detecção.
- **Tema:** segue `prefers-color-scheme` do sistema até que o usuário alterne o tema manualmente. A escolha manual é salva no navegador.

### Fontes

Big Shoulders Display, Public Sans e IBM Plex Mono (self-hosted). As fontes em `public/fonts/` são distribuídas sob a licença SIL Open Font License 1.1. Veja `public/fonts/LICENSE-OFL.txt`. A exceção é `teagar-regular.woff2`, a fonte própria Teagar, usada só no wordmark do rodapé; ela pertence a Thiago Cerqueira e não está sob a OFL.

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

The site runs on the Teagar VPS. The shared Caddy (`teagar-caddy`, external network `teagar_proxy`) terminates TLS and reverse-proxies to the `teagar-site` container, which serves the files in `dist/`.

- `deploy/compose.yaml` and `deploy/Caddyfile`: the `teagar-site` container (a read-only, file-only Caddy) in `/opt/apps/teagar.com.br`.
- `deploy/proxy-site-block.example`: the `teagar.com.br` and `www` blocks already present in the shared Caddyfile. To change it, follow the VPS runbook (backup, `caddy validate`, write in place, `USR1`) and leave the other blocks untouched.

To publish a new version:

```sh
DEPLOY_HOST=<user>@<server> scripts/deploy.sh
```

The script builds, runs the tests, uploads `dist/` over SSH and recreates only `teagar-site`. The shared Caddy is not restarted. `<user>` and `<server>` are placeholders; the repository contains no credentials.

### Language and theme detection

- **Language:** the root `/` redirects to `/en/` only when there is no stored language preference and the browser's primary language is not Portuguese. A manual choice made with the language switcher is stored in the browser and takes precedence over detection.
- **Theme:** follows `prefers-color-scheme` until the user toggles the theme manually. The manual choice is stored in the browser.

### Fonts

Big Shoulders Display, Public Sans and IBM Plex Mono (self-hosted). The fonts in `public/fonts/` are distributed under the SIL Open Font License 1.1. See `public/fonts/LICENSE-OFL.txt`. The exception is `teagar-regular.woff2`, the owner's own Teagar typeface, used only for the footer wordmark; it belongs to Thiago Cerqueira and is not under the OFL.
