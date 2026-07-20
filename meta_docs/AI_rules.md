# TrialBridge — AI_rules.md

## 1. Model Usage Rules
- **Codex build sessions**: GPT-5.6 Terra, always.
- **Runtime profile extraction, scoring, explanation**: GPT-5.6 Luna,
  always. Never escalate to a heavier model at runtime for these three
  tasks.
- **Registry querying is never routed through an LLM** — it is direct,
  parallel, deterministic API calls. This boundary (AI for reasoning/
  translation, code for data retrieval) must be enforced in code review.

## 2. Prompt Discipline
- Every prompt requests structured JSON output.
- Every prompt is a version-controlled named constant (`PROFILE_PROMPT`,
  `SCORE_PROMPT`, `EXPLAIN_PROMPT`).
- Every prompt change is logged in `CHANGELOG.md` under "AI Behavior
  Changes."
- The `EXPLAIN_PROMPT` must always instruct the model to respond ONLY in
  the target language, and the response must be validated (basic
  language-tag sanity check) before being returned to the frontend.

## 3. Documentation-First Development (MANDATORY)
- No feature is complete until its `docs/*` entry exists and is accurate.
- No architectural decision without a corresponding
  `.private_docs/architecture_rationale.md` entry in the same session.
- Any decision touching patient data retention MUST have a corresponding
  `.private_docs/security_rationale.md` entry before being considered
  done — this is a hard gate, not a suggestion, given the health-adjacent
  nature of the product.

## 4. Mandatory Documentation Updates Per Change Type
| Change type | Required doc update |
|---|---|
| New/changed endpoint | `docs/api_reference.md`, `docs/lld.md` |
| New/changed prompt | `docs/implementation_notes.md`, `CHANGELOG.md` |
| New/changed Pydantic model | `docs/lld.md`, `docs/class_diagrams.md` |
| New/changed registry integration | `.private_docs/api_rationale.md` |
| New/changed data retention behavior | `docs/security_architecture.md`, `.private_docs/security_rationale.md` |
| New/changed scaling approach | `docs/scaling_to_1_billion_users.md`, `.private_docs/scaling_rationale.md` |
| Any tradeoff/scope cut | `docs/known_tradeoffs.md`, `docs/what_we_skipped_and_why.md` |

## 5. Changelog Update Requirements
Every behavior-changing commit gets a `CHANGELOG.md` entry: Added /
Changed / Fixed / Security / Documentation.

## 6. Docs Synchronization Requirement
Before any `plan.md` phase is marked complete: "Does every file touched
this phase have an accurate `docs/*`/`.private_docs/*` reflection?" If no,
not complete.

## 7. AI Output Validation Rules
- All structured JSON output validated against Pydantic models before use.
- Malformed output triggers one retry, then a graceful user-facing error
  — never a silent failure.
- The `EXPLAIN_PROMPT` output must never be presented to the user without
  confirming it is in the correct target language; if validation fails,
  fall back to English with a visible note rather than showing garbled or
  wrong-language text.
- No prompt or logging pathway may persist raw patient free-text beyond
  the request lifecycle, except the minimal `condition_keywords` needed
  for notification matching (see `backend_schema.md`).
