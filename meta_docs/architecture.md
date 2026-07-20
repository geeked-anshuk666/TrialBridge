# TrialBridge — architecture.md

## 1. System Architecture Overview

```mermaid
flowchart TD
    A[Patient: plain-language description, any language] --> B[POST /api/search]
    B --> C[Step 1: Language Detection + Profile Extraction - GPT-5.6 Luna]
    C --> D[Step 2: Parallel Multi-Registry Query]
    D --> D1[ClinicalTrials.gov V2]
    D --> D2[EU Clinical Trials Register]
    D --> D3[ISRCTN]
    D1 --> E[Step 3: Eligibility Scorer - GPT-5.6 Luna]
    D2 --> E
    D3 --> E
    E --> F[Step 4: Multilingual Explainer - GPT-5.6 Luna]
    F --> G[Step 5: Notification Registration - SQLite + Web Push]
    F --> H[Frontend: Trial Cards + Map + Eligibility Badges]
    G --> I[Background Cron: 30-min refresh check]
    I --> J[Push Notification if new match found]
```

## 2. Component Diagram

```mermaid
graph LR
    subgraph Frontend [React + Vite PWA]
        F1[SearchInput]
        F2[LanguageDetector]
        F3[TrialCard]
        F4[TrialMap]
        F5[EligibilityBadge]
        F6[NotifyToggle]
        F7[DoctorReport]
    end

    subgraph Backend [FastAPI]
        B1[routers/search.py]
        B2[routers/notify.py]
        B3[services/openai_client.py]
        B4[services/ctgov_api.py]
        B5[services/euctr_api.py]
        B6[services/isrctn_api.py]
        B7[services/scorer.py]
        B8[services/notifier.py]
        B9[jobs/refresh_cron.py]
        B10[(SQLite)]
    end

    subgraph External [Free Public Registries]
        E1[ClinicalTrials.gov V2]
        E2[EU Clinical Trials Register]
        E3[ISRCTN]
    end

    F1 --> B1
    B1 --> B3
    B1 --> B4
    B1 --> B5
    B1 --> B6
    B4 --> E1
    B5 --> E2
    B6 --> E3
    B1 --> B7
    B7 --> B3
    F6 --> B2
    B2 --> B10
    B9 --> B10
    B9 --> B4
```

## 3. Sequence Diagram — Full Search Pipeline

```mermaid
sequenceDiagram
    participant U as Patient
    participant FE as Frontend
    participant API as FastAPI
    participant AI as GPT-5.6 Luna
    participant REG as Registries (parallel)

    U->>FE: Describe condition (any language)
    FE->>API: POST /api/search
    API->>AI: Extract profile + detect language
    AI-->>API: {detected_language, condition_english, ...}
    par Parallel Query
        API->>REG: ClinicalTrials.gov query
        API->>REG: EU CTR query
        API->>REG: ISRCTN query
    end
    REG-->>API: Aggregated recruiting trials
    API->>AI: Score top ~20 trials for eligibility
    AI-->>API: Ranked list with scores
    API->>AI: Explain top 6 in patient's language
    AI-->>API: Localized explanations
    API-->>FE: Full response
    FE-->>U: Trial cards + map + badges (in patient's language)
    U->>FE: Toggle "Notify me"
    FE->>API: POST /api/notify/subscribe
    API->>API: Store subscription in SQLite
```

## 4. Background Notification Flow

```mermaid
sequenceDiagram
    participant CRON as Refresh Cron (30 min)
    participant DB as SQLite
    participant REG as Registries
    participant PUSH as Web Push

    CRON->>DB: Load active subscriptions
    loop Each subscription
        CRON->>REG: Re-query condition keywords
        REG-->>CRON: Latest recruiting trials
        CRON->>CRON: Diff against last-seen trial IDs
        alt New match found
            CRON->>PUSH: Send push notification
        end
    end
```

## 5. Documentation Structure Requirements (Mandatory for Stage 2)

- `docs/hld.md` — expand the diagrams above with deployment topology and
  the rationale for SQLite-only persistence (notification matching, not
  clinical records).
- `docs/lld.md` — exact request/response schemas, cron job internals.
- `docs/uml_diagrams.md` — component + deployment diagrams beyond above.
- `docs/class_diagrams.md` — Pydantic models in Mermaid `classDiagram`.
- `docs/entity_relationships.md` — the SQLite subscription schema (see
  `backend_schema.md`).
- `docs/system_overview.md` — plain-English walkthrough for a new
  engineer, with explicit emphasis on the multilingual pipeline since
  it's the core differentiator.
- `docs/design_decisions.md` — why 3 separate LLM calls (extraction,
  scoring, explanation) instead of one mega-prompt (answer: each step
  needs different output shape and failure isolation; a scoring failure
  shouldn't require re-running language detection).

## 6. HLD Requirements
Deployment topology, external registry dependency map (with explicit
freshness characteristics per registry), and the boundary between
deterministic registry-query code and LLM reasoning stages.

## 7. LLD Requirements
Every Pydantic model field, every service function signature, the exact
JSON schema for each GPT-5.6 Luna call, and the cron job's diffing logic
for detecting "new" matches.

## 8. UML Requirements
Minimum: component diagram, sequence diagram (search + notification flows
above), class diagram, deployment diagram.

## 9. Architecture Documentation Requirements
- Every architectural decision (SQLite vs. Postgres, parallel vs.
  sequential registry queries, 3-call pipeline vs. 1 mega-prompt) must
  be in `.private_docs/architecture_rationale.md`.
- `docs/known_tradeoffs.md` must list every hackathon-scope tradeoff
  (2-3 registries instead of full WHO ICTRP 18, no long-term medical
  history storage, etc.) with a note on the production path.
