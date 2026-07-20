# TrialBridge — MASTER DOCUMENT
OpenAI Build Week | Track: Apps for Your Life

## 1. WHAT THIS PROJECT IS
TrialBridge is a global clinical trial matching engine. A patient describes
their condition in plain language — in any language — and the system:
1. Detects the language and extracts a structured medical profile
2. Queries multiple live international trial registries in parallel
3. Scores the top candidate trials for eligibility fit against the patient's
   specific profile
4. Explains the top matches back to the patient in their own language, in
   plain, non-clinical terms
5. Lets the patient opt into push notifications for new matching trials
6. Generates a physician-facing PDF summary in English

The differentiator: ClinicalTrials.gov's own interface is English-only,
jargon-heavy, and single-registry. TrialBridge is multilingual from the
ground up, aggregates multiple international registries simultaneously, and
translates clinical eligibility criteria into language a non-medical person
can actually act on.

## 2. WHY THIS PROJECT, WHY NOW
- Over 80% of clinical trials fail to recruit enough patients on time — the
  barrier is overwhelmingly discovery, not a lack of eligible patients.
- ClinicalTrials.gov alone lists 490,000+ registered studies; no layperson
  can navigate that volume, and no physician has time to check it per
  patient during a routine visit.
- WHO's ICTRP aggregates 18+ national registries covering 689,000+ trials
  across 121 countries — most patients never learn that international
  options exist.
- GPT-5.6-class models can read dense clinical eligibility criteria and
  cross-reference them against a patient's plain-English case description —
  a synthesis task that previously required a clinical research coordinator.

## 3. MODELS TO USE
| Task | Model | Why |
|---|---|---|
| Codex build sessions | **GPT-5.6 Terra** | Cheapest capable coding model |
| Language detection + profile extraction (runtime) | **GPT-5.6 Luna** | Fast, structured JSON, handles 95+ languages |
| Eligibility scoring (runtime) | **GPT-5.6 Luna** | Same |
| Multilingual explanation generation (runtime) | **GPT-5.6 Luna** | Same |

The trial search itself is **zero AI cost** — parallel calls to free public
registry APIs. AI is used only for the three reasoning/translation layers
that a rule engine genuinely cannot do.

## 4. FULL TECH STACK
- **Backend:** Python 3.11 + FastAPI on Railway (free tier)
- **Frontend:** React + Vite + Tailwind CSS on Vercel (free tier)
- **Database:** SQLite (patient profile + push-notification subscriptions
  only — no clinical data is retained beyond the session unless the user
  opts into notifications)
- **PWA:** vite-plugin-pwa + Web Push API (native browser push, free)
- **Scheduling:** APScheduler for the 30-minute refresh cron
- **External data (all free):**
  - ClinicalTrials.gov V2 API — US trials, 30-minute freshness achievable
  - EU Clinical Trials Register — European trials, 24-hour freshness
  - ISRCTN — UK trials, 24-hour freshness
  - WHO ICTRP — 121-country aggregator, weekly freshness

## 5. SETUP FROM SCRATCH
```bash
mkdir trialbridge && cd trialbridge
mkdir backend frontend

cd backend
python -m venv venv && source venv/bin/activate
pip install fastapi uvicorn openai httpx sqlite3 apscheduler pydantic \
            python-dotenv pywebpush
touch main.py .env
echo "OPENAI_API_KEY=sk-..." >> .env

cd ../frontend
npm create vite@latest . -- --template react
npm install
npm install -D tailwindcss postcss autoprefixer vite-plugin-pwa

# Run locally
# terminal 1:
cd backend && uvicorn main:app --reload
# terminal 2:
cd frontend && npm run dev
```

## 6. HOW TO USE CODEX (STEP BY STEP)
1. This is your **second** Codex session — keep FreightDoc's session
   separate and closed with `/feedback` already captured before starting
   this one.
2. Seed the session with the architecture prompt (see Doc 6).
3. Build order: search endpoint → parallel registry calls → profile
   extraction prompt → scoring prompt → explanation prompt → push
   notification registration → frontend.
4. Run `/feedback` before closing this session too and copy the Session ID.

## 7. FRESHNESS HONESTY
US trials: ~30 minutes (live query + cron). EU/UK: ~24 hours (daily cron).
WHO ICTRP: weekly. State these numbers exactly in the demo — do not round up
to "real-time" for registries that are not.

## 8. BUDGET
TrialBridge build (Terra): ~200 credits. TrialBridge runtime testing
(Luna): ~50 credits. Trivial relative to the 2,500 credit pool.

## 9. POST-HACKATHON COST-DOWN PATH (if turned into a SaaS)
- All registry APIs remain free indefinitely — the data layer costs nothing
  regardless of scale.
- The only recurring AI cost is the matching + explanation layer, which can
  be moved to GPT-5.6-mini-tier once volume grows; this is genuinely the
  cheapest high-impact idea in the entire portfolio to operate long-term.
- Consider a translation-memory cache: common condition/language pairs
  produce near-identical explanation templates — cache and reuse.

## 10. DOCUMENT MAP (this repo's specs)
01_PROBLEM.md · 02_COMPETITIVE_ANALYSIS.md · 03_WHY_NOW.md ·
04_JUDGE_APPEAL.md · 05_DEMO_SCRIPT.md · 06_TECHNICAL_ARCHITECTURE.md ·
07_HACKATHON_FIT.md · 08_STARTUP_POTENTIAL.md · 09_RISKS.md ·
10_API_REFERENCE.md
