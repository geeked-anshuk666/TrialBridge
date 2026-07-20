# TrialBridge

Find the clinical trial that could change your life — in any language,
anywhere in the world. Built with Codex and GPT-5.6 for OpenAI Build Week
2026.

## What This Is
TrialBridge takes a patient's plain-language description of their
condition, in any language, and matches them against clinical trials
across multiple international registries — explaining results back in
the patient's own language, with optional notifications for future
matches.

## Documentation Map

### Public documentation (`docs/`)
| File | What it covers |
|---|---|
| `system_overview.md` | Plain-English walkthrough, emphasizing the multilingual pipeline |
| `codebase_explained.md` | File-by-file map |
| `design_decisions.md` | Why things were built the way they were |
| `project_concepts.md` | Tone/certainty design principles for this health-adjacent product |
| `scaling_to_1_billion_users.md` | Scaling beyond the hackathon MVP |
| `api_reference.md` | Every endpoint, request/response shape |
| `hld.md` / `lld.md` | High-level and low-level design |
| `database_design.md` | SQLite schema, privacy-minimization rationale |
| `security_architecture.md` | Data handling and disclaimer strategy |
| `testing_strategy.md` | What's tested and how |
| `deployment_guide.md` | Deploy from scratch |
| `uml_diagrams.md` / `class_diagrams.md` / `entity_relationships.md` | Diagrams |
| `troubleshooting_guide.md` | Common failure modes, especially registry timeouts |
| `implementation_notes.md` | Exact prompts and implementation details |
| `interview_defense_guide.md` | How to explain this project in an interview |
| `known_tradeoffs.md` / `what_we_skipped_and_why.md` | Explicit scope decisions |
| `future_improvements.md` / `feature_prioritization.md` | Roadmap |

### Private documentation (`.private_docs/`, git-ignored)
`project_brain.md`, `line_by_line_explanation.md`,
`interviewer_questions.md`, `system_deep_dive.md`, `code_walkthrough.md`,
`architecture_rationale.md`, `database_rationale.md`, `api_rationale.md`,
`security_rationale.md`, `scaling_rationale.md`.

## Onboarding Process (for a new developer)
1. Read this README fully.
2. Read `docs/system_overview.md` for the mental model — pay special
   attention to how language consistency is maintained end to end.
3. Read `docs/hld.md` then `docs/lld.md`.
4. Read `docs/security_architecture.md` before touching any patient-data
   handling code.
5. Skim `docs/known_tradeoffs.md`.
6. You should be productive within a few hours having read only the
   above.

## Setup
```bash
cd backend && pip install -r requirements.txt && uvicorn main:app --reload
cd frontend && npm install && npm run dev
```

## Tech Stack
Python/FastAPI + SQLite backend, React/Vite/Tailwind PWA frontend, GPT-5.6
Luna (runtime) / Terra (built with Codex), ClinicalTrials.gov V2 / EU CTR
/ ISRCTN for registry data.

## Important Disclaimer
TrialBridge is an informational discovery tool. It does not make clinical
eligibility determinations and is not a substitute for a physician's
judgment. Every result should be discussed with a qualified healthcare
provider.

## How Codex Was Used
[To be filled in with specifics once the build session is complete —
must be written by hand, not AI-generated prose, per hackathon rules.]

Codex Session ID: [from `/feedback`]
