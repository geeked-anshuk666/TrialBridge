# TrialBridge production-readiness plan

## Goal

Ship a free-tier MVP that can be deployed tomorrow: Next.js PWA on Vercel, FastAPI on Render, Neon Postgres, Groq-hosted AI, resilient registry adapters, and a polished scroll-driven 3D hero.

## Workstreams

1. **Frontend migration and visual system** — replace the Vite shell with Next.js App Router, Tailwind, accessible responsive layout, PWA manifest/service worker, and a CSS/Three.js parallax hero that degrades to a lightweight CSS animation on low-power devices.
2. **Backend hardening** — split settings, API routers, services, registry adapters, Groq client, validation, correlation IDs, rate limiting, CORS, structured redacted logs, health/readiness endpoints, and consistent error envelopes.
3. **Neon data layer** — SQLAlchemy/psycopg pool, migrations, indexes, least-privilege connection configuration, and privacy-minimized subscription schema.
4. **Testing and reliability** — unit tests for parsing/scoring/diffing, mocked registry integration tests, API contract tests, frontend build checks, accessibility checks, and smoke tests.
5. **Deployment** — Render blueprint/Docker configuration, Vercel environment variable guide, health checks, rollback notes, and production secrets checklist.

## Scope guardrails

- Keep the AI model configurable through `GROQ_MODEL`; default to `llama-3.1-8b-instant` for free-tier operation.
- Do not persist raw patient descriptions or treatment histories.
- Use deterministic registry retrieval; use Groq only for extraction, scoring, and explanation.
- Implement the 3D hero without requiring paid assets or services.
- Defer full accounts, clinical decision support, payments, and all-registry coverage.

## Acceptance gates

- `npm run build` succeeds for the Next.js app.
- Backend imports and tests pass with mocked external services.
- `/health` is cheap and always available; `/ready` verifies Neon connectivity.
- No secrets are committed; `.env.example` is complete.
- Mobile keyboard navigation, reduced-motion, screen-reader labels, and disclaimer copy are present.
- Render and Vercel deployment steps are documented and reproducible.
