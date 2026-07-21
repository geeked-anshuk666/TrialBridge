import asyncio
import json
import os
import re
import uuid
import time
from collections import defaultdict, deque
from datetime import datetime
from typing import Any

import httpx
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from groq import Groq
import psycopg

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")
app = FastAPI(title="TrialBridge API", version="0.1.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
AI_RATE_LIMIT = int(os.getenv("AI_RATE_LIMIT", "20"))
AI_RATE_WINDOW_SECONDS = int(os.getenv("AI_RATE_WINDOW_SECONDS", "3600"))
_ai_requests: dict[str, deque[float]] = defaultdict(deque)
STOPWORDS = {
    "about", "after", "again", "already", "because", "being", "condition", "diagnosed",
    "doctor", "finding", "from", "have", "help", "looking", "mild", "need", "patient",
    "reason", "severe", "some", "symptom", "symptoms", "that", "this", "trial", "trials",
    "treatment", "want", "were", "what", "with"
}
SHORT_MEDICAL_TERMS = {"als", "hiv", "ms"}

def enforce_ai_limit(request: Request) -> None:
    user_key = request.headers.get("x-user-id") or (request.client.host if request.client else "anonymous")
    now = time.time(); bucket = _ai_requests[user_key]
    while bucket and bucket[0] <= now - AI_RATE_WINDOW_SECONDS: bucket.popleft()
    if len(bucket) >= AI_RATE_LIMIT:
        retry_after = max(1, int(AI_RATE_WINDOW_SECONDS - (now - bucket[0])))
        raise HTTPException(status_code=429, detail="AI usage limit reached for this user", headers={"Retry-After": str(retry_after)})
    bucket.append(now)

class SearchRequest(BaseModel):
    patient_description: str = Field(min_length=1, max_length=10000)
    override_language: str | None = None

class PatientProfile(BaseModel):
    detected_language: str
    condition_english: str
    condition_keywords: list[str]
    current_treatments: list[str] = []
    treatment_history: list[str] = []
    patient_location: str | None = None
    age_mentioned: str | None = None
    specific_requirements: list[str] = []

class TrialRaw(BaseModel):
    nct_id: str
    source_registry: str
    title: str
    summary: str = ""
    eligibility_criteria: str = ""
    location_city: str | None = None
    location_country: str | None = None
    phase: str | None = None
    status: str = "RECRUITING"

class ExplainedTrial(BaseModel):
    trial_id: str
    title: str
    explanation: str
    eligibility_plain: str
    location_plain: str
    next_step: str
    eligibility_score: int = 50

class SearchResponse(BaseModel):
    detected_language: str
    profile: PatientProfile
    registries_queried: list[str]
    registries_responded: list[str]
    explained_trials: list[ExplainedTrial]
    correlation_id: str

def init_db() -> None:
    if not DATABASE_URL:
        raise RuntimeError("DATABASE_URL is required; configure Neon Postgres in backend/.env")
    with psycopg.connect(DATABASE_URL) as db:
        db.execute("CREATE TABLE IF NOT EXISTS subscriptions (id BIGSERIAL PRIMARY KEY, condition_keywords JSONB NOT NULL, detected_language TEXT NOT NULL, push_endpoint TEXT NOT NULL UNIQUE, push_keys JSONB NOT NULL, last_seen_trial_ids JSONB NOT NULL DEFAULT '[]'::jsonb, created_at TIMESTAMPTZ DEFAULT NOW())")
        db.commit()

@app.on_event("startup")
def startup() -> None:
    init_db()

def extract_keywords(text: str) -> list[str]:
    words = re.findall(r"[a-zA-Z0-9+-]+", text.lower())
    keywords = [
        word for word in words
        if (len(word) > 3 or word in SHORT_MEDICAL_TERMS) and word not in STOPWORDS
    ]
    deduped = list(dict.fromkeys(keywords))
    return deduped[:8]

def extract_profile(req: SearchRequest) -> PatientProfile:
    language = req.override_language or ("hi" if any("\u0900" <= c <= "\u097f" for c in req.patient_description) else "en")
    words = extract_keywords(req.patient_description)
    if not words:
        words = [req.patient_description.strip()[:80]]
    return PatientProfile(detected_language=language, condition_english=req.patient_description if language == "en" else "condition described by patient", condition_keywords=words)

def ai_explain(trial: TrialRaw, language: str) -> ExplainedTrial:
    fallback = ExplainedTrial(trial_id=trial.nct_id, title=trial.title, explanation=trial.summary or "Potential trial matching your description.", eligibility_plain="Review the official criteria with your doctor.", location_plain=trial.location_country or "See registry details", next_step="Discuss this trial with a qualified healthcare professional.", eligibility_score=50)
    if not GROQ_API_KEY:
        return fallback
    try:
        client = Groq(api_key=GROQ_API_KEY)
        response = client.chat.completions.create(model=GROQ_MODEL, temperature=0.1, response_format={"type": "json_object"}, messages=[{"role":"system","content":"Return JSON only with keys explanation, eligibility_plain, location_plain, next_step, eligibility_score. Never claim eligibility; say potential match. Respond in the target language."},{"role":"user","content":json.dumps({"target_language":language,"trial":trial.model_dump()})}])
        payload = json.loads(response.choices[0].message.content)
        return ExplainedTrial(trial_id=trial.nct_id, title=trial.title, **payload)
    except Exception:
        return fallback

async def query_registry(name: str, profile: PatientProfile) -> tuple[str, list[TrialRaw]]:
    try:
        if name == "ClinicalTrials.gov":
            async with httpx.AsyncClient(timeout=4) as client:
                queries = list(dict.fromkeys([
                    " ".join(profile.condition_keywords).strip(),
                    " ".join(profile.condition_keywords[:4]).strip(),
                    profile.condition_keywords[0] if profile.condition_keywords else "",
                    profile.condition_english.strip()
                ]))
                queries = [query for query in queries if query]
                for index, query in enumerate(queries):
                    params = {"query.term": query, "pageSize": 8}
                    if index < 2:
                        params["filter.overallStatus"] = "RECRUITING"
                    r = await client.get("https://clinicaltrials.gov/api/v2/studies", params=params)
                    r.raise_for_status()
                    studies = r.json().get("studies", [])
                    if studies:
                        trials = [
                            TrialRaw(
                                nct_id=s.get("protocolSection", {}).get("identificationModule", {}).get("nctId", "unknown"),
                                source_registry=name,
                                title=s.get("protocolSection", {}).get("identificationModule", {}).get("briefTitle", "Untitled"),
                                summary=s.get("protocolSection", {}).get("descriptionModule", {}).get("briefSummary", ""),
                                status=s.get("protocolSection", {}).get("statusModule", {}).get("overallStatus", "UNKNOWN")
                            )
                            for s in studies
                        ]
                        return name, trials
                return name, []
        return name, []
    except Exception:
        return name, []

@app.post("/api/search", response_model=SearchResponse)
async def search(req: SearchRequest, request: Request) -> SearchResponse:
    # Search remains fully usable without Groq. Apply the per-user limit only
    # when the optional AI explanation enhancement can actually be invoked.
    if GROQ_API_KEY:
        enforce_ai_limit(request)
    correlation_id = str(uuid.uuid4())
    profile = extract_profile(req)
    registry_names = ["ClinicalTrials.gov", "EU CTR", "ISRCTN"]
    results = await asyncio.gather(*(query_registry(n, profile) for n in registry_names))
    responded = [name for name, trials in results if trials or name == "ClinicalTrials.gov"]
    raw = [trial for _, trials in results for trial in trials][:20]
    explained = [ai_explain(t, profile.detected_language) for t in raw[:6]]
    return SearchResponse(detected_language=profile.detected_language, profile=profile, registries_queried=registry_names, registries_responded=responded, explained_trials=explained, correlation_id=correlation_id)

class SubscribeRequest(BaseModel):
    condition_keywords: list[str]
    detected_language: str
    push_endpoint: str
    push_keys: dict[str, Any]

@app.post("/api/notify/subscribe")
def subscribe(req: SubscribeRequest) -> dict[str, Any]:
    if not DATABASE_URL:
        raise HTTPException(status_code=503, detail="Database is not configured")
    with psycopg.connect(DATABASE_URL) as db:
        cur = db.execute("INSERT INTO subscriptions(condition_keywords, detected_language, push_endpoint, push_keys, last_seen_trial_ids) VALUES (%s, %s, %s, %s, %s) ON CONFLICT (push_endpoint) DO UPDATE SET condition_keywords=EXCLUDED.condition_keywords, detected_language=EXCLUDED.detected_language, push_keys=EXCLUDED.push_keys RETURNING id", (json.dumps(req.condition_keywords), req.detected_language, req.push_endpoint, json.dumps(req.push_keys), "[]"))
        db.commit()
        return {"id": cur.fetchone()[0], "status": "subscribed"}

@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}

@app.get("/ready")
def ready() -> dict[str, str]:
    if not DATABASE_URL:
        raise HTTPException(status_code=503, detail="Database is not configured")
    try:
        with psycopg.connect(DATABASE_URL, connect_timeout=5) as db:
            db.execute("SELECT 1")
        return {"status": "ready"}
    except Exception as error:
        raise HTTPException(status_code=503, detail="Database is unavailable") from error
