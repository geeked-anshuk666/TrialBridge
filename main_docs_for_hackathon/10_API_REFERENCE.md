# TrialBridge — 10_API_REFERENCE.md

## External APIs

### ClinicalTrials.gov V2 API
Base: https://clinicaltrials.gov/api/v2/studies
Auth: none
Freshness: effectively real-time; new US registrations typically visible
within ~30 minutes

### EU Clinical Trials Register
Base: https://www.clinicaltrialsregister.eu/ctr-search/rest/
Auth: none
Freshness: daily refresh recommended (~24 hours)

### ISRCTN (UK)
Base: https://www.isrctn.com/api/
Auth: none
Freshness: daily refresh recommended (~24 hours)

### WHO ICTRP
Base: https://trialsearch.who.int
Auth: none (bulk data access)
Freshness: weekly bulk refresh

### Web Push API
Native browser API, free, no external service required for basic push

## Query pattern: ClinicalTrials.gov V2
```python
import httpx

async def search_trials(condition: str, location: str = None):
    params = {
        "query.cond": condition,
        "filter.overallStatus": "RECRUITING",
        "fields": "NCTId,BriefTitle,BriefSummary,EligibilityCriteria,"
                  "LocationCity,LocationCountry,Phase,StudyType",
        "pageSize": 50,
        "sort": "LastUpdatePostDate:desc"
    }
    if location:
        params["filter.locStr"] = location
        params["distances"] = "500mi"

    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://clinicaltrials.gov/api/v2/studies", params=params
        )
        return response.json()
```

## Prompt: Profile Extraction
```python
PROFILE_PROMPT = """
You are a medical information assistant helping patients find clinical
trials. Extract structured information from the patient's description.
The description may be in any language -- detect it and respond in JSON
only.

Patient description: {patient_input}

Respond in JSON only:
{{
  "detected_language": "ISO 639-1 code",
  "condition_english": "medical condition in English for API search",
  "condition_keywords": ["keyword1", "keyword2"],
  "current_treatments": ["treatment1"],
  "treatment_history": ["past treatment1"],
  "patient_location": "city, country if mentioned",
  "age_mentioned": "age or range if mentioned",
  "specific_requirements": ["any specific preferences mentioned"]
}}
"""
```

## Prompt: Eligibility Scoring
```python
SCORE_PROMPT = """
You are a clinical trial eligibility specialist. Score how well each trial
matches this patient profile.

Patient Profile: {patient_profile_json}
Trials to evaluate: {trials_json}

For each trial, provide:
- eligibility_score: 0-100
- key_match_reasons
- potential_barriers
- distance_from_patient (if location data available)

Respond in JSON only -- an array of scored trials.
"""
```

## Prompt: Multilingual Explanation
```python
EXPLAIN_PROMPT = """
You are a compassionate patient advocate explaining clinical trials to a
patient in their native language.

Target language: {language}
Patient condition: {condition}

For each trial below, write a clear, warm, plain-language explanation a
non-medical person can understand. Avoid jargon. Include: what the trial
is testing, what participation involves, who can join, where it is
located, and how to express interest.

Trials: {top_trials_json}

Respond in {language} only. JSON format:
{{
  "explanations": [
    {{"trial_id": "NCT...", "title": "...", "explanation": "...",
      "eligibility_plain": "...", "location_plain": "...",
      "next_step": "..."}}
  ]
}}
"""
```
