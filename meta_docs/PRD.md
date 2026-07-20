# TrialBridge — Product Requirements Document (PRD.md)

## 1. Product Summary
TrialBridge is a global, multilingual clinical trial matching engine. A
patient describes their condition in plain language, in any language, and
the system detects the language, extracts a structured medical profile,
queries multiple international trial registries in parallel, scores
eligibility fit, and explains the top matches back to the patient in their
own language — with optional push notifications for future matches.

## 2. Problem Statement
Over 80% of clinical trials fail to recruit enough patients on time — not
because eligible patients don't exist, but because discovery fails.
ClinicalTrials.gov alone lists 490,000+ studies in English-only, jargon-
heavy language, and no existing tool aggregates multiple international
registries or explains results in the patient's own language.

## 3. Target Users
- Primary: patients with serious, rare, or treatment-resistant conditions
  actively looking for trial options, in any language, anywhere in the
  world.
- Secondary: physicians who receive a plain-English/patient-language
  summary shared by the patient.
- Tertiary (future): pharma sponsors interested in patient-referral
  partnerships.

## 4. Goals (Hackathon Scope)
- G1: Accept a plain-language condition description in any language.
- G2: Detect language and extract a structured medical profile via
  GPT-5.6 Luna.
- G3: Query ClinicalTrials.gov (US) and at least one additional
  international registry (EU CTR or ISRCTN) in parallel.
- G4: Score the top ~20 candidate trials for eligibility fit against the
  patient's specific profile.
- G5: Explain the top 6 trials back to the patient in their detected
  language, in plain, non-clinical terms.
- G6: Offer push notification opt-in for future matching trials (PWA Web
  Push).
- G7: Generate a physician-facing PDF summary in English.

## 5. Non-Goals (Hackathon Scope)
- Full 18-registry WHO ICTRP coverage (start with 2-3 registries).
- User accounts with long-term medical history storage beyond what's
  needed for notification matching.
- Any actual trial enrollment or eligibility determination (this is
  explicitly a discovery/informational tool, never a clinical decision
  maker).

## 6. Success Metrics
- Search pipeline returns results in under 15 seconds for a representative
  query.
- Correctly detects and responds in at least 2 non-English languages
  during testing (target: English + Hindi, minimum).
- Cross-registry parallel query correctly aggregates results from at
  least 2 registries without one slow registry blocking the others
  (timeout + partial-result handling).

## 7. User Stories
- As a patient, I want to describe my condition in my own language and
  get trial matches explained back to me in that same language, without
  needing to learn medical terminology.
- As a patient, I want to see trials from my own country AND
  internationally, since I might be willing to travel for the right
  trial.
- As a patient, I want to be notified later if a new matching trial opens,
  without having to keep searching manually.
- As a physician, I want a clean, English-language PDF summary I can
  quickly review when my patient brings this to an appointment.

## 8. DOCUMENTATION REQUIREMENTS (MANDATORY)

This PRD mandates the coding agent (Stage 2) produce the full
documentation tree below as a first-class deliverable.

### Required `docs/*` (public documentation)
docs/system_overview.md
docs/codebase_explained.md
docs/design_decisions.md
docs/project_concepts.md
docs/scaling_to_1_billion_users.md
docs/api_reference.md
docs/hld.md
docs/lld.md
docs/database_design.md
docs/security_architecture.md
docs/testing_strategy.md
docs/deployment_guide.md
docs/uml_diagrams.md
docs/class_diagrams.md
docs/entity_relationships.md
docs/troubleshooting_guide.md
docs/implementation_notes.md
docs/interview_defense_guide.md
docs/known_tradeoffs.md
docs/future_improvements.md
docs/feature_prioritization.md
docs/what_we_skipped_and_why.md

### Required `.private_docs/*` (git-ignored)
.private_docs/project_brain.md
.private_docs/line_by_line_explanation.md
.private_docs/interviewer_questions.md
.private_docs/system_deep_dive.md
.private_docs/code_walkthrough.md
.private_docs/architecture_rationale.md
.private_docs/database_rationale.md
.private_docs/api_rationale.md
.private_docs/security_rationale.md
.private_docs/scaling_rationale.md
`.private_docs/` MUST be git-ignored from the moment it's first populated.

### Documentation objectives
1. A new developer productive within a few hours from `docs/*` alone.
2. The original author able to defend every clinical-data-handling,
   multilingual-pipeline, and registry-integration decision using only
   `.private_docs/*`.
3. Documentation and code never drift — especially critical here because
   this product touches health information and multilingual clinical
   reasoning, both high-stakes-if-wrong domains.

### Knowledge transfer requirements
- Every registry API integration (ClinicalTrials.gov, EU CTR, ISRCTN, WHO
  ICTRP) documented with its exact freshness characteristics in
  `.private_docs/api_rationale.md`.
- Every prompt (profile extraction, eligibility scoring, multilingual
  explanation) documented verbatim in `docs/implementation_notes.md`.
- The medical/legal disclaimer strategy documented explicitly in
  `docs/security_architecture.md` and `.private_docs/security_rationale.md`
  — this is a health-adjacent product and the "informational only, not a
  clinical determination" framing must be traceable to a design decision,
  not an afterthought.

## 9. Production Readiness Evaluation (Mandatory — Nothing Silently Omitted)

- **Database**: SQLite for MVP (patient profile + push subscription for
  notification matching only — no full medical history retained beyond
  what's needed for re-matching). Document explicitly why SQLite (single-
  instance simplicity) rather than Postgres for the hackathon, and the
  migration path in `.private_docs/database_rationale.md`.
- **Caching**: Registry query results for identical condition keywords
  within a short window should be cached to reduce redundant external API
  calls and improve demo responsiveness.
- **Reliability**: Each registry query must have an independent timeout;
  a slow/down registry must not block results from the others (partial-
  result degradation, not total failure).
- **Performance**: Registry queries run in parallel (asyncio.gather),
  never sequentially.
- **Security**: This product handles health-adjacent information. Even
  though full clinical records aren't stored, the condition description
  and treatment history entered by the patient must be treated as
  sensitive: no logging of raw patient input in plaintext logs, TLS in
  transit, and a clear data-retention policy documented in
  `docs/security_architecture.md`.
- **Observability**: Structured logging with correlation IDs across the
  5-step pipeline, with explicit redaction of patient-identifying free-
  text fields from logs.
- **Scalability**: Document the horizontal scaling path and note that the
  registry APIs themselves are the natural rate-limit bottleneck, not the
  application tier.
- **Deployment**: Dockerfile, `.env`-based secrets, documented rollback.
- **Testing**: Unit tests for the profile extraction parser and the
  notification-matching cron logic; integration tests for `/api/search`
  against mocked registry responses in at least 2 languages.

## 10. Acceptance Criteria
- All 10 Stage 1 docs exist and cross-reference documentation requirements.
- All 22 `docs/*`/`.private_docs/*` files exist, are FreightDoc/TrialBridge-
  specific (not generic), after Stage 2.
- `.private_docs/` is git-ignored.
- Every production-readiness item above is implemented or explicitly
  justified as deferred in `docs/known_tradeoffs.md`.
- Medical/legal disclaimer language appears in the UI and is documented
  as a deliberate design decision, not an incidental string.
