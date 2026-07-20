# TrialBridge — Technical Requirements Document (TRD.md)

## 1. Technical Summary
FastAPI backend + React/Vite/Tailwind PWA frontend + SQLite (notification
subscriptions only). Five-stage pipeline: language detection/profile
extraction → parallel multi-registry query → eligibility scoring →
multilingual explanation → notification registration. GPT-5.6 Luna at
runtime for all three reasoning stages; GPT-5.6 Terra for Codex build
sessions.

## 2. Functional Requirements
- FR1: Accept a plain-language condition description in any language.
- FR2: Detect language and extract a structured medical profile via
  GPT-5.6 Luna.
- FR3: Query ClinicalTrials.gov V2 API and at least one additional
  registry (EU CTR or ISRCTN) in parallel, filtered to `RECRUITING` status.
- FR4: Score the top ~20 keyword-ranked trials for eligibility fit via
  GPT-5.6 Luna.
- FR5: Generate plain-language explanations of the top 6 trials in the
  patient's detected language via GPT-5.6 Luna.
- FR6: Register a Web Push subscription and persist minimal matching
  criteria (condition keywords, language) in SQLite.
- FR7: Run a background job every 30 minutes to check for newly-recruiting
  trials matching subscribed patients and send push notifications.
- FR8: Generate an English-language PDF summary for physician sharing.
- FR9: Serve the frontend as an installable PWA with working push
  notifications.

## 3. Non-Functional Requirements
- NFR1: Full search pipeline completes in under 15 seconds.
- NFR2: A slow or unavailable registry degrades gracefully — partial
  results, never total failure.
- NFR3: All patient-facing text (search results, explanations) renders in
  the patient's detected language; only the physician PDF is always
  English.
- NFR4: No raw patient free-text is logged in plaintext; logs redact or
  hash the input while preserving enough for debugging (e.g., detected
  language, condition keywords, timestamp).

## 4. DOCUMENTATION ARCHITECTURE (MANDATORY)

### Ownership model
| Doc category | Owner | Update trigger |
|---|---|---|
| `docs/*` | Whoever makes the change | Any architecture/API/schema/security/scaling change |
| `.private_docs/*` | Whoever makes the change | Any non-trivial design/rationale decision |
| Stage 1 docs (this set of 10) | Planning phase only | Frozen after Stage 2 begins except corrections |

### Documentation generation requirements
1. `docs/*` and `.private_docs/*` are generated exclusively by the coding
   agent (Stage 2); this TRD and its siblings specify what must exist.
2. Documentation is a per-phase deliverable in `plan.md` — this is
   especially important for TrialBridge given the health-adjacent data
   handling, which requires explicit, auditable rationale at every step.
3. Every registry integration, every prompt, every notification/data-
   retention decision must be traceable to a `docs/*` or `.private_docs/*`
   entry.
4. `.private_docs/` must be git-ignored from first commit that populates
   it.

### Documentation validation requirement
Before any `plan.md` phase is marked complete:
- Relevant `docs/*` reflect current code state.
- Relevant `.private_docs/*` rationale exists and is specific.
- `CHANGELOG.md` has an entry.
- If the phase touched patient data handling in any way, `docs/security_architecture.md`
  and `.private_docs/security_rationale.md` are explicitly reviewed and
  updated, even if the conclusion is "no change needed."

## 5. Technology Constraints
- GPT-5.6 (Luna runtime / Terra Codex builds) per hackathon rules.
- Codex used throughout, not only at the start.
- Free-tier deployment (Railway backend, Vercel frontend).

## 6. Dependencies
- OpenAI Python SDK v1.x
- FastAPI, Uvicorn, httpx, Pydantic, apscheduler, pywebpush, python-dotenv
- React, Vite, Tailwind CSS, vite-plugin-pwa

## 7. Traceability
Every FR and NFR maps to at least one entry in `docs/hld.md` and
`docs/lld.md` once Stage 2 completes.
