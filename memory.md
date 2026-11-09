# Workspace Memory

Durable, non-secret context for **portfolio**.

## Objective

Portfólio pessoal e empresarial de Thiago Cerqueira (Teagar) e da Teagar Company, publicado em https://teagar.com.br, para prospectar clientes e apresentar trajetória e projetos. Requisitos completos em `AGENTS.md`.

## Durable decisions

- Gartrol is the source of truth for cards, claims, leases, deliveries, commits, and evidence.
- Agents deliver cards as `done`; only humans validate or reject them. Pull-request review or merge is not a prerequisite for delivery.
- Commit scope: `site`.
- Model routing (policy "Claude Code — portfolio tiers"): Haiku for mechanical/low-risk work, Sonnet for implementation, Opus for content strategy, orchestration and review.
- `teagar.com.br/` is an unrelated leftover Vite cache directory; it is git-ignored.
- GitHub repo: Teagar/teagar.com.br (public). Teagar/portfolio is the unrelated 2023 portfolio; never push to it.
- The initial publication pushed main directly to bootstrap the repo; later changes go through short-lived branches and PRs.

## Conventions

- Read `AGENTS.md` before editing.
- Use Conventional Commits with a mandatory stable scope: `type(scope): imperative summary`.
- Follow Trunk-Based Development with `main` as the only trunk and short-lived topic branches.
- Treat one pull request as one coherent delivery; batch related micro-adjustments and keep commits atomic.
- Run targeted checks while iterating and the required full gate once before integration; require human review for high-risk changes.
- Use `gh --body-file` for multiline pull-request Markdown and verify the published body.
- Record only concise facts that remain useful across sessions.
- Never store credentials, lease tokens, raw transcripts, or temporary status.
