# TrialBridge — plan.md

## Phase 0 — Setup (Day 3 morning, after FreightDoc is stable)
- [ ] Scaffold backend (FastAPI + SQLite)
- [ ] Scaffold frontend (Vite + React + Tailwind + vite-plugin-pwa)
- [ ] **Docs**: Create empty `docs/` and `.private_docs/` structure;
      add `.private_docs/` to `.gitignore`.

## Phase 1 — Profile Extraction + Language Detection (Day 3)
- [ ] Implement profile extraction (GPT-5.6 Luna, PROFILE_PROMPT)
- [ ] Test with at least 2 languages (English, Hindi minimum)
- [ ] **Docs**: `docs/api_reference.md` (extraction internals),
      `.private_docs/api_rationale.md` (why multilingual-first design)

## Phase 2 — Parallel Registry Query (Day 3)
- [ ] Implement `services/ctgov_api.py`, `services/euctr_api.py`,
      `services/isrctn_api.py`
- [ ] Implement `asyncio.gather` parallel query with per-registry timeout
      and partial-result handling
- [ ] **Docs**: `.private_docs/api_rationale.md` (registry freshness
      characteristics table), `docs/known_tradeoffs.md` (2-3 registries
      vs. full 18-registry WHO ICTRP)

## Phase 3 — Eligibility Scoring + Explanation (Day 3-4)
- [ ] Implement `services/scorer.py` (GPT-5.6 Luna, SCORE_PROMPT)
- [ ] Implement multilingual explanation (GPT-5.6 Luna, EXPLAIN_PROMPT)
- [ ] Implement `POST /api/search` orchestrating the full pipeline
- [ ] **Docs**: `docs/lld.md`, `docs/uml_diagrams.md` (sequence diagram),
      `docs/design_decisions.md` (3-call pipeline rationale)

## Phase 4 — Notifications (Day 4)
- [ ] SQLite schema + `services/notifier.py`
- [ ] `POST /api/notify/subscribe`
- [ ] `jobs/refresh_cron.py` (30-min APScheduler job)
- [ ] **Docs**: `docs/database_design.md`, `.private_docs/database_rationale.md`
      (privacy-minimization decision)

## Phase 5 — Frontend + PWA (Day 4)
- [ ] Build SearchInput, LanguageDetector, TrialCard, TrialMap,
      EligibilityBadge, NotifyToggle, DoctorReport
- [ ] Wire PWA manifest + service worker + Web Push
- [ ] **Docs**: `docs/codebase_explained.md`, `docs/project_concepts.md`
      (tone/certainty design principles)

## Phase 6 — Testing + Hardening (Day 4)
- [ ] Unit tests: profile extraction parser, cron diffing logic
- [ ] Integration test: `/api/search` against mocked registries, 2+
      languages
- [ ] **Docs**: `docs/testing_strategy.md`, `docs/security_architecture.md`,
      `.private_docs/security_rationale.md` (data retention audit)

## Phase 7 — Deployment (Day 4)
- [ ] Dockerfile, deploy backend to Railway, frontend to Vercel
- [ ] Verify push notifications work end to end on a real device
- [ ] **Docs**: `docs/deployment_guide.md`, `.private_docs/architecture_rationale.md`

## Phase 8 — Documentation Completion + Review (Day 4)
- [ ] Generate remaining `docs/*` and `.private_docs/*` per the full
      required tree (same list structure as FreightDoc's Phase 7)
- [ ] **Validation step**: confirm every doc is TrialBridge-specific,
      especially the multilingual and data-privacy rationale sections

## Phase 9 — Demo + Submission (Day 4, before deadline)
- [ ] Record demo video per `05_DEMO_SCRIPT.md` (rehearse the non-English
      demo run at least 3 times before recording)
- [ ] Run `/feedback` in Codex, capture Session ID
- [ ] Finalize `README.md` and `CHANGELOG.md`
- [ ] Submit on Devpost

## Documentation Review & Validation Checklist (every phase)
- [ ] Every touched file has a corresponding doc update?
- [ ] `.private_docs/` still git-ignored?
- [ ] `CHANGELOG.md` entry exists for this phase?
- [ ] Any patient-data-handling change reviewed against
      `docs/security_architecture.md`?
- [ ] All production-readiness items from PRD.md Section 9 addressed
      somewhere in `docs/known_tradeoffs.md`?
