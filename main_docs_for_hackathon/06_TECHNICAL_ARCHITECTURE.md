# TrialBridge — 06_TECHNICAL_ARCHITECTURE.md

## Full pipeline
User Input (any language)
│
▼
[1] Language Detection + Profile Extraction (GPT-5.6 Luna)
Output: {detected_language, condition_english, condition_keywords,
current_treatments, treatment_history, patient_location,
age_mentioned, specific_requirements}
│
▼
[2] Multi-Registry Query (parallel API calls, zero AI cost)
ClinicalTrials.gov V2 API, EU Clinical Trials Register, ISRCTN
Filter: RECRUITING status only
Output: raw trial list (up to ~200)
│
▼
[3] Eligibility Scorer (GPT-5.6 Luna)
Input: patient profile + top ~20 keyword-ranked trials
Output: ranked list, {eligibility_score, key_match_reasons,
potential_barriers, distance_from_patient}
│
▼
[4] Multilingual Explainer (GPT-5.6 Luna)
Input: top 6 ranked trials + patient's detected language
Output: {trial_id, title, explanation, eligibility_plain,
location_plain, next_step} — all in patient's language
│
▼
[5] Notification Registration (zero AI cost)
Save patient profile + condition keywords to SQLite
Register Web Push subscription
Background cron re-checks every 30 minutes for new matches
│
▼
Frontend: trial cards (patient's language), map, eligibility badges,
"notify me" toggle, "share with my doctor" PDF export

## Backend structure
trialbridge-backend/
├── main.py
├── routers/
│   ├── search.py
│   ├── notify.py
│   └── health.py
├── services/
│   ├── openai_client.py
│   ├── ctgov_api.py
│   ├── euctr_api.py
│   ├── isrctn_api.py
│   ├── scorer.py
│   └── notifier.py
├── jobs/
│   └── refresh_cron.py
├── models/
│   ├── patient.py
│   └── trial.py
├── db.py
├── requirements.txt
└── Dockerfile

## Key endpoints
POST /api/search             Full pipeline: profile -> match -> explain
POST /api/notify/subscribe   Register push notification subscription
GET  /api/notify/test        Send test push notification
GET  /health

## Frontend structure
trialbridge-frontend/
├── src/
│   ├── App.jsx
│   ├── components/
│   │   ├── SearchInput.jsx
│   │   ├── LanguageDetector.jsx
│   │   ├── TrialCard.jsx
│   │   ├── TrialMap.jsx
│   │   ├── EligibilityBadge.jsx
│   │   ├── NotifyToggle.jsx
│   │   └── DoctorReport.jsx
│   ├── hooks/
│   │   ├── useTrialSearch.js
│   │   └── usePushNotify.js
│   └── sw.js
├── public/manifest.json
└── vite.config.js

## Codex seed prompt
I am building TrialBridge for the OpenAI Build Week hackathon. This is my
second submission. Deadline July 21. I am solo. Use GPT-5.6 Luna for all
runtime API calls.
TrialBridge matches patients to clinical trials globally. Patient describes
their condition in any language. Pipeline:

GPT-5.6 Luna extracts a structured medical profile and detects language
Parallel queries to ClinicalTrials.gov V2 API and EU Clinical Trials
Register
GPT-5.6 Luna scores the top 20 trials for eligibility fit
GPT-5.6 Luna explains the top 6 trials in the patient's native language
PWA push notifications when new matching trials open

Backend: Python + FastAPI + SQLite. Frontend: React + Vite + Tailwind +
vite-plugin-pwa. Deploy: Railway (backend) + Vercel (frontend).
Key requirement: multilingual from the ground up. The entire UI and all
trial explanations must render in the patient's detected language. Use
browser navigator.language as a default, allow manual override.
Build the complete backend starting with POST /api/search, including
parallel async calls to ClinicalTrials.gov and EUCTR. All GPT calls use
model="gpt-5.6-luna".
